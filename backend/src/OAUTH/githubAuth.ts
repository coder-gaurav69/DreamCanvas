import express, { Router, Request, Response } from "express";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import cookieParser from "cookie-parser";
import axios from "axios";
import { generateToken } from "../utils/tokenGeneration.js";
import {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL,
  FRONTEND_URL,
} from "../config.js";
import userModel from "../Schema/userSchema.js";

const githubRoute: Router = express.Router();

// =================== Passport Config ===================
passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID!,
      clientSecret: GITHUB_CLIENT_SECRET!,
      callbackURL: GITHUB_CALLBACK_URL!,
      passReqToCallback: true,
    },
    async (req: any, accessToken: any, refreshToken: any, profile: any, done: any) => {
      let email;

      // Try to get email from profile.emails first
      if (profile.emails && profile.emails.length > 0) {
        email = profile.emails[0].value;
      } else {
        // Fetch emails from GitHub API as fallback
        try {
          const emailsResponse = await axios.get("https://api.github.com/user/emails", {
            headers: {
              Authorization: `token ${accessToken}`,
            },
          });
          const emails = emailsResponse.data;

          // Find primary and verified email, or fallback to first email
          const primaryEmailObj =
            emails.find((e: any) => e.primary && e.verified) || emails[0];
          email = primaryEmailObj?.email;
        } catch (error) {
          console.error("Error fetching emails from GitHub API:", error);
          email = null;
        }
      }

      // Use email or fallback to username or profileUrl for folderName and lookup
      const uniqueId = email || profile.username || profile.profileUrl;

      const existingUser = await userModel.findOne({ email: email, loginType:"Github" });

      if (existingUser) {
        const [myAccessToken, myRefreshToken] = generateToken(
          existingUser._id.toString(),
          existingUser.email
        );

        await userModel.findByIdAndUpdate(existingUser._id, {
          $set: { refreshToken: myRefreshToken },
        });

        const user = {
          profile,
          myAccessToken,
          myRefreshToken,
          folderName: uniqueId,
          id: existingUser._id,
          loginType: "GitHub",
        };
        return done(null, user);
      }

      const newUser = new userModel({
        userName: profile.username || profile.displayName,
        email: email,
        profilePhoto: profile.photos?.[0]?.value,
        loginType:"Github",
      });

      await newUser.save();

      const [myAccessToken, myRefreshToken] = generateToken(
        newUser._id.toString(),
        newUser.email
      );

      await userModel.findByIdAndUpdate(newUser._id, {
        $set: { refreshToken: myRefreshToken },
      });

      const user = {
        profile,
        myAccessToken,
        myRefreshToken,
        folderName: uniqueId,
        id: newUser._id,
        loginType: "GitHub",
      };

      return done(null, user);
    }
  )
);

// =================== Middleware App ===================
const githubMiddleware = express();
githubMiddleware.use(cookieParser());
githubMiddleware.use(passport.initialize());

// =================== Routes ===================
githubRoute.get(
  "/github",
  passport.authenticate("github", {
    scope: ["user:email"],
  })
);

githubRoute.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/login",
    session: false,
  }),
  (req: Request, res: Response) => {
    const {
      myAccessToken,
      myRefreshToken,
      profile,
      id,
      folderName,
      loginType,
    } = req.user as any;

    res
      .cookie("accessToken", myAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .cookie("refreshToken", myRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .cookie("loginType", loginType, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
      });

    console.log("Login successfully with GITHUB");
    res.redirect(`${FRONTEND_URL}`);
  }
);

export { githubRoute, githubMiddleware };
