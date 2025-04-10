import { Router } from "express";
import {
  accountVerification,
  deleteUser,
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
import { updateToken } from "../middlewares/updateToken";
import { authorizeRoleAdmin } from "../middlewares/admin-auth";

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
userRouter.post("/signout", isUserAuthenticated, updateToken, signOut);
userRouter.get("/me", isUserAuthenticated, updateToken, getUserData);
userRouter.delete(
  "/delete-user/:userId",
  isUserAuthenticated,
  updateToken,
  authorizeRoleAdmin("admin"),
  deleteUser
);

export default userRouter;
