import dotenv from "dotenv";

dotenv.config();

interface ITokenOptions {
  maxAge: number;
  httpOnly: boolean;
  sameSite: "none" | "lax" | "strict";
  secure?: boolean;
}

const isProduction = process.env.NODE_ENV === "production";

// create the tokens expiration time
const accessTokenExpiration: any =
  Number(process.env.ACCESS_TOKEN_EXPIRATION) || 30; // minutes

const refreshTokenExpiration: any =
  Number(process.env.REFRESH_TOKEN_EXPIRATION) || 5; // day

// cookies options
export const accessTokenOptions: ITokenOptions = {
  maxAge: accessTokenExpiration * 60 * 1000, //minutes
  httpOnly: true,
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction,
};

export const refreshTokenOptions: ITokenOptions = {
  maxAge: refreshTokenExpiration * 24 * 60 * 60 * 1000, // days
  httpOnly: true,
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction,
};

export const hasLoggedInTokenOptions: ITokenOptions = {
  maxAge: refreshTokenExpiration * 24 * 60 * 60 * 1000, // days
  httpOnly: false, // client accessible
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
