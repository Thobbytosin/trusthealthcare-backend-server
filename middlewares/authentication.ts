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
      return next(new ErrorHandler("Access Denied: Login to proceed", 403));

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

    if (!loggedInUser.role.some((role: string) => ["doctor"].includes(role)))
      return next(
        new ErrorHandler(
          "Permission denied: You are not registered as a doctor",
          403
        )
      );

    const doctor = await Doctor.findOne({
      where: { id: doctorId },
    });

    // check if doctor exists
    if (!doctor) return next(new ErrorHandler("Account does not exist", 404));

    // check for last time the account was updated
    const lastUpdatedDate: Date = new Date(doctor.updatedAt || "");

    const presentDate: Date = new Date();

    const timeDifference = presentDate.getTime() - lastUpdatedDate.getTime();

    const oneWeekAgo = 7 * 24 * 60 * 60 * 1000; // milliseconds

    if (timeDifference < oneWeekAgo)
      return next(
        new ErrorHandler(
          "You can only update your profile once in 7 days. Contact support for further assistance.",
          400
        )
      );

    // check if user is updating their account
    if (doctor.userId !== loggedInUser.id)
      return next(
        new ErrorHandler(
          "Access Restricted: You can only update your account",
          403
        )
      );

    if (doctor.verificationStatus !== "Verified")
      return next(
        new ErrorHandler("Your application has not been verified yet", 400)
      );

    req.doctor = doctor;
    return next();
  }
);

// 0	86400000	 1,716,163,200,000.00 MAY 20 REFERENCE
// 1	86400000	 1,716,076,800,000.00
// 2	86400000	 1,715,990,400,000.00
// 3	86400000	 1,715,904,000,000.00
// 4	86400000	 1,715,817,600,000.00
// 5	86400000	 1,715,731,200,000.00
// 6	86400000	 1,715,644,800,000.00
// 7	86400000	 1,715,558,400,000.00
// 8	86400000	 1,715,472,000,000.00
// 9

// 		 86,400,000.00
// 		 172,800,000.00
// 		 259,200,000.00
// 		 345,600,000.00
// 		 432,000,000.00
// 		 518,400,000.00
// 		 604,800,000.00
// 		 691,200,000.00
