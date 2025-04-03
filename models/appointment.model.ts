import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { Patient } from "./patient.model";
import { Doctor } from "./doctor.model";
import { Transaction } from "./transaction.model";

export enum AppointmentStatus {
  PENDING = "Pending",
  CONFIRMED = "Confirmed",
  CANCELLED = "Cancelled",
  COMPLETED = "Completed",
  RESCHEDULED = "Rescheduled",
  NO_SHOW = "No-Show",
}

export enum AppointmentType {
  CONSULTATION = "Consultation",
  FOLLOW_UP = "Follow-up",
  CHECK_UP = "Check-up",
  EMERGENCY = "Emergency",
  ROUTINE = "Routine",
}

@Table({
  tableName: "appointments",
  timestamps: true,
})
export class Appointment extends Model {
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    allowNull: false,
  })
  id!: string;

  @ForeignKey(() => Patient)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  patientId!: string;

  @BelongsTo(() => Patient)
  patient!: Patient;

  @ForeignKey(() => Doctor)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  doctorId!: string;

  @BelongsTo(() => Doctor)
  doctor!: Doctor;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  bookingDate!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  appointmentDate!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    validate: {
      isAfter: new Date().toISOString(),
    },
  })
  appointmentStartTime!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    validate: {
      isAfterStartTime(value: Date) {
        if (this.appointmentStartTime && value <= this.appointmentStartTime) {
          throw new Error(
            "Appointment session can not end when it has not started"
          );
        }
      },
    },
  })
  appointmentEndTime!: Date;

  @Column({
    type: DataType.ENUM(...Object.values(AppointmentStatus)),
    defaultValue: AppointmentStatus.PENDING,
    allowNull: false,
  })
  status!: AppointmentStatus;

  // @Column({
  //   type: DataType.ENUM("Pending", "Confirmed", "Cancelled", "Completed"),
  //   defaultValue: "Pending",
  //   allowNull: false,
  // })
  // status!: "Pending" | "Confirmed" | "Cancelled" | "Completed";

  @Column({
    type: DataType.ENUM(...Object.values(AppointmentType)),
    allowNull: false,
  })
  appointmentType!: AppointmentType;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  reason!: string;

  @Column({
    type: DataType.STRING,
  })
  notes?: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isPaid!: boolean;

  @ForeignKey(() => Transaction)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  transactionId?: string;

  @BelongsTo(() => Transaction)
  transaction?: Transaction;

  @Column({
    type: DataType.STRING,
  })
  meetingLink?: string; // For virtual appointments

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isFollowUpRequired!: boolean;

  @Column({
    type: DataType.DATE,
  })
  followUpDate?: Date;

  @Column({
    type: DataType.STRING,
  })
  doctorCancellationReason?: string;

  @Column({
    type: DataType.STRING,
  })
  patientCancellationReason?: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  reminderSentCount!: number;
}

// import mongoose, { Document, Model, Schema } from "mongoose";

// interface IAppointment extends Document {
//   patientId: mongoose.Schema.Types.ObjectId;
//   doctorId: mongoose.Schema.Types.ObjectId;
//   date: Date;
//   time: string;
//   reason: string;
//   status: "Pending" | "Confirmed" | "Cancelled" | "Completed";
//   isPaid: boolean;
//   paymentDetails?: {
//     method: string; // e.g., "Credit Card", "PayPal"
//     transactionId: mongoose.Schema.Types.ObjectId;
//     amount: number;
//   };
//   notes?: string;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const appointmentSchema: Schema<IAppointment> = new mongoose.Schema(
//   {
//     patientId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Patient",
//       required: true,
//     },
//     doctorId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Doctor",
//       required: true,
//     },
//     date: { type: Date, default: Date.now(), required: true },
//     time: { type: String, required: true },
//     reason: { type: String, required: true },
//     status: {
//       type: String,
//       enum: ["Pending", "Confirmed", "Cancelled", "Completed"],
//       default: "Pending",
//     },
//     isPaid: { type: Boolean, default: false },
//     paymentDetails: {
//       method: { type: String },
//       transactionId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Transaction",
//       },
//       amount: { type: Number },
//       notes: { type: String },
//     },
//   },
//   { timestamps: true }
// );

// const Appointment: Model<IAppointment> = mongoose.model(
//   "Appointment",
//   appointmentSchema
// );

// export default Appointment;
