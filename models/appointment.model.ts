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
import { User } from "./user.model";

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

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  patientId!: string;

  @BelongsTo(() => User)
  patient!: User;

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
