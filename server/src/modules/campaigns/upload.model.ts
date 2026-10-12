import { Schema, model, Types } from "mongoose";

export interface IUpload {
  platform: string;
  platformName: string;
  reportDate: string;
  market: string | null;
  fileName: string;
  fileNameNormalized: string;
  rowCount: number;
  uploadedBy: Types.ObjectId;
  storageKey: string | null;
  mimeType: string | null;
  fileSize: number | null;
}

const uploadSchema = new Schema<IUpload>(
  {
    platform: {
      type: String,
      required: true,
      trim: true,
    },
    platformName: {
      type: String,
      required: true,
      trim: true,
    },
    reportDate: {
      type: String,
      required: true,
    },
    market: {
      type: String,
      default: null,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileNameNormalized: {
      type: String,
      required: true,
      trim: true,
    },
    rowCount: {
      type: Number,
      required: true,
      min: 0,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    storageKey: {
      type: String,
      default: null,
    },
    mimeType: {
      type: String,
      default: null,
    },
    fileSize: {
      type: Number,
      default: null,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// A filename can exist only once across all uploads.
uploadSchema.index(
  { fileNameNormalized: 1 },
  {
    unique: true,
    name: "fileNameNormalized_unique",
  }
);

// This index is intentionally non-unique.
uploadSchema.index(
  { platform: 1, reportDate: 1 },
  {
    unique: false,
    name: "platform_1_reportDate_1",
  }
);

export const Upload = model<IUpload>("Upload", uploadSchema);