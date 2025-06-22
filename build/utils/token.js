"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetTokenOptions = exports.verificationTokenOptions = exports.hasLoggedInTokenOptions = exports.refreshTokenOptions = exports.accessTokenOptions = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const isProduction = process.env.NODE_ENV === "production";
// create the tokens expiration time
const accessTokenExpiration = Number(process.env.ACCESS_TOKEN_EXPIRATION) || 30; // minutes
const refreshTokenExpiration = Number(process.env.REFRESH_TOKEN_EXPIRATION) || 5; // day
// cookies options
exports.accessTokenOptions = {
    maxAge: accessTokenExpiration * 60 * 1000, //minutes
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
};
exports.refreshTokenOptions = {
    maxAge: refreshTokenExpiration * 24 * 60 * 60 * 1000, // days
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
};
exports.hasLoggedInTokenOptions = {
    maxAge: refreshTokenExpiration * 24 * 60 * 60 * 1000, // days
    httpOnly: false, // client accessible
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
};
exports.verificationTokenOptions = {
    maxAge: 5 * 60 * 1000, // 5 miuntes
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
};
exports.resetTokenOptions = {
    maxAge: 4 * 60 * 1000, // 4 miuntes
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
};
