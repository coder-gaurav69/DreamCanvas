import express, { Response, Request } from "express";
import { generateImage , deleteImage, getImages } from "../Controller/generate_delete_get.js";
import userModel from "../Schema/userSchema.js";
import { validate } from "../MiddleWare/authorisation.js";

const route = express.Router();

route.post("/generate-image",validate,generateImage);

route.delete("/delete-image",validate,deleteImage);

route.get('/getImages',validate,getImages);


export default route;