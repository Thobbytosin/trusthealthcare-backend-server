import { NextFunction, Request, Response } from "express";
import catchAsyncError from "../middlewares/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import { uploadToCloudinary } from "../utils/cloudinary";
import { Doctor } from "../models/doctor.model";
import { Op } from "sequelize";

//////////////////////////////////////////////////////////////////////////////////////////////// UPLOAD DOCTOR
export const uploadDoctor = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;
    const loggedInUser = req.user;
    const { thumbnail } = req.files;

    // if loggedIn user is not an admin, they must provide their verified email
    if (
      !loggedInUser.role.some((role: string) => ["admin"].includes(role)) &&
      loggedInUser.email !== data.email
    ) {
      return next(
        new ErrorHandler("Invalid Credentials: Enter your verified email", 403)
      );
    }

    const checkDoctor = await Doctor.findOne({ where: { email: data.email } });

    // check if doctor exists
    if (checkDoctor)
      return next(
        new ErrorHandler("Permission denied: Doctor already exists", 422)
      );

    const folderPath = `trusthealthcare/doctors/${data.name}`;

    // for cloudinary upload
    try {
      const { thumbnailId, thumbnailUrl } = await uploadToCloudinary(
        thumbnail,
        folderPath
      );

      data.thumbnail = {
        id: thumbnailId,
        url: thumbnailUrl,
      };
    } catch (error: any) {
      return res
        .status(400)
        .json({ success: false, message: error.message || "Upload Failed" });
    }

    // create doctor
    const doctor = await Doctor.create(data);

    res.status(201).json({
      success: true,
      message:
        "Application submitted. Please be patient while we review your application.",
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
export const getAllDoctorsList = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 4;
    const skip = (page - 1) * limit;
    const sortOrder = (req.query.sortOrder as string) || "asc";

    // search query
    const search = req.query.search as string;

    const { sortBy, available } = req.query;

    // set WHERE conditions for search query
    const where: any = {};
    if (search) {
      const searchTerms = search.trim().split(/\s+/); // Split by spaces

      where[Op.or] = searchTerms.map((term) => ({
        [Op.or]: [
          { city: { [Op.iRegexp]: `\\m${term}\\M` } }, // no case sensitive
          { specialization: { [Op.iRegexp]: `\\m${term}\\M` } },
        ],
      }));
    }

    if (available) {
      where.available = true; // fetch doctors that available
    }

    // set ORDER conditions for sorting
    let order: any[] = [];

    if (sortBy === "latest") {
      order.push(["createdAt", "DESC"]);
    } else if (sortBy === "oldest") {
      order.push(["createdAt", "ASC"]);
    } else if (sortBy === "ratings") {
      order.push(["ratings", "DESC"]);
    }

    // const totalDoctors = await Doctor.count();

    const totalDoctors = await Doctor.count({ where });

    const doctors = await Doctor.findAll({
      where,
      attributes: {
        exclude: [
          "securityAnswer",
          "phone",
          "altPhone",
          "hospital",
          "email",
          "education",
          "licenseNumber",
          "certifications",
          "availableDays",
          "timeSlots",
          "holidays",
          "clinicAddress",
          "reviews",
          "maxPatientsPerDay",
        ],
      },
      offset: skip,
      limit,
      order,
    });

    if (!doctors) return next(new ErrorHandler("No record found", 404));

    res.status(200).json({
      success: true,
      message: "Doctors list sent",
      resultsPerPage: doctors.length,
      totalPages: Math.ceil(totalDoctors / limit),
      page,
      doctors,
    });
  }
);

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
