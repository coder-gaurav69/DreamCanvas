import express, { Router, Request, Response } from "express";
import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import cookieParser from "cookie-parser";
import {
  FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET,
  FACEBOOK_CALLBACK_URL,
  FRONTEND_URL,
} from "../config.js";
import userModel from "../Schema/userSchema.js";
import axios from "axios";
import { generateToken } from "../utils/tokenGeneration.js";

const facebookRoute: Router = express.Router();

// =================== Passport Config ===================
passport.use(
  new FacebookStrategy(
    {
      clientID: FACEBOOK_APP_ID!,
      clientSecret: FACEBOOK_APP_SECRET!,
      callbackURL: FACEBOOK_CALLBACK_URL!,
      passReqToCallback: true,
      profileFields: ['id', 'displayName', 'emails', 'photos']
    },
    async (req, accessToken, refreshToken, profile, done) => {
      const email = profile?.emails?.[0]?.value;
      const existingUser = await userModel.findOne({ email: email, loginType: "Facebook" });

      if (existingUser) {
        const [myAccessToken, myRefreshToken] = generateToken(existingUser._id.toString(), existingUser.email);

        await userModel.findByIdAndUpdate(existingUser._id, {
          $set: { refreshToken: myRefreshToken }
        });

        const user = {
          profile,
          myAccessToken,
          myRefreshToken,
          folderName: existingUser.folderName,
          id: existingUser?._id,
          loginType: "Facebook"
        };

        return done(null, user);
      }

      const newUser = new userModel({
        userName: profile.displayName,
        email: email,
        profilePhoto: profile?.photos?.[0]?.value,
        loginType: "Facebook",
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
        loginType: 'Facebook'
      };

      return done(null, user);
    }
  )
);

// =================== Middleware App ===================
const facebookMiddleware = express();
facebookMiddleware.use(cookieParser());
facebookMiddleware.use(passport.initialize());

// =================== Routes ===================
facebookRoute.get(
  "/facebook",
  passport.authenticate("facebook", {
    scope: ["email"],
  })
);

facebookRoute.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: "/login",
    session: false,
  }),
  (req: Request, res: Response) => {
    const { myAccessToken, myRefreshToken, profile, id, folderName,loginType } =
      req.user as any;

    // setting cookie
    const parameter =  {
        httpOnly: true,
        secure: true,
        sameSite: "none" as const,
        maxAge: 24 * 60 * 60 * 1000,
      }

    res.cookie("accessToken",myAccessToken, parameter).cookie("refreshToken",myRefreshToken, parameter).cookie("loginType",loginType, parameter)

    console.log("Login successfully with Facebook")
    res.redirect(`${FRONTEND_URL}`);
  }
);

export { facebookRoute, facebookMiddleware };
