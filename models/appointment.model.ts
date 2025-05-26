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
import { Doctor, IDoctor } from "./doctor.model";
import { Transaction } from "./transaction.model";
import { IUser, User } from "./user.model";

export enum AppointmentStatus {
  PENDING = "Pending",
  CONFIRMED = "Confirmed",
  ONGOING = "Ongoing",
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

export interface IAppointment {
  id: string;
  patientId: string;
  doctorId: string;
  transactionId: string;
  bookingDate: Date;
  appointmentDate: Date;
  bookingSlot: string;
  status: string;
  appointmentType: string;
  reason: string;
  notes?: string;
  meetingLink: string;
  isFollowUpRequired?: boolean;
  followUpDate?: string;
  doctorCancellationReason?: string;
  patientCancellationReason?: string;
}

@Table({
  tableName: "appointments",
  timestamps: true,
})
export class Appointment extends Model<IAppointment> implements IAppointment {
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

  @ForeignKey(() => Doctor)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  doctorId!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  bookingDate!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  appointmentDate!: Date;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  bookingSlot!: string;

  @Column({
    type: DataType.ENUM(...Object.values(AppointmentType)),
    allowNull: false,
  })
  appointmentType!: AppointmentType;

  @Column({
    type: DataType.ENUM(...Object.values(AppointmentStatus)),
    defaultValue: AppointmentStatus.PENDING,
    allowNull: false,
  })
  status!: AppointmentStatus;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  reason!: string;

  @Column({
    type: DataType.STRING,
  })
  notes?: string;

  @ForeignKey(() => Transaction)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  transactionId!: string;

  @Column({
    type: DataType.STRING,
  })
  meetingLink!: string; // For virtual appointments

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isFollowUpRequired?: boolean;

  @Column({
    type: DataType.STRING,
  })
  followUpDate?: string;

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
