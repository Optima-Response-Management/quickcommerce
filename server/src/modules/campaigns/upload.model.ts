import { Schema, model, Types } from "mongoose";

// One document per uploaded file
export interface IUpload {
  platform: string; // platform slug, e.g. "zepto"
  platformName: string;
  reportDate: string; // YYYY-MM-DD, the day the report covers
  market: string | null;
  fileName: string;
  rowCount: number;
  uploadedBy: Types.ObjectId;
}

const uploadSchema = new Schema<IUpload>(
  {
    platform: { type: String, required: true },
    platformName: { type: String, required: true },
    reportDate: { type: String, required: true },
    market: { type: String, default: null },
    fileName: { type: String, required: true },
    rowCount: { type: Number, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// One upload per platform, date and market. Uploading again replaces the earlier one.
uploadSchema.index({ platform: 1, reportDate: 1 });
export const Upload = model<IUpload>("Upload", uploadSchema);