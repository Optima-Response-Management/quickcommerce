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
import {
  deleteUploadedFile,
  saveUploadedFile,
} from "./upload.storage";

const normalizeFileName = (name: string) =>
  name.normalize("NFC").trim().toLocaleLowerCase("en-US");

export async function uploadCampaignFile(
  file: Express.Multer.File,
  input: UploadCampaignInput,
  user: HydratedDocument<IUser>,
) {
  const slug = input.platform;
  const reportDate = input.reportDate;
  const market = input.market?.trim() || null;
  const subMarket = input.subMarket?.trim() || null;
  const fileNameNormalized = normalizeFileName(file.originalname);

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
      `Uploads for ${platform.name} are not set up yet.`,
    );
  }

  assertFileNameMatchesPlatform(file.originalname, slug);

  // Filenames must be unique globally, regardless of platform/date/market.
  const duplicate = await Upload.findOne({
    fileNameNormalized,
  })
    .select("_id")
    .lean();

  if (duplicate) {
    throw new ApiError(
      409,
      `A file named "${file.originalname}" has already been uploaded. Rename the file before uploading it again.`,
    );
  }

  const sheet = await parseSheet(file);
  const missing = findMissingColumns(slug, sheet.headers);

  if (missing.length) {
    const hasCampaignType = sheet.headers.some(
      (header) => normalize(header) === "campaigntype",
    );

    let hint = "";

    if (slug !== "flipkart" && hasCampaignType) {
      hint =
        ' This file has a "Campaign Type" column, which is the Flipkart format.';
    } else if (slug === "flipkart" && !hasCampaignType) {
      hint =
        ' Flipkart files use a "Campaign Type" column.';
    }

    throw new ApiError(
      400,
      `This file does not match the ${platform.name} format. Missing columns: ${missing.join(", ")}.${hint}`,
      missing.map((column) => ({
        field: column,
        message: "Column not found in the file",
      })),
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

  if (errors.length) {
    throw new ApiError(
      400,
      `${errors.length} problem(s) found in the file. Fix them and upload again. Nothing was saved.`,
      errors.slice(0, 20),
    );
  }

  if (valid.length === 0) {
    throw new ApiError(400, "The file has no campaign rows.");
  }

  const storedFile = await saveUploadedFile(file);

  let session: mongoose.ClientSession | null = null;

  try {
    session = await mongoose.startSession();

    let uploadId = "";

    await session.withTransaction(async () => {
      // Never delete or replace previous uploads based on platform,
      // report date, market, or submarket.
      const [upload] = await Upload.create(
        [
          {
            platform: slug,
            platformName: platform.name,
            reportDate,
            market,
            subMarket,
            fileName: file.originalname,
            fileNameNormalized,
            rowCount: valid.length,
            uploadedBy: user._id,
            storageKey: storedFile.storageKey,
            mimeType: storedFile.mimeType,
            fileSize: storedFile.fileSize,
          },
        ],
        { session },
      );

      await Campaign.insertMany(
        valid.map((row) => ({
          ...row,
          uploadId: upload._id,
          platform: slug,
          reportDate,

          // Prefer each row's Excel location.
          // Fall back to the upload-level location only when absent.
          market: row.market ?? market,
          subMarket: row.subMarket ?? subMarket,
        })),
        { session },
      );

      uploadId = String(upload._id);
    });

    return {
      uploadId,
      platform: slug,
      platformName: platform.name,
      reportDate,
      market,
      subMarket,
      fileName: file.originalname,
      rowCount: valid.length,
      skippedTotalRows,
    };
  } catch (error) {
    // If this upload fails, remove only the file created by this request.
    await deleteUploadedFile(storedFile.storageKey).catch(
      () => undefined,
    );

    // The unique database index also protects against simultaneous
    // uploads with the same normalized filename.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      throw new ApiError(
        409,
        `A file named "${file.originalname}" has already been uploaded. Rename the file before uploading it again.`,
      );
    }

    throw error;
  } finally {
    await session?.endSession();
  }
}