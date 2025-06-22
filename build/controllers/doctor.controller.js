"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDoctorMeta = exports.getDoctorAvailableSlot = exports.getSomeDoctorsUnauthenticated = exports.getAllDoctorsList = exports.getDoctor = exports.updateDoctor = exports.uploadDoctor = void 0;
const catchAsyncError_1 = __importDefault(require("../middlewares/catchAsyncError"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const cloudinary_1 = require("../utils/cloudinary");
const doctor_model_1 = require("../models/doctor.model");
const sequelize_1 = require("sequelize");
const user_model_1 = require("../models/user.model");
const auth_controller_1 = require("./auth.controller");
const helpers_1 = require("../utils/helpers");
const sequelize_typescript_1 = require("sequelize-typescript");
const availableSlots_service_1 = require("../services/availableSlots.service");
const cache_service_1 = require("../services/cache.service");
const date_fns_1 = require("date-fns");
//////////////////////////////////////////////////////////////////////////////////////////////// UPLOAD DOCTOR
exports.uploadDoctor = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const loggedInUser = req.user;
    const { thumbnail } = req.files;
    // find loggedIn user from the database
    const user = yield user_model_1.User.findByPk(loggedInUser.id);
    // sign out for security reasons
    if (!user) {
        auth_controller_1.signOut;
        return next(new errorHandler_1.default("Permission denied: Suspected fraudulent operation", 404));
    }
    // if loggedIn user is not an admin, they must provide their verified email
    if (!loggedInUser.role.some((role) => ["admin"].includes(role)) &&
        loggedInUser.email !== data.email) {
        return next(new errorHandler_1.default("Invalid Credentials: Enter your verified email", 403));
    }
    const checkDoctor = yield doctor_model_1.Doctor.findOne({ where: { email: data.email } });
    // check if doctor exists
    if (checkDoctor)
        return next(new errorHandler_1.default("Permission denied: Doctor already exists", 422));
    const folderPath = `trusthealthcare/doctors/${data.name}`;
    // for cloudinary upload
    try {
        const { thumbnailId, thumbnailUrl } = yield (0, cloudinary_1.uploadToCloudinary)(thumbnail, folderPath);
        data.thumbnail = {
            id: thumbnailId,
            url: thumbnailUrl,
        };
        data.image = thumbnailUrl;
    }
    catch (error) {
        return res
            .status(400)
            .json({ success: false, message: error.message || "Upload Failed" });
    }
    let doctor;
    // create doctor (either by a user or an admin)
    if (loggedInUser.role.some((role) => ["admin"].includes(role))) {
        doctor = yield doctor_model_1.Doctor.create(Object.assign(Object.assign({}, data), { uploadedBy: "admin", uploadedById: loggedInUser.id }));
    }
    else {
        doctor = yield doctor_model_1.Doctor.create(Object.assign(Object.assign({}, data), { uploadedBy: "doctor", uploadedById: loggedInUser.id }));
    }
    if (!doctor)
        return next(new errorHandler_1.default("Error uploading doctor details", 400));
    yield (0, helpers_1.logDoctorActivity)({
        doctorId: doctor.id || "",
        action: "Doctor Signed up",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        next,
    });
    res.status(201).json({
        success: true,
        message: "Application submitted. Please be patient while we review your application.",
    });
}));
//////////////////////////////////////////////////////////////////////////////////////////////// UPDATE DOCTOR
exports.updateDoctor = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body; // edited fields
    const doctorId = req.doctor.id;
    const doctor = yield doctor_model_1.Doctor.findByPk(doctorId);
    if (!doctor)
        return next(new errorHandler_1.default("Doctor not found", 404));
    yield (doctor === null || doctor === void 0 ? void 0 : doctor.update(Object.assign({}, data)));
    const updatedDoctor = {
        id: doctor === null || doctor === void 0 ? void 0 : doctor.id,
        name: doctor === null || doctor === void 0 ? void 0 : doctor.name,
        email: doctor === null || doctor === void 0 ? void 0 : doctor.email,
        specialization: doctor === null || doctor === void 0 ? void 0 : doctor.specialization,
        workExperience: doctor === null || doctor === void 0 ? void 0 : doctor.workExperience,
        yearsOfExperience: doctor === null || doctor === void 0 ? void 0 : doctor.yearsOfExperience,
        education: doctor === null || doctor === void 0 ? void 0 : doctor.education,
        hospital: doctor === null || doctor === void 0 ? void 0 : doctor.hospital,
        certifications: doctor === null || doctor === void 0 ? void 0 : doctor.certifications,
        availableDays: doctor === null || doctor === void 0 ? void 0 : doctor.availableDays,
        timeSlots: doctor === null || doctor === void 0 ? void 0 : doctor.timeSlots,
        city: doctor === null || doctor === void 0 ? void 0 : doctor.city,
        state: doctor === null || doctor === void 0 ? void 0 : doctor.state,
        ratings: doctor === null || doctor === void 0 ? void 0 : doctor.ratings,
        reviews: doctor === null || doctor === void 0 ? void 0 : doctor.reviews,
        maxPatientsPerDay: doctor === null || doctor === void 0 ? void 0 : doctor.maxPatientsPerDay,
        about: doctor === null || doctor === void 0 ? void 0 : doctor.about,
        image: doctor === null || doctor === void 0 ? void 0 : doctor.image,
        verificationStatus: doctor === null || doctor === void 0 ? void 0 : doctor.verificationStatus,
        available: doctor === null || doctor === void 0 ? void 0 : doctor.available,
    };
    // save doctor to redis
    yield (0, cache_service_1.setCachedDoctor)(updatedDoctor.id, updatedDoctor);
    res.status(201).json({
        success: true,
        message: "Doctor credentials updated.",
    });
}));
// //////////////////////////////////////////////////////////////////////////////////////////////// GET A DOCTOR (USER)
exports.getDoctor = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const doctorId = req.params.doctor_id;
    let doctor = yield (0, cache_service_1.getCachedDoctor)(doctorId);
    if (!doctor) {
        doctor = yield doctor_model_1.Doctor.findByPk(doctorId);
        if (!doctor) {
            return next(new errorHandler_1.default("Not Found: Doctor does not exist", 404));
        }
        yield (0, cache_service_1.setCachedDoctor)(doctorId, doctor);
    }
    res.status(200).json({
        success: true,
        message: "Doctor Information retrieved",
        doctor,
    });
}));
// //////////////////////////////////////////////////////////////////////////////////////////////// GET ALL DOCTORS (USER)
exports.getAllDoctorsList = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 4;
    const skip = (page - 1) * limit;
    // queries
    const { search, specialization, sortBy, filter, location } = req.query;
    // set WHERE conditions for query
    const where = {};
    // for search by location
    if (search) {
        const searchTerms = typeof search === "string" ? search.trim().split(/\s+/) : []; // Split by spaces
        where[sequelize_1.Op.or] = searchTerms.map((term) => ({
            [sequelize_1.Op.or]: [
                { city: { [sequelize_1.Op.iRegexp]: `\\m${term}\\M` } }, // no case sensitive
                { state: { [sequelize_1.Op.iRegexp]: `\\m${term}\\M` } }, // no case sensitive
            ],
        }));
    }
    // search by user location
    if (location) {
        const searchTerms = typeof location === "string" ? location.trim().split(/\s+/) : []; // Split by spaces
        where[sequelize_1.Op.or] = searchTerms.map((term) => ({
            [sequelize_1.Op.or]: [
                { clinicAddress: { [sequelize_1.Op.iRegexp]: `\\m${term}\\M` } }, // no case sensitive
                { city: { [sequelize_1.Op.iRegexp]: `\\m${term}\\M` } }, // no case sensitive
                { state: { [sequelize_1.Op.iRegexp]: `\\m${term}\\M` } }, // no case sensitive
            ],
        }));
    }
    // for specialization
    if (specialization) {
        const specializationQueries = typeof specialization === "string"
            ? specialization.trim().split(/\s+/)
            : []; // Split by spaces
        where[sequelize_1.Op.or] = specializationQueries.map((query) => ({
            [sequelize_1.Op.or]: [
                sequelize_typescript_1.Sequelize.literal(`'${query}' ~* ANY("specialization")`), // for array fields of strings
            ],
        }));
    }
    // for available
    if (filter === "available") {
        where.available = true; // fetch doctors that available
    }
    // set ORDER conditions for sorting
    let order = [];
    if (sortBy === "latest") {
        order.push(["createdAt", "DESC"]);
    }
    else if (sortBy === "oldest") {
        order.push(["createdAt", "ASC"]);
    }
    else if (sortBy === "ratings") {
        order.push(["ratings", "DESC"]);
    }
    // total doctors in the db
    const grandTotalDoctors = yield doctor_model_1.Doctor.count();
    // total doctors after query
    const totalDoctors = yield doctor_model_1.Doctor.count({ where });
    // exclude vital info
    const doctors = yield doctor_model_1.Doctor.findAll({
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
    if (!doctors)
        return next(new errorHandler_1.default("No record found", 404));
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
}));
// //////////////////////////////////////////////////////////////////////////////////////////////// GET SOME DOCTORS (UNAUTHENTICATED)
exports.getSomeDoctorsUnauthenticated = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let doctors = yield (0, cache_service_1.getCachedDoctors)();
    if (!doctors) {
        doctors = yield doctor_model_1.Doctor.findAll({
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
        if (!doctors) {
            return next(new errorHandler_1.default("No record found", 404));
        }
        yield (0, cache_service_1.setCachedDoctors)(doctors);
    }
    res.status(200).json({
        success: true,
        message: "Doctors data fetched",
        doctors,
    });
}));
// //////////////////////////////////////////////////////////////////////////////////////////////// GET DOCTOR AVAILABLE SLOT
exports.getDoctorAvailableSlot = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const doctorId = req.params.doctor_id;
    const rawDate = req.query.date;
    if (!doctorId || !rawDate)
        return next(new errorHandler_1.default("Doctor available slots not available", 400));
    if (rawDate === "none") {
        res.status(200).json({
            success: true,
            message: "No available slots",
        });
        return;
    }
    const date = new Date(rawDate);
    const formattedDate = (0, date_fns_1.format)(date, "dd MMM yyyy");
    let availableSlots = yield (0, cache_service_1.getCachedSlots)(doctorId, formattedDate);
    if (!availableSlots) {
        availableSlots = yield (0, availableSlots_service_1.doctorAvailableSlots)(doctorId, date, next);
        if (availableSlots)
            yield (0, cache_service_1.setCachedSlots)(doctorId, availableSlots, formattedDate);
    }
    res.status(200).json({
        success: true,
        availableSlots: availableSlots.selectedDay,
    });
}));
// //////////////////////////////////////////////////////////////////////////////////////////////// GET A DOCTOR METATAG (USER)
exports.getDoctorMeta = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const doctorId = req.params.doctor_id;
    let tags = yield (0, cache_service_1.getCachedMetaTags)(doctorId);
    if (!tags) {
        const doctor = yield doctor_model_1.Doctor.findOne({
            where: { id: doctorId },
        });
        if (!doctor)
            return next(new errorHandler_1.default("Error: Doctor not found", 404));
        tags = { name: doctor.name, specialty: doctor.specialization };
        yield (0, cache_service_1.setCachedMetaTags)(doctorId, tags);
    }
    res.status(200).json({
        success: true,
        message: "Doctor meta tags received",
        tags,
    });
}));
