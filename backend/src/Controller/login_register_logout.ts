import { Request, Response } from "express";
import userModel from "../Schema/userSchema.js";
import jwt from "jsonwebtoken";
import {
  JWT_SECRET_KEY_REFRESHTOKEN,
  JWT_SECRET_KEY_ACCESSTOKEN,
  FRONTEND_URL,
} from "../config.js";
import bcrypt from "bcrypt";

// controller for login
const loginController = async (req: Request, res: Response) => {
  try {
    const { email, _id } = (req as any).user;

    const accessToken = jwt.sign({ _id }, JWT_SECRET_KEY_ACCESSTOKEN, {
      expiresIn: "5h",
    });

    const refreshToken = jwt.sign({ _id }, JWT_SECRET_KEY_REFRESHTOKEN, {
      expiresIn: "24h",
    });

    const response = await userModel.findOneAndUpdate(
      { _id },
      { $set: { refreshToken: refreshToken } },
      { new: true }
    );

    // Set cookie
    const user = {
      accessToken: accessToken,
      refreshToken: refreshToken,
      folderName: email,
      loginType: "Email",
      id: _id,
    };

    console.log("User logged in successfully");

    res.cookie("user", user);

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
    });

    const response = await newUser.save();

    const accessToken = jwt.sign(
      { _id: response._id },
      JWT_SECRET_KEY_ACCESSTOKEN,
      {
        expiresIn: "5h",
      }
    );

    const refreshToken = jwt.sign(
      { _id: response._id },
      JWT_SECRET_KEY_REFRESHTOKEN,
      {
        expiresIn: "24h",
      }
    );

    await userModel.findByIdAndUpdate(
      { _id: response._id },
      {
        $set: { refreshToken: refreshToken },
      }
    );

    // Set cookie
    const user = {
      accessToken: accessToken,
      refreshToken: refreshToken,
      folderName: email,
      id: response._id,
      loginType: "Email",
    };

    res.cookie("user", user);

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
  const usercookie = req.cookies.user;

  if (!usercookie) {
    res.status(400).json({
      message: "login first",
      success: false,
    });
    return;
  }

  // Clear cookie
  res.clearCookie("user");

  console.log("Logout successfully");

  res.status(200).json({
    message: "Logout successfully",
    success: true,
  });

};

export { loginController, registerController, logoutController };
