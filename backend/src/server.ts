import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import { FRONTEND_URL } from "./config.js";
import MongoDB from "./database/mongoDb.js";
import authRoute from "./routes/auth.js";
import { PORT, MONGODB_URL } from "./config.js";
import route from "./routes/generate-delete-get-routes.js";
import { validate } from "./MiddleWare/authorisation.js";
import { googleRoute, googleMiddleware } from "./OAUTH/googleAuth.js";
import { facebookRoute, facebookMiddleware } from "./OAUTH/facebookAuth.js";
import { githubMiddleware, githubRoute } from "./OAUTH/githubAuth.js";
import axios from "axios";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: `${FRONTEND_URL}`,
    // origin:'*',
    credentials: true,
    methods: ["GET", "POST", "DELETE"],
  })
);

// const CF_ACCOUNT_ID = "b9b95cc7e3626d3036c67832cfb52e86";
// const CF_API_TOKEN = "gWBIsWtQVcsjXylHZ6mM747-A5UaF24SINshVjYs";

// import fetch from "node-fetch";

// app.post("/generate-phoenix", async (req: Request, res: Response) => {
//   try {
//     const prompt = req.body?.prompt || "a girl playing cricket";

//     if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
//       return res.status(500).json({
//         success: false,
//         message: "Missing Cloudflare API credentials",
//       });
//     }

//     const apiUrl = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell`;

//     // 🧠 Keep payload simple; Phoenix understands { prompt }.
//     // If you KNOW extra fields are required by the specific model docs,
//     // you can keep them, but they are not needed just to make it work.
//     const payload = {
//       prompt,
//       // If you really want, you can keep these. If not required, comment them out.
//       // input_text: prompt,
//       // width: "512",
//       // height: "512",
//     };

//     // console.log("📦 SENDING PAYLOAD:", payload);

//     const response = await fetch(apiUrl, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${CF_API_TOKEN}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(payload),
//     });

//     // If HTTP status itself is not OK, try to read and show the error nicely
//     if (!response.ok) {
//       const text = await response.text();

//       // HTML 500 page from Cloudflare edge
//       if (/<html[^>]*>/i.test(text)) {
//         console.error("❌ Cloudflare HTML error:", text.slice(0, 200), "...");
//         return res.status(502).json({
//           success: false,
//           message: "Cloudflare returned an internal error (HTML 500)",
//           status: response.status,
//         });
//       }

//       // Try parse as JSON error
//       try {
//         const json = JSON.parse(text);
//         const firstErr = Array.isArray(json.errors) ? json.errors[0] : null;
//         const msg = firstErr?.message || json.message || "Cloudflare AI error";
//         const code = firstErr?.code ?? json.code;

//         return res.status(400).json({
//           success: false,
//           message: msg,
//           code,
//           full: json,
//         });
//       } catch {
//         // Plain text error
//         console.error("❌ Cloudflare text error:", text);
//         return res.status(502).json({
//           success: false,
//           message: "Cloudflare error (text)",
//           status: response.status,
//           error: text,
//         });
//       }
//     }

//     // ✅ At this point, HTTP status is OK; read the bytes
//     const arrayBuffer = await response.arrayBuffer();
//     const raw = Buffer.from(arrayBuffer);

//     // First, see if this is actually JSON (success OR error), not an image
//     try {
//       const text = raw.toString("utf8").trim();

//       if (text.startsWith("{") || text.startsWith("[")) {
//         const json = JSON.parse(text);

//         // If Workers AI wrapped an error in JSON:
//         if (json.success === false) {
//           const firstErr = Array.isArray(json.errors) ? json.errors[0] : null;
//           const msg = firstErr?.message || json.message || "Cloudflare AI Error";
//           const code = firstErr?.code ?? json.code;

