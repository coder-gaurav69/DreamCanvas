import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import userModel from "../Schema/userSchema.js";
import { generateToken } from "../utils/tokenGeneration.js";

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

  try {
    const user:any = await userModel
      .findOne({ email , loginType:"Email"})
      .select("-userName -generatedImages -createdAt");

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
    const existingUser = await userModel.findOne({ email , loginType:"Email" });

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


const validate = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  if (!accessToken) {
    return res.status(401).json({ message: "Access token missing", success: false });
  }

  try {
    const decoded = jwt.verify(accessToken, JWT_SECRET_KEY_ACCESSTOKEN);
    req.user = decoded;
    return next();
  } catch (err) {
    // Try refresh token
    if (!refreshToken) {
      return res.status(401).json({ message: "Session expired, please login again", success: false });
    }

    try {
      const decodedRefresh: any = jwt.verify(refreshToken, JWT_SECRET_KEY_REFRESHTOKEN!);
      const user = await userModel.findById(decodedRefresh.id);

      if (!user || user.refreshToken !== refreshToken) {
        return res.status(403).json({ message: "Invalid refresh token", success: false });
      }

      const [newAccessToken, newRefreshToken] = generateToken(user._id.toString(), user.email);

      await userModel.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken });

      res.cookie("accessToken", newAccessToken);

      res.cookie("refreshToken", newRefreshToken);

      req.user = { id: user._id, email: user.email };
      return next();

    } catch (refreshErr) {
      return res.status(403).json({ message: "Refresh token expired or invalid", success: false });
    }
  }
};


export { loginMiddleware, registerMiddleware, validate };
