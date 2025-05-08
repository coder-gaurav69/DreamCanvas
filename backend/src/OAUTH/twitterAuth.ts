import express, { Router, Request, Response } from "express";
import passport from "passport";
import { Strategy as TwitterStrategy } from "passport-twitter";
import cookieParser from "cookie-parser";
import axios from "axios";
import expressSession from "express-session"; // Re-enable express-session for OAuth

import {
  TWITTER_API_KEY,
  TWITTER_API_KEY_SECRET,
  TWITTER_CALLBACK_URL,
  FRONTEND_URL,
} from "../config.js";

import userModel from "../Schema/userSchema.js";

const twitterRoute: Router = express.Router();

// =================== Passport Config ===================
passport.use(
  new TwitterStrategy(
    {
      consumerKey: TWITTER_API_KEY!,
      consumerSecret: TWITTER_API_KEY_SECRET!,
      callbackURL: TWITTER_CALLBACK_URL!,
    },
    async (token: any, tokenSecret: any, profile: any, done: any) => {
      const email = profile?.emails?.[0]?.value || null;

      const response = await userModel.findOne({ email });

      const user = {
        profile,
        token,
        tokenSecret,
        folderName: email,
        id: response?._id,
      };

      console.log(user);

      if (response) {
        return done(null, user);
      }

      const newUser = new userModel({
        userName: profile.displayName,
        email: email,
        profilePhoto: profile?.photos?.[0]?.value,
      });

      await newUser.save();
      console.log(profile);
      return done(null, user);
    }
  )
);

// =================== Middleware App ===================
const twitterMiddleware = express();

// Use session only for OAuth authentication
twitterMiddleware.use(
  expressSession({
    secret: "your-session-secret", // Replace with a secure session secret
    resave: false,
    saveUninitialized: true,
  })
);

twitterMiddleware.use(cookieParser());
twitterMiddleware.use(passport.initialize()); // Initialize passport

// =================== Auth Routes ===================
twitterRoute.get(
  '/auth/twitter',
  passport.authenticate('twitter')
);

twitterRoute.get(
  "/auth/twitter/callback",
  passport.authenticate("twitter", {
    failureRedirect: "/login",
    session: true, // Enable session support only for OAuth
  }),
  (req: Request, res: Response) => {
    const { token, tokenSecret, profile, id, folderName } = req.user as any;

    const user = { accessToken: token, id, folderName, loginType: 'Twitter' };
    console.log(user);

    // Set cookie instead of using sessions for your own user data
    res.cookie("user", user, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.redirect(`${FRONTEND_URL}`);
  }
);

twitterRoute.get("/profile", (req: Request, res: Response) => {
  res.json(req.user); // This may not work if you're not using session
});

// Function for validation
const twitterValidate = async (
  token: string,
  id: string,
  folderName: string
): Promise<any> => {
  try {
    const response = await axios.get(
      `https://api.twitter.com/2/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      }
    );

    console.log("Valid token");
    return token;
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      console.log("Token is expired or invalid.");
      throw new Error("Invalid or expired token. Please re-authenticate.");
    } else {
      throw new Error("Error validating access token.");
    }
  }
};

// Logout route to clear cookie
twitterRoute.get("/auth/logout", (req: Request, res: Response) => {
  res.clearCookie("user"); // Clear the user cookie
  res.redirect("/login");  // Redirect to the login page
});

export { twitterRoute, twitterMiddleware, twitterValidate };
