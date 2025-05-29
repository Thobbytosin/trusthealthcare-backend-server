import { Router } from "express";
import { authorizeRoleAdmin } from "../../middlewares/admin-auth";
import {
  getDoctorsAnalytics,
  getUsersAnalytics,
} from "../../controllers/analytics.controller";

const analyticsRouterV1 = Router();

// GET USERS ANALYTICS (ADMIN)
analyticsRouterV1.get(
  "/analytics/users",
  authorizeRoleAdmin("admin"),
  getUsersAnalytics
);

// GET DOCTORS ANALYTICS (ADMIN)
analyticsRouterV1.get(
  "/analytics/doctors",
  authorizeRoleAdmin("admin"),
  getDoctorsAnalytics
);

export default analyticsRouterV1;
