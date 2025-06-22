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
exports.updateToken = void 0;
const catchAsyncError_1 = __importDefault(require("./catchAsyncError"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.updateToken = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // fetch the refresh token from the request cookies
    const { TC_AGENT_X } = req.cookies;
    // verify if token is valid
    const decode = jsonwebtoken_1.default.verify(TC_AGENT_X, process.env.SIGN_IN_REFRESH_SECRET_KEY);
    // NOTE: jwt will return an error if tc_agent_x has expired. No need to check
    const user = decode.user;
    // generate a new access and refresh tokens
    const accessToken = jsonwebtoken_1.default.sign({ user }, process.env.SIGN_IN_ACCESS_SECRET_KEY, {
        expiresIn: `${Number(process.env.ACCESS_TOKEN_EXPIRATION)}m` || "30m",
    });
    const refreshToken = jsonwebtoken_1.default.sign({ user }, process.env.SIGN_IN_REFRESH_SECRET_KEY, {
        expiresIn: `${Number(process.env.REFRESH_TOKEN_EXPIRATION)}d` || "5d",
    });
    const loggedInToken = process.env.LOGGED_IN_TOKEN || "";
    //   save tokens in the response cookie
    // res.cookie("tr_host_x", accessToken, accessTokenOptions);
    // res.cookie("tc_agent_x", refreshToken, refreshTokenOptions);
    // res.cookie("_xur_cr-host", loggedInToken, hasLoggedInTokenOptions);
    req.tokens = { accessToken, loggedInToken, refreshToken };
    req.user = user;
    next();
}));
