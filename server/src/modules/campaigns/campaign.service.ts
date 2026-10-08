import mongoose, {
  HydratedDocument,
} from "mongoose";

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

export async function uploadCampaignFile(
  file: Express.Multer.File,
  input: UploadCampaignInput,
  user: HydratedDocument<IUser>
) {
  const slug = input.platform;

  const reportDate =
    input.reportDate;

  const market =
    input.market ?? null;

  // ------------------------------------------------------------
  // PLATFORM VALIDATION
  // ------------------------------------------------------------

  const platform =
    await Platform.findOne({
      slug,
      isActive: true,
    });

  if (!platform) {
    throw new ApiError(
      400,
      "Unknown platform"
    );
  }

  if (!SUPPORTED_FORMATS[slug]) {
    throw new ApiError(
      400,
      `Uploads for ${platform.name} are not set up yet.`
    );
  }

  // ------------------------------------------------------------
  // FILE NAME VALIDATION
  // ------------------------------------------------------------

  assertFileNameMatchesPlatform(
    file.originalname,
    slug
  );

  // ------------------------------------------------------------
  // PARSE FILE
  // ------------------------------------------------------------

  const sheet =
    await parseSheet(file);

  // ------------------------------------------------------------
  // COLUMN VALIDATION
  // ------------------------------------------------------------

  const missing =
    findMissingColumns(
      slug,
      sheet.headers
    );

  if (missing.length) {
    const hasCampaignType =
      sheet.headers.some(
        (h) =>
          normalize(h) ===
          "campaigntype"
      );

    let hint = "";

    if (
      slug !== "flipkart" &&
      hasCampaignType
    ) {
      hint =
        ' This file has a "Campaign Type" column, which is the Flipkart format.';
    } else if (
      slug === "flipkart" &&
      !hasCampaignType
    ) {
      hint =
        ' Flipkart files use a "Campaign Type" column.';
    }

    throw new ApiError(
      400,
      `This file does not match the ${platform.name} format. Missing columns: ${missing.join(", ")}.${hint}`,
      missing.map((column) => ({
        field: column,
        message:
          "Column not found in the file",
      }))
    );
  }

  // ------------------------------------------------------------
  // EMPTY FILE VALIDATION
  // ------------------------------------------------------------

  if (
    sheet.rows.length === 0
  ) {
    throw new ApiError(
      400,
      "The file has no data rows."
    );
  }

  // ------------------------------------------------------------
  // ROW VALIDATION
  // ------------------------------------------------------------

  const {
    valid,
    errors,
    skippedTotalRows,
  } =
    normalizeRows(
      slug,
      sheet.rows
    );

  if (errors.length) {
    throw new ApiError(
      400,
      `${errors.length} problem(s) found in the file. Fix them and upload again. Nothing was saved.`,
      errors.slice(0, 20)
    );
  }

  if (valid.length === 0) {
    throw new ApiError(
      400,
      "The file has no campaign rows."
    );
  }

  // ------------------------------------------------------------
  // SAVE ORIGINAL FILE
  // ------------------------------------------------------------

  const storedFile =
    await saveUploadedFile(
      file
    );

  let session:
    | mongoose.ClientSession
    | null = null;

  try {
    session =
      await mongoose.startSession();

    let uploadId = "";

    await session.withTransaction(
      async () => {
        // ------------------------------------------------------
        // CREATE UPLOAD
        // ------------------------------------------------------

        const [upload] =
          await Upload.create(
            [
              {
                platform: slug,
                platformName:
                  platform.name,
                reportDate,
                market,
                fileName:
                  file.originalname,
                rowCount:
                  valid.length,
                uploadedBy:
                  user._id,

                storageKey:
                  storedFile.storageKey,

                mimeType:
                  storedFile.mimeType,

                fileSize:
                  storedFile.fileSize,
              },
            ],
            {
              session,
            }
          );

        // ------------------------------------------------------
        // CREATE CAMPAIGN ROWS
        // ------------------------------------------------------

        await Campaign.insertMany(
          valid.map((row) => ({
            ...row,
            uploadId:
              upload._id,
            platform: slug,
            reportDate,
            market,
          })),
          {
            session,
          }
        );

        uploadId =
          String(upload._id);
      }
    );

    return {
      uploadId,
      platform: slug,
      platformName:
        platform.name,
      reportDate,
      market,
      fileName:
        file.originalname,
      rowCount:
        valid.length,
      skippedTotalRows,
    };
  } catch (error) {
    // Database transaction failed.
    // Remove the stored physical file so we don't
    // leave orphan files on disk.
    await deleteUploadedFile(
      storedFile.storageKey
    );

    throw error;
  } finally {
    await session?.endSession();
  }
}