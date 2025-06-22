"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToCloudinary = exports.cloudApi = exports.cloudUploader = void 0;
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const CLOUD_NAME = process.env.CLOUD_NAME;
const CLOUD_SECRET = process.env.CLOUD_SECRET;
const CLOUD_KEY = process.env.CLOUD_KEY;
cloudinary_1.v2.config({
    cloud_name: CLOUD_NAME,
    api_key: CLOUD_KEY,
    api_secret: CLOUD_SECRET,
    secure: true,
});
exports.cloudUploader = cloudinary_1.v2.uploader;
exports.cloudApi = cloudinary_1.v2.api;
const uploadToCloudinary = (thumbnail, folderPath) => __awaiter(void 0, void 0, void 0, function* () {
    // delete old thumbnail
    yield exports.cloudApi.delete_resources_by_prefix(folderPath);
    const result = yield exports.cloudUploader.upload(thumbnail.filepath, {
        folder: folderPath,
        use_filename: true,
        unique_filename: false,
        transformation: { gravity: "face" },
    });
    const publicId = result === null || result === void 0 ? void 0 : result.public_id;
    const thumbnailId = publicId === null || publicId === void 0 ? void 0 : publicId.split("/").pop(); // fetch the last id
    const thumbnailUrl = result === null || result === void 0 ? void 0 : result.secure_url;
    return { thumbnailId, thumbnailUrl };
});
exports.uploadToCloudinary = uploadToCloudinary;
