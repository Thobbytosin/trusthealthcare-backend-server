"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
let Transaction = class Transaction extends sequelize_typescript_1.Model {
};
exports.Transaction = Transaction;
__decorate([
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        primaryKey: true,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "doctorId", void 0);
exports.Transaction = Transaction = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "transactions",
        timestamps: true,
    })
], Transaction);
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
