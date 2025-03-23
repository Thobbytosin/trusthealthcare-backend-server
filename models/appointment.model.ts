import mongoose, { Document, Model, Schema } from "mongoose";

interface IAppointment extends Document {
  patientId: mongoose.Schema.Types.ObjectId;
  doctorId: mongoose.Schema.Types.ObjectId;
  date: Date;
  time: string;
  reason: string;
  status: "Pending" | "Confirmed" | "Cancelled" | "Completed";
  isPaid: boolean;
  paymentDetails?: {
    method: string; // e.g., "Credit Card", "PayPal"
    transactionId: mongoose.Schema.Types.ObjectId;
    amount: number;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema: Schema<IAppointment> = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    date: { type: Date, default: Date.now(), required: true },
    time: { type: String, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled", "Completed"],
      default: "Pending",
    },
    isPaid: { type: Boolean, default: false },
    paymentDetails: {
      method: { type: String },
      transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
      },
      amount: { type: Number },
      notes: { type: String },
    },
  },
  { timestamps: true }
);

const Appointment: Model<IAppointment> = mongoose.model(
  "Appointment",
  appointmentSchema
);

export default Appointment;
