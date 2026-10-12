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

import {
  normalizeRows,
  parseSheet,
} from "./campaign.parser";

import {
  deleteUploadedFile,
  saveUploadedFile,
} from "./upload.storage";

function normalizeFileName(fileName: string): string {
  return fileName.trim().normalize("NFC").toLowerCase();
}

function isDuplicateFilenameError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const mongoError = error as {
    code?: number;
    keyPattern?: Record<string, unknown>;
    message?: string;
  };

  return (
    mongoError.code === 11000 &&
    (
      "fileNameNormalized" in (mongoError.keyPattern ?? {}) ||
      mongoError.message?.includes("fileNameNormalized_unique") === true
    )
  );
}

export async function uploadCampaignFile(
  file: Express.Multer.File,
  input: UploadCampaignInput,
  user: HydratedDocument<IUser>
) {
  const slug = input.platform;
  const reportDate = input.reportDate;
  const market = input.market ?? null;
  const fileName = file.originalname.trim();
  const fileNameNormalized = normalizeFileName(fileName);

  if (!fileNameNormalized) {
    throw new ApiError(400, "Filename cannot be empty.");
  }

  // Check the filename globally, ignoring capitalization.
  const existingUpload = await Upload.findOne({
    fileNameNormalized,
  })
    .select("_id")
    .lean();

  if (existingUpload) {
    throw new ApiError(
      409,
      `A file named "${fileName}" already exists in upload history. Rename the file and upload it again.`
    );
  }

  // Validate the selected platform.
  const platform = await Platform.findOne({
    slug,
    isActive: true,
  });

  if (!platform) {
    throw new ApiError(400, "Unknown platform");
  }

  if (!SUPPORTED_FORMATS[slug]) {
    throw new ApiError(
      400,
      `Uploads for ${platform.name} are not set up yet.`
    );
  }

  // Validate the filename against the selected platform.
  assertFileNameMatchesPlatform(fileName, slug);

  // Parse the spreadsheet.
  const sheet = await parseSheet(file);

  // Validate required columns.
  const missing = findMissingColumns(slug, sheet.headers);

  if (missing.length > 0) {
    const hasCampaignType = sheet.headers.some(
      (header) => normalize(header) === "campaigntype"
    );

    let hint = "";

    if (slug !== "flipkart" && hasCampaignType) {
      hint =
        ' This file has a "Campaign Type" column, which is the Flipkart format.';
    } else if (slug === "flipkart" && !hasCampaignType) {
      hint = ' Flipkart files use a "Campaign Type" column.';
    }

    throw new ApiError(
      400,
      `This file does not match the ${platform.name} format. Missing columns: ${missing.join(", ")}.${hint}`,
      missing.map((column) => ({
        field: column,
        message: "Column not found in the file",
      }))
    );
  }

  if (sheet.rows.length === 0) {
    throw new ApiError(400, "The file has no data rows.");
  }

  const {
    valid,
    errors,
    skippedTotalRows,
  } = normalizeRows(slug, sheet.rows);

  if (errors.length > 0) {
    throw new ApiError(
      400,
      `${errors.length} problem(s) found in the file. Fix them and upload again. Nothing was saved.`,
      errors.slice(0, 20)
    );
  }

  if (valid.length === 0) {
    throw new ApiError(400, "The file has no campaign rows.");
  }

  // Store the physical file only after initial validation.
  const storedFile = await saveUploadedFile(file);

  let session: mongoose.ClientSession | null = null;

  try {
    session = await mongoose.startSession();

    let uploadId = "";

    await session.withTransaction(async () => {
      // Always create a new upload. Never replace existing uploads.
      const [upload] = await Upload.create(
        [
          {
            platform: slug,
            platformName: platform.name,
            reportDate,
            market,
            fileName,
            fileNameNormalized,
            rowCount: valid.length,
            uploadedBy: user._id,
            storageKey: storedFile.storageKey,
            mimeType: storedFile.mimeType,
            fileSize: storedFile.fileSize,
          },
        ],
        { session }
      );

      // Associate every campaign row with this specific upload.
      await Campaign.insertMany(
        valid.map((row) => ({
          ...row,
          uploadId: upload._id,
          platform: slug,
          reportDate,
          market,
        })),
        { session }
      );

      uploadId = String(upload._id);
    });

    return {
      uploadId,
      platform: slug,
      platformName: platform.name,
      reportDate,
      market,
      fileName,
      rowCount: valid.length,
      skippedTotalRows,
    };
  } catch (error) {
    // A concurrent request may have claimed the filename after
    // the initial check. The unique index prevents both succeeding.
    if (isDuplicateFilenameError(error)) {
      throw new ApiError(
        409,
        `A file named "${fileName}" already exists in upload history. Rename the file and upload it again.`
      );
    }

    throw error;
  } finally {
    if (session) {
      await session.endSession();
    }

    // Only remove the newly stored file when the database operation
    // failed. Never remove a file belonging to a previous upload.
    // Successful uploads retain their stored files.
  }
}