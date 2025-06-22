"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const dotenv_1 = __importDefault(require("dotenv"));
const user_model_1 = require("../models/user.model");
const doctor_model_1 = require("../models/doctor.model");
const appointment_model_1 = require("../models/appointment.model");
const patient_model_1 = require("../models/patient.model");
const transaction_model_1 = require("../models/transaction.model");
const userActivity_model_1 = require("../models/userActivity.model");
const doctorActivity_model_1 = require("../models/doctorActivity.model");
const apiKey_model_1 = require("../models/apiKey.model");
// import { User } from "../models/user.model";
// load environment variables
dotenv_1.default.config();
// Initialize Sequelize with PostgreSQL
// const sequelize = new Sequelize({
//   database: process.env.DB_NAME,
//   port: parseInt(process.env.DB_PORT || ""),
//   username: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   host: process.env.DB_HOST, // or your database server
//   // dialect: "postgres", // Specify PostgreSQL
//   dialectOptions: {
//     ssl: {
//       require: true,
//       rejectUnauthorized: false, // needed for Neon
//     },
//   },
//   models: [
//     User,
//     Doctor,
//     Appointment,
//     Patient,
//     Transaction,
//     UserActivityLogs,
//     DoctorActivityLogs,
//     ApiKey,
//   ],
//   logging: false, // Disable logging (optional)
//   pool: {
//     max: 1, // Maximum number of connections in the pool
//     min: 0, // Minimum number of connections in the pool
//     acquire: 10000, // Maximum time (ms) Sequelize tries to get a connection before throwing an error
//     idle: 5000, // Time (ms) a connection can be idle before being released
//   },
// });
const sequelize = new sequelize_typescript_1.Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
    logging: false,
    models: [
        user_model_1.User,
        doctor_model_1.Doctor,
        appointment_model_1.Appointment,
        patient_model_1.Patient,
        transaction_model_1.Transaction,
        userActivity_model_1.UserActivityLogs,
        doctorActivity_model_1.DoctorActivityLogs,
        apiKey_model_1.ApiKey,
    ],
    pool: {
        max: 5, // or 10 depending on your traffic
        min: 1,
        acquire: 30000, // time Sequelize will try to get a connection before throwing error
        idle: 10000, // how long a connection stays open when idle
    },
});
exports.default = sequelize;
