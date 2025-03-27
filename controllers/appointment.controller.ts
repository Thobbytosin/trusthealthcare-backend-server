import { NextFunction, Request, Response } from "express";
import catchAsyncError from "../middlewares/catchAsyncError";

export const uploadAppointment = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {}
);
