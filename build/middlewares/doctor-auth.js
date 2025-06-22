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
exports.hasDoctorProfileBeenUpdatedLast7days = void 0;
const catchAsyncError_1 = __importDefault(require("./catchAsyncError"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const doctor_model_1 = require("../models/doctor.model");
// check if doctor profile has been updated in the past 1 week
exports.hasDoctorProfileBeenUpdatedLast7days = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const loggedInUser = req.user;
    const doctorId = req.params.doctor_id; // doctor id
    if (!loggedInUser.role.some((role) => ["doctor", "admin"].includes(role)))
        return next(new errorHandler_1.default("Permission denied: You are not registered as a doctor or an admin", 403));
    const doctor = yield doctor_model_1.Doctor.findByPk(doctorId);
    // check if doctor exists
    if (!doctor)
        return next(new errorHandler_1.default("Account does not exist", 404));
    // check if user/admin is updating the account they created
    if (doctor.uploadedById !== loggedInUser.id)
        return next(new errorHandler_1.default("Permission Denied: You can only update your account", 403));
    // check for last time the account was updated
    const lastUpdatedDate = new Date(doctor.updatedAt || "");
    const presentDate = new Date();
    const timeDifference = presentDate.getTime() - lastUpdatedDate.getTime();
    const oneWeekAgo = 7 * 24 * 60 * 60 * 1000; // milliseconds
    if (timeDifference < oneWeekAgo)
        return next(new errorHandler_1.default("You can only update your account once in 7 days. Contact support for further assistance.", 400));
    // check if account has been verified
    if (doctor.verificationStatus !== "Verified")
        return next(new errorHandler_1.default("Your account has not been verified yet.You can only update your account after verification is completed", 400));
    req.doctor = doctor;
    return next();
}));
