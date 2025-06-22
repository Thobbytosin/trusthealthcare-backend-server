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
exports.deleteDoctorAccount = exports.doctorApplicationDenial = exports.doctorApplicationApproval = exports.getDoctorAdmin = exports.getAllDoctorsAdmin = exports.getAllUsersAdmin = exports.deleteUser = void 0;
const catchAsyncError_1 = __importDefault(require("../middlewares/catchAsyncError"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const user_model_1 = require("../models/user.model");
const doctor_model_1 = require("../models/doctor.model");
const helpers_1 = require("../utils/helpers");
//////////////////////////////////////////////////////////////////////////////////////////////// DELETE USER ACCOUNT (ADMIN)
exports.deleteUser = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { doctorId } = req.params;
    const loggedInUser = req.user;
    if (!doctorId)
        return next(new errorHandler_1.default("User Id not found", 400));
    const user = yield user_model_1.User.findByPk(doctorId);
    if (!user)
        return next(new errorHandler_1.default("User Account not found", 404));
    if (loggedInUser.id === doctorId)
        return next(new errorHandler_1.default("Permission Restricted: You can not delete your account", 403));
    yield user.destroy();
    res.status(200).json({ success: true, message: "User Account Deleted" });
}));
//////////////////////////////////////////////////////////////////////////////////////////////// GET ALL USERS (ADMIN)
exports.getAllUsersAdmin = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_model_1.User.findAll();
    if (!users)
        return next(new errorHandler_1.default("No record found", 404));
    res.status(200).json({
        success: true,
        message: "Users data fetched",
        users,
    });
}));
//////////////////////////////////////////////////////////////////////////////////////////////// GET ALL DOCTORS (ADMIN)
exports.getAllDoctorsAdmin = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const doctors = yield doctor_model_1.Doctor.findAll();
    if (!doctors)
        return next(new errorHandler_1.default("No record found", 404));
    res.status(200).json({
        success: true,
        message: "Doctors data fetched",
        doctors,
    });
}));
// //////////////////////////////////////////////////////////////////////////////////////////////// GET A DOCTOR (ADMIN)
exports.getDoctorAdmin = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const doctorId = req.params.doctor_id;
    const doctor = yield doctor_model_1.Doctor.findByPk(doctorId);
    if (!doctor)
        return next(new errorHandler_1.default("Error: Doctor not found", 404));
    res
        .status(200)
        .json({ success: true, message: "Doctor Information retrieved", doctor });
}));
////////////////////////////////////////////////////////////////////////////////////////////////  APPLICATION APPROVAL (ADMIN)
exports.doctorApplicationApproval = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const doctorId = req.params.doctor_id;
    const user = yield user_model_1.User.findByPk(doctorId);
    const doctor = yield doctor_model_1.Doctor.findOne({ where: { uploadedById: doctorId } });
    if (!user || !doctor)
        return next(new errorHandler_1.default("User/Doctor not found", 404));
    if (user.role.some((role) => ["doctor"].includes(role)))
        return next(new errorHandler_1.default("Your account is already verified", 408));
    user.role = ["doctor"];
    user.doctorId = doctor.id;
    const updatedUser = yield user.save();
    if (!updatedUser)
        return next(new errorHandler_1.default("Error updating user", 400));
    // update doctor verification status
    doctor.verificationStatus = "Verified";
    const updatedDoctor = yield doctor.save();
    if (!updatedDoctor)
        return next(new errorHandler_1.default("Error updating doctor", 400));
    yield (0, helpers_1.logDoctorActivity)({
        doctorId: updatedDoctor.id || "",
        action: "Doctor Application Approved",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        next,
    });
    res.status(200).json({
        success: true,
        message: "Your application has been approved. Welcome to Trust Healthcare",
    });
}));
////////////////////////////////////////////////////////////////////////////////////////////////  APPLICATION DENIAL (ADMIN)
exports.doctorApplicationDenial = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const doctorId = req.params.doctor_id;
    const doctor = yield doctor_model_1.Doctor.findOne({ where: { uploadedById: doctorId } });
    if (!doctor)
        return next(new errorHandler_1.default("Doctor not found", 404));
    doctor.verificationStatus = "Failed";
    doctor.save();
    yield (0, helpers_1.logDoctorActivity)({
        doctorId: doctor.id || "",
        action: "Doctor Application Failed",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        next,
    });
    res.status(200).json({
        success: true,
        message: "Sorry, Your application has been denied. Check your email for reasons.",
    });
}));
////////////////////////////////////////////////////////////////////////////////////////////////// DELETE ACCOUNT (ADMIN)
exports.deleteDoctorAccount = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const doctorId = req.params.doctor_id;
    const loggedInUser = req.user;
    const doctor = yield doctor_model_1.Doctor.findOne({
        where: { id: doctorId },
    });
    if (!doctor)
        return next(new errorHandler_1.default("Error: Doctor not found", 404));
    yield (doctor === null || doctor === void 0 ? void 0 : doctor.destroy());
    yield doctor.save();
    res
        .status(200)
        .json({ success: true, message: "Your account has been deleted" });
}));
