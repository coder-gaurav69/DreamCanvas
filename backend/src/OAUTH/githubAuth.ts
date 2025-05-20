import express, { Router, Request, Response } from "express";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import cookieParser from "cookie-parser";
import {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL,
  FRONTEND_URL,
} from "../config.js";
import userModel from "../Schema/userSchema.js";
import { generateToken } from "../utils/tokenGeneration.js";

const githubRoute: Router = express.Router();

// =================== Passport Config ===================
passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID!,
      clientSecret: GITHUB_CLIENT_SECRET!,
      callbackURL: GITHUB_CALLBACK_URL!,
      scope: ["user:email"],
      passReqToCallback: true,
    },
    async (profile:any, done:any) => {
      try {
        // GitHub profile emails might be private; use profile.emails if available
        console.log(profile)
        const email = profile?.emails?.[0]?.value;

        if (!email) {
          return done(new Error("No email found in GitHub profile"));
        }

        const existingUser = await userModel.findOne({ email });

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
            folderName: email,
            id: existingUser._id,
            loginType: "GitHub",
          };

          return done(null, user);
        }

        // If user doesn't exist, create new user
        const newUser = new userModel({
          userName: profile.displayName || profile.username,
          email: email,
          profilePhoto: profile.photos?.[0]?.value,
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
          folderName: email,
          id: newUser._id,
          loginType: "GitHub",
        };

        return done(null, user);
      } catch (error) {
        return done(error);
      }
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
    const { myAccessToken, myRefreshToken, profile, id, folderName, loginType } =
      req.user as any;

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
