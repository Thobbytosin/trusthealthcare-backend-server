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
exports.getUserData = exports.resetPassword = exports.forgotPassword = void 0;
const catchAsyncError_1 = __importDefault(require("../middlewares/catchAsyncError"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const user_model_1 = require("../models/user.model");
const helpers_1 = require("../utils/helpers");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const sendMail_1 = require("../utils/sendMail");
const token_1 = require("../utils/token");
const cache_service_1 = require("../services/cache.service");
dotenv_1.default.config();
// //////////////////////////////////////////////////////////////////////////////////////////////// FORGOT PASSWORD
exports.forgotPassword = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email)
        return next(new errorHandler_1.default("Field is required", 403));
    // from the hasPasswordChanged middleware
    const user = req.user;
    // generate the reset token and code
    const { resetCode, resetToken } = (0, helpers_1.createResetPasswordToken)(user);
    // data to be sent to the email template
    const mailData = { name: user.name, resetCode };
    try {
        yield (0, sendMail_1.sendMail)({
            subject: "Password Reset",
            email: user.email,
            templateName: "reset-password-email.ejs",
            templateData: mailData,
        });
        // save token in the response cookie
        res.cookie("reset_token", resetToken, token_1.resetTokenOptions);
        res.status(200).json({
            success: true,
            message: "A password reset code has been sent to your email address. This code is valid for 4 minutes.",
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
}));
// //////////////////////////////////////////////////////////////////////////////////////////////// RESET PASSWORD
exports.resetPassword = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const resetToken = req.cookies.reset_token;
    const { resetCode, password } = req.body;
    if (!resetToken)
        return next(new errorHandler_1.default("Session has expired. Try Again", 404));
    if (!resetCode || !password)
        return next(new errorHandler_1.default("All fields are required", 403));
    const credentials = jsonwebtoken_1.default.verify(resetToken, process.env.JWT_RESET_SECRET_KEY);
    // check if code is equal to the reset code stored in  backend
    if (credentials.resetCode !== resetCode)
        return next(new errorHandler_1.default("Access Denied: Invalid reset code", 403));
    // find the account
    const user = yield user_model_1.User.findOne({
        where: { email: credentials.user.email },
    });
    if (!user)
        return next(new errorHandler_1.default("Permission Denied: Account does not exist", 404));
    // check if password security is strong
    if (!(0, helpers_1.isPasswordStrong)(password)) {
        return next(new errorHandler_1.default("Password security is too weak", 401));
    }
    // encrypt password
    const hashedPassword = bcryptjs_1.default.hashSync(password, 10);
    // set the user last password reset time
    user.lastPasswordReset = new Date();
    // set the password as the new user password
    user.password = hashedPassword;
    yield user.save();
    const mailData = { name: user.name };
    // send password success mail
    try {
        yield (0, sendMail_1.sendMail)({
            email: user.email,
            subject: "Password Reset Success",
            templateData: mailData,
            templateName: "reset-password-success-email.ejs",
        });
        yield (0, helpers_1.logUserActivity)({
            userId: user.id,
            action: "Password reset",
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
            next,
        });
        res.status(200).json({
            success: true,
            message: "Your password has been reset successfully.",
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
}));
// //////////////////////////////////////////////////////////////////////////////////////////////// GET USER DATA
exports.getUserData = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    let user = yield (0, cache_service_1.getCachedUser)(userId);
    if (!user) {
        user = yield user_model_1.User.findByPk(userId);
        if (!user) {
            return next(new errorHandler_1.default("Not Found: User Account does not exist", 404));
        }
        yield (0, cache_service_1.setCachedUser)(userId, user);
    }
    res.status(200).json({ success: true, user });
}));
