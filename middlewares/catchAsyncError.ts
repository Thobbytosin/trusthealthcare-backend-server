import { Request, Response, NextFunction } from "express";

// HIGH ORDER FUNCTION
// const catchAsyncError = (func: any) => () => {
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       await func(req, res, next);
//     } catch (error) {
//       next(error);
//     }
//   };
// };

const catchAsyncError =
  (func: any) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(func(req, res, next)).catch(next);
  };

export default catchAsyncError;

// FOR CLARITY
// const catchAsyncError = (func: any) => {
//   return () => {
//     // The inner function will execute here
//   };
// };
