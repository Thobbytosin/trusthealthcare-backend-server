import { Router } from "express";
import {
  forgotPassword,
  getUserData,
  resetPassword,
} from "../controllers/user.controller";
import {
  hasPasswordChangedLast24Hours,
  isUserAuthenticated,
} from "../middlewares/authentication";

const userRouter = Router();

// FORGOT PASSWORD
userRouter.post(
  "/forgot-password",
  hasPasswordChangedLast24Hours,
  forgotPassword
);

// RESET PASSWORD
userRouter.post("/reset-password", resetPassword);

// GET USER DETAILS
userRouter.get("/me", isUserAuthenticated, getUserData);

export default userRouter;
