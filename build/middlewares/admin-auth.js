"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoleAdmin = exports.authorizeUpload = void 0;
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const authorizeUpload = (...allowedrole) => {
    return (req, res, next) => {
        var _a;
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.role.some((role) => allowedrole.includes(role)))) {
            return next(new errorHandler_1.default(`Permission Denied: You must have an account to submit your application as a doctor or update your profile.`, 403));
        }
        next();
    };
};
exports.authorizeUpload = authorizeUpload;
// return next(new ErrorHandler(`Permission Denied: Requires ${roles.join(" or ")}`, 403));
const authorizeRoleAdmin = (...allowedrole) => {
    return (req, res, next) => {
        var _a;
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.role.some((role) => allowedrole.includes(role)))) {
            return next(new errorHandler_1.default(`Permission Denied: Only an ${allowedrole} can perform this operation.`, 403));
        }
        next();
    };
};
exports.authorizeRoleAdmin = authorizeRoleAdmin;
