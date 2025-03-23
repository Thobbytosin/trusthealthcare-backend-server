import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/errorHandler";

export const authorizeRoleAdminAndDoctor = (...allowedrole: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.role.some((role) => allowedrole.includes(role))) {
      return next(
        new ErrorHandler(
          `Permission Denied: Only an ${allowedrole.join(
            " and a "
          )} can access this.`,
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
    if (!req.user?.role.some((role) => allowedrole.includes(role))) {
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
