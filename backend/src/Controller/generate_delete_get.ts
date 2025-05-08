import axios from "axios";
import express, { Response, Request } from "express";
import fs from "fs";
import {
  uploadLocalFileToCloudinary,
  deleteFileFromCloudinary,
} from "../Cloud/Cloudinary.js";
import userModel from "../Schema/userSchema.js";

// controller for generate image
const generateImage = async (req: Request, res: Response): Promise<any> => {
  const { input } = req.body;

  const { id } = req.cookies.user;

  if (!input || !id) {
    return res
      .status(400)
      .json({ message: "Input and Id are required", success: false });
  }

  try {
    const user = await userModel.findById(id);

    const email = user?.email;

    const folderName = (email as any).split("@")[0];

    const url = "http://127.0.0.1:7860/sdapi/v1/txt2img";

    const payload = {
      prompt: input,
      steps: 30,
      width: 512,
      height: 512,
    };
    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (
      !response.data ||
      !response.data.images ||
      response.data.images.length === 0
    ) {
      return res.status(400).json({
        message: "Failed to generate image",
        status: "not ok",
        success: false,
      });
    }

    const base64StringOfImage = response.data.images[0];
    const buffer = Buffer.from(base64StringOfImage, "base64");
    const fileExtension = ".jpeg";
    const fileName = `image_${Date.now()}${fileExtension}`;

    fs.writeFileSync(fileName, buffer);

    // Upload to Cloudinary
    const result = await uploadLocalFileToCloudinary(fileName, folderName);

    // Save to DB - appending to images array
    await userModel.updateOne(
      { email },
      {
        $push: {
          "generatedImages.images": {
            imageUrl: result.imageUrl,
            publicId: result.public_id,
          },
        },
      }
    );

    fs.unlinkSync(fileName);

    res.status(200).json({
      message: "Image generated and saved successfully",
      fileName: result.imageUrl,
      status: "ok",
      success: true,
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      message: "Internal Server Error",
      status: "not ok",
      error: errMsg,
      success: false,
    });
  }
};

const deleteImage = async (req: Request, res: Response): Promise<any> => {
  const { public_id } = req.body;
  const { id } = req.cookies.user;

  if (!public_id) {
    return res.status(400).json({
      message: "public_id is required",
      success: false,
    });
  }

  try {
    // Check if the image exists before deletion (optional safety check)
    const user = await userModel.findOne({
      _id: id,
      "generatedImages.images.publicId": public_id,
    });

    if (!user) {
      return res.status(400).json({
        message: "Image not found in the database",
        success: false,
      });
    }

    await deleteFileFromCloudinary(public_id);

    await userModel.updateOne(
      { _id: id },
      {
        $pull: {
          "generatedImages.images": {
            publicId: public_id,
          },
        },
      }
    );

    res.status(200).json({
      message: "Image deleted successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: (error as any).message || "Internal Server Error",
      success: false,
    });
  }
};


const getImages = async (req: Request, res: Response): Promise<any> => {
  
  const {id} = req.cookies.user;
  console.log(id)

  try {
    const result = await userModel.findById({ _id:id });

    if (!result) {
      return res.status(400).json({
        message: "User not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Received successfully",
      data: {
        images: (result as any).generatedImages.images,
      },
      success: true,
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return res.status(500).json({
      message: "Internal Server Error",
      status: "not ok",
      error: errMsg,
      success: false,
    });
  }
};

export { generateImage, deleteImage, getImages };
