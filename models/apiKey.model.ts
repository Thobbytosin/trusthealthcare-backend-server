import {
  Table,
  Column,
  Model,
  DataType,
  Default,
  AllowNull,
  Unique,
  IsEmail,
} from "sequelize-typescript";

@Table({ tableName: "api_keys", timestamps: true })
export class ApiKey extends Model {
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    allowNull: false,
  })
  id!: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  key!: string;

  @Unique
  @IsEmail
  @AllowNull(false)
  @Column(DataType.STRING)
  email!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  owner!: string;

  @Default(true)
  @Column(DataType.BOOLEAN)
  isActive!: boolean;

  @Column(DataType.DATE)
  expiresAt?: Date;
}
