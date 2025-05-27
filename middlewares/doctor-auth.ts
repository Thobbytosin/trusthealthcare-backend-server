import { NextFunction, Request, Response } from "express";
import catchAsyncError from "./catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import { Doctor } from "../models/doctor.model";

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
