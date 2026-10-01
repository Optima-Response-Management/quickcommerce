import { Schema, model } from "mongoose";

// One document per platform, state and city.
// A platform that only has states so far (no cities yet) has city: null.
export interface ILocation {
  platform: string; // platform slug, e.g. "swiggy"
  state: string;
  city: string | null;
  isActive: boolean;
}

const locationSchema = new Schema<ILocation>(
  {
    platform: { type: String, required: true, lowercase: true, trim: true },
    state: { type: String, required: true, trim: true },
    city: { type: String, default: null, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

locationSchema.index({ platform: 1, state: 1, city: 1 }, { unique: true });

// Stored in the "locations" collection
export const PlatformLocation = model<ILocation>("PlatformLocation", locationSchema, "locations");