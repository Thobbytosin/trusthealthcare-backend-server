import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { User } from "./user.model";

@Table({
  tableName: "user_activity_logs",
  timestamps: true,
})
export class UserActivityLogs extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId!: string;

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
