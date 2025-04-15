import {
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from "sequelize-typescript";
import { Appointment } from "./appointment.model";
import { User } from "./user.model";

export interface IDoctor {
  id: string;
  name: string;
  email: string;
  securityQuestion: string;
  securityAnswer: string;
  specialization: string[];
  workExperience: { hospital: string; role: string; duration: string }[];
  yearsOfExperience: number;
  education: string[];
  hospital: string;
  clinicAddress: string;
  licenseNumber: string;
  certifications: string[];
  availableDays: string[];
  timeSlots: { [key: string]: string[] };
  holidays?: Date[];
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  altPhone?: string;
  ratings?: number;
  reviews?: Review[];
  appointments?: Appointment[];
  maxPatientsPerDay: number;
  about: string;
  thumbnail: { id: string; url: string };
  verificationStatus: "Processing" | "Verified" | "Failed";
  uploadedBy: "user" | "admin";
  userId: string;
  available: boolean;
}

interface Review {
  patientId: number;
  comment: string;
  rating: number;
  date: Date;
}

@Table({
  tableName: "doctors",
  defaultScope: {
    attributes: {
      exclude: ["securityAnswer"],
    },
  },
  scopes: {
    withSecurityAnswer: {
      attributes: { include: ["securityAnswer"] },
    },
  },
  timestamps: true,
})
export class Doctor extends Model {
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    allowNull: false,
  })
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  securityQuestion!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  securityAnswer!: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: false,
  })
  specialization!: string[];

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  yearsOfExperience!: number;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
  })
  workExperience!: [
    {
      hospital: string;
      role: string;
      duration: string;
    }
  ];

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: false,
  })
  education!: string[];

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  hospital!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  clinicAddress!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  licenseNumber!: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: false,
  })
  certifications!: string[];

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: false,
  })
  availableDays!: string[];

  @Column({
    type: DataType.JSONB,
    allowNull: false,
  })
  timeSlots!: { [key: string]: string[] };

  @Column({
    type: DataType.ARRAY(DataType.DATE),
  })
  holidays?: Date[];

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  city!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  state!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  zipCode!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  phone!: string;

  @Column({
    type: DataType.STRING,
  })
  altPhone?: string;

  @Column({
    type: DataType.FLOAT,
    defaultValue: 0,
  })
  ratings?: number;

  @Column({
    type: DataType.ARRAY(DataType.JSONB),
  })
  reviews?: Review[];

  @HasMany(() => Appointment)
  appointments?: Appointment[];

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  maxPatientsPerDay!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  about!: string;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
  })
  thumbnail!: {
    id: string;
    url: string;
  };

  @Column({
    type: DataType.ENUM("Processing", "Verified", "Failed", "Completed"),
    defaultValue: "Processing",
  })
  verificationStatus!: "Processing" | "Verified" | "Failed";

  @Column({
    type: DataType.ENUM("user", "admin"),
    allowNull: false,
  })
  uploadedBy!: "user" | "admin";

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId!: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  available!: boolean;
}

// import mongoose, { Document, Model, Schema } from "mongoose";

// const doctorSchema: Schema<IDoctor> = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     securityAnswer: { type: String, required: true, select: false },
//     hospital: { type: String, required: true },
//     specialization: { type: String, required: true },
//     experience: { type: String, required: true },
//     education: [{ type: String, required: true }],
//     licenseNumber: { type: String, required: true },
//     certifications: [{ type: String }],
//     availableDays: [{ type: String, required: true }],
//     timeSlots: [{ type: String, required: true }],
//     holidays: [{ type: Date }],
//     clinicAddress: { type: String, required: true },
//     city: { type: String, required: true },
//     state: { type: String, required: true },
//     zipCode: { type: Number, required: true },
//     phone: { type: Number, required: true },
//     altPhone: { type: String },
//     ratings: { type: Number, default: 0 },
//     reviews: [
//       {
//         patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
//         comment: { type: String },
//         rating: { type: Number },
//         date: { type: Date, default: Date.now },
//       },
//     ],
//     appointments: [
//       { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
//     ],
//     maxPatientsPerDay: { type: Number, required: true },
//     about: { type: String },
//     thumbnail: {
//       id: {
//         type: String,
//       },
//       url: { type: String },
//     },
//     verificationStatus: {
//       type: String,
//       enum: ["Processing", "Verified", "Failed", "Completed"],
//       default: "Processing",
//     },
//   },
//   { timestamps: true }
// );

// const Doctor: Model<IDoctor> = mongoose.model("Doctor", doctorSchema);

// export default Doctor;
