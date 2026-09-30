import { Schema, model, Types } from "mongoose";
import { ROLES, PLATFORMS, FEATURES, Role, Platform, Feature } from "../../config/contstants";

export interface IUser {
  name: string;
  email: string;
  password: string; // bcrypt hash
  role: Role;
  platformAccess: "all" | "custom";
  platforms: Platform[];
  features: Feature[];
  createdBy: Types.ObjectId | null;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, required: true },
    platformAccess: { type: String, enum: ["all", "custom"], default: "all" },
    platforms: { type: [String], enum: PLATFORMS, default: [] },
    features: { type: [String], enum: FEATURES, default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);