import { NextFunction, Request, Response } from "express";
import catchAsyncError from "../middlewares/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import { User } from "../models/user.model";
import {
  createVerificationToken,
  isEmailValid,
  isPasswordStrong,
} from "../utils/helpers";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendMail } from "../utils/sendMail";
import {
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
    const user = await User.scope("withPassword").findOne({ where: { email } }); // include password

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

// //////////////////////////////////////////////////////////////////////////////////////////////// SIGN OUT USER
export const signOut = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    res.status(200).json({ success: true, message: "Signed out" });
  }
);

//////////////////////////////////////////////////////////////////////////////////////////////// UPDATE TOKEN
export const refreshToken = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ success: true, message: "Token Refreshed" });
  }
);
