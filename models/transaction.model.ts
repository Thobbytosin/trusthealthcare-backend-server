import { Column, DataType, Default, Model, Table } from "sequelize-typescript";

export interface ITransaction {
  id: string;
}

@Table({
  tableName: "transactions",
  timestamps: true,
})
export class Transaction extends Model<ITransaction> implements ITransaction {
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
  doctorId!: string;
}

// import mongoose, { Document, Model, Schema } from "mongoose";

// interface ITransaction extends Document {
//   transactionId: string;
//   user: mongoose.Schema.Types.ObjectId;
//   amount: number;
//   method: "Credit Card" | "Debit Card" | "UPI" | "Cash" | "Bank Transfer";
//   status: "Pending" | "Confirmed" | "Cancelled" | "Completed";
//   date: Date;
// }

// const transactionSchema: Schema<ITransaction> = new mongoose.Schema(
//   {
//     transactionId: { type: String, required: true, unique: true },
//     user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     amount: { type: Number, required: true },
//     method: {
//       type: String,
//       enum: ["Credit Card", "Debit Card", "UPI", "Cash", "Bank Transfer"],
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ["Pending", "Confirmed", "Cancelled", "Completed"],
//       required: true,
//       default: "Pending",
//     },
//     date: { type: Date, default: Date.now() },
//   },
//   { timestamps: true }
// );

// const Transaction: Model<ITransaction> = mongoose.model(
//   "Transaction",
//   transactionSchema
// );

// export default Transaction;
