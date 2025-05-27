import { Router } from "express";
import {
  fetchSuggestions,
  saveSuggestion,
} from "../../controllers/suggestion.controller";

const suggestionRouterV1 = Router();

// SAVE A SUGGESTION
suggestionRouterV1.post("/save-suggestion", saveSuggestion);
suggestionRouterV1.get("/fetch-suggestions", fetchSuggestions);

export default suggestionRouterV1;
