import express, { Router, Request, Response } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import cookieParser from "cookie-parser";
import axios from "axios";
import { generateToken } from "../utils/tokenGeneration.js";
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
      const existingUser = await userModel.findOne({ email:email,loginType:"Google" });

      if (existingUser) {

        const [myAccessToken, myRefreshToken] = generateToken(existingUser._id.toString(), existingUser.email);
        console.log(myAccessToken,refreshToken)

        await userModel.findByIdAndUpdate(existingUser._id,{
          $set:{refreshToken:myRefreshToken}
        });

        const user = {
          profile,
          myAccessToken,
          myRefreshToken,
          folderName: email,
          id: existingUser?._id,
          loginType:"Google"
        };
        return done(null, user);
      }

      const newUser = new userModel({
        userName: profile.displayName,
        email: email,
        profilePhoto: profile?.photos?.[0]?.value,
        loginType:"Google",
      });
      
      await newUser.save();

      const [myAccessToken, myRefreshToken] = generateToken(newUser._id.toString(), newUser.email);

       await userModel.findByIdAndUpdate(newUser._id,{
          $set:{refreshToken:myRefreshToken}
        });

      const user = {
          profile,
          myAccessToken,
          myRefreshToken,
          folderName: email,
          id: newUser?._id,
          loginType:'Google'
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
    const { myAccessToken, myRefreshToken, profile, id, folderName,loginType } =
      req.user as any;

    res.cookie("accessToken",myAccessToken,{
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    }).cookie("refreshToken",myRefreshToken,{
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    }).cookie("loginType",loginType,{
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    })

    console.log("Login successfully with GOOGLE")
    res.redirect(`${FRONTEND_URL}`);
  }
);


export { googleRoute, googleMiddleware };
