import { NextFunction, Request, Response } from "express";
import catchAsyncError from "./catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../models/user.model";
import { accessTokenOptions, refreshTokenOptions } from "../utils/token";
import { Doctor } from "../models/doctor.model";

dotenv.config();

export const isUserAuthenticated = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    // check if user is logged in (check and verify access token)
    const { access_token } = req.cookies;

    // if there is no access token
    if (!access_token)
      return next(
        new ErrorHandler("Session has expired: refresh your browser.", 403)
      );

    // verify access token
    const decodeAccess: any = jwt.verify(
      access_token,
      (process.env.SIGN_IN_ACCESS_SECRET_KEY as string) || ""
    );

    if (!decodeAccess) return next(new ErrorHandler("Invalid token", 404));

    req.user = decodeAccess.user;
    return next();
  }
);

// check if password has been rest in the past 24 hours
export const hasPasswordChangedLast24Hours = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    // console.log(user?.dataValues);

    // check if user exists
    if (!user) return next(new ErrorHandler("Account does not exist", 404));

    // for first time
    if (user.lastPasswordReset === null) {
      req.user = user?.dataValues;
      return next();
    }

    const userLastResetDate: Date = new Date(user.lastPasswordReset || "");

    const presentDate: Date = new Date();

    const timeDifference = presentDate.getTime() - userLastResetDate.getTime();

    const twentFourHours = 24 * 60 * 60 * 1000; // milliseconds

    if (timeDifference > twentFourHours) {
      req.user = user?.dataValues;
      return next();
    } else {
      return next(
        new ErrorHandler(
          "You can only reset a password once in 24 hours. Contact support for further assistance",
          400
        )
      );
    }
  }
);

// check if doctor profile has been updated in the past 1 week
export const hasDoctorProfileBeenUpdatedLast7days = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const loggedInUser = req.user;
    const doctorId = req.params.doctor_id; // doctor id

    if (
      !loggedInUser.role.some((role: string) =>
        ["doctor", "admin"].includes(role)
      )
    )
      return next(
        new ErrorHandler(
          "Permission denied: You are not registered as a doctor or an admin",
          403
        )
      );

    const doctor = await Doctor.findByPk(doctorId);

    // check if doctor exists
    if (!doctor) return next(new ErrorHandler("Account does not exist", 404));

    // check if user/admin is updating the account they created
    if (doctor.uploadedById !== loggedInUser.id)
      return next(
        new ErrorHandler(
          "Permission Denied: You can only update your account",
          403
        )
      );

    // check for last time the account was updated
    const lastUpdatedDate: Date = new Date(doctor.updatedAt || "");

    const presentDate: Date = new Date();

    const timeDifference = presentDate.getTime() - lastUpdatedDate.getTime();

    const oneWeekAgo = 7 * 24 * 60 * 60 * 1000; // milliseconds

    if (timeDifference < oneWeekAgo)
      return next(
        new ErrorHandler(
          "You can only update your account once in 7 days. Contact support for further assistance.",
          400
        )
      );

    // check if account has been verified
    if (doctor.verificationStatus !== "Verified")
      return next(
        new ErrorHandler(
          "Your account has not been verified yet.You can only update your account after verification is completed",
          400
        )
      );

    req.doctor = doctor;
    return next();
  }
);
