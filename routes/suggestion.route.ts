import { Router } from "express";
import {
  fetchSuggestions,
  saveSuggestion,
} from "../controllers/suggestion.controller";

const suggestionRouter = Router();

// SAVE A SUGGESTION
suggestionRouter.post("/save-suggestion", saveSuggestion);
suggestionRouter.get("/fetch-suggestions", fetchSuggestions);

export default suggestionRouter;
