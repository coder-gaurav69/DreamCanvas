import { Request, Response } from "express";
import userModel from "../Schema/userSchema.js";
import jwt from "jsonwebtoken";
import {
  JWT_SECRET_KEY_REFRESHTOKEN,
  JWT_SECRET_KEY_ACCESSTOKEN,
  FRONTEND_URL,
} from "../config.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/tokenGeneration.js";

// controller for login
const loginController = async (req: Request, res: Response) => {
  try {
    const { email, _id } = (req as any).user;

    const [accessToken, refreshToken] = generateToken(_id, email);

    const response = await userModel.findOneAndUpdate(
      { _id , loginType:"Email" , email },
      { $set: { refreshToken: refreshToken } },
      { new: true }
    );

    // Set cookie
    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .cookie("loginType", "Email", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
      });

    console.log("Login successfully");

    res.status(200).json({
      message: "User logged in successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// controller for register
const registerController = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new userModel({
      userName: name,
      email,
      password: hashedPassword,
      loginType:"Email"
    });

    const response = await newUser.save();

    const [accessToken,refreshToken] = generateToken(response.id,email);

    await userModel.findByIdAndUpdate(
      { _id: response._id },
      {
        $set: { refreshToken: refreshToken },
      }
    );

    // Set cookie
    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .cookie("loginType", "Email", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
      });


    res.status(201).json({
      message: "User registered successfully",
      success: true,
    });

  } catch (error) {
    console.error("Error in registerController:", error);
    res.status(500).json({
      message: "Registration failed",
      success: false,
    });
  }
};

// controller for logout
const logoutController = async (req: Request, res: Response): Promise<void> => {
  const { loginType, refreshToken, accessToken } = req.cookies;

  if (!req.cookies) {
    res.status(400).json({
      message: "Login first",
      success: false,
    });
    return;
  }

  // Clear the cookie (match the cookie options used during set)
  res
    .clearCookie("loginType", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    })
    .clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    })
    .clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

  console.log("Logout successfully");

  res.status(200).json({
    message: "Logout successfully",
    success: true,
  });
};

export { loginController, registerController, logoutController };
