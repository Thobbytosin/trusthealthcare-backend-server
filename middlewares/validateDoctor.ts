import { NextFunction, Request, Response } from "express";
import { IDoctor } from "../models/doctor.model";
import ErrorHandler from "../utils/errorHandler";

const requireFields: (keyof IDoctor)[] = [
  "name",
  "email",
  "securityAnswer",
  "specialization",
  "experience",
  "education",
  "licenseNumber",
  "availableDays",
  "timeSlots",
  "clinicAddress",
  "city",
  "state",
  "phone",
  "ratings",
  "maxPatientsPerDay",
  "thumbnail",
  "zipCode",
  "hospital",
];

// validate doctor middleware
export const validateDoctorData = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const data = req.body;

  if (!data) return next(new ErrorHandler("All fields are required", 400));

  // check for missing required fields
  const missingFields = requireFields.filter((field) => {
    const value = data[field];

    // check for missing required fields (for strings, numbers and arrays)
    return (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "") ||
      (Array.isArray(value) && value.length === 0)
    );
  });

  if (missingFields.length > 0) {
    return next(
      new ErrorHandler(
        `Missing required fields: ${missingFields.join(", ")}`,
        404
      )
    );
  }

  req.data = data;
  next();
};
