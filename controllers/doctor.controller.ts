import { NextFunction, Request, Response } from "express";
import catchAsyncError from "../middlewares/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import { uploadToCloudinary } from "../utils/cloudinary";
import { Doctor, IDoctor } from "../models/doctor.model";
import { Op } from "sequelize";
import { User } from "../models/user.model";
import { signOut } from "./auth.controller";
import { logDoctorActivity } from "../utils/helpers";
import { Sequelize } from "sequelize-typescript";
import redis from "../utils/redis";

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

      data.image = thumbnailUrl;
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
        uploadedById: loggedInUser.id,
      });
    } else {
      doctor = await Doctor.create({
        ...data,
        uploadedBy: "doctor",
        uploadedById: loggedInUser.id,
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
    // const { thumbnail } = req.files; // images
    const doctor = req.doctor;

    // HANDLE DOCTOR PICURE UPDATE ON A DIFFERENT ROUTE
    // upload data image to cloudinary server

    // if (thumbnail) {
    //   const folderPath = `trusthealthcare/doctors/${data.name}`;

    //   // for cloudinary upload
    //   try {
    //     const { thumbnailId, thumbnailUrl } = await uploadToCloudinary(
    //       thumbnail,
    //       folderPath
    //     );

    //     data.thumbnail = {
    //       id: thumbnailId,
    //       url: thumbnailUrl,
    //     };
    //   } catch (error: any) {
    //     return res
    //       .status(400)
    //       .json({ success: false, message: error.message || "Upload Failed" });
    //   }
    // }

    // update doctor credentials
    const newDoctor = await Doctor.update(
      { ...data },
      { where: { id: doctor.id } }
    );

    if (!newDoctor)
      return next(
        new ErrorHandler(
          "Error updating credntials: You can only update your account",
          400
        )
      );

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
    // const cachedDoctor = await redis.get(`doctor - ${doctorId}`);
    const cachedDoctor = false;

    if (cachedDoctor) {
      res.status(200).json({
        success: true,
        message: "Doctor Information retrieved",
        doctor: JSON.parse(cachedDoctor),
      });
    } else {
      const doctor: IDoctor | null = await Doctor.findOne({
        where: { id: doctorId },
        attributes: {
          exclude: [
            "securityAnswer",
            "securityQuestion",
            "phone",
            "altPhone",
            "hospital",
            "thumbnail",
            "zipCode",
            "createdAt",
            "updatedAt",
            "licenseNumber",
            "email",
            "holidays",
            "clinicAddress",
            "reviews",
            "appointments",
            "uploadedBy",
            "userId",
          ],
        },
      });

      if (!doctor)
        return next(new ErrorHandler("Error: Doctor not found", 404));

      // save doctor to redis
      await redis.set(
        `doctor - ${doctor.id}`,
        JSON.stringify(doctor),
        "EX",
        14 * 24 * 60 * 60 // 14 days
      );

      res.status(200).json({
        success: true,
        message: "Doctor Information retrieved",
        doctor,
      });
    }
  }
);

// //////////////////////////////////////////////////////////////////////////////////////////////// GET ALL DOCTORS (USER)
export const getAllDoctorsList = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 4;
    const skip = (page - 1) * limit;

    // queries
    const { search, specialization, sortBy, filter, location } = req.query;

    // set WHERE conditions for query
    const where: any = {};
    // for search by location
    if (search) {
      const searchTerms =
        typeof search === "string" ? search.trim().split(/\s+/) : []; // Split by spaces

      where[Op.or] = searchTerms.map((term) => ({
        [Op.or]: [
          { city: { [Op.iRegexp]: `\\m${term}\\M` } }, // no case sensitive
          { state: { [Op.iRegexp]: `\\m${term}\\M` } }, // no case sensitive
        ],
      }));
    }

    // search by user location
    if (location) {
      const searchTerms =
        typeof location === "string" ? location.trim().split(/\s+/) : []; // Split by spaces

      where[Op.or] = searchTerms.map((term) => ({
        [Op.or]: [
          { clinicAddress: { [Op.iRegexp]: `\\m${term}\\M` } }, // no case sensitive
          { city: { [Op.iRegexp]: `\\m${term}\\M` } }, // no case sensitive
          { state: { [Op.iRegexp]: `\\m${term}\\M` } }, // no case sensitive
        ],
      }));
    }

    // for specialization
    if (specialization) {
      const specializationQueries =
        typeof specialization === "string"
          ? specialization.trim().split(/\s+/)
          : []; // Split by spaces

      where[Op.or] = specializationQueries.map((query) => ({
        [Op.or]: [
          Sequelize.literal(`'${query}' ~* ANY("specialization")`), // for array fields of strings
        ],
      }));
    }

    // for available
    if (filter === "available") {
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

    // total doctors in the db
    const grandTotalDoctors = await Doctor.count();

    // total doctors after query
    const totalDoctors = await Doctor.count({ where });

    // exclude vital info
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
          "thumbnail",
          "securityQuestion",
          "workExperience",
          "holidays",
          "clinicAddress",
          "reviews",
          "maxPatientsPerDay",
          "appointments",
          "uploadedBy",
          "userId",
          "createdAt",
          "updatedAt",
          "zipCode",
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
      results: totalDoctors,
      page,
      doctors,
      limit,
    });
  }
);

// //////////////////////////////////////////////////////////////////////////////////////////////// GET SOME DOCTORS (UNAUTHENTICATED)
export const getSomeDoctorsUnauthenticated = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const doctors = await Doctor.findAll({
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
          "workExperience",
          "createdAt",
          "updatedAt",
          "securityQuestion",
          "thumbnail",
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

// [{"institution": "University of Lagos, Nigeria", "graduationYear": "2013", "course": "MBBS"},{"institution":  "Johns Hopkins School of Medicine, USA", "graduationYear": "2017", "course": "MD"}]

// [{"name": "Evergreen Skin & Laser Clinic","address": "27 Ologun Agbaje Street, Victoria Island"}]
