import { NextFunction, Request, Response } from "express";
import catchAsyncError from "./catchAsyncError";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { accessTokenOptions, refreshTokenOptions } from "../utils/token";
import ErrorHandler from "../utils/errorHandler";

dotenv.config();

export const updateToken = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    // fetch the refrsh token from the request cookies
    const { refresh_token } = req.cookies;

    if (!refresh_token)
      return next(
        new ErrorHandler(
          "Access Restricted: You are not currently logged in.",
          403
        )
      );

    // verify if token is valid
    const decode = jwt.verify(
      refresh_token,
      process.env.SIGN_IN_REFRESH_SECRET_KEY as string
    ) as { user: any };

    // NOTE: jwt will return an error if refresh_token has expired. No need to check

    const user = decode.user;

    // generate a new access and refresh tokens
    const accessToken = jwt.sign(
      { user },
      process.env.SIGN_IN_ACCESS_SECRET_KEY as string,
      {
        expiresIn:
          `${Number(process.env.ACCESS_TOKEN_EXPIRATION) as any}m` || "30m",
      }
    );

    const refreshToken = jwt.sign(
      { user },
      process.env.SIGN_IN_REFRESH_SECRET_KEY as string,
      {
        expiresIn:
          `${Number(process.env.REFRESH_TOKEN_EXPIRATION) as any}d` || "5d",
      }
    );

    res.cookie("access_token", accessToken, accessTokenOptions);
    res.cookie("refresh_token", refreshToken, refreshTokenOptions);

    req.user = user;
    next();
  }
);
