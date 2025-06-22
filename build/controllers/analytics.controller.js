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
exports.getDoctorsAnalytics = exports.getUsersAnalytics = void 0;
const catchAsyncError_1 = __importDefault(require("../middlewares/catchAsyncError"));
const moment_1 = __importDefault(require("moment"));
const user_model_1 = require("../models/user.model");
const sequelize_1 = require("sequelize");
const userActivity_model_1 = require("../models/userActivity.model");
const doctor_model_1 = require("../models/doctor.model");
const doctorActivity_model_1 = require("../models/doctorActivity.model");
////////////////////////////////////////////////////////////////////////////////////////////////  USERS ANALYTICS (ADMIN)
exports.getUsersAnalytics = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const oneWeekAgo = (0, moment_1.default)().subtract(7, "days").toDate();
    const twoWeeksAgo = (0, moment_1.default)().subtract(14, "days").toDate();
    const totalUsers = yield user_model_1.User.count();
    const newUsersInOneWeek = yield user_model_1.User.count({
        where: { createdAt: { [sequelize_1.Op.gte]: oneWeekAgo } },
    });
    const newUsersInTwoWeeks = yield user_model_1.User.count({
        where: { createdAt: { [sequelize_1.Op.gte]: twoWeeksAgo, [sequelize_1.Op.lt]: oneWeekAgo } },
    });
    // calculate percentage increase/dcerease
    let usersPercentageChange = 0;
    let trend = "no change";
    if (newUsersInTwoWeeks === 0 && newUsersInOneWeek > 0) {
        usersPercentageChange = 100;
        trend = "increase";
    }
    else if (newUsersInTwoWeeks > 0) {
        usersPercentageChange =
            ((newUsersInOneWeek - newUsersInTwoWeeks) / newUsersInTwoWeeks) * 100;
        trend =
            usersPercentageChange > 0
                ? "increase"
                : usersPercentageChange < 0
                    ? "decrease"
                    : "no change";
        usersPercentageChange = Math.abs(usersPercentageChange); // always return +ve value
    }
    const logins = yield userActivity_model_1.UserActivityLogs.count({
        where: { action: "Logged in", createdAt: { [sequelize_1.Op.gte]: oneWeekAgo } },
    });
    const refreshes = yield userActivity_model_1.UserActivityLogs.count({
        where: {
            action: "Token Refreshed",
            createdAt: { [sequelize_1.Op.gte]: oneWeekAgo },
        },
    });
    const activeLastOneWeek = logins + refreshes;
    const usersLogoutsLastOneWeek = yield userActivity_model_1.UserActivityLogs.count({
        where: {
            action: "Logged out",
            createdAt: { [sequelize_1.Op.gte]: oneWeekAgo },
        },
    });
    res.status(200).json({
        success: true,
        message: "Users Analytics Fetched",
        totalUsers,
        newUsersInOneWeek,
        activeLastOneWeek,
        usersLogoutsLastOneWeek,
        usersPercentageChange: usersPercentageChange.toFixed(2),
        trend,
    });
}));
////////////////////////////////////////////////////////////////////////////////////////////////  DOCTORS ANALYTICS (ADMIN)
exports.getDoctorsAnalytics = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const oneWeekAgo = (0, moment_1.default)().subtract(7, "days").toDate();
    const totalDoctors = yield doctor_model_1.Doctor.count();
    const newDoctors = yield doctor_model_1.Doctor.count({
        where: { createdAt: { [sequelize_1.Op.gte]: oneWeekAgo } },
    });
    const logins = yield doctorActivity_model_1.DoctorActivityLogs.count({
        where: {
            action: "Doctor Logged in",
            createdAt: { [sequelize_1.Op.gte]: oneWeekAgo },
        },
    });
    const refreshes = yield doctorActivity_model_1.DoctorActivityLogs.count({
        where: {
            action: "Doctor Token Refreshed",
            createdAt: { [sequelize_1.Op.gte]: oneWeekAgo },
        },
    });
    const activeLastOneWeek = logins + refreshes;
    const logoutsLastOneWeek = yield doctorActivity_model_1.DoctorActivityLogs.count({
        where: {
            action: "Doctor Logged out",
            createdAt: { [sequelize_1.Op.gte]: oneWeekAgo },
        },
    });
    res.status(200).json({
        success: true,
        message: "Doctors Analytics Fetched",
        totalDoctors,
        newDoctors,
        activeLastOneWeek,
        doctorLogoutsLastOneWeek: logoutsLastOneWeek,
    });
}));
