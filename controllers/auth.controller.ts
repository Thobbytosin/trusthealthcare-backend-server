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
import { sendVerificationSMS } from "../utils/sendSms";
import { where } from "sequelize";

dotenv.config();

interface IRegistration {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  verified?: boolean;
}

//////////////////////////////////////////////////////////////////////////////////////////////// USER REGISTRATION
export const registerUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password }: IRegistration = req.body;

    if (!name || !email || !password) {
      return next(new ErrorHandler("All fields are required", 400));
    }

    const isUserExists = await User.findOne({ where: { email } });

    if (isUserExists) {
      return next(new ErrorHandler("Account already exists", 409));
    }

    if (!isEmailValid.test(email)) {
      return next(new ErrorHandler("Please enter a valid email", 400));
    }

    if (!isPasswordStrong(password)) {
      return next(new ErrorHandler("Password security is too weak", 400));
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);

    const user: IRegistration = {
      name,
      email,
      password: hashedPassword,
    };

    const { verificationCode, verificationToken } =
      createVerificationToken(user);

    // data to be sent to the email
    const mailData = { name: user.name, verificationCode };

    // try-catch block for the email
    try {
      // send SMS
      // await sendVerificationSMS("2349167571188", verificationCode);

      // send mail
      await sendMail({
        email: user.email,
        subject: "Account Verification",
        templateName: "verification-email.ejs",
        templateData: mailData,
      });

      // save token in the response cookie
      res.cookie(
        "verification_token",
        verificationToken,
        verificationTokenOptions
      );

      res.status(200).json({
        success: true,
        message:
          "A 6-digit verification code has been sent to your email address.",
      });
    } catch (error: any) {
      return next(new ErrorHandler("Mail sending Failed", 400));
    }
  }
);

//////////////////////////////////////////////////////////////////////////////////////////////// ACCOUNT ACTIVATION
export const accountVerification = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const verificationToken = req.cookies.verification_token;
    const { verificationCode } = req.body;

    if (!verificationToken) {
      return next(new ErrorHandler("Verification code has expired", 403));
    }

    if (!verificationCode) {
      return next(new ErrorHandler("All fields are required", 403));
    }

    const credentials: { user: User; verificationCode: string } = jwt.verify(
      verificationToken,
      process.env.JWT_VERIFICATION_SECRET_KEY as string
    ) as { user: User; verificationCode: string };

    if (credentials.verificationCode !== verificationCode) {
      return next(
        new ErrorHandler("Access Denied: Invalid Verification code", 403)
      );
    }

    const { name, email, password } = credentials.user;

    const userExists = await User.findOne({ where: { email } });

    if (userExists)
      return next(new ErrorHandler("Account already exists", 403));

    await User.create({ name, email, password, verified: true });

    const user = await User.findOne({ where: { email } });

    if (!user) return next(new ErrorHandler("Error Proccessing User", 404));

    // data to be sent to the email
    const mailData = { name: user.name };

    try {
      await sendMail({
        email: user.email,
        subject: "Welcome Message",
        templateData: mailData,
        templateName: "welcome-email.ejs",
      });

      res.status(201).json({
        success: true,
        message: "Account Verification Successful!",
      });
    } catch (error: any) {
      return next(new ErrorHandler("Mail sending Failed", 404));
    }
  }
);

// /////////////////////////////////////////////////////////////////////////////////////////////// RESEND VERIFICATION CODE
export const resendVerificationCode = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const oldVerificationToken = req.cookies.verification_token;

    if (!oldVerificationToken)
      return next(new ErrorHandler("Session has expired. Try Again", 403));

    const credentials: { user: User; verificationCode: string } = jwt.verify(
      oldVerificationToken,
      process.env.JWT_VERIFICATION_SECRET_KEY as string
    ) as { user: User; verificationCode: string };

    // if there is no credentials (i.e token has expired). it goes to the error middleware

    const user = credentials.user;

    // generate a new verification code
    const { verificationCode, verificationToken } =
      createVerificationToken(user);

    // data to be sent to the email
    const mailData = { name: user.name, verificationCode: verificationCode };

    // try-catch block for the email
    try {
      // send SMS
      // await sendVerificationSMS("2349167571188", verificationCode);

      // send mail
      await sendMail({
        email: user.email,
        subject: "Resent Verification Code",
        templateName: "verification-email.ejs", // generate a new template
        templateData: mailData,
      });

      // save token in the response cookie
      res.cookie(
        "verification_token",
        verificationToken, // new verification token
        verificationTokenOptions
      );

      res.status(201).json({
        success: true,
        message:
          "A new 6-digit verification code has been re-sent to your email address.",
      });
    } catch (error: any) {
      return next(new ErrorHandler("Mail sending Failed", 400));
    }
  }
);

// //////////////////////////////////////////////////////////////////////////////////////////////// SIGN IN USER
export const loginUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password)
      return next(new ErrorHandler("All fields are required", 403));

    // check if user exists
    const user = await User.scope("withPassword").findOne({ where: { email } });

    if (!user) return next(new ErrorHandler("Account not found", 404));

    // check if password matches
    const isPasswordMatch = bcryptjs.compareSync(password, user.password || "");

    if (!isPasswordMatch)
      return next(new ErrorHandler("Invalid credentials", 404));

    // set the user last login
    user.lastLogin = new Date();
    await user.save();

    // remove the password when sending user details to the client
    const editedUser = await User.findOne({ where: { email } });

    // sign in user
    if (editedUser) {
      signInWithCredentials(editedUser, 200, res);
    }
  }
);

// //////////////////////////////////////////////////////////////////////////////////////////////// FORGOT PASSWORD
export const forgotPassword = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    if (!email) return next(new ErrorHandler("Field is required", 403));

    // check if user is already registered
    const user = await User.findOne({ where: { email } });

    if (!user) return next(new ErrorHandler("Account not found", 404));

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

// //////////////////////////////////////////////////////////////////////////////////////////////// SIGN OUT USER
export const signOut = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    res.status(200).json({ success: true, message: "Signed out" });
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
