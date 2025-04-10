import { Request } from "express";
import { IUser } from "../models/user.model";
import { IDoctor } from "../models/doctor.model";
import { File } from "formidable";

declare global {
  namespace Express {
    interface Request {
      user: IUser;
      data: IDoctor;
      files: { [key: string]: File | File[] };
    }
  }
}
