import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.model";
import jwt from "jsonwebtoken";
import {
  accessTokenOptions,
  hasLoggedInTokenOptions,
  refreshTokenOptions,
} from "../utils/token";
import { logDoctorActivity, logUserActivity } from "../utils/helpers";
import dotenv from "dotenv";
import { setCachedUser } from "./cache.service";

dotenv.config();

export const signInWithCredentials = async (
  statusCode: number,
  res: Response,
  req: Request,
  next: NextFunction,
  user?: User | any
) => {
  // generate unique access token when user logs in
  const accessToken = jwt.sign(
    { user },
    process.env.SIGN_IN_ACCESS_SECRET_KEY as string,
    { expiresIn: `${process.env.ACCESS_TOKEN_EXPIRATION as any}m` || "30m" }
  );

  // generate unique refresh token when user logs in
  const refreshToken = jwt.sign(
    { user },
    process.env.SIGN_IN_REFRESH_SECRET_KEY as string,
    { expiresIn: `${process.env.REFRESH_TOKEN_EXPIRATION as any}d` || "5d" }
  );

  // accessToken expires in
  const accessTokenExpiresAt = new Date(
    Date.now() + accessTokenOptions.maxAge
  ).getTime();

  const loggedInToken = process.env.LOGGED_IN_TOKEN;

  //   save tokens in the response cookie
  res.cookie("tr_host_x", accessToken, accessTokenOptions);
  res.cookie("tc_agent_x", refreshToken, refreshTokenOptions);
  res.cookie("_xur_cr_host", loggedInToken, hasLoggedInTokenOptions);

  if (user?.signedInAs === "user") {
    await logUserActivity({
      userId: user.id,
      action: "Logged in",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      next,
    });
  } else if (user?.signedInAs === "doctor") {
    await logDoctorActivity({
      doctorId: user.doctorId || "",
      action: "Doctor Logged in",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      next,
    });
  }

  await setCachedUser(user.id, user);

  // send response to the client
  res.status(statusCode).json({
    success: true,
    message: "Logged in successfully",
    user,
    expiresAt: accessTokenExpiresAt,
    accessToken,
    refreshToken,
    loggedInToken,
  });
};
