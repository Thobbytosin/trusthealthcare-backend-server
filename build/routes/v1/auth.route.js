"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../../controllers/auth.controller");
const user_auth_1 = require("../../middlewares/user-auth");
const updateToken_1 = require("../../middlewares/updateToken");
const authRouterV1 = (0, express_1.Router)();
// SIGN UP
authRouterV1.post("/signup", auth_controller_1.registerUser);
// ACCOUNT VERIFICATION
authRouterV1.post("/account-verification", auth_controller_1.accountVerification);
// RESEND VERIFICATION CODE
authRouterV1.post("/resend-verification-code", auth_controller_1.resendVerificationCode);
// LOGIN
authRouterV1.post("/login", auth_controller_1.loginUser);
// SIGN OUT
authRouterV1.post("/signout", user_auth_1.isUserAuthenticated, auth_controller_1.signOut);
// REFRESH TOKEN
authRouterV1.get("/refresh-tokens", updateToken_1.updateToken, auth_controller_1.refreshToken);
// CLEAR ACCESS TOKEN
authRouterV1.get("/clear-access-token", auth_controller_1.clearAccessToken);
exports.default = authRouterV1;
