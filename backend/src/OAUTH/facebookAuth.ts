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
      profileFields: ["id", "emails", "name", "displayName", "photos"],
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {

      const email = profile?.emails?.[0]?.value;
      const existingUser = await userModel.findOne({ email });

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
          loginType:"Facebook"
        };
        return done(null, user);
      }

      const newUser = new userModel({
        userName: profile.displayName,
        email: email,
        profilePhoto: profile?.photos?.[0]?.value,
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

export { facebookRoute, facebookMiddleware };
