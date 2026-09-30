import mongoose, { HydratedDocument } from "mongoose";
import { ApiError } from "../../utils/ApiError";
import { IUser } from "../users/user.model";
import { Platform } from "../platforms/platform.model";
import { Upload } from "./upload.model";
import { Campaign } from "./campaign.model";
import { UploadCampaignInput } from "./campaign.schema";
import {
  SUPPORTED_FORMATS,
  assertFileNameMatchesPlatform,
  findMissingColumns,
  normalize,
} from "./campaign.formats";
import { normalizeRows, parseSheet } from "./campaign.parser";

export async function uploadCampaignFile(
  file: Express.Multer.File,
  input: UploadCampaignInput,
  user: HydratedDocument<IUser>
) {
  const slug = input.platform;
  const reportDate = input.reportDate;
  const market = input.market ?? null;

  // The selected platform must exist and have an upload format
  const platform = await Platform.findOne({ slug, isActive: true });
  if (!platform) throw new ApiError(400, "Unknown platform");
  if (!SUPPORTED_FORMATS[slug]) {
    throw new ApiError(400, `Uploads for ${platform.name} are not set up yet.`);
  }

  // Check 1: the file name must belong to the selected platform
  assertFileNameMatchesPlatform(file.originalname, slug);

  // Check 2: the columns must match the selected platform's format
  const sheet = await parseSheet(file);
  const missing = findMissingColumns(slug, sheet.headers);
  if (missing.length) {
    const hasCampaignType = sheet.headers.some((h) => normalize(h) === "campaigntype");
    let hint = "";
    if (slug !== "flipkart" && hasCampaignType) {
      hint = ' This file has a "Campaign Type" column, which is the Flipkart format.';
    } else if (slug === "flipkart" && !hasCampaignType) {
      hint = ' Flipkart files use a "Campaign Type" column.';
    }
    throw new ApiError(
      400,
      `This file does not match the ${platform.name} format. Missing columns: ${missing.join(", ")}.${hint}`,
      missing.map((c) => ({ field: c, message: "Column not found in the file" }))
    );
  }

  if (sheet.rows.length === 0) throw new ApiError(400, "The file has no data rows.");

  // Check 3: every row must be valid. Nothing is saved if any row is wrong.
  const { valid, errors, skippedTotalRows } = normalizeRows(slug, sheet.rows);
  if (errors.length) {
    throw new ApiError(
      400,
      `${errors.length} problem(s) found in the file. Fix them and upload again. Nothing was saved.`,
      errors.slice(0, 20)
    );
  }
  if (valid.length === 0) throw new ApiError(400, "The file has no campaign rows.");

  // Save. An earlier upload for the same platform, date and market is replaced.
  // It runs in a transaction, so a failure never leaves a half-replaced upload.
  const session = await mongoose.startSession();
  let uploadId = "";
  let replaced = false;

  try {
    await session.withTransaction(async () => {
      replaced = false;

      const existing = await Upload.findOne({ platform: slug, reportDate, market }).session(session);
      if (existing) {
        replaced = true;
        await Campaign.deleteMany({ uploadId: existing._id }, { session });
        await Upload.deleteOne({ _id: existing._id }, { session });
      }

      const [upload] = await Upload.create(
        [
          {
            platform: slug,
            platformName: platform.name,
            reportDate,
            market,
            fileName: file.originalname,
            rowCount: valid.length,
            uploadedBy: user._id,
          },
        ],
        { session }
      );

      await Campaign.insertMany(
        valid.map((row) => ({ ...row, uploadId: upload._id, platform: slug, reportDate, market })),
        { session }
      );

      uploadId = upload.id;
    });
  } catch (err) {
    if ((err as { code?: number }).code === 11000) {
      throw new ApiError(409, "Another upload for the same platform and date is in progress. Try again.");
    }
    throw err;
  } finally {
    await session.endSession();
  }

  return {
    uploadId,
    platform: slug,
    platformName: platform.name,
    reportDate,
    market,
    fileName: file.originalname,
    rowCount: valid.length,
    skippedTotalRows,
    replaced,
  };
}