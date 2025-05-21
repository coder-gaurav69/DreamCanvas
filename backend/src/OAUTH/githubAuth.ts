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
      scope: ['user:email']
    },
    async (req:any, accessToken:any, refreshToken:any, profile:any, done:any) => {
      const email = profile?.emails?.[0]?.value;
      const existingUser = await userModel.findOne({ email: email, loginType: "GitHub" });

      if (existingUser) {
        const [myAccessToken, myRefreshToken] = generateToken(existingUser._id.toString(), existingUser.email);

        await userModel.findByIdAndUpdate(existingUser._id, {
          $set: { refreshToken: myRefreshToken }
        });

        const user = {
          profile,
          myAccessToken,
          myRefreshToken,
          folderName:existingUser.folderName,
          id: existingUser?._id,
          loginType: "GitHub"
        };

        return done(null, user);
      }

      const newUser = new userModel({
        userName: profile.displayName || profile.username,
        email: email,
        profilePhoto: profile?.photos?.[0]?.value,
        loginType: "GitHub",
      });

      await newUser.save();

      const [myAccessToken, myRefreshToken] = generateToken(newUser._id.toString(), newUser.email);

      const folderName = `(${email?.split('@')[0]})` + newUser?.id.toString();

      await userModel.findByIdAndUpdate(newUser._id, {
        $set: { refreshToken: myRefreshToken, folderName: folderName },
      });

      const user = {
        profile,
        myAccessToken,
        myRefreshToken,
        folderName: folderName,
        id: newUser?._id,
        loginType: 'GitHub'
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

    // setting cookies
    const parameter = {
        httpOnly: true,
        secure: true,
        sameSite: "none" as const,
        maxAge: 24 * 60 * 60 * 1000,
      }
    res
      .cookie("accessToken", myAccessToken, parameter)
      .cookie("refreshToken", myRefreshToken, parameter)
      .cookie("loginType", loginType, parameter);

    console.log("Login successfully with Github");
    res.redirect(`${FRONTEND_URL}`);
  }
);

export { githubRoute, githubMiddleware };
