import { Router } from "express";
import {
  accountVerification,
  clearAccessToken,
  loginUser,
  refreshToken,
  registerUser,
  resendVerificationCode,
  signOut,
} from "../controllers/auth.controller";
import { isUserAuthenticated } from "../middlewares/authentication";
import { updateToken } from "../middlewares/updateToken";

const authRouter = Router();

// SIGN UP
authRouter.post("/signup", registerUser);

// ACCOUNT VERIFICATION
authRouter.post("/account-verification", accountVerification);

// RESEND VERIFICATION CODE
authRouter.post("/resend-verification-code", resendVerificationCode);

// LOGIN
authRouter.post("/login", loginUser);

// SIGN OUT
authRouter.post("/signout", isUserAuthenticated, signOut);

// REFRESH TOKEN
authRouter.get("/refresh-tokens", updateToken, refreshToken);

// REFRESH TOKEN
authRouter.get("/clear-access-token", clearAccessToken);

export default authRouter;
