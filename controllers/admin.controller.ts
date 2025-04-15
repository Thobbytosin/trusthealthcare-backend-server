import { NextFunction, Request, Response } from "express";
import catchAsyncError from "../middlewares/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import { User } from "../models/user.model";
import { Doctor } from "../models/doctor.model";
import { logDoctorActivity } from "../utils/helpers";

//////////////////////////////////////////////////////////////////////////////////////////////// DELETE USER ACCOUNT (ADMIN)
export const deleteUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const loggedInUser = req.user;

    if (!userId) return next(new ErrorHandler("User Id not found", 400));

    const user = await User.findByPk(userId);

    if (!user) return next(new ErrorHandler("User Account not found", 404));

    if (loggedInUser.id === userId)
      return next(
        new ErrorHandler(
          "Permission Restricted: You can not delete your account",
          403
        )
      );

    await user.destroy();

    res.status(200).json({ success: true, message: "User Account Deleted" });
  }
);

//////////////////////////////////////////////////////////////////////////////////////////////// GET ALL USERS (ADMIN)
export const getAllUsersAdmin = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.findAll();

    if (!users) return next(new ErrorHandler("No record found", 404));

    res.status(200).json({
      success: true,
      message: "Users data fetched",
      users,
    });
  }
);

//////////////////////////////////////////////////////////////////////////////////////////////// GET ALL DOCTORS (ADMIN)
export const getAllDoctorsAdmin = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const doctors = await Doctor.findAll();

    if (!doctors) return next(new ErrorHandler("No record found", 404));

    res.status(200).json({
      success: true,
      message: "Doctors data fetched",
      doctors,
    });
  }
);

// //////////////////////////////////////////////////////////////////////////////////////////////// GET A DOCTOR (ADMIN)
export const getDoctorAdmin = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const doctorId = req.params.doctor_id;

    const doctor = await Doctor.findByPk(doctorId);

    if (!doctor) return next(new ErrorHandler("Error: Doctor not found", 404));

    res
      .status(200)
      .json({ success: true, message: "Doctor Information retrieved", doctor });
  }
);

////////////////////////////////////////////////////////////////////////////////////////////////  APPLICATION APPROVAL (ADMIN)
export const doctorApplicationApproval = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;

    const user = await User.findByPk(userId);
    const doctor = await Doctor.findOne({ where: { userId } });

    if (!user || !doctor)
      return next(new ErrorHandler("User/Doctor not found", 404));

    if (user.role.some((role) => ["doctor"].includes(role)))
      return next(new ErrorHandler("Your account is already verified", 408));

    user.role = [...user.role, "doctor"];
    user.doctorId = doctor.id;
    const updatedUser = await user.save();

    if (!updatedUser) return next(new ErrorHandler("Error updating user", 400));

    // update doctor verification status
    doctor.verificationStatus = "Verified";
    const updatedDoctor = await doctor.save();

    if (!updatedDoctor)
      return next(new ErrorHandler("Error updating doctor", 400));

    await logDoctorActivity({
      doctorId: updatedDoctor.id || "",
      action: "Doctor Application Approved",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      next,
    });

    res.status(200).json({
      success: true,
      message:
        "Your application has been approved. Welcome to Trust Healthcare",
    });
  }
);

////////////////////////////////////////////////////////////////////////////////////////////////  APPLICATION DENIAL (ADMIN)
export const doctorApplicationDenial = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;

    const doctor = await Doctor.findOne({ where: { userId } });

    if (!doctor) return next(new ErrorHandler("Doctor not found", 404));

    doctor.verificationStatus = "Failed";
    doctor.save();

    await logDoctorActivity({
      doctorId: doctor.id || "",
      action: "Doctor Application Failed",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      next,
    });

    res.status(200).json({
      success: true,
      message:
        "Sorry, Your application has been denied. Check your email for reasons.",
    });
  }
);

////////////////////////////////////////////////////////////////////////////////////////////////// DELETE ACCOUNT (ADMIN)
export const deleteDoctorAccount = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const doctorId = req.params.doctor_id;
    const loggedInUser = req.user;

    const doctor = await Doctor.findOne({
      where: { id: doctorId },
    });

    if (!doctor) return next(new ErrorHandler("Error: Doctor not found", 404));

    await doctor?.destroy();
    await doctor.save();

    res
      .status(200)
      .json({ success: true, message: "Your account has been deleted" });
  }
);
