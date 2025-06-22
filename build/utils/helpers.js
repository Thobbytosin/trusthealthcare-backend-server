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
exports.isEmailValid = void 0;
exports.isPasswordStrong = isPasswordStrong;
exports.createVerificationToken = createVerificationToken;
exports.createResetPasswordToken = createResetPasswordToken;
exports.add = add;
exports.logUserActivity = logUserActivity;
exports.logDoctorActivity = logDoctorActivity;
exports.generate30MinsSlot = generate30MinsSlot;
exports.generateApiKey = generateApiKey;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = __importDefault(require("./errorHandler"));
const userActivity_model_1 = require("../models/userActivity.model");
const doctorActivity_model_1 = require("../models/doctorActivity.model");
const date_fns_1 = require("date-fns");
const crypto_1 = __importDefault(require("crypto"));
exports.isEmailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
function isPasswordStrong(password) {
    const passwordLength = password.trim().length;
    const hasAlphabet = () => !!password.match(/[a-zA-Z]/);
    const hasNumber = () => !!password.match(/[0-9]/);
    // Password Test
    const passwordIsArbitrarilyStrongEnough = hasNumber() && hasAlphabet() && passwordLength >= 8;
    return passwordIsArbitrarilyStrongEnough;
}
function createVerificationToken(user) {
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // generates random 6 digit code
    const verificationToken = jsonwebtoken_1.default.sign({ user, verificationCode }, process.env.JWT_VERIFICATION_SECRET_KEY, { expiresIn: "5m" });
    return { verificationCode, verificationToken };
}
function createResetPasswordToken(user) {
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetToken = jsonwebtoken_1.default.sign({ user, resetCode }, process.env.JWT_RESET_SECRET_KEY, { expiresIn: "4m" });
    return { resetCode, resetToken };
}
function add(a, b) {
    const answer = a + b;
    return answer;
}
function logUserActivity(_a) {
    return __awaiter(this, arguments, void 0, function* ({ userId, action, ipAddress, userAgent, next, }) {
        try {
            if (action !== "Token Refreshed") {
                return yield userActivity_model_1.UserActivityLogs.create({
                    userId,
                    action,
                    userAgent,
                    ipAddress,
                });
            }
            const lastRefresh = yield userActivity_model_1.UserActivityLogs.findOne({
                where: {
                    userId,
                    action: "Token Refreshed",
                },
                order: [["createdAt", "DESC"]], // picks the last token refreshed
            });
            // for token refreshed, log only after 30 minutes to avoid multiple logs
            const shouldLog = !lastRefresh ||
                Date.now() - new Date(lastRefresh.createdAt).getTime() > 30 * 60 * 1000;
            if (shouldLog) {
                return yield userActivity_model_1.UserActivityLogs.create({
                    userId,
                    action,
                    userAgent,
                    ipAddress,
                });
            }
        }
        catch (err) {
            return next(new errorHandler_1.default(err.message, 400));
        }
    });
}
function logDoctorActivity(_a) {
    return __awaiter(this, arguments, void 0, function* ({ doctorId, action, ipAddress, userAgent, next, }) {
        try {
            if (action !== "Doctor Token Refreshed") {
                return yield doctorActivity_model_1.DoctorActivityLogs.create({
                    doctorId,
                    action,
                    userAgent,
                    ipAddress,
                });
            }
            const lastRefresh = yield doctorActivity_model_1.DoctorActivityLogs.findOne({
                where: {
                    doctorId,
                    action: "Doctor Token Refreshed",
                },
                order: [["createdAt", "DESC"]], // picks the last token refreshed
            });
            // for token refreshed, log only after 30 minutes to avoid multiple logs
            const shouldLog = !lastRefresh ||
                Date.now() - new Date(lastRefresh.createdAt).getTime() > 30 * 60 * 1000;
            if (shouldLog) {
                return yield doctorActivity_model_1.DoctorActivityLogs.create({
                    doctorId,
                    action,
                    userAgent,
                    ipAddress,
                });
            }
        }
        catch (err) {
            return next(new errorHandler_1.default(err.message, 400));
        }
    });
}
function to12HrRange(start, end) {
    return `${(0, date_fns_1.format)(start, "h:mm a")} - ${(0, date_fns_1.format)(end, "h:mm a")}`;
}
function generate30MinsSlot(start, end) {
    const result = [];
    const startDate = (0, date_fns_1.parse)(start, "HH:mm", new Date());
    const endDate = (0, date_fns_1.parse)(end, "HH:mm", new Date());
    let current = startDate;
    while ((0, date_fns_1.isBefore)((0, date_fns_1.addMinutes)(current, 30), endDate) ||
        +(0, date_fns_1.addMinutes)(current, 30) === +endDate) {
        const next = (0, date_fns_1.addMinutes)(current, 30);
        result.push(to12HrRange(current, next));
        current = next;
    }
    return result;
}
function generateApiKey() {
    const key = crypto_1.default.randomBytes(32).toString("hex");
    return key;
}
