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

userRouter.post(
  "/forgot-password",
  hasPasswordChangedLast24Hours,
  forgotPassword
);
userRouter.post("/reset-password", resetPassword);
userRouter.get("/me", isUserAuthenticated, getUserData);

export default userRouter;
