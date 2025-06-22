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
exports.requestApiKey = void 0;
const catchAsyncError_1 = __importDefault(require("../middlewares/catchAsyncError"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const helpers_1 = require("../utils/helpers");
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const apiKey_model_1 = require("../models/apiKey.model");
exports.requestApiKey = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { owner, email } = req.body;
    if (!owner || !email) {
        return next(new errorHandler_1.default("Missing required fields", 400));
    }
    if (!helpers_1.isEmailValid.test(email)) {
        return next(new errorHandler_1.default("Please enter a valid email", 400));
    }
    const userHasApiKeyAlready = yield apiKey_model_1.ApiKey.findOne({
        where: { email, isActive: true },
    });
    if (userHasApiKeyAlready) {
        return next(new errorHandler_1.default("You already have your API KEY. Check your dashboard to access it.", 409));
    }
    const key = (0, helpers_1.generateApiKey)();
    // data to be sent to the email
    const mailData = { owner, apiKey: key };
    const results = yield Promise.allSettled([
        (0, sendMail_1.default)({
            email: email,
            subject: "Trust HealthCare API Key",
            templateData: mailData,
            templateName: "api-key-email.ejs",
        }),
        apiKey_model_1.ApiKey.create({ key, owner, email, isActive: true }),
    ]);
    const [mailResult, apiKeyResult] = results;
    if (mailResult.status === "rejected") {
        return next(new errorHandler_1.default("Falied to send verification success mail", 400));
    }
    if (apiKeyResult.status === "rejected") {
        return next(new errorHandler_1.default(`Error validating your account. Try again`, 400));
    }
    res.status(200).json({
        success: true,
        message: "Your API Key has been sent your email. Please keep safe",
    });
}));
