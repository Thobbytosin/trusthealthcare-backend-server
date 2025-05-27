import { Router } from "express";
import {
  forgotPassword,
  getUserData,
  resetPassword,
} from "../../controllers/user.controller";
import {
  hasPasswordChangedLast24Hours,
  isUserAuthenticated,
} from "../../middlewares/user-auth";

const userRouterV1 = Router();

// FORGOT PASSWORD
userRouterV1.post(
  "/forgot-password",
  hasPasswordChangedLast24Hours,
  forgotPassword
);

// RESET PASSWORD
userRouterV1.post("/reset-password", resetPassword);

// GET USER DETAILS
userRouterV1.get("/me", isUserAuthenticated, getUserData);

export default userRouterV1;
