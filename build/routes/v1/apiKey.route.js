"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const apiKey_controller_1 = require("../../controllers/apiKey.controller");
const apiKeyRouterV1 = (0, express_1.Router)();
apiKeyRouterV1.post("/request-api-key", apiKey_controller_1.requestApiKey);
exports.default = apiKeyRouterV1;
