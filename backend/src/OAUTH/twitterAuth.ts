import express, { Router, Request, Response } from "express";
import passport from "passport";
import { Strategy as TwitterStrategy } from "passport-twitter";
import cookieParser from "cookie-parser";
import { generateToken } from "../utils/tokenGeneration.js";
import {
  TWITTER_CONSUMER_KEY,
  TWITTER_CONSUMER_SECRET,
  TWITTER_CALLBACK_URL,
  FRONTEND_URL,
} from "../config.js";
import userModel from "../Schema/userSchema.js";

const twitterRoute: Router = express.Router();

// =================== Passport Twitter Strategy ===================
passport.use(
  new TwitterStrategy(
    {
      consumerKey: TWITTER_CONSUMER_KEY,
      consumerSecret: TWITTER_CONSUMER_SECRET,
      callbackURL: TWITTER_CALLBACK_URL,
      includeEmail: true,
      passReqToCallback: true,
    },
    async (req: any, token, tokenSecret, profile, done) => {
      const email = profile?.emails?.[0]?.value;

      let user = await userModel.findOne({ email });

      if (!user) {
        user = new userModel({
          userName: profile.displayName,
          email: email,
          profilePhoto: profile?.photos?.[0]?.value,
        });
        await user.save();
      }

      const [myAccessToken, myRefreshToken] = generateToken(
        user._id.toString(),
        user.email
      );

      await userModel.findByIdAndUpdate(user._id, {
        $set: { refreshToken: myRefreshToken },
      });

      return done(null, {
        profile,
        myAccessToken,
        myRefreshToken,
        folderName: email,
        id: user._id,
        loginType: "Twitter",
      });
    }
  )
);

// =================== Middleware ===================
const twitterMiddleware = express();
twitterMiddleware.use(cookieParser());
twitterMiddleware.use(passport.initialize());

// =================== Routes ===================
twitterRoute.get(
  "/twitter",
  passport.authenticate("twitter", { session: false })
);

twitterRoute.get(
  "/twitter/callback",
  passport.authenticate("twitter", {
    failureRedirect: "/login",
    session: false,
  }),
  (req: Request, res: Response) => {
    const { myAccessToken, myRefreshToken, loginType } = req.user as any;
    res
      .cookie("accessToken", myAccessToken)
      .cookie("refreshToken", myRefreshToken)
      .cookie("loginType", loginType);

    res.redirect(FRONTEND_URL);
  }
);

export { twitterRoute, twitterMiddleware };
