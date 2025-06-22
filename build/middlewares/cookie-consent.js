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
exports.checkCookieConsent = void 0;
const catchAsyncError_1 = __importDefault(require("./catchAsyncError"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
exports.checkCookieConsent = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // skip api docs
    if (req.path.startsWith("/api/v1/api-docs")) {
        return next();
    }
    const rawConsent = req.headers["x-cookie-consent"];
    if (!rawConsent)
        return next(new errorHandler_1.default("Cookie consent is required to proceed", 404));
    const consentHeader = Array.isArray(rawConsent)
        ? rawConsent[0]
        : rawConsent;
    let consent = {};
    try {
        consent = JSON.parse(consentHeader);
    }
    catch (error) {
        return next(new errorHandler_1.default("Invalid cookie consent format", 400));
    }
    // check for necessary cookie
    // if (consent.necessary === false)
    //   return next(
    //     new ErrorHandler(
    //       "Access denied: Necessary cookies are required to use this feature.",
    //       403
    //     )
    //   );
    req.cookieConsent = consent;
    next();
}));
