"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_config_1 = __importDefault(require("./swagger.config"));
const docs_1 = __importDefault(require("../docs"));
const swaggerDocument = Object.assign(Object.assign({}, swagger_config_1.default), { paths: docs_1.default });
exports.default = swaggerDocument;
