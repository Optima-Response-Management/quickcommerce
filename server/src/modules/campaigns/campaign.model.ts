import { Schema, model, Types } from "mongoose";

// One document per campaign row
export interface ICampaign {
  uploadId: Types.ObjectId;

  platform: string;

  reportDate: string;

  market: string | null;

  CampaignName: string;

  BrandName: string;

  SubBrandName: string;

  Budget: number;

  Spend: number;

  Revenue: number;

  Orders: number;

  Roas: number;
}

const campaignSchema = new Schema<ICampaign>({
  uploadId: {
    type: Schema.Types.ObjectId,
    ref: "Upload",
    required: true,
    index: true,
  },

  platform: {
    type: String,
    required: true,
    index: true,
  },

  reportDate: {
    type: String,
    required: true,
    index: true,
  },

  market: {
    type: String,
    default: null,
  },

  CampaignName: {
    type: String,
    required: true,
    trim: true,
  },

  BrandName: {
    type: String,
    default: "",
    trim: true,
    index: true,
  },

  SubBrandName: {
    type: String,
    default: "",
    trim: true,
    index: true,
  },

  Budget: {
    type: Number,
    required: true,
    min: 0,
  },

  Spend: {
    type: Number,
    required: true,
    min: 0,
  },

  Revenue: {
    type: Number,
    required: true,
    min: 0,
  },

  Orders: {
    type: Number,
    required: true,
    min: 0,
  },

  Roas: {
    type: Number,
    required: true,
    min: 0,
  },
});

campaignSchema.index({
  platform: 1,
  reportDate: 1,
});

campaignSchema.index({
  BrandName: 1,
  SubBrandName: 1,
});

export const Campaign = model<ICampaign>(
  "Campaign",
  campaignSchema,
);