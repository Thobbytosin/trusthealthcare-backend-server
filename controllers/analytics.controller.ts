import { NextFunction, Request, Response } from "express";
import catchAsyncError from "../middlewares/catchAsyncError";
import moment from "moment";
import { User } from "../models/user.model";
import { Op } from "sequelize";
import { UserActivityLogs } from "../models/userActivity.model";
import { Doctor } from "../models/doctor.model";
import { DoctorActivityLogs } from "../models/doctorActivity.model";

////////////////////////////////////////////////////////////////////////////////////////////////  USERS ANALYTICS (ADMIN)
export const getUsersAnalytics = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const oneWeekAgo = moment().subtract(7, "days").toDate();

    const totalUsers = await User.count();

    const newUsers = await User.count({
      where: { createdAt: { [Op.gte]: oneWeekAgo } },
    });

    const logins = await UserActivityLogs.count({
      where: { action: "Logged in", createdAt: { [Op.gte]: oneWeekAgo } },
    });

    const refreshes = await UserActivityLogs.count({
      where: {
        action: "Token Refreshed",
        createdAt: { [Op.gte]: oneWeekAgo },
      },
    });

    const activeLastOneWeek = logins + refreshes;

    const usersLogoutsLastOneWeek = await UserActivityLogs.count({
      where: {
        action: "Logged out",
        createdAt: { [Op.gte]: oneWeekAgo },
      },
    });

    res.status(200).json({
      success: true,
      message: "Users Analytics Fetched",
      totalUsers,
      newUsers,
      activeLastOneWeek,
      usersLogoutsLastOneWeek,
    });
  }
);

////////////////////////////////////////////////////////////////////////////////////////////////  DOCTORS ANALYTICS (ADMIN)
export const getDoctorsAnalytics = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const oneWeekAgo = moment().subtract(7, "days").toDate();

    const totalDoctors = await Doctor.count();

    const newDoctors = await Doctor.count({
      where: { createdAt: { [Op.gte]: oneWeekAgo } },
    });

    const logins = await DoctorActivityLogs.count({
      where: {
        action: "Doctor Logged in",
        createdAt: { [Op.gte]: oneWeekAgo },
      },
    });

    const refreshes = await DoctorActivityLogs.count({
      where: {
        action: "Doctor Token Refreshed",
        createdAt: { [Op.gte]: oneWeekAgo },
      },
    });

    const activeLastOneWeek = logins + refreshes;

    const logoutsLastOneWeek = await DoctorActivityLogs.count({
      where: {
        action: "Doctor Logged out",
        createdAt: { [Op.gte]: oneWeekAgo },
      },
    });

    res.status(200).json({
      success: true,
      message: "Doctors Analytics Fetched",
      totalDoctors,
      newDoctors,
      activeLastOneWeek,
      doctorLogoutsLastOneWeek: logoutsLastOneWeek,
    });
  }
);
