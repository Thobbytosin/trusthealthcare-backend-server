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
exports.signInWithCredentials = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const token_1 = require("../utils/token");
const helpers_1 = require("../utils/helpers");
const dotenv_1 = __importDefault(require("dotenv"));
const cache_service_1 = require("./cache.service");
dotenv_1.default.config();
const signInWithCredentials = (statusCode, res, req, next, user) => __awaiter(void 0, void 0, void 0, function* () {
    // generate unique access token when user logs in
    const accessToken = jsonwebtoken_1.default.sign({ user }, process.env.SIGN_IN_ACCESS_SECRET_KEY, { expiresIn: `${process.env.ACCESS_TOKEN_EXPIRATION}m` || "30m" });
    // generate unique refresh token when user logs in
    const refreshToken = jsonwebtoken_1.default.sign({ user }, process.env.SIGN_IN_REFRESH_SECRET_KEY, { expiresIn: `${process.env.REFRESH_TOKEN_EXPIRATION}d` || "5d" });
    // accessToken expires in
    const accessTokenExpiresAt = new Date(Date.now() + token_1.accessTokenOptions.maxAge).getTime();
    const loggedInToken = process.env.LOGGED_IN_TOKEN;
    //   save tokens in the response cookie
    res.cookie("tr_host_x", accessToken, token_1.accessTokenOptions);
    res.cookie("tc_agent_x", refreshToken, token_1.refreshTokenOptions);
    res.cookie("_xur_cr-host", loggedInToken, token_1.hasLoggedInTokenOptions);
    if ((user === null || user === void 0 ? void 0 : user.signedInAs) === "user") {
        yield (0, helpers_1.logUserActivity)({
            userId: user.id,
            action: "Logged in",
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
            next,
        });
    }
    else if ((user === null || user === void 0 ? void 0 : user.signedInAs) === "doctor") {
        yield (0, helpers_1.logDoctorActivity)({
            doctorId: user.doctorId || "",
            action: "Doctor Logged in",
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
            next,
        });
    }
    yield (0, cache_service_1.setCachedUser)(user.id, user);
    // send response to the client
    res.status(statusCode).json({
        success: true,
        message: "Logged in successfully",
        user,
        expiresAt: accessTokenExpiresAt,
    });
});
exports.signInWithCredentials = signInWithCredentials;
