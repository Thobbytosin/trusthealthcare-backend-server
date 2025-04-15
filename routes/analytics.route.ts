import { Router } from "express";
import { isUserAuthenticated } from "../middlewares/authentication";
import { authorizeRoleAdmin } from "../middlewares/admin-auth";
import {
  getDoctorsAnalytics,
  getUsersAnalytics,
} from "../controllers/analytics.controller";

const analyticsRouter = Router();

// GET USERS ANALYTICS (ADMIN)
analyticsRouter.get(
  "/analytics/users",
  isUserAuthenticated,
  authorizeRoleAdmin("admin"),
  getUsersAnalytics
);

// GET DOCTORS ANALYTICS (ADMIN)
analyticsRouter.get(
  "/analytics/doctors",
  isUserAuthenticated,
  authorizeRoleAdmin("admin"),
  getDoctorsAnalytics
);

export default analyticsRouter;
