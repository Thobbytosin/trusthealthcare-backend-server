import jwt from "jsonwebtoken";
import ErrorHandler from "./errorHandler";
import { UserActivityLogs } from "../models/userActivity.model";
import { NextFunction } from "express";
import { DoctorActivityLogs } from "../models/doctorActivity.model";

export const isPasswordStrong = (password: string) => {
  const passwordLength = password.trim().length;

  //   console.log("LENGTH:", password.trim().length);
  // check password strength
  // const hasUpperCase = () => !!password.match(/[a-z]/);
  // const hasLowerCase = () => !!password.match(/[A-Z]/);
  const hasAlphabet = () => !!password.match(/[a-zA-Z]/);
  const hasNumber = () => !!password.match(/[0-9]/);

  // Password Test
  const passwordIsArbitrarilyStrongEnough =
    hasNumber() && hasAlphabet() && passwordLength >= 8;

  return passwordIsArbitrarilyStrongEnough;
};

export const isEmailValid: RegExp =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const createVerificationToken = (user: any) => {
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString(); // generates random 6 digit code

  const verificationToken = jwt.sign(
    { user, verificationCode },
    process.env.JWT_VERIFICATION_SECRET_KEY as string,
    { expiresIn: "5m" }
  );

  return { verificationCode, verificationToken };
};

export const createResetPasswordToken = (user: any) => {
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  const resetToken = jwt.sign(
    { user, resetCode },
    process.env.JWT_RESET_SECRET_KEY as string,
    { expiresIn: "4m" }
  );

  return { resetCode, resetToken };
};

export function add(a: number, b: number) {
  const answer = a + b;

  return answer;
}

export const logUserActivity = async ({
  userId,
  action,
  ipAddress,
  userAgent,
  next,
}: {
  userId: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  next: NextFunction;
}) => {
  try {
    if (action !== "Token Refreshed") {
      return await UserActivityLogs.create({
        userId,
        action,
        userAgent,
        ipAddress,
      });
    }

    const lastRefresh = await UserActivityLogs.findOne({
      where: {
        userId,
        action: "Token Refreshed",
      },
      order: [["createdAt", "DESC"]], // picks the last token refreshed
    });

    // for token refreshed, log only after 30 minutes to avoid multiple logs
    const shouldLog =
      !lastRefresh ||
      Date.now() - new Date(lastRefresh.createdAt).getTime() > 30 * 60 * 1000;

    if (shouldLog) {
      return await UserActivityLogs.create({
        userId,
        action,
        userAgent,
        ipAddress,
      });
    }
  } catch (err: any) {
    return next(new ErrorHandler(err.message, 400));
  }
};

export const logDoctorActivity = async ({
  doctorId,
  action,
  ipAddress,
  userAgent,
  next,
}: {
  doctorId: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  next: NextFunction;
}) => {
  try {
    if (action !== "Doctor Token Refreshed") {
      return await DoctorActivityLogs.create({
        doctorId,
        action,
        userAgent,
        ipAddress,
      });
    }

    const lastRefresh = await DoctorActivityLogs.findOne({
      where: {
        doctorId,
        action: "Doctor Token Refreshed",
      },
      order: [["createdAt", "DESC"]], // picks the last token refreshed
    });

    // for token refreshed, log only after 30 minutes to avoid multiple logs
    const shouldLog =
      !lastRefresh ||
      Date.now() - new Date(lastRefresh.createdAt).getTime() > 30 * 60 * 1000;

    if (shouldLog) {
      return await DoctorActivityLogs.create({
        doctorId,
        action,
        userAgent,
        ipAddress,
      });
    }
  } catch (err: any) {
    return next(new ErrorHandler(err.message, 400));
  }
};
