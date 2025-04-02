import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { registerUser } from "./controllers/auth.controller";
import ErrorMiddleware from "./middlewares/error";

export const createTestApp = () => {
  const appTest = express();

  appTest.use(express.json({ limit: "20mb" }));
  appTest.use(cors());
  appTest.use(cookieParser());
  appTest.post("/api/v1/signup", registerUser);
  // appTest.post("/api/v1/account-verification", accountVerification);
  // appTest.post("/api/v1/login", loginUser);

  // unknown route
  appTest.all("*", (req, res, next) => {
    const error = new Error(`Route ${req.originalUrl} not found`) as any;
    error.statusCode = 400;
    next(error);
  });

  // MIDDLEWARES
  // handle errors middleware on all requests
  appTest.use(ErrorMiddleware);

  return appTest;
};
