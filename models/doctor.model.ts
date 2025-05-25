import {
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { User } from "./user.model";

export type DoctorAppointment = {
  patient: { name: string };
  title: string;
  dateOfAppointment: Date;
  appointmentDuration: string;
  appointmentType: string;
  appointmentStatus: string;
  extraNotes?: string;
};

export type IDoctor = {
  id: string;
  name: string;
  email: string;
  securityQuestion: string;
  securityAnswer: string;
  specialization: string[];
  workExperience: { hospital: string; role: string; duration: string }[];
  yearsOfExperience: number;
  education: { institution: string; graduationYear: string; course: string }[];
  hospital: { name: string; address: string }[];
  licenseNumber: string;
  certifications: string[];
  availableDays: string[];
  timeSlots: {
    [key: string]: {
      label: "Morning" | "Afternoon" | "Evening";
      start: string;
      end: string;
    }[];
  };
  holidays?: Date[];
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  altPhone?: string;
  ratings?: number;
  reviews?: Review[];
  appointments?: DoctorAppointment[];
  maxPatientsPerDay: number;
  about: string;
  thumbnail: { id: string; url: string };
  image: string;
  verificationStatus: "Processing" | "Verified" | "Failed";
  uploadedBy: "doctor" | "admin";
  uploadedById: string;
  available: boolean;
};

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
export class Doctor extends Model<IDoctor> implements IDoctor {
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
    type: DataType.JSONB,
    allowNull: true,
  })
  education!: [
    {
      institution: string;
      graduationYear: string;
      course: string;
    }
  ];

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  hospital!: [
    {
      name: string;
      address: string;
    }
  ];

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
  timeSlots!: {
    [key: string]: {
      label: "Morning" | "Afternoon" | "Evening";
      start: string;
      end: string;
    }[];
  };

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

  @Column({
    type: DataType.ARRAY(DataType.JSONB),
  })
  appointments?: DoctorAppointment[];

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
    type: DataType.STRING,
    allowNull: false,
  })
  image!: string;

  @Column({
    type: DataType.ENUM("Processing", "Verified", "Failed", "Completed"),
    defaultValue: "Processing",
  })
  verificationStatus!: "Processing" | "Verified" | "Failed";

  @Column({
    type: DataType.ENUM("user", "admin"),
    allowNull: false,
  })
  uploadedBy!: "doctor" | "admin";

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  uploadedById!: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  available!: boolean;
}
