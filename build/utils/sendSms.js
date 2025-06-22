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
exports.sendVerificationSMS = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const sendVerificationSMS = (to, code) => __awaiter(void 0, void 0, void 0, function* () {
    const data = {
        to,
        from: "medicfunc",
        sms: `Welcome to Trust HealthCare: Your account verification code is ${code}`,
        api_key: process.env.TERMII_API_KEY,
        channel: "generic",
        type: "plain",
    };
    const options = {
        method: "POST",
        url: `${process.env.TERMI_BASE_URL}/api/sms/send`,
        headers: {
            "Content-Type": "application/json",
        },
        data,
    };
    try {
        const response = yield (0, axios_1.default)(options);
        // console.log("SUCCESS SENDING VERIFICATION SMS:", response.data); // Logs the response from Termii
    }
    catch (error) {
        console.error("Error sending SMS:", error.response ? error.response.data : error.message);
    }
});
exports.sendVerificationSMS = sendVerificationSMS;
