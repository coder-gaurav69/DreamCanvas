import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import userModel from "../Schema/userSchema.js";
import {googleValidate} from "../OAUTH/googleAuth.js"

import {
  JWT_SECRET_KEY_ACCESSTOKEN,
  JWT_SECRET_KEY_REFRESHTOKEN,
} from "../config.js";
import bcrypt from "bcrypt";

const loginMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      message: "Email or password is required",
      success: false,
    });
    return;
  }

  console.log(email, password);

  try {
    const user:any = await userModel
      .findOne({ email })
      .select("-userName -generatedImages -createdAt");
    
    console.log()

    if (!user) {
      res.status(400).json({
        message: "User not found, please create your account",
        success: false,
      });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      res.status(401).json({
        message: "Invalid credentials",
        success: false,
      });
      return;
    }

    // Attach user info to request so controller can use it
    (req as any).user = user;

    next(); // go to loginController
  } catch (error) {
    console.error("Error in loginMiddleware:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

const registerMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({
      message: "name, email, and password are required",
      success: false,
    });
    return;
  }

  try {
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      res.status(400).json({
        message: "User already exists with this email, please login instead.",
        success: false,
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Error in registerMiddleware:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
    return;
  }
};

const validate = async (req: Request, res: Response, next: NextFunction):Promise<any> => {
  const { accessToken, refreshToken, id, loginType ,folderName} = req.cookies.user || {};

  if (!accessToken || !refreshToken || !id || !loginType) {
    return res.status(401).json({
      message: "Not an authorised user",
      success: false,
    });
  }

  // console.log("google request ayi");

  if (loginType == "Google") {
    // console.log('yes google hoon mai')
    console.log('Logged in from Google');
    googleValidate(accessToken,refreshToken,id,folderName)
    console.log('working fine google')
    return next();
  }

  else if (loginType == "Github") {
    console.log('Logged in from Github');
    return next();
  }

  // for custom email validation
  else if (loginType == "Email") {
    jwt.verify(
      accessToken,
      JWT_SECRET_KEY_ACCESSTOKEN,
      async (err: any, decoded: any): Promise<void> => {
        if (err) {
          const userExists = await userModel.findById(id).select("-password -generatedImages -userName");

          if (!userExists) {
            res.status(404).json({
              message: "User not found, please create your account",
              success: false,
            });
            return;
          }

          const newAccessToken = jwt.sign({ id }, JWT_SECRET_KEY_ACCESSTOKEN, { expiresIn: "5h" });
          const newRefreshToken = jwt.sign({ id }, JWT_SECRET_KEY_REFRESHTOKEN, { expiresIn: "24h" });

          await userModel.findByIdAndUpdate(id, {
            $set: { refreshToken: newRefreshToken },
          });

          res.cookie("user", {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            id,
            loginType: "Email"
          });

          return next();
        }
        console.log('sahi chl rhaa hai na');
        return next(); // access token is valid
      }
    );
  }
};


export { loginMiddleware, registerMiddleware, validate };
