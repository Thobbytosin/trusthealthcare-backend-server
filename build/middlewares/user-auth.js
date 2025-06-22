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
exports.hasPasswordChangedLast24Hours = exports.isUserAuthenticated = void 0;
const catchAsyncError_1 = __importDefault(require("./catchAsyncError"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_model_1 = require("../models/user.model");
dotenv_1.default.config();
exports.isUserAuthenticated = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // check if user is logged in (check and verify access token)
    const { TR_HOST_X } = req.cookies;
    // if there is no access token
    if (!TR_HOST_X)
        return next(new errorHandler_1.default("Unauthorized: Authentication required.", 401));
    // verify access token
    const decodeAccess = jsonwebtoken_1.default.verify(TR_HOST_X, process.env.SIGN_IN_ACCESS_SECRET_KEY || "");
    if (!decodeAccess)
        return next(new errorHandler_1.default("Unauthorized: Invalid authentication token", 401));
    req.user = decodeAccess.user;
    return next();
}));
// check if password has been rest in the past 24 hours
exports.hasPasswordChangedLast24Hours = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const user = yield user_model_1.User.findOne({ where: { email } });
    // console.log(user?.dataValues);
    // check if user exists
    if (!user)
        return next(new errorHandler_1.default("Account does not exist", 404));
    // for first time
    if (user.lastPasswordReset === null) {
        req.user = user === null || user === void 0 ? void 0 : user.dataValues;
        return next();
    }
    const userLastResetDate = new Date(user.lastPasswordReset || "");
    const presentDate = new Date();
    const timeDifference = presentDate.getTime() - userLastResetDate.getTime();
    const twentFourHours = 24 * 60 * 60 * 1000; // milliseconds
    if (timeDifference > twentFourHours) {
        req.user = user === null || user === void 0 ? void 0 : user.dataValues;
        return next();
    }
    else {
        return next(new errorHandler_1.default("You can only reset a password once in 24 hours. Contact support for further assistance", 400));
    }
}));
