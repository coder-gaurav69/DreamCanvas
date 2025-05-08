import express, { Router, Request, Response } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import cookieParser from "cookie-parser";
import axios from "axios";

import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
  FRONTEND_URL,
} from "../config.js";
import userModel from "../Schema/userSchema.js";

const googleRoute: Router = express.Router();

// =================== Passport Config ===================
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID!,
      clientSecret: GOOGLE_CLIENT_SECRET!,
      callbackURL: GOOGLE_CALLBACK_URL!,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      // Log the tokens for debugging
      console.log('Access Token:', accessToken);      // Log access token
      console.log('Refresh Token:', refreshToken);    // Log refresh token

      // Extract the email from the profile
      const email = profile?.emails?.[0]?.value;

      // Check if the user exists in the database
      const response = await userModel.findOne({ email });

      // Create a user object with profile details and tokens
      const user = {
        profile,
        accessToken,
        refreshToken,   // Include refreshToken here
        folderName: email,
        id: response?._id,
      };

      console.log(user);  // Log user details

      // If user exists, return user with tokens
      if (response) {
        return done(null, user);
      }

      // If user doesn't exist, create a new user record
      const newUser = new userModel({
        userName: profile.displayName,
        email: email,
        refreshToken: refreshToken,  // Save the refresh token to DB
        profilePhoto: profile?.photos?.[0]?.value,
      });

      await newUser.save();  // Save the new user to the database

      console.log(profile);  // Log the profile info
      return done(null, user);  // Complete the authentication process
    }
  )
);


// =================== Middleware App ===================
const googleMiddleware = express();

googleMiddleware.use(cookieParser());

// ❌ No session middleware
// middleware.use(session(...));

googleMiddleware.use(passport.initialize());
// ❌ No passport.session()
// middleware.use(passport.session());

// =================== Auth Routes ===================
googleRoute.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],  // Request profile and email
    accessType: 'offline',        // Request offline access to get refresh token
    prompt: 'consent',            // Force consent screen for first-time login
  })
);


googleRoute.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false, // 👈 very important: disables session!
  }),
  (req: Request, res: Response) => {
    const { accessToken, refreshToken, profile , id,folderName} = req.user as any;

    // Set your custom cookie
    const user = { accessToken, refreshToken , id , folderName , loginType:'Google'};
    console.log(user)
    res.cookie("user", user, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.redirect(`${FRONTEND_URL}`);
  }
);

googleRoute.get("/profile", (req: Request, res: Response) => {
  res.json(req.user);
});

// function for validation
const googleValidate = async (
  accessToken:string,
  refreshToken:string,
  id:string,
  folderName:string
):Promise<any>=>{

  try {
    // Step 1: Check if access token is valid
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`
    );

    // If it reaches here, token is valid
    console.log("valid");
    return accessToken;
  } catch (error:any) {
    if (error.response && error.response.status === 400) {
      // Token is likely expired; refresh it
      console.log("Token expired. Attempting to refresh...");

      try {
        const tokenResponse = await axios.post(
          "https://oauth2.googleapis.com/token",
          null,
          {
            params: {
              client_id: GOOGLE_CLIENT_ID,
              client_secret: GOOGLE_CLIENT_SECRET,
              refresh_token: refreshToken,
              grant_type: "refresh_token",
            },
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );

        const newAccessToken = tokenResponse.data.access_token;

        console.log("Access token refreshed:", newAccessToken);
        
        const user = { accessToken, refreshToken , id , folderName , loginType:'Google'};

        return newAccessToken;
      } catch (refreshError:any) {
        throw new Error(
          "Failed to refresh access token: " + refreshError.message
        );
      }
    } else {
      // Invalid token or other error
      throw new Error("Invalid access token");
    }
  }
};

export { googleRoute, googleMiddleware ,googleValidate };
