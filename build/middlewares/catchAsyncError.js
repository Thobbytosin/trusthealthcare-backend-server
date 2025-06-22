"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
const catchAsyncError = (func) => (req, res, next) => {
    Promise.resolve(func(req, res, next)).catch(next);
};
exports.default = catchAsyncError;
// FOR CLARITY
// const catchAsyncError = (func: any) => {
//   return () => {
//     // The inner function will execute here
//   };
// };
