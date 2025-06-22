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
exports.validateDoctorData = void 0;
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const catchAsyncError_1 = __importDefault(require("./catchAsyncError"));
const requireFields = [
    "name",
    "email",
    "about",
    "securityAnswer",
    "securityQuestion",
    "specialization",
    "yearsOfExperience",
    "workExperience",
    "education",
    "hospital",
    "licenseNumber",
    "certifications",
    "availableDays",
    "timeSlots",
    "city",
    "state",
    "zipCode",
    "phone",
    "maxPatientsPerDay",
];
// validate doctor middleware
exports.validateDoctorData = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const data = req.body;
    const { thumbnail } = req.files; // for doctor profile image
    if (Object.keys(data).length === 0 || !data)
        return next(new errorHandler_1.default("All fields are required", 400));
    // check for missing required fields
    const missingFields = requireFields.filter((field) => {
        const value = data[field];
        // check for missing required fields (for strings, numbers and arrays)
        return (value === undefined ||
            value === null ||
            (typeof value === "string" && value.trim() === "") ||
            (Array.isArray(value) && value.length === 0));
    });
    if (missingFields.length > 0) {
        return next(new errorHandler_1.default(`Missing required fields: ${missingFields.join(", ")}`, 404));
    }
    if (req.method === "POST") {
        // check if doctor  uploaded an image
        if (thumbnail === null || thumbnail === undefined)
            return next(new errorHandler_1.default("Permission Denied: Doctor MUST have an image", 403));
        // check if user is uploading more than 1 image
        if (Array.isArray(thumbnail))
            return next(new errorHandler_1.default("Multiple images not allowed", 403));
        if (((_a = thumbnail.mimetype) === null || _a === void 0 ? void 0 : _a.startsWith("image/svg")) ||
            !((_b = thumbnail.mimetype) === null || _b === void 0 ? void 0 : _b.startsWith("image")))
            return next(new errorHandler_1.default("Invalid image format. File must be an image(.jpg, .png, .jpeg)", 403));
    }
    // ensure some fields are array
    const ensureArray = (value) => {
        if (Array.isArray(value))
            return value;
        if (typeof value === "string")
            return [value];
        return [];
    };
    const formattedData = Object.assign(Object.assign({}, data), { city: data.city.toLowerCase(), education: ensureArray(data.education), certifications: ensureArray(data.certifications), availableDays: ensureArray(data.availableDays), workExperience: ensureArray(data.workExperience), hospital: ensureArray(data.hospital), specialization: ensureArray(data.specialization), timeSlots: (_c = data.availableDays) === null || _c === void 0 ? void 0 : _c.reduce((acc, day) => {
            acc[day] = ensureArray(data === null || data === void 0 ? void 0 : data.timeSlots[day]);
            return acc;
        }, {}) });
    req.body = formattedData;
    next();
}));
