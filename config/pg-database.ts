import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";
import { User } from "../models/user.model";
import { Doctor } from "../models/doctor.model";
import { Appointment } from "../models/appointment.model";
import { Patient } from "../models/patient.model";
import { Transaction } from "../models/transaction.model";
import { UserActivityLogs } from "../models/userActivity.model";
import { DoctorActivityLogs } from "../models/doctorActivity.model";
import { Suggestion } from "../models/suggestion.model";
// import { User } from "../models/user.model";

// load environment variables
dotenv.config();

// Initialize Sequelize with PostgreSQL
const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || ""),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST, // or your database server
  dialect: "postgres", // Specify PostgreSQL
  models: [
    User,
    Doctor,
    Appointment,
    Patient,
    Transaction,
    UserActivityLogs,
    DoctorActivityLogs,
    Suggestion,
  ],
  logging: false, // Disable logging (optional)
  pool: {
    max: 10, // Maximum number of connections in the pool
    min: 0, // Minimum number of connections in the pool
    acquire: 30000, // Maximum time (ms) Sequelize tries to get a connection before throwing an error
    idle: 10000, // Time (ms) a connection can be idle before being released
  },
});

export default sequelize;

// KEYWORDS
// SELECT * FROM doctors WHERE city ~* '\mikeja\M';
