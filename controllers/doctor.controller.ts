import { NextFunction, Request, Response } from "express";
import catchAsyncError from "../middlewares/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import { uploadToCloudinary } from "../utils/cloudinary";
import { Doctor } from "../models/doctor.model";
import { Op } from "sequelize";
import { User } from "../models/user.model";
import { signOut } from "./auth.controller";
import { logDoctorActivity } from "../utils/helpers";

//////////////////////////////////////////////////////////////////////////////////////////////// UPLOAD DOCTOR
export const uploadDoctor = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;
    const loggedInUser = req.user;
    const { thumbnail } = req.files;

    // find loggedIn user from the database
    const user = await User.findByPk(loggedInUser.id);

    // sign out for security reasons
    if (!user) {
      signOut;
      return next(
        new ErrorHandler(
          "Permission denied: Suspected fraudulent operation",
          404
        )
      );
    }

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

    let doctor;
    // create doctor (either by a user or an admin)
    if (loggedInUser.role.some((role: string) => ["admin"].includes(role))) {
      doctor = await Doctor.create({
        ...data,
        uploadedBy: "admin",
        userId: loggedInUser.id,
      });
    } else {
      doctor = await Doctor.create({
        ...data,
        uploadedBy: "user",
        userId: loggedInUser.id,
      });
    }

    if (!doctor)
      return next(new ErrorHandler("Error uploading doctor details", 400));

    await logDoctorActivity({
      doctorId: doctor.id || "",
      action: "Doctor Signed up",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      next,
    });

    res.status(201).json({
      success: true,
      message:
        "Application submitted. Please be patient while we review your application.",
    });
  }
);

//////////////////////////////////////////////////////////////////////////////////////////////// UPDATE DOCTOR
export const updateDoctor = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body; // edited fields
    const { thumbnail } = req.files; // images
    const doctor = req.doctor;

    // upload data image to cloudinary server

    if (thumbnail) {
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
    }

    // update doctor credentials

    const newDoctor = await Doctor.update(
      { ...data },
      { where: { id: doctor.id } }
    );

    if (!newDoctor)
      return next(new ErrorHandler("Error updating credntials", 400));

    res.status(201).json({
      success: true,
      message: "Doctor credentials updated.",
    });
  }
);

// //////////////////////////////////////////////////////////////////////////////////////////////// GET A DOCTOR (USER)
export const getDoctor = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const doctorId = req.params.doctor_id;
    const { role } = req.query;

    const doctor = await Doctor.findOne({
      where: { id: doctorId },
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
          "appointments",
          "uploadedBy",
          "userId",
        ],
      },
    });

    if (!doctor) return next(new ErrorHandler("Error: Doctor not found", 404));

    res
      .status(200)
      .json({ success: true, message: "Doctor Information retrieved", doctor });
  }
);

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
          "appointments",
          "uploadedBy",
          "userId",
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

// //////////////////////////////////////////////////////////////////////////////////////////////// GET SOME DOCTORS (UNAUTHENTICATED)
export const getSomeDoctorsUnauthenticated = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const doctors = await Doctor.findAll({
      where: { available: true },
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
          "appointments",
          "holidays",
          "clinicAddress",
          "reviews",
          "maxPatientsPerDay",
          "city",
          "state",
          "zipCode",
          "uploadedBy",
          "userId",
        ],
      },
      offset: 0,
      limit: 4,
    });

    if (!doctors) return next(new ErrorHandler("No record found", 404));

    res.status(200).json({
      success: true,
      message: "Doctors data fetched",
      doctors,
    });
  }
);
