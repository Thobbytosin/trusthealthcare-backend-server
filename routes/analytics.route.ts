import { Router } from "express";
import { isUserAuthenticated } from "../middlewares/authentication";
import { authorizeRoleAdmin } from "../middlewares/admin-auth";
import { getUserAnalytics } from "../controllers/analytics.controller";

const analyticsRouter = Router();

// GET USERS ANALYTICS (ADMIN)
analyticsRouter.get(
  "/analytics/users",
  isUserAuthenticated,
  authorizeRoleAdmin("admin"),
  getUserAnalytics
);

export default analyticsRouter;
