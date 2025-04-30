import { NextFunction, Request, Response } from "express";
import catchAsyncError from "../middlewares/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import { Suggestion } from "../models/suggestion.model";
import { Op } from "sequelize";

export const fetchSuggestions = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const searchTerm = req.query.term as string;

    if (!searchTerm) return next(new ErrorHandler("No search term", 403));

    const suggestions = await Suggestion.findAll({
      where: {
        keyword: {
          [Op.iLike]: `%${searchTerm.toLowerCase()}%`,
        },
      },
      limit: 10,
    });

    const resultKeywords = suggestions.map((suggestion) => suggestion.keyword);
    res.status(200).json({ success: true, resultKeywords });
  }
);

export const saveSuggestion = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { keyword } = req.body;
    if (!keyword) return next(new ErrorHandler("No keyword", 404));

    const suggestion = await Suggestion.findOne({
      where: {
        keyword: {
          [Op.iLike]: keyword,
        },
      },
    });

    if (suggestion) {
      suggestion.frequency += 1;
      await suggestion.save();
      return res
        .status(200)
        .json({ success: true, message: "Suggestion updated" });
    } else {
      await Suggestion.create({ keyword });
      return res
        .status(200)
        .json({ success: true, message: "Suggestion saved" });
    }
  }
);
