import axios from "axios";
import express, { Response, Request } from "express";
import fetch from "node-fetch";
import fs from "fs";
import {
  uploadFileToCloudinary,
  deleteFileFromCloudinary,
} from "../Cloud/Cloudinary.js";
import userModel from "../Schema/userSchema.js";
import {
  AI_MODEL_MAP,
  CF_ACCOUNT_ID,
  CF_API_TOKEN,
  CF_MODEL_ID,
} from "../config.js";

const STYLE_GUIDE: Record<string, string> = {
  Realistic:
    "ultra realistic photograph, DSLR, natural lighting, detailed, family-friendly, ",
  Artistic:
    "digital painting, artistic brush strokes, rich colours, family-friendly, ",
  "3D Render":
    "high quality 3D CGI render, ray-traced lighting, detailed materials, family-friendly, ",
  Cartoon:
    "cute cartoon / anime style, cel shading, bold outlines, family-friendly, ",
  Fantasy:
    "epic fantasy illustration, magical atmosphere, cinematic lighting, family-friendly, ",
};

// Helper: guess mime from raw bytes
function detectMime(raw: Buffer): string {
  if (
    raw.length >= 3 &&
    raw[0] === 0xff &&
    raw[1] === 0xd8 &&
    raw[2] === 0xff
  ) {
    return "image/jpeg"; // JPEG magic bytes
  }
  if (
    raw.length >= 8 &&
    raw[0] === 0x89 &&
    raw[1] === 0x50 &&
    raw[2] === 0x4e &&
    raw[3] === 0x47
  ) {
    return "image/png"; // PNG magic bytes
  }
  return "image/png"; // default
}

