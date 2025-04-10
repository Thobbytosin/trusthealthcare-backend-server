import { NextFunction, Request, Response } from "express";
import formidable from "formidable";

export const formParser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const form = formidable();

  const arrayFields = ["availableDays"];

  const [fields, files] = await form.parse(req as any);

  if (!req.body) req.body = {};

  for (let key in fields) {
    const value = fields[key];
    if (!value) continue;

    if (arrayFields.includes(key)) {
      req.body[key] = value;
    } else {
      req.body[key] = value![0];
    }
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
