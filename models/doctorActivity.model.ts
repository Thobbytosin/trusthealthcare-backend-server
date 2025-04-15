import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { Doctor } from "./doctor.model";

@Table({
  tableName: "doctor_activity_logs",
  timestamps: true,
})
export class DoctorActivityLogs extends Model {
  @ForeignKey(() => Doctor)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  doctorId!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  action!: string;

  @Column({
    type: DataType.STRING,
  })
  ipAddress?: string;

  @Column({
    type: DataType.STRING,
  })
  userAgent?: string;
}
