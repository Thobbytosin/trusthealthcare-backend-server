import { Request } from "express";
import { Doctor, IDoctor } from "../models/doctor.model";
import { File } from "formidable";
import { IUser } from "../models/user.model";
import { ID } from "aws-sdk/clients/s3";
import { CookieConsentType } from "../middlewares/cookie-consent";

declare global {
  namespace Express {
    interface Request {
      cookieConsent: CookieConsentType;
      user: IUser;
      doctor: IDoctor;
      files: { [key: string]: File | File[] };
    }
  }
}
