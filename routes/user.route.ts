import { Router } from "express";
import {
  accountVerification,
  forgotPassword,
  getUserData,
  loginUser,
  registerUser,
  resendVerificationCode,
  resetPassword,
  signOut,
} from "../controllers/auth.controller";
import {
  hasPasswordChangedLast24Hours,
  isUserAuthenticated,
} from "../middlewares/authentication";
import { updateAccessToken } from "../middlewares/updateToken";

const userRouter = Router();

userRouter.post("/signup", registerUser);
userRouter.post("/account-verification", accountVerification);
userRouter.post("/resend-verification-code", resendVerificationCode);
userRouter.post("/login", loginUser);
userRouter.post(
  "/forgot-password",
  hasPasswordChangedLast24Hours,
  forgotPassword
);
userRouter.post("/reset-password", resetPassword);
userRouter.post("/signout", isUserAuthenticated, updateAccessToken, signOut);
userRouter.get("/me", isUserAuthenticated, updateAccessToken, getUserData);

export default userRouter;
