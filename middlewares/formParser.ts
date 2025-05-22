import { NextFunction, Request, Response } from "express";
import formidable from "formidable";

export const formParser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const form = formidable({ multiples: true });

  const arrayFields = ["availableDays", "certifications", "specialization"];

  const jsonFields = ["workExperience", "timeSlots", "education", "hospital"];

  const [fields, files] = await form.parse(req as any);

  if (!req.body) req.body = {};

  for (let key in fields) {
    const value = fields[key];
    if (!value) continue;

    if (key.startsWith("timeSlots[")) {
      continue; // process these separately
    }

    if (arrayFields.includes(key)) {
      req.body[key] = value;
    } else if (jsonFields.includes(key)) {
      try {
        const cleanedJson = value![0]
          // .replace(/[\n\s]/g, "") // Strip whitespace
          .replace(/^\[|];?$/g, ""); // remove semicolons/brackets

        req.body[key] = JSON.parse(`[${cleanedJson}]`);
        // req.body[key] = JSON.parse(value![0]);
      } catch (e) {
        req.body[key] = value![0];
      }
    } else {
      req.body[key] = value![0];
    }
  }

  // Process timeSlots
  const timeSlots: Record<string, string[]> = {};
  for (let key in fields) {
    if (key.startsWith("timeSlots[")) {
      const day = key.match(/timeSlots\[(.*?)\]/)?.[1];
      if (day && fields[key]) {
        // Split comma-separated slots and trim whitespace
        timeSlots[day] = fields[key]![0].split(",").map((s) => s.trim());
      }
    }
  }

  if (Object.keys(timeSlots).length > 0) {
    req.body.timeSlots = timeSlots;
  }

  if (!req.files) req.files = {};

  for (let key in files) {
    const filesNeeded = files[key];

    if (!filesNeeded) break;

    if (filesNeeded.length > 1) {
      req.files[key] = filesNeeded; // for multiple images
    } else {
      req.files[key] = filesNeeded[0]; // if it is only an image
    }
  }

  next(); // move to validate input data
};
