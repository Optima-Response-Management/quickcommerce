
import { Schema, model, Types } from "mongoose";

// One document per uploaded file.
export interface IUpload {
  platform: string;
  platformName: string;
  reportDate: string;
  market: string | null;
  fileName: string;
  rowCount: number;
  uploadedBy: Types.ObjectId;

  // Original uploaded file storage.
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

// Non-unique index: multiple uploads may share a platform and date.
uploadSchema.index(
  {
    platform: 1,
    reportDate: 1,
  },
  {
    unique: false,
    name: "platform_1_reportDate_1",
  }
);

export const Upload = model<IUpload>(
  "Upload",
  uploadSchema
);
