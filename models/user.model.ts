import { Column, DataType, Default, Model, Table } from "sequelize-typescript";

@Table({
  tableName: "users",
  defaultScope: {
    attributes: {
      exclude: ["password"], // Always exclude by default
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
    validate: {
      isIn: [["user", "patient", "doctor", "administrator"]],
    },
  })
  role!: "user" | "patient" | "doctor" | "administrator";

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  verified!: boolean;

  @Default(DataType.NOW)
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  lastLogin!: Date;

  @Column({
    type: DataType.DATE,
  })
  lastPasswordReset?: Date;
}

//////// MONGO DB
// import mongoose, { Document, Schema, Model } from "mongoose";

// export interface IUser extends Document {
//   name: string;
//   email: string;
//   password?: string;
//   avatar?: {
//     id: string;
//     url: string;
//   };
//   role: ("user" | "patient" | "doctor" | "administrator")[];
//   verified: boolean;
//   lastLogin: Date;
//   lastPasswordReset: Date;
// }

// const userSchema: Schema<IUser> = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     password: {
//       type: String,
//       required: true,
//       select: false,
//     },
//     verified: {
//       type: Boolean,
//       default: false,
//     },
//     lastLogin: {
//       type: Date,
//       default: Date.now(),
//     },
//     lastPasswordReset: {
//       type: Date,
//     },
//     role: {
//       type: [String],
//       enum: ["user", "patient", "doctor", "administrator"],
//       default: ["user"],
//     },
//   },
//   { timestamps: true }
// );

// const User: Model<IUser> = mongoose.model("User", userSchema);

// export default User;
