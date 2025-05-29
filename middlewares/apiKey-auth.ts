import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/errorHandler";
import { ApiKey } from "../models/apiKey.model";

export const apiKeyAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // skip if user is logged In
  const loggedInUser = req?.user;

  if (loggedInUser) {
    return next();
  }

  const apiKey = req.query.api_key;

  if (!apiKey) {
    return next(new ErrorHandler("Unauthorized: API Key is missing", 401));
  }

  const foundKey = await ApiKey.findOne({
    where: { key: apiKey, isActive: true },
  });

  if (!foundKey) {
    return next(new ErrorHandler("Invalid or expired API key", 401));
  }

  next();
};
