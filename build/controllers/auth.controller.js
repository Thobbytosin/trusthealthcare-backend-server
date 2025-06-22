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
exports.validateToken = exports.clearAccessToken = exports.refreshToken = exports.signOut = exports.loginUser = exports.resendVerificationCode = exports.accountVerification = exports.registerUser = void 0;
const catchAsyncError_1 = __importDefault(require("../middlewares/catchAsyncError"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const user_model_1 = require("../models/user.model");
const helpers_1 = require("../utils/helpers");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const sendMail_1 = require("../utils/sendMail");
const token_1 = require("../utils/token");
const redis_1 = __importDefault(require("../config/redis"));
const signIn_service_1 = require("../services/signIn.service");
const apiKey_model_1 = require("../models/apiKey.model");
dotenv_1.default.config();
//////////////////////////////////////////////////////////////////////////////////////////////// USER REGISTRATION
exports.registerUser = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    if (!name ||
        !email ||
        !password ||
        name.trim() === "" ||
        email.trim() === "" ||
        password.trim() === "") {
        return next(new errorHandler_1.default("All fields are required", 400));
    }
    const isUserExists = yield user_model_1.User.findOne({ where: { email } });
    if (isUserExists) {
        return next(new errorHandler_1.default("Account already exists. Please proceed to sign in to your account", 409));
    }
    if (!helpers_1.isEmailValid.test(email)) {
        return next(new errorHandler_1.default("Please enter a valid email", 400));
    }
    if (!(0, helpers_1.isPasswordStrong)(password)) {
        return next(new errorHandler_1.default("Password security is too weak", 400));
    }
    const hashedPassword = bcryptjs_1.default.hashSync(password, 10);
    const user = {
        name,
        email,
        password: hashedPassword,
    };
    const { verificationCode, verificationToken } = (0, helpers_1.createVerificationToken)(user);
    // data to be sent to the email
    const mailData = { name: user.name, verificationCode };
    // try-catch block for the email
    try {
        // send SMS
        // await sendVerificationSMS("2349167571188", verificationCode);
        // send mail
        yield (0, sendMail_1.sendMail)({
            email: user.email,
            subject: "Account Verification",
            templateName: "verification-email.ejs",
            templateData: mailData,
        });
        // save token in the response cookie
        res.cookie("verification_token", verificationToken, token_1.verificationTokenOptions);
        res.status(200).json({
            success: true,
            message: "A 6-digit verification code has been sent to your email address.",
        });
    }
    catch (error) {
        return next(new errorHandler_1.default("Falied to send verification mail", 400));
    }
}));
//////////////////////////////////////////////////////////////////////////////////////////////// ACCOUNT ACTIVATION
exports.accountVerification = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const verificationToken = req.cookies.verification_token;
    const { verificationCode } = req.body;
    if (!verificationToken) {
        return next(new errorHandler_1.default("Verification code has expired", 401));
    }
    if (!verificationCode || verificationCode.trim() === "") {
        return next(new errorHandler_1.default("All fields are required", 400));
    }
    const credentials = jsonwebtoken_1.default.verify(verificationToken, process.env.JWT_VERIFICATION_SECRET_KEY);
    if (credentials.verificationCode !== verificationCode) {
        return next(new errorHandler_1.default("Access Denied: Invalid Verification code", 403));
    }
    const { name, email, password } = credentials.user;
    const userExists = yield user_model_1.User.findOne({ where: { email } });
    if (userExists)
        return next(new errorHandler_1.default("Account already exists", 409));
    const user = yield user_model_1.User.create({
        name,
        email,
        password,
        verified: true,
    });
    // const user = await User.findOne({ where: { email } });
    if (!user)
        return next(new errorHandler_1.default("Error processing acocount: Account not found", 404));
    // check if user already has an apikey
    const userHasApiKeyAlready = yield apiKey_model_1.ApiKey.findOne({
        where: { email, isActive: true },
    });
    const apiKey = (0, helpers_1.generateApiKey)();
    if (!userHasApiKeyAlready) {
        yield apiKey_model_1.ApiKey.create({
            key: apiKey,
            owner: user.id,
            email: user.email,
            isActive: true,
        });
    }
    // data to be sent to the email
    const mailData = { name: user.name };
    const results = yield Promise.allSettled([
        (0, sendMail_1.sendMail)({
            email: user.email,
            subject: "Welcome Message",
            templateData: mailData,
            templateName: "welcome-email.ejs",
        }),
        (0, helpers_1.logUserActivity)({
            userId: user.id,
            action: "Signed up",
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
            next,
        }),
    ]);
    const [mailResult, logResult] = results;
    if (mailResult.status === "rejected") {
        return next(new errorHandler_1.default("Falied to send verification success mail", 400));
    }
    if (logResult.status === "rejected") {
        return next(new errorHandler_1.default("Error verifying user: Something went wrong", 400));
    }
    res.status(201).json({
        success: true,
        message: "Account Verification Successful!",
    });
}));
// /////////////////////////////////////////////////////////////////////////////////////////////// RESEND VERIFICATION CODE
exports.resendVerificationCode = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const oldVerificationToken = req.cookies.verification_token;
    if (!oldVerificationToken)
        return next(new errorHandler_1.default("Session has expired. Try Again", 401));
    const credentials = jsonwebtoken_1.default.verify(oldVerificationToken, process.env.JWT_VERIFICATION_SECRET_KEY);
    // if there is no credentials (i.e token has expired). it goes to the error middleware
    const user = credentials.user;
    // generate a new verification code
    const { verificationCode, verificationToken } = (0, helpers_1.createVerificationToken)(user);
    // data to be sent to the email
    const mailData = { name: user.name, verificationCode: verificationCode };
    // try-catch block for the email
    try {
        // send SMS
        // await sendVerificationSMS("2349167571188", verificationCode);
        // send mail
        yield (0, sendMail_1.sendMail)({
            email: user.email,
            subject: "Resent Verification Code",
            templateName: "verification-email.ejs", // generate a new template
            templateData: mailData,
        });
        // save token in the response cookie
        res.cookie("verification_token", verificationToken, // new verification token
        token_1.verificationTokenOptions);
        res.status(200).json({
            success: true,
            message: "A new 6-digit verification code has been re-sent to your email address.",
        });
    }
    catch (error) {
        return next(new errorHandler_1.default("Falied to re-send verification mail", 400));
    }
}));
// //////////////////////////////////////////////////////////////////////////////////////////////// SIGN IN USER
exports.loginUser = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, role } = req.body;
    if (!email || !password || email.trim() === "" || password.trim() === "")
        return next(new errorHandler_1.default("All fields are required", 403));
    // check if user exists
    const user = yield user_model_1.User.scope("withPassword").findOne({ where: { email } }); // include password
    if (!user)
        return next(new errorHandler_1.default("Account not found", 404));
    // user must be a doctor to sign in as a doctor
    if (role === "doctor" &&
        !user.role.some((role) => ["doctor"].includes(role)))
        return next(new errorHandler_1.default("Permission denied: You are not registered as a doctor", 403));
    // check if password matches
    const isPasswordMatch = bcryptjs_1.default.compareSync(password, user.password || "");
    if (!isPasswordMatch)
        return next(new errorHandler_1.default("Invalid credentials", 404));
    // set the user last login
    user.lastLogin = new Date();
    if (role === "doctor") {
        user.signedInAs = role;
    }
    else if (role === "admin") {
        user.signedInAs = role;
    }
    else {
        user.signedInAs = "user";
    }
    yield user.save();
    // remove the password when sending user details to the client
    const newUser = yield user_model_1.User.findOne({ where: { email } });
    // sign in user
    if (newUser) {
        (0, signIn_service_1.signInWithCredentials)(200, res, req, next, newUser);
    }
    else {
        return next(new errorHandler_1.default("Error signing in", 408));
    }
}));
// //////////////////////////////////////////////////////////////////////////////////////////////// SIGN OUT USER
exports.signOut = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const loggedInUser = req.user;
    if (loggedInUser.signedInAs === "user") {
        yield (0, helpers_1.logUserActivity)({
            userId: loggedInUser.id,
            action: "Logged out",
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
            next,
        });
    }
    else if (loggedInUser.signedInAs === "doctor") {
        yield (0, helpers_1.logDoctorActivity)({
            doctorId: loggedInUser.doctorId || "",
            action: "Doctor Logged out",
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
            next,
        });
    }
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    res.clearCookie("has_logged_in");
    // delete user from db
    yield (redis_1.default === null || redis_1.default === void 0 ? void 0 : redis_1.default.del(`user - ${loggedInUser.id}`));
    res.status(200).json({ success: true, message: "Signed out" });
}));
//////////////////////////////////////////////////////////////////////////////////////////////// UPDATE TOKEN
exports.refreshToken = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { accessToken, loggedInToken, refreshToken } = req.tokens;
    if (user.signedInAs === "user") {
        yield (0, helpers_1.logUserActivity)({
            userId: user.id,
            action: "Token Refreshed",
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
            next,
        });
    }
    else if (user.signedInAs === "doctor") {
        yield (0, helpers_1.logDoctorActivity)({
            doctorId: user.doctorId || "",
            action: "Doctor Token Refreshed",
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
            next,
        });
    }
    // accessToken expires in
    const accessTokenExpiresAt = new Date(Date.now() + token_1.accessTokenOptions.maxAge).getTime();
    res.status(200).json({
        success: true,
        message: "Token Refreshed",
        expiresAt: accessTokenExpiresAt,
        accessToken,
        refreshToken,
        loggedInToken,
    });
}));
//////////////////////////////////////////////////////////////////////////////////////////////// CLEAR ACCESS TOKEN
exports.clearAccessToken = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie("tr_host_x");
    res.status(200).json({
        success: true,
        message: "Session Timeout cleared due to inactivity",
    });
}));
//////////////////////////////////////////////////////////////////////////////////////////////// CLEAR ACCESS TOKEN
exports.validateToken = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({
        success: true,
        message: "Validated",
    });
}));
