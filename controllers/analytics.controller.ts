import { NextFunction, Request, Response } from "express";
import catchAsyncError from "../middlewares/catchAsyncError";
import moment from "moment";
import { User } from "../models/user.model";
import { Op } from "sequelize";
import { UserActivityLogs } from "../models/userActivity.model";

export const getUserAnalytics = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const oneWeekAgo = moment().subtract(7, "days").toDate();

    const totalUsers = await User.count();

    const newUsers = await User.count({
      where: { createdAt: { [Op.gte]: oneWeekAgo } },
    });

    const logins = await UserActivityLogs.count({
      where: { actions: "Logged in", createdAt: { [Op.gte]: oneWeekAgo } },
    });

    const refreshes = await UserActivityLogs.count({
      where: {
        actions: "Token Refreshed",
        createdAt: { [Op.gte]: oneWeekAgo },
      },
    });

    const activeLastOneWeek = logins + refreshes;

    res.status(200).json({
      success: true,
      message: "Users Analytics Fetched",
      totalUsers,
      newUsers,
      activeLastOneWeek,
    });
  }
);
