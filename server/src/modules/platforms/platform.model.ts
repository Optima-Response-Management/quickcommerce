import { Schema, model } from "mongoose";

export interface IPlatform {
  name: string;
  slug: string;
  isActive: boolean;
}

const platformSchema = new Schema<IPlatform>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Model "Platform" maps to the "platforms" collection
export const Platform = model<IPlatform>("Platform", platformSchema);