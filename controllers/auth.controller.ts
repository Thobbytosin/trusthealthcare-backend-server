import { NextFunction, Request, Response } from "express";
import catchAsyncError from "../middlewares/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import { User } from "../models/user.model";
import {
  createVerificationToken,
  generateApiKey,
  isEmailValid,
  isPasswordStrong,
  logDoctorActivity,
  logUserActivity,
} from "../utils/helpers";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendMail } from "../utils/sendMail";
import { accessTokenOptions, verificationTokenOptions } from "../utils/token";
import redis from "../config/redis";
import { signInWithCredentials } from "../services/signIn.service";
import { ApiKey } from "../models/apiKey.model";

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

    if (
      !name ||
      !email ||
      !password ||
      name.trim() === "" ||
      email.trim() === "" ||
      password.trim() === ""
    ) {
      return next(new ErrorHandler("All fields are required", 400));
    }

    const isUserExists = await User.findOne({ where: { email } });

    if (isUserExists) {
      return next(
        new ErrorHandler(
          "Account already exists. Please proceed to sign in to your account",
          409
        )
      );
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
      return next(new ErrorHandler("Falied to send verification mail", 400));
    }
  }
);

//////////////////////////////////////////////////////////////////////////////////////////////// ACCOUNT ACTIVATION
export const accountVerification = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const verificationToken = req.cookies.verification_token;
    const { verificationCode } = req.body;

    if (!verificationToken) {
      return next(new ErrorHandler("Verification code has expired", 401));
    }

    if (!verificationCode || verificationCode.trim() === "") {
      return next(new ErrorHandler("All fields are required", 400));
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
      return next(new ErrorHandler("Account already exists", 409));

    const user = await User.create({
      name,
      email,
      password,
      verified: true,
    });

    // const user = await User.findOne({ where: { email } });

    if (!user)
      return next(
        new ErrorHandler("Error processing acocount: Account not found", 404)
      );

    // check if user already has an apikey
    const userHasApiKeyAlready = await ApiKey.findOne({
      where: { email, isActive: true },
    });

    const apiKey = generateApiKey();

    if (!userHasApiKeyAlready) {
      await ApiKey.create({
        key: apiKey,
        owner: user.id,
        email: user.email,
        isActive: true,
      });
    }

    // data to be sent to the email
    const mailData = { name: user.name };

    const results = await Promise.allSettled([
      sendMail({
        email: user.email,
        subject: "Welcome Message",
        templateData: mailData,
        templateName: "welcome-email.ejs",
      }),

      logUserActivity({
        userId: user.id,
        action: "Signed up",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        next,
      }),
    ]);

    const [mailResult, logResult] = results;

    if (mailResult.status === "rejected") {
      return next(
        new ErrorHandler("Falied to send verification success mail", 400)
      );
    }

    if (logResult.status === "rejected") {
      return next(
        new ErrorHandler("Error verifying user: Something went wrong", 400)
      );
    }

    res.status(201).json({
      success: true,
      message: "Account Verification Successful!",
    });
  }
);

// /////////////////////////////////////////////////////////////////////////////////////////////// RESEND VERIFICATION CODE
export const resendVerificationCode = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const oldVerificationToken = req.cookies.verification_token;

    if (!oldVerificationToken)
      return next(new ErrorHandler("Session has expired. Try Again", 401));

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

      res.status(200).json({
        success: true,
        message:
          "A new 6-digit verification code has been re-sent to your email address.",
      });
    } catch (error: any) {
      return next(new ErrorHandler("Falied to re-send verification mail", 400));
    }
  }
);

// //////////////////////////////////////////////////////////////////////////////////////////////// SIGN IN USER
export const loginUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, role } = req.body;

    if (!email || !password || email.trim() === "" || password.trim() === "")
      return next(new ErrorHandler("All fields are required", 403));

    // check if user exists
    const user = await User.scope("withPassword").findOne({ where: { email } }); // include password

    if (!user) return next(new ErrorHandler("Account not found", 404));

    // user must be a doctor to sign in as a doctor
    if (
      role === "doctor" &&
      !user.role.some((role) => ["doctor"].includes(role))
    )
      return next(
        new ErrorHandler(
          "Permission denied: You are not registered as a doctor",
          403
        )
      );

    // check if password matches
    const isPasswordMatch = bcryptjs.compareSync(password, user.password || "");

    if (!isPasswordMatch)
      return next(new ErrorHandler("Invalid credentials", 404));

    // set the user last login
    user.lastLogin = new Date();
    if (role === "doctor") {
      user.signedInAs = role;
    } else if (role === "admin") {
      user.signedInAs = role;
    } else {
      user.signedInAs = "user";
    }
    await user.save();

    // remove the password when sending user details to the client
    const newUser = await User.findOne({ where: { email } });

    // sign in user
    if (newUser) {
      signInWithCredentials(200, res, req, next, newUser);
    } else {
      return next(new ErrorHandler("Error signing in", 408));
    }
  }
);

// //////////////////////////////////////////////////////////////////////////////////////////////// SIGN OUT USER
export const signOut = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const loggedInUser = req.user;

    if (loggedInUser.signedInAs === "user") {
      await logUserActivity({
        userId: loggedInUser.id,
        action: "Logged out",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        next,
      });
    } else if (loggedInUser.signedInAs === "doctor") {
      await logDoctorActivity({
        doctorId: loggedInUser.doctorId || "",
        action: "Doctor Logged out",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        next,
      });
    }

    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    res.clearCookie("has_logged_in");

    // delete user from db
    await redis?.del(`user - ${loggedInUser.id}`);

    res.status(200).json({ success: true, message: "Signed out" });
  }
);

//////////////////////////////////////////////////////////////////////////////////////////////// UPDATE TOKEN
export const refreshToken = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (user.signedInAs === "user") {
      await logUserActivity({
        userId: user.id,
        action: "Token Refreshed",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        next,
      });
    } else if (user.signedInAs === "doctor") {
      await logDoctorActivity({
        doctorId: user.doctorId || "",
        action: "Doctor Token Refreshed",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        next,
      });
    }

    // accessToken expires in
    const accessTokenExpiresAt = new Date(
      Date.now() + accessTokenOptions.maxAge
    ).getTime();

    res.status(200).json({
      success: true,
      message: "Token Refreshed",
      expiresAt: accessTokenExpiresAt,
    });
  }
);

//////////////////////////////////////////////////////////////////////////////////////////////// CLEAR ACCESS TOKEN
export const clearAccessToken = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie("tr_host_x");

    res.status(200).json({
      success: true,
      message: "Session Timeout cleared due to inactivity",
    });
  }
);
