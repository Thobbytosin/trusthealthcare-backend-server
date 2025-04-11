import { NextFunction, Request, Response } from "express";
import catchAsyncError from "../middlewares/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import { User } from "../models/user.model";
import {
  createResetPasswordToken,
  createVerificationToken,
  isEmailValid,
  isPasswordStrong,
} from "../utils/helpers";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendMail } from "../utils/sendMail";
import {
  resetTokenOptions,
  signInWithCredentials,
  verificationTokenOptions,
} from "../utils/token";

dotenv.config();

interface IRegistration {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  verified?: boolean;
}

// //////////////////////////////////////////////////////////////////////////////////////////////// FORGOT PASSWORD
export const forgotPassword = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    if (!email) return next(new ErrorHandler("Field is required", 403));

    // from the hasPasswordChanged middleware
    const user = req.user;

    // generate the reset token and code
    const { resetCode, resetToken } = createResetPasswordToken(user);

    // data to be sent to the email template
    const mailData = { name: user.name, resetCode };

    try {
      await sendMail({
        subject: "Password Reset",
        email: user.email,
        templateName: "reset-password-email.ejs",
        templateData: mailData,
      });

      // save token in the response cookie
      res.cookie("reset_token", resetToken, resetTokenOptions);

      res.status(200).json({
        success: true,
        message:
          "A password reset code has been sent to your email address. This code is valid for 4 minutes.",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// //////////////////////////////////////////////////////////////////////////////////////////////// RESET PASSWORD
export const resetPassword = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const resetToken = req.cookies.reset_token;
    const { resetCode, password } = req.body;

    if (!resetToken)
      return next(new ErrorHandler("Session has expired. Try Again", 404));

    if (!resetCode || !password)
      return next(new ErrorHandler("All fields are required", 403));

    const credentials = jwt.verify(
      resetToken,
      process.env.JWT_RESET_SECRET_KEY as string
    ) as { user: any; resetCode: string };

    // check if code is equal to the reset code stored in  backend
    if (credentials.resetCode !== resetCode)
      return next(new ErrorHandler("Access Denied: Invalid reset code", 403));

    // find the account
    const user = await User.findOne({
      where: { email: credentials.user.email },
    });

    if (!user)
      return next(
        new ErrorHandler("Permission Denied: Account does not exist", 404)
      );

    // check if password security is strong
    if (!isPasswordStrong(password)) {
      return next(new ErrorHandler("Password security is too weak", 401));
    }

    // encrypt password
    const hashedPassword = bcryptjs.hashSync(password, 10);

    // set the user last password reset time
    user.lastPasswordReset = new Date();

    // set the password as the new user password
    user.password = hashedPassword;
    await user.save();

    const mailData = { name: user.name };

    // send password success mail
    try {
      await sendMail({
        email: user.email,
        subject: "Password Reset Success",
        templateData: mailData,
        templateName: "reset-password-success-email.ejs",
      });

      res.status(200).json({
        success: true,
        message: "Your password has been reset successfully.",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// //////////////////////////////////////////////////////////////////////////////////////////////// GET USER DATA
export const getUserData = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    if (!user) return next(new ErrorHandler("Account not found", 404));

    res.status(200).json({ success: true, user });
  }
);
