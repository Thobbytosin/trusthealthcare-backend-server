import { NextFunction, Request, Response } from "express";
import catchAsyncError from "../middlewares/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import cloudUploader from "../utils/cloudinary";
import { isPasswordStrong } from "../utils/helpers";
import bcryptjs from "bcryptjs";
import { User } from "../models/user.model";
import { Doctor } from "../models/doctor.model";

//////////////////////////////////////////////////////////////////////////////////////////////// UPLOAD DOCTOR
export const uploadDoctor = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = req.data;

    const userId = req.user.id;

    const user = await User.findByPk(userId);

    // double check again if user exists
    if (!user) return next(new ErrorHandler("Authorization Restricted", 400));

    const checkDoctor = await Doctor.findOne({ where: { name: data.name } });

    const checkDoctorEmail = await Doctor.findOne({
      where: { email: data.email },
    });

    // check if doctor exists
    if (checkDoctor || checkDoctorEmail)
      return next(
        new ErrorHandler("Permission denied: Doctor already exists", 422)
      );

    // handle doctor image upload to server
    const thumbnail = data.thumbnail;

    if (!thumbnail)
      return next(
        new ErrorHandler("Permission Denied: Doctor MUST have an image", 403)
      );

    if (thumbnail) {
      // upload the thumbnail
      // create the folder path the image will be uploaded on cloudinary
      const folderPath = `medicalFunc/doctors/${data.name}`;

      // the cloudUploader takes 3 arguments (the foldl)
      await cloudUploader.upload(
        thumbnail as any,
        {
          folder: folderPath,
          transformation: { gravity: "face" },
        },
        async (error: any, result) => {
          // if there is an error, the code stops here
          if (error) return next(new ErrorHandler(error.message, 400));

          const publicId = result?.public_id;

          const thumbnailId = publicId?.split("/").pop() as string; // fetch the last id

          const thumbnailUrl = result?.secure_url as string;

          data.thumbnail = {
            id: thumbnailId,
            url: thumbnailUrl,
          };
        }
      );
    }

    // create doctor
    const doctor = await Doctor.create(data);

    res.status(201).json({
      success: true,
      message: "Application successful. Review in progress",
      doctor,
    });
  }
);

//////////////////////////////////////////////////////////////////////////////////////////////// EDIT DOCTOR
// export const editDoctor = catchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const doctorId = req.params.doctor_id;

//     const findDoctor = await Doctor.findById(doctorId);

//     if (!findDoctor)
//       return next(
//         new ErrorHandler("Permission denied: Doctor credentials not found", 404)
//       );

//     const data = req.data;

//     const userId = req.user._id;

//     const user = await User.findById(userId);

//     // double check again if user exists
//     if (!user) return next(new ErrorHandler("Authorization Restricted", 400));

//     const checkDoctor = await Doctor.findOne({ email: data.email });

//     if (!checkDoctor)
//       return next(
//         new ErrorHandler("Permission denied: Doctor credentials not found", 404)
//       );

//     // also check if doctor has been verified
//     if (checkDoctor.verificationStatus === "Processing")
//       return next(
//         new ErrorHandler(
//           "Account verification is in progress. Try again later. Thanks.",
//           403
//         )
//       );

//     // also check if doctor has been verified
//     if (checkDoctor.verificationStatus === "Failed")
//       return next(new ErrorHandler("Account Verification failed.", 400));

//     // upload data image to cloudinary server
//     const thumbnail = data.thumbnail;

//     if (thumbnail) {
//       // upload the thumbnail
//       // create the folder path the image will be uploaded on cloudinary
//       const folderPath = `medicalFunc/doctors/${data.name}`;

//       // the cloudUploader takes 3 arguments (the foldl)
//       await cloudUploader.upload(
//         thumbnail as any,
//         {
//           folder: folderPath,
//           transformation: { gravity: "face" },
//         },
//         async (error: any, result) => {
//           // if there is an error, the code stops here
//           if (error) return next(new ErrorHandler(error.message, 400));

//           const publicId = result?.public_id;

//           const thumbnailId = publicId?.split("/").pop() as string; // fetch the last id

//           const thumbnailUrl = result?.secure_url as string;

//           data.thumbnail = {
//             id: thumbnailId,
//             url: thumbnailUrl,
//           };
//         }
//       );
//     }

//     // update doctor credentials

//     const newDoctorInfo = await Doctor.findByIdAndUpdate(
//       doctorId,
//       { $set: data },
//       { new: true }
//     );

//     res.status(201).json({
//       success: true,
//       message: "Doctor credentials updated.",
//       doctor: newDoctorInfo,
//     });
//   }
// );

// //////////////////////////////////////////////////////////////////////////////////////////////// DELETE DOCTOR
// export const deleteDoctor = catchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const doctorId = req.params.doctor_id;

//     const doctor = await Doctor.findById(doctorId);

//     if (!doctor) return next(new ErrorHandler("Error: Doctor not found", 404));

//     await doctor?.deleteOne();

//     res
//       .status(200)
//       .json({ success: true, message: "Doctor credentials deleted" });
//   }
// );

// //////////////////////////////////////////////////////////////////////////////////////////////// GET A DOCTOR (USER)
// export const getDoctor = catchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const doctorId = req.params.doctor_id;

//     const doctor = await Doctor.findById(doctorId).select(
//       "-securityAnswer -phone -altPhone -hospital -clinicAddress"
//     );

//     if (!doctor) return next(new ErrorHandler("Error: Doctor not found", 404));

//     res
//       .status(200)
//       .json({ success: true, message: "Doctor Information retrieved", doctor });
//   }
// );

// //////////////////////////////////////////////////////////////////////////////////////////////// GET A DOCTOR (ADMIN)
// export const getDoctorAdmin = catchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const doctorId = req.params.doctor_id;

//     const doctor = await Doctor.findById(doctorId);

//     if (!doctor) return next(new ErrorHandler("Error: Doctor not found", 404));

//     res
//       .status(200)
//       .json({ success: true, message: "Doctor Information retrieved", doctor });
//   }
// );

// //////////////////////////////////////////////////////////////////////////////////////////////// GET ALL DOCTORS (USER)
// export const getAllDoctorsList = catchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     // const page = parseInt(req.query.page as string, 10) || 1;
//     // const limit = parseInt(req.query.limit as string, 10) || 4;
//     // const skip = (page - 1) * limit;

//     // const totalDoctors = await Doctor.countDocuments();

//     const doctors = await Doctor.find().select(
//       "-securityAnswer -phone -altPhone -hospital "
//     );
//     // .skip(skip)
//     // .limit(limit);   // hide for now

//     if (!doctors) return next(new ErrorHandler("Error Fetching DoctorsS", 400));

//     res.status(200).json({
//       success: true,
//       message: "Doctors Information retrieved",
//       doctors,
//       // totalPages: Math.ceil(totalDoctors / limit),
//     });
//   }
// );

// //////////////////////////////////////////////////////////////////////////////////////////////// GET ALL DOCTORS (USER)
// export const getAllDoctorsAdmin = catchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const doctors = await Doctor.find();

//     if (!doctors) return next(new ErrorHandler("Error: Doctor not found", 404));

//     res.status(200).json({
//       success: true,
//       message: "Admin - Doctors Information retrieved",
//       doctors,
//     });
//   }
// );
