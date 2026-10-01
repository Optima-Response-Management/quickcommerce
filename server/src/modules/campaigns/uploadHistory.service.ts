import mongoose, { HydratedDocument } from "mongoose";
import { ApiError } from "../../utils/ApiError";
import { IUser, User } from "../users/user.model";
import { platformFilter } from "../campaigns/campaign.access";
import { Campaign } from "./campaign.model";
import { Upload } from "./upload.model";
import { ListUploadsQuery } from "./upload.schema";

export async function listUploads(query: ListUploadsQuery, user: HydratedDocument<IUser>) {
  const { from, to, page, limit } = query;

  const filter: Record<string, unknown> = {};

  // Only uploads for platforms this user is allowed to see
  const platform = platformFilter(query.platform, user);
  if (platform) filter.platform = platform;

  if (from || to) {
    filter.reportDate = { ...(from ? { $gte: from } : {}), ...(to ? { $lte: to } : {}) };
  }

  const [uploads, total] = await Promise.all([
    Upload.find(filter)
      .sort({ createdAt: -1, _id: -1 }) // newest upload first
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Upload.countDocuments(filter),
  ]);

  // Who uploaded each file
  const uploaderIds = [...new Set(uploads.map((u) => String(u.uploadedBy)))];
  const uploaders = uploaderIds.length
    ? await User.find({ _id: { $in: uploaderIds } }).select("name").lean()
    : [];
  const names = new Map(uploaders.map((u) => [String(u._id), u.name]));

  return {
    uploads: uploads.map((u) => ({
      id: String(u._id),
      platform: u.platform,
      platformName: u.platformName,
      reportDate: u.reportDate,
      market: u.market,
      fileName: u.fileName,
      rowCount: u.rowCount,
      uploadedBy: { id: String(u.uploadedBy), name: names.get(String(u.uploadedBy)) ?? null }, // name is null if that user was deleted
      uploadedAt: (u as { createdAt?: Date }).createdAt ?? null, // added by Mongoose timestamps
    })),
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

// Deletes the upload and every campaign row that came from it
export async function deleteUpload(id: string) {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(404, "Upload not found");

  const upload = await Upload.findById(id);
  if (!upload) throw new ApiError(404, "Upload not found");

  let deletedRows = 0;
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const result = await Campaign.deleteMany({ uploadId: upload._id }, { session });
      deletedRows = result.deletedCount;
      await Upload.deleteOne({ _id: upload._id }, { session });
    });
  } finally {
    await session.endSession();
  }

  return {
    id: String(upload._id),
    platformName: upload.platformName,
    reportDate: upload.reportDate,
    fileName: upload.fileName,
    deletedRows,
  };
}