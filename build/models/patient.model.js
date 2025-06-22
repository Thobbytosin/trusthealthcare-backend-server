"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Patient = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
let Patient = class Patient extends sequelize_typescript_1.Model {
};
exports.Patient = Patient;
__decorate([
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        primaryKey: true,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Patient.prototype, "id", void 0);
exports.Patient = Patient = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "patients",
        timestamps: true,
    })
], Patient);
// import mongoose, { Document, Model, Schema } from "mongoose";
// interface IPatient extends Document {
//   user: mongoose.Schema.Types.ObjectId; // Link to the User schema (assuming patient is a user too)
//   name: string;
//   dateOfBirth: Date;
//   gender: "Male" | "Female";
//   contactInfo: {
//     phone: string;
//     email: string;
//   };
//   medicalHistory: string[];
//   allergies: string[];
//   medications: string[];
//   appointments: mongoose.Schema.Types.ObjectId[]; // Reference to appointments
//   emergencyContact: {
//     name: string;
//     relation: string;
//     phone: string;
//   }[];
//   preferredDoctor?: mongoose.Schema.Types.ObjectId; // Link to preferred doctor if any
// }
// const patientSchema: Schema<IPatient> = new mongoose.Schema(
//   {
//     user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     name: { type: String, required: true },
//     dateOfBirth: { type: Date, required: true },
//     gender: { type: String, enum: ["Male", "Female"], required: true },
//     contactInfo: {
//       phone: { type: String, required: true },
//       email: { type: String, required: true },
//     },
//     medicalHistory: [{ type: String }],
//     allergies: [{ type: String }],
//     medications: [{ type: String }],
//     appointments: [
//       { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
//     ],
//     emergencyContact: [
//       {
//         name: {
//           type: String,
//           required: true,
//         },
//         relation: {
//           type: String,
//           required: true,
//         },
//         phone: {
//           type: String,
//           required: true,
//         },
//       },
//     ],
//     preferredDoctor: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Doctor",
//     },
//   },
//   { timestamps: true }
// );
// const Patient: Model<IPatient> = mongoose.model("Patient", patientSchema);
// export default Patient;
