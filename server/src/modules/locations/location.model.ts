import { Schema, model } from "mongoose";

export interface ILocationBrand {
  name: string;
  products: string[];
}

// One document per platform, state and city.
// A platform that only has states so far (no cities yet) has city: null.
// A platform with no state list at all (BigBasket, Flipkart, Amazon) has state: null and city: null.
export interface ILocation {
  platform: string; // platform slug, e.g. "swiggy"
  state: string | null;
  city: string | null;
  brands: ILocationBrand[]; // brands sold at this location, each with its sub products
  isActive: boolean;
}

const locationBrandSchema = new Schema<ILocationBrand>(
  {
    name: { type: String, required: true, trim: true },
    products: [{ type: String, trim: true }],
  },
  { _id: false }
);

const locationSchema = new Schema<ILocation>(
  {
    platform: { type: String, required: true, lowercase: true, trim: true },
    state: { type: String, default: null, trim: true },
    city: { type: String, default: null, trim: true },
    brands: { type: [locationBrandSchema], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

locationSchema.index({ platform: 1, state: 1, city: 1 }, { unique: true });

// Stored in the "locations" collection
export const PlatformLocation = model<ILocation>("PlatformLocation", locationSchema, "locations");