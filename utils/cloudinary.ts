import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import ErrorHandler from "./errorHandler";
import { Response } from "express";

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

export const uploadToCloudinary = async (
  res: Response,
  thumbnail: any,
  folderPath: string
) => {
  let thumbnailId;
  let thumbnailUrl;

  await cloudUploader.upload(
    thumbnail.filepath,
    {
      folder: folderPath,
      transformation: { gravity: "face" },
    },
    async (error: any, result) => {
      // if there is an error, the code stops here

      if (error)
        return res.status(400).json({ success: false, message: error.message });

      const publicId = result?.public_id;

      thumbnailId = publicId?.split("/").pop() as string; // fetch the last id

      thumbnailUrl = result?.secure_url as string;

      // console.log(thumbnailId, thumbnailUrl);

      // data.thumbnail = {
      //   id: thumbnailId,
      //   url: thumbnailUrl,
      // };
    }
  );

  return { thumbnailId, thumbnailUrl };
};

export const cloudApi = cloudinary.api;

export default cloudUploader;
