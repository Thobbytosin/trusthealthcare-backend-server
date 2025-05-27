import {
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { Doctor } from "./doctor.model";

export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar?: { id: string; url: string };
  role: ["user" | "patient" | "doctor" | "admin"];
  lastLogin: Date | null;
  lastPasswordReset?: Date;
  verified: boolean;
  doctorId: string | null;
  signedInAs?: "user" | "doctor";
}

@Table({
  tableName: "users",
  defaultScope: {
    attributes: {
      exclude: ["password", "createdAt", "updatedAt"], // Always exclude by default
    },
  },
  scopes: {
    withPassword: {
      attributes: { include: ["password"] },
    },
  },
  timestamps: true, // createdAt and updatedAt
})
export class User extends Model {
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
  password!: string;

  @Column({
    type: DataType.JSONB,
  })
  avatar?: {
    id: string;
    url: string;
  };

  @Default(["user"])
  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: false,
  })
  role!: ["user" | "patient" | "doctor" | "admin"];

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  verified!: boolean;

  @Default(DataType.NOW)
  @Column({
    type: DataType.DATE,
    defaultValue: null,
  })
  lastLogin!: Date | null;

  @Column({
    type: DataType.DATE,
  })
  lastPasswordReset?: Date;

  @ForeignKey(() => Doctor)
  @Column({
    type: DataType.UUID,
    defaultValue: null,
  })
  doctorId!: string | null;

  @Column({
    type: DataType.ENUM("user", "doctor"),
  })
  signedInAs?: "user" | "doctor";
}
