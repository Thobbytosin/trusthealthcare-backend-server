import { Column, DataType, Default, Model, Table } from "sequelize-typescript";

@Table({
  tableName: "suggestions",
  timestamps: true, // createdAt and updatedAt
})
export class Suggestion extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  keyword!: string;

  @Default(1)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  frequency!: number;
}
