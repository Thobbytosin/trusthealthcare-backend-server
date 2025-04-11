import { NextFunction, Request, Response } from "express";
import catchAsyncError from "../middlewares/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import { User } from "../models/user.model";

//////////////////////////////////////////////////////////////////////////////////////////////// DELETE USER ACCOUNT
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
