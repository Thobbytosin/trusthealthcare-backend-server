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

export const cloudUploader = cloudinary.uploader;

export const cloudApi = cloudinary.api;

interface UploadResult {
  thumbnailId: string;
  thumbnailUrl: string;
}

export const uploadToCloudinary = async (
  thumbnail: any,
  folderPath: string
): Promise<UploadResult> => {
  // delete old thumbnail
  await cloudApi.delete_resources_by_prefix(folderPath);

  const result = await cloudUploader.upload(thumbnail.filepath, {
    folder: folderPath,
    use_filename: true,
    unique_filename: false,
    transformation: { gravity: "face" },
  });

  const publicId = result?.public_id;

  const thumbnailId = publicId?.split("/").pop() as string; // fetch the last id

  const thumbnailUrl = result?.secure_url as string;

  return { thumbnailId, thumbnailUrl };
};
