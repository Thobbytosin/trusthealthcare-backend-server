import { NextFunction, Request, Response } from "express";
import formidable from "formidable";

export const formParser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const form = formidable();

  const [fields, files] = await form.parse(req as any);

  if (!req.body) req.body = {};

  for (let key in fields) {
    req.body[key] = fields[key]![0];
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

  next(); // got to next controller
};
