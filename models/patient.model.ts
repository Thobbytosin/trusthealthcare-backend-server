import mongoose, { Document, Model, Schema } from "mongoose";

interface IPatient extends Document {
  user: mongoose.Schema.Types.ObjectId; // Link to the User schema (assuming patient is a user too)
  name: string;
  dateOfBirth: Date;
  gender: "Male" | "Female";
  contactInfo: {
    phone: string;
    email: string;
  };
  medicalHistory: string[];
  allergies: string[];
  medications: string[];
  appointments: mongoose.Schema.Types.ObjectId[]; // Reference to appointments
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  }[];
  preferredDoctor?: mongoose.Schema.Types.ObjectId; // Link to preferred doctor if any
}

const patientSchema: Schema<IPatient> = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ["Male", "Female"], required: true },
    contactInfo: {
      phone: { type: String, required: true },
      email: { type: String, required: true },
    },
    medicalHistory: [{ type: String }],
    allergies: [{ type: String }],
    medications: [{ type: String }],
    appointments: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    ],
    emergencyContact: [
      {
        name: {
          type: String,
          required: true,
        },
        relation: {
          type: String,
          required: true,
        },
        phone: {
          type: String,
          required: true,
        },
      },
    ],

    preferredDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
  },
  { timestamps: true }
);

const Patient: Model<IPatient> = mongoose.model("Patient", patientSchema);

export default Patient;
