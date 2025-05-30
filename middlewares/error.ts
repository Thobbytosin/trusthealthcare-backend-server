import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/errorHandler";

const ErrorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = typeof err === "object" ? err.statusCode || 500 : 500;
  err.message =
    typeof err === "object"
      ? err.message || "Something went wrong. Please try again later."
      : String(err);
  err.name =
    typeof err === "object"
      ? err.name || "Something went wrong. Please try again later."
      : String(err);

  if (err.name === "TokenExpiredError" || err.message === "jwt expired") {
    const message = "Session has ended.";
    err = new ErrorHandler(message, 401);
  }

  if (err.message === "invalid signature") {
    const message = "Invalid Token.";
    err = new ErrorHandler(message, 400);
  }

  if (err.name === "JsonWebTokenError") {
    const message = "Session has expired. Kindly login.";
    err = new ErrorHandler(message, 401);
  }

  if (err.message.startsWith("Doctor validation failed:")) {
    const message = "All doctor parameters must be entered";
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({ success: false, message: err.message });
};

export default ErrorMiddleware;
