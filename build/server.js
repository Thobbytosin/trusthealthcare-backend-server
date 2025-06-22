"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import "reflect-metadata";
const http_1 = __importDefault(require("http"));
const app_1 = require("./app");
const dotenv_1 = __importDefault(require("dotenv"));
const syncDb_1 = require("./utils/syncDb");
// create server
const server = http_1.default.createServer(app_1.app);
// load environment variables
dotenv_1.default.config();
// run server
server.listen(process.env.PORT, () => {
    console.log("SERVER IS RUNNING ON PORT " + process.env.PORT);
    //   connect to database
    (0, syncDb_1.syncDatabase)();
});
