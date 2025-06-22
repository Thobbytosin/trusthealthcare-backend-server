import { Router } from "express";
import {
  accountVerification,
  clearAccessToken,
  loginUser,
  refreshToken,
  registerUser,
  resendVerificationCode,
  signOut,
} from "../../controllers/auth.controller";
import { isUserAuthenticated } from "../../middlewares/user-auth";
import { updateToken } from "../../middlewares/updateToken";

const authRouterV1 = Router();

// SIGN UP
authRouterV1.post("/signup", registerUser);

// ACCOUNT VERIFICATION
authRouterV1.post("/account-verification", accountVerification);

// RESEND VERIFICATION CODE
authRouterV1.post("/resend-verification-code", resendVerificationCode);

// LOGIN
authRouterV1.post("/login", loginUser);

// SIGN OUT
authRouterV1.post("/signout", isUserAuthenticated, signOut);

// REFRESH TOKEN
authRouterV1.get("/refresh-tokens", updateToken, refreshToken);

// CLEAR ACCESS TOKEN
authRouterV1.get("/clear-access-token", clearAccessToken);

export default authRouterV1;
