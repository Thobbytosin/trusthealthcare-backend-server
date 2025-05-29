import { Router } from "express";
import { requestApiKey } from "../../controllers/apiKey.controller";

const apiKeyRouterV1 = Router();

apiKeyRouterV1.post("/request-api-key", requestApiKey);

export default apiKeyRouterV1;
