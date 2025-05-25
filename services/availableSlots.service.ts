import { NextFunction, Request, Response } from "express";
import catchAsyncError from "../middlewares/catchAsyncError";
import { Doctor } from "../models/doctor.model";
import ErrorHandler from "../utils/errorHandler";

const doctorAvailableSlots = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const doctorId = req.params.doctor_id;
    const doctor = await Doctor.findByPk(doctorId);

    if (!doctor) return next(new ErrorHandler("Doctor not found", 404));
  }
);
