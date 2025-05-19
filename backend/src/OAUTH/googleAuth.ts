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
      const email = profile?.emails?.[0]?.value;
      const existingUser = await userModel.findOne({ email });

      if (existingUser) {
        const user = {
          profile,
          accessToken,
          refreshToken,
          folderName: email,
          id: existingUser?._id,
        };
        return done(null, user);
      }

      const newUser = new userModel({
        userName: profile.displayName,
        email: email,
        refreshToken: refreshToken,
        profilePhoto: profile?.photos?.[0]?.value,
      });

      await newUser.save();

      const user = {
          profile,
          accessToken,
          refreshToken,
          folderName: email,
          id: newUser?._id,
      };

      return done(null, user);
    }
  )
);

// =================== Middleware App ===================
const googleMiddleware = express();
googleMiddleware.use(cookieParser());
googleMiddleware.use(passport.initialize());

// =================== Routes ===================
googleRoute.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    accessType: "offline",
    prompt: "consent",
  })
);

googleRoute.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  (req: Request, res: Response) => {
    const { accessToken, refreshToken, profile, id, folderName } =
      req.user as any;

    const user = {
      accessToken,
      refreshToken,
      id,
      folderName,
      loginType: "Google",
    };

    res.cookie("user", user, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });
    console.log("loginSuccessfully with google");
    res.redirect(`${FRONTEND_URL}`);
  }
);

// =================== Access Token Validator ===================
const googleValidate = async (
  accessToken: string,
  refreshToken: string,
  id: string,
  folderName: string
): Promise<any> => {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`
    );

    return accessToken; // Token is valid
  } catch (error: any) {
    if (error.response?.status === 400) {
      // Token expired, try to refresh
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
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          }
        );

        const newAccessToken = tokenResponse.data.access_token;
        console.log("Access token refreshed:", newAccessToken);
        return newAccessToken;
      } catch (refreshError: any) {
        throw new Error(
          "Failed to refresh access token: " + refreshError.message
        );
      }
    } else {
      throw new Error("Invalid access token");
    }
  }
};

export { googleRoute, googleMiddleware, googleValidate };
