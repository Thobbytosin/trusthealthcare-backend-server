import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

const CLOUD_NAME = process.env.CLOUD_NAME;
const CLOUD_SECRET = process.env.CLOUD_SECRET;
const CLOUD_KEY = process.env.CLOUD_KEY;

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_KEY,
  api_secret: CLOUD_SECRET,
  secure: true,
});

const cloudUploader = cloudinary.uploader;

export const cloudApi = cloudinary.api;

export default cloudUploader;
