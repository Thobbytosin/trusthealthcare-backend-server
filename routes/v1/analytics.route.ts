import { Router } from "express";
import { isUserAuthenticated } from "../../middlewares/user-auth";
import { authorizeRoleAdmin } from "../../middlewares/admin-auth";
import {
  getDoctorsAnalytics,
  getUsersAnalytics,
} from "../../controllers/analytics.controller";

const analyticsRouterV1 = Router();

// GET USERS ANALYTICS (ADMIN)
analyticsRouterV1.get(
  "/analytics/users",
  isUserAuthenticated,
  authorizeRoleAdmin("admin"),
  getUsersAnalytics
);

// GET DOCTORS ANALYTICS (ADMIN)
analyticsRouterV1.get(
  "/analytics/doctors",
  isUserAuthenticated,
  authorizeRoleAdmin("admin"),
  getDoctorsAnalytics
);

export default analyticsRouterV1;
