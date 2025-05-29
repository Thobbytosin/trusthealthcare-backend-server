import { NextFunction, Request, Response } from "express";
import catchAsyncError from "../middlewares/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import { generateApiKey, isEmailValid } from "../utils/helpers";
import sendMail from "../utils/sendMail";
import { ApiKey } from "../models/apiKey.model";

export const requestApiKey = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { owner, email } = req.body;

    if (!owner || !email) {
      return next(new ErrorHandler("Missing required fields", 400));
    }

    if (!isEmailValid.test(email)) {
      return next(new ErrorHandler("Please enter a valid email", 400));
    }

    const userHasApiKeyAlready = await ApiKey.findOne({
      where: { email, isActive: true },
    });

    if (userHasApiKeyAlready) {
      return next(
        new ErrorHandler(
          "You already have your API KEY. Check your dashboard to access it.",
          409
        )
      );
    }

    const key = generateApiKey();

    // data to be sent to the email
    const mailData = { owner, apiKey: key };

    const results = await Promise.allSettled([
      sendMail({
        email: email,
        subject: "Trust HealthCare API Key",
        templateData: mailData,
        templateName: "api-key-email.ejs",
      }),

      ApiKey.create({ key, owner, email, isActive: true }),
    ]);

    const [mailResult, apiKeyResult] = results;

    if (mailResult.status === "rejected") {
      return next(
        new ErrorHandler("Falied to send verification success mail", 400)
      );
    }

    if (apiKeyResult.status === "rejected") {
      return next(
        new ErrorHandler(`Error validating your account. Try again`, 400)
      );
    }

    res.status(200).json({
      success: true,
      message: "Your API Key has been sent your email. Please keep safe",
    });
  }
);
