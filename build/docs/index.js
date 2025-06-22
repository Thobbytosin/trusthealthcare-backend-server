"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_swagger_1 = __importDefault(require("./auth.swagger"));
const user_swagger_1 = __importDefault(require("./user.swagger"));
const paths = Object.assign(Object.assign({}, user_swagger_1.default), auth_swagger_1.default);
exports.default = paths;
