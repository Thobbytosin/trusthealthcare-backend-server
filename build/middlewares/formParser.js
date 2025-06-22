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
exports.formParser = void 0;
const formidable_1 = __importDefault(require("formidable"));
const formParser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const form = (0, formidable_1.default)({ multiples: true });
    const arrayFields = ["availableDays", "certifications", "specialization"];
    const jsonFields = ["workExperience", "timeSlots", "education", "hospital"];
    const [fields, files] = yield form.parse(req);
    if (!req.body)
        req.body = {};
    for (let key in fields) {
        const value = fields[key];
        if (!value)
            continue;
        if (key.startsWith("timeSlots[")) {
            continue; // process these separately
        }
        if (arrayFields.includes(key)) {
            req.body[key] = value;
        }
        else if (jsonFields.includes(key)) {
            try {
                const cleanedJson = value[0]
                    // .replace(/[\n\s]/g, "") // Strip whitespace
                    .replace(/^\[|];?$/g, ""); // remove semicolons/brackets
                req.body[key] = JSON.parse(`[${cleanedJson}]`);
                // req.body[key] = JSON.parse(value![0]);
            }
            catch (e) {
                req.body[key] = value[0];
            }
        }
        else {
            req.body[key] = value[0];
        }
    }
    // Process timeSlots
    const timeSlots = {};
    for (let key in fields) {
        if (key.startsWith("timeSlots[")) {
            const day = (_a = key.match(/timeSlots\[(.*?)\]/)) === null || _a === void 0 ? void 0 : _a[1];
            if (day && fields[key]) {
                // Split comma-separated slots and trim whitespace
                timeSlots[day] = fields[key][0].split(",").map((s) => s.trim());
            }
        }
    }
    if (Object.keys(timeSlots).length > 0) {
        req.body.timeSlots = timeSlots;
    }
    if (!req.files)
        req.files = {};
    for (let key in files) {
        const filesNeeded = files[key];
        if (!filesNeeded)
            break;
        if (filesNeeded.length > 1) {
            req.files[key] = filesNeeded; // for multiple images
        }
        else {
            req.files[key] = filesNeeded[0]; // if it is only an image
        }
    }
    next(); // move to validate input data
});
exports.formParser = formParser;
