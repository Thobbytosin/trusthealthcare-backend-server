import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";
import { User } from "../models/user.model";
import { Doctor } from "../models/doctor.model";
import { Appointment } from "../models/appointment.model";
import { Patient } from "../models/patient.model";
import { Transaction } from "../models/transaction.model";
import { UserActivityLogs } from "../models/userActivity.model";
import { DoctorActivityLogs } from "../models/doctorActivity.model";
import { ApiKey } from "../models/apiKey.model";
// import { User } from "../models/user.model";

// load environment variables
dotenv.config();

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

const sequelize = new Sequelize(process.env.DATABASE_URL as string, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: false,
  models: [
    User,
    Doctor,
    Appointment,
    Patient,
    Transaction,
    UserActivityLogs,
    DoctorActivityLogs,
    ApiKey,
  ],
  pool: {
    max: 1, // recommended for Neon
    min: 0,
    acquire: 10000,
    idle: 5000,
  },
});

export default sequelize;