const generateImage = async (req: Request, res: Response):Promise<any> => {
  try {
    const prompt = req.body?.input;
    const style = req.body?.style as keyof typeof AI_MODEL_MAP | undefined;
    const { id, email } = (req as any).user ?? {};

    // ---- Basic validation ----
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }

    if (!style) {
      return res.status(400).json({
        success: false,
        message: "Style is required",
      });
    }

    if (!id || !email) {
      return res.status(401).json({
        success: false,
        message: "User information missing (id/email).",
      });
    }

    if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
      return res.status(500).json({
        success: false,
        message: "Missing Cloudflare API credentials",
      });
    }

    const model = AI_MODEL_MAP[style];

    if (!model || !model.startsWith("@cf/")) {
      return res.status(400).json({
        success: false,
        message: `Invalid or misconfigured model for style '${style}'`,
        model,
        available: Object.keys(AI_MODEL_MAP),
      });
    }

    const apiUrl = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${model}`;

    const finalPrompt = `${prompt} + ${STYLE_GUIDE[style]}`;
    // console.log(finalPrompt);
    const payload = { prompt:finalPrompt };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // ---- 1) HTTP error codes (4xx/5xx) ----
    if (!response.ok) {
      const text = await response.text();

      // HTML 500 from Cloudflare edge
      if (/<html[^>]*>/i.test(text)) {
        console.error("Cloudflare HTML error:", text.slice(0, 200), "...");
        return res.status(502).json({
          success: false,
          message: "Cloudflare returned an internal error (HTML 500)",
          status: response.status,
        });
      }

      // Try JSON error
      try {
        const json = JSON.parse(text);
        const firstErr = Array.isArray(json.errors) ? json.errors[0] : null;
        const msg = firstErr?.message || json.message || "Cloudflare AI error";
        const code = firstErr?.code ?? json.code;

        return res.status(400).json({
          success: false,
          message: msg,
          code,
          full: json,
        });
      } catch {
        console.error("Cloudflare text error:", text);
        return res.status(502).json({
          success: false,
          message: "Cloudflare error (text)",
          status: response.status,
          error: text,
        });
      }
    }

    // ---- 2) HTTP OK → bytes ----
    const arrayBuffer = await response.arrayBuffer();
    const raw = Buffer.from(arrayBuffer);

    let base64Image: string | null = null;
    let mime: string | null = null;

    // ---- 3) Try JSON first (could be success or error) ----
    try {
      const text = raw.toString("utf8").trim();

      if (text.startsWith("{") || text.startsWith("[")) {
        const json = JSON.parse(text);

        // 3a) Workers AI JSON error
        if (json.success === false) {
          const firstErr = Array.isArray(json.errors) ? json.errors[0] : null;
          const msg =
            firstErr?.message || json.message || "Cloudflare AI Error";
          const code = firstErr?.code ?? json.code;

          if (
            code === 3030 ||
            (typeof msg === "string" &&
              /nsfw|adult|moderat/i.test(msg.toLowerCase()))
          ) {
            return res.status(400).json({
              success: false,
              message: "Content blocked by Cloudflare moderation",
              details: msg,
              code,
              full: json,
            });
          }

          return res.status(400).json({
            success: false,
            message: msg,
            code,
            full: json,
          });
        }

        // 3b) JSON success with base64 image in result
        const result = json.result;
        if (typeof result === "string") {
          base64Image = result;
        } else if (result?.image && typeof result.image === "string") {
          base64Image = result.image;
        } else if (
          Array.isArray(result?.images) &&
          result.images[0]?.b64_json
        ) {
          base64Image = result.images[0].b64_json;
        } else if (
          Array.isArray(result?.artifacts) &&
          result.artifacts[0]?.base64
        ) {
          base64Image = result.artifacts[0].base64;
        }

        if (base64Image) {
          mime = "image/png"; // from base64 alone we assume PNG
        } else {
          return res.status(500).json({
            success: false,
            message: "Cloudflare returned JSON but no image result",
            full: json,
          });
        }
      }
    } catch {
      // Not JSON → treat as raw image below
    }

    // ---- 4) If not JSON base64, treat as raw binary image ----
    if (!base64Image) {
      mime = detectMime(raw);
      base64Image = raw.toString("base64");
    }

    if (!base64Image) {
      return res.status(500).json({
        success: false,
        message: "Cloudflare did not return an image",
      });
    }

    const dataUri = `data:${mime || "image/png"};base64,${base64Image}`;

    // ---- 5) Upload to Cloudinary via your helper----
    const folderName = `DreamCanvas/${email}`;
    const uploadResult = await uploadFileToCloudinary(dataUri, folderName);

    // ---- 6) Save URL + public_id to Mongo ----
    await userModel.updateOne(
      { _id: id, email },
      {
        $push: {
          generatedImages: {
            imageUrl: uploadResult.imageUrl,
            publicId: uploadResult.public_id,
          },
        },
      }
    );

    // ---- 7) Send public URL to client ----
    return res.json({
      success: true,
      fileName: uploadResult.imageUrl,
      publicId: uploadResult.public_id,
    });
  } catch (err: any) {
    console.error("ERROR (generateImage):", err.message || err);

    return res.status(500).json({
      success: false,
      message: "Image generation request failed",
      error: err.message || String(err),
    });
  }
};

const deleteImage = async (req: Request, res: Response): Promise<any> => {
  const { public_id } = req.body;
  const { id, email } = (req as any).user;

  if (!public_id) {
    return res.status(400).json({
      message: "public_id is required",
      success: false,
    });
  }

  try {
    // Check if the image exists
    const user = await userModel.findOne({
      _id: id,
      email,
      "generatedImages.publicId": public_id,
    });

    if (!user) {
      return res.status(404).json({
        message: "Image not found in the database",
        success: false,
      });
    }

    // Delete from cloudinary or your storage
    await deleteFileFromCloudinary(public_id);

    // Remove image from user's generatedImages array
    await userModel.updateOne(
      { _id: id },
      {
        $pull: {
          generatedImages: {
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
  const { id, email } = (req as any).user;

  try {
    const result = (await userModel.findById({ _id: id, email })) as any;

    if (!result) {
      return res.status(400).json({
        message: "User not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Received successfully",
      data: {
        imagesList: result.generatedImages,
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
