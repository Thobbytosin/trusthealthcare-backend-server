import mongoose, { Document, Schema, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  avatar?: {
    id: string;
    url: string;
  };
  role: ("user" | "patient" | "doctor" | "administrator")[];
  verified: boolean;
  lastLogin: Date;
  lastPasswordReset: Date;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: Date.now(),
    },
    lastPasswordReset: {
      type: Date,
    },
    role: {
      type: [String],
      enum: ["user", "patient", "doctor", "administrator"],
      default: ["user"],
    },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.model("User", userSchema);

export default User;
