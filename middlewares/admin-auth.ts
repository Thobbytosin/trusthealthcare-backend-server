import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/errorHandler";

export const authorizeUpload = (...allowedrole: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.role.some((role: string) => allowedrole.includes(role))) {
      return next(
        new ErrorHandler(
          `Permission Denied: You must have an account to submit your application as a doctor.`,
          403
        )
      );
    }
    next();
  };
};

// return next(new ErrorHandler(`Permission Denied: Requires ${roles.join(" or ")}`, 403));

export const authorizeRoleAdmin = (...allowedrole: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.role.some((role: string) => allowedrole.includes(role))) {
      return next(
        new ErrorHandler(
          `Permission Denied: Only an ${allowedrole} can perform this operation.`,
          403
        )
      );
    }
    next();
  };
};