//           // NSFW / moderation-like errors
//           if (
//             code === 3030 ||
//             (typeof msg === "string" &&
//               /nsfw|adult|moderat/i.test(msg.toLowerCase()))
//           ) {
//             return res.status(400).json({
//               success: false,
//               message: "Content blocked by Cloudflare moderation",
//               details: msg,
//               code,
//               full: json,
//             });
//           }

//           return res.status(400).json({
//             success: false,
//             message: msg,
//             code,
//             full: json,
//           });
//         }

//         // If JSON is SUCCESS and actually contains base64 image in result
//         const result = json.result;
//         let base64FromJson: string | null = null;

//         if (typeof result === "string") {
//           base64FromJson = result;
//         } else if (result?.image && typeof result.image === "string") {
//           base64FromJson = result.image;
//         } else if (
//           Array.isArray(result?.images) &&
//           result.images[0]?.b64_json
//         ) {
//           base64FromJson = result.images[0].b64_json;
//         } else if (
//           Array.isArray(result?.artifacts) &&
//           result.artifacts[0]?.base64
//         ) {
//           base64FromJson = result.artifacts[0].base64;
//         }

//         if (base64FromJson) {
//           return res.json({
//             success: true,
//             image: `data:image/png;base64,${base64FromJson}`,
//           });
//         }

//         // JSON but no obvious image → treat as error
//         return res.status(500).json({
//           success: false,
//           message: "Cloudflare returned JSON but no image result",
//           full: json,
//         });
//       }
//     } catch {
//       // Not JSON → fall through and treat as raw image
//     }

//     // ✅ If we got here, it's not JSON → treat as raw PNG/JPEG
//     const base64 = raw.toString("base64");

//     return res.json({
//       success: true,
//       image: `data:image/png;base64,${base64}`,
//     });
//   } catch (err: any) {
//     console.error("🔥 ERROR:", err.message || err);

//     return res.status(500).json({
//       success: false,
//       message: "Phoenix model request failed",
//       error: err.message || String(err),
//     });
//   }
// });


// Health check route

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Image Generator");
});

// app.post("/api-model", async (_req, res) => {
//   const url =
//     "https://api.cloudflare.com/client/v4/accounts/6a47bdb6347fee3e6c92f1396ef8e47e/ai/run/@cf/lykon/dreamshaper-8-lcm";

//   try {
//     const response = await axios.post(
//       url,
//       { prompt: "a girl living in the park" },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.CF_API_TOKEN}`,
//           "Content-Type": "application/json",
//         },
//         responseType: "arraybuffer", // 🔥 required for binary image models
//       }
//     );

//     const base64 = Buffer.from(response.data).toString("base64");

//     res.json({
//       success: true,
//       image: base64,
//     });

//   } catch (err: any) {
//     console.error("ERR:", err.response?.data || err.message);
//     res.status(500).json(err.response?.data || err.message);
//   }
// });


// Auth routes (login / register)
app.use("/auth", authRoute);

// routes for generating and deleting images from mongoDB and cloud and for getting
app.use("/", route);

// to get all the cookies
app.get("/test-cookies", (req, res) => {
  const user = req.cookies.user;
  res.status(200).json({
    message: "received successfully",
    cookies: user,
    success: true,
  });
});

// Use Google OAuth middleware and routes
app.use(googleMiddleware);
app.use("/auth", googleRoute);

// Use facebook OAuth middleware and routes
app.use("/auth", facebookRoute);
app.use(facebookMiddleware);

// // Use github OAuth middleware and routes
app.use("/auth", githubRoute);
app.use(githubMiddleware);

// route which validates users
app.post("/validate", validate, (req: Request, res: Response) => {
  const { profileImage } = (req as any).user;
  res.status(200).json({
    message: "User is authenticated",
    profileImage: profileImage,
    success: true,
  });
});

// 404 fallback
// app.get('*', (req: Request, res: Response) => {
//     console.log('site not found');
//     res.status(404).send('Site not found');
// });

// Connect MongoDB
MongoDB(MONGODB_URL);

// Start server
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
