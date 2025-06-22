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
exports.saveSuggestion = exports.fetchSuggestions = void 0;
const catchAsyncError_1 = __importDefault(require("../middlewares/catchAsyncError"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const suggestion_model_1 = require("../models/suggestion.model");
const sequelize_1 = require("sequelize");
exports.fetchSuggestions = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const searchTerm = req.query.term;
    if (!searchTerm)
        return next(new errorHandler_1.default("No search term", 403));
    const suggestions = yield suggestion_model_1.Suggestion.findAll({
        where: {
            keyword: {
                [sequelize_1.Op.iLike]: `%${searchTerm.toLowerCase()}%`,
            },
        },
        limit: 10,
    });
    const resultKeywords = suggestions.map((suggestion) => suggestion.keyword);
    res.status(200).json({ success: true, resultKeywords });
}));
exports.saveSuggestion = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { keyword } = req.body;
    if (!keyword)
        return next(new errorHandler_1.default("No keyword", 404));
    const suggestion = yield suggestion_model_1.Suggestion.findOne({
        where: {
            keyword: {
                [sequelize_1.Op.iLike]: keyword,
            },
        },
    });
    if (suggestion) {
        suggestion.frequency += 1;
        yield suggestion.save();
        return res
            .status(200)
            .json({ success: true, message: "Suggestion updated" });
    }
    else {
        yield suggestion_model_1.Suggestion.create({ keyword });
        return res
            .status(200)
            .json({ success: true, message: "Suggestion saved" });
    }
}));
