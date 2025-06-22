"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_auth_1 = require("../../middlewares/admin-auth");
const analytics_controller_1 = require("../../controllers/analytics.controller");
const analyticsRouterV1 = (0, express_1.Router)();
// GET USERS ANALYTICS (ADMIN)
analyticsRouterV1.get("/analytics/users", (0, admin_auth_1.authorizeRoleAdmin)("admin"), analytics_controller_1.getUsersAnalytics);
// GET DOCTORS ANALYTICS (ADMIN)
analyticsRouterV1.get("/analytics/doctors", (0, admin_auth_1.authorizeRoleAdmin)("admin"), analytics_controller_1.getDoctorsAnalytics);
exports.default = analyticsRouterV1;
