import { Router } from "express";
import {
  accountVerification,
  loginUser,
  refreshToken,
  registerUser,
  resendVerificationCode,
  signOut,
} from "../controllers/auth.controller";
import { isUserAuthenticated } from "../middlewares/authentication";
import { updateToken } from "../middlewares/updateToken";

const authRouter = Router();

authRouter.post("/signup", registerUser);
authRouter.post("/account-verification", accountVerification);
authRouter.post("/resend-verification-code", resendVerificationCode);
authRouter.post("/login", loginUser);
authRouter.post("/signout", isUserAuthenticated, signOut);
authRouter.get("/refresh-tokens", updateToken, refreshToken);

export default authRouter;
