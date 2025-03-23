import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Response } from "express";

dotenv.config();

interface IUserNoPassword {
  name: string;
  email: string;
}

interface ITokenOptions {
  maxAge: number;
  httpOnly: boolean;
  sameSite: "none" | "lax" | "strict";
  secure?: boolean;
}

const isProduction = process.env.NODE_ENV === "production";

// create the tokens expiration time
const accessTokenExpiration: any =
  Number(process.env.ACCESS_TOKEN_EXPIRATION) || 1;

const refreshTokenExpiration: any =
  Number(process.env.REFRESH_TOKEN_EXPIRATION) || 7;

// cookies options
export const accessTokenOptions: ITokenOptions = {
  maxAge: accessTokenExpiration * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction,
};

export const refreshTokenOptions: ITokenOptions = {
  maxAge: refreshTokenExpiration * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction,
};

export const verificationTokenOptions: ITokenOptions = {
  maxAge: 4 * 60 * 1000, // 4 miuntes
  httpOnly: true,
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction,
};

export const resetTokenOptions: ITokenOptions = {
  maxAge: 4 * 60 * 1000, // 4 miuntes
  httpOnly: true,
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction,
};

export const signInWithCredentials = (
  user: IUserNoPassword,
  statusCode: number,
  res: Response
) => {
  // generate unique access token when user logs in
  const accessToken = jwt.sign(
    { user },
    process.env.SIGN_IN_ACCESS_SECRET_KEY as string,
    { expiresIn: `${process.env.ACCESS_TOKEN_EXPIRATION as any}d` || "1d" }
  );

  //   generate unique refresh token when user logs in
  const refreshToken = jwt.sign(
    { user },
    process.env.SIGN_IN_REFRESH_SECRET_KEY as string,
    { expiresIn: `${process.env.REFRESH_TOKEN_EXPIRATION as any}d` || "7d" }
  );

  //   save tokens in the response cookie
  res.cookie("access_token", accessToken, accessTokenOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenOptions);

  // send response to the client
  res.status(statusCode).json({
    success: true,
    message: "Logged in successfully",
    user,
  });
};
