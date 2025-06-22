import { NextFunction, Request, Response } from "express";
import catchAsyncError from "./catchAsyncError";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {
  accessTokenOptions,
  hasLoggedInTokenOptions,
  refreshTokenOptions,
} from "../utils/token";

dotenv.config();

export const updateToken = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    // fetch the refrsh token from the request cookies
    const { tc_agent_x } = req.cookies;

    // verify if token is valid
    const decode = jwt.verify(
      tc_agent_x,
      process.env.SIGN_IN_REFRESH_SECRET_KEY as string
    ) as { user: any };

    // NOTE: jwt will return an error if tc_agent_x has expired. No need to check

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

    const loggedInToken = process.env.LOGGED_IN_TOKEN || "";

    //   save tokens in the response cookie
    // res.cookie("tr_host_x", accessToken, accessTokenOptions);
    // res.cookie("tc_agent_x", refreshToken, refreshTokenOptions);
    // res.cookie("_xur_cr-host", loggedInToken, hasLoggedInTokenOptions);

    req.tokens = { accessToken, loggedInToken, refreshToken };
    req.user = user;
    next();
  }
);
