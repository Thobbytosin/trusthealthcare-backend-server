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
exports.syncDatabase = void 0;
const pg_database_1 = __importDefault(require("../config/pg-database"));
const dbStatus_1 = require("./dbStatus");
// Function to sync models with the database
const syncDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield pg_database_1.default.authenticate(); // Test connection
        (0, dbStatus_1.setDatabaseConnected)(true);
        console.log("✅ Database connected successfully");
        yield pg_database_1.default.sync({ alter: true }); // Sync models (creates tables)
        // console.log("✅ Tables created/updated successfully");
    }
    catch (error) {
        console.error("❌ Database sync error:", error);
    }
});
exports.syncDatabase = syncDatabase;
