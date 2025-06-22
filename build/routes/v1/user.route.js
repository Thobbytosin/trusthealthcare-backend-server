"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../../controllers/user.controller");
const user_auth_1 = require("../../middlewares/user-auth");
const apiKey_auth_1 = require("../../middlewares/apiKey-auth");
const userRouterV1 = (0, express_1.Router)();
// FORGOT PASSWORD
userRouterV1.post("/forgot-password", user_auth_1.hasPasswordChangedLast24Hours, user_controller_1.forgotPassword);
// RESET PASSWORD
userRouterV1.post("/reset-password", user_controller_1.resetPassword);
// GET USER DETAILS
userRouterV1.get("/me", user_auth_1.isUserAuthenticated, apiKey_auth_1.apiKeyAuth, user_controller_1.getUserData);
exports.default = userRouterV1;
