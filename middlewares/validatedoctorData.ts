import { NextFunction, Request, Response } from "express";
import { IDoctor } from "../models/doctor.model";
import ErrorHandler from "../utils/errorHandler";
import catchAsyncError from "./catchAsyncError";

const requireFields: (keyof IDoctor)[] = [
  "name",
  "email",
  "about",
  "securityAnswer",
  "securityQuestion",
  "specialization",
  "yearsOfExperience",
  "workExperience",
  "education",
  "hospital",
  "licenseNumber",
  "certifications",
  "availableDays",
  "timeSlots",
  "clinicAddress",
  "city",
  "state",
  "zipCode",
  "phone",
  "maxPatientsPerDay",
];

// validate doctor middleware
export const validateDoctorData = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;
    const { thumbnail } = req.files; // for doctor profile image

    if (Object.keys(data).length === 0 || !data)
      return next(new ErrorHandler("All fields are required", 400));

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

    // check if doctor  uploaded an image
    if (thumbnail === null || thumbnail === undefined)
      return next(
        new ErrorHandler("Permission Denied: Doctor MUST have an image", 403)
      );

    // ensure some fields are array
    const ensureArray = (value: any) => {
      if (Array.isArray(value)) return value;
      if (typeof value === "string") return [value];
      return [];
    };

    // console.log(data);

    const formattedData = {
      ...data,
      city: data.city.toLowerCase(),
      education: ensureArray(data.education),
      certifications: ensureArray(data.certifications),
      availableDays: ensureArray(data.availableDays),
      workExperience: ensureArray(data.workExperience),
      specialization: ensureArray(data.specialization),
      timeSlots: data.availableDays?.reduce(
        (acc: Record<string, any>, day: string) => {
          acc[day] = ensureArray(data?.timeSlots[day]);
          return acc;
        },
        {}
      ),
    };

    // check if user is uploading more than 1 image
    if (Array.isArray(thumbnail))
      return next(new ErrorHandler("Multiple images not allowed", 403));

    if (
      thumbnail.mimetype?.startsWith("image/svg") ||
      !thumbnail.mimetype?.startsWith("image")
    )
      return next(
        new ErrorHandler(
          "Invalid image format. File must be an image(.jpg, .png, .jpeg)",
          403
        )
      );

    req.body = formattedData;
    next();
  }
);
