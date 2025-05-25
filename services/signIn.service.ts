import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.model";
import jwt from "jsonwebtoken";
import {
  accessTokenOptions,
  hasLoggedInTokenOptions,
  refreshTokenOptions,
} from "../utils/token";
import { logDoctorActivity, logUserActivity } from "../utils/helpers";
import redis from "../utils/redis";

export const signInWithCredentials = async (
  user: User,
  statusCode: number,
  res: Response,
  req: Request,
  next: NextFunction
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

  //   save tokens in the response cookie
  res.cookie("access_token", accessToken, accessTokenOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenOptions);
  res.cookie("has_logged_in", "true", hasLoggedInTokenOptions);

  if (user.signedInAs === "user") {
    await logUserActivity({
      userId: user.id,
      action: "Logged in",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      next,
    });
  } else if (user.signedInAs === "doctor") {
    await logDoctorActivity({
      doctorId: user.doctorId || "",
      action: "Doctor Logged in",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      next,
    });
  }

  // save user to redis
  await redis.set(
    `user - ${user.id}`,
    JSON.stringify(user),
    "EX",
    14 * 24 * 60 * 60
  ); // delete after 14 days (14x24x60x60)
  // await redis.set(user.id, JSON.stringify(user), 'EX', 3600) //  expiring in 1 hour

  // send response to the client
  res.status(statusCode).json({
    success: true,
    message: "Logged in successfully",
    user,
    expiresAt: accessTokenExpiresAt,
  });
};
