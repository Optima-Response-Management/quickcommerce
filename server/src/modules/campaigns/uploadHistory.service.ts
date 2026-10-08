import mongoose, {
  HydratedDocument,
} from "mongoose";

import ExcelJS from "exceljs";

import { ApiError } from "../../utils/ApiError";
import { IUser, User } from "../users/user.model";

import {
  platformFilter,
} from "../campaigns/campaign.access";

import { Campaign } from "./campaign.model";
import { Upload } from "./upload.model";
import { ListUploadsQuery } from "./upload.schema";

import {
  deleteUploadedFile,
  readUploadedFile,
} from "./upload.storage";

// ------------------------------------------------------------
// LIST UPLOADS
// ------------------------------------------------------------

export async function listUploads(
  query: ListUploadsQuery,
  user: HydratedDocument<IUser>
) {
  const {
    from,
    to,
    page,
    limit,
  } = query;

  const filter:
    Record<string, unknown> = {};

  // Only uploads for platforms
  // this user can see.
  const platform =
    platformFilter(
      query.platform,
      user
    );

  if (platform) {
    filter.platform =
      platform;
  }

  if (from || to) {
    filter.reportDate = {
      ...(from
        ? { $gte: from }
        : {}),
      ...(to
        ? { $lte: to }
        : {}),
    };
  }

  const [
    uploads,
    total,
  ] = await Promise.all([
    Upload.find(filter)
      .sort({
        createdAt: -1,
        _id: -1,
      })
      .skip(
        (page - 1) * limit
      )
      .limit(limit)
      .lean(),

    Upload.countDocuments(
      filter
    ),
  ]);

  // ----------------------------------------------------------
  // UPLOADER NAMES
  // ----------------------------------------------------------

  const uploaderIds = [
    ...new Set(
      uploads.map((upload) =>
        String(
          upload.uploadedBy
        )
      )
    ),
  ];

  const uploaders =
    uploaderIds.length
      ? await User.find({
          _id: {
            $in: uploaderIds,
          },
        })
          .select("name")
          .lean()
      : [];

  const names =
    new Map(
      uploaders.map(
        (uploadUser) => [
          String(
            uploadUser._id
          ),
          uploadUser.name,
        ]
      )
    );

  // ----------------------------------------------------------
  // RESPONSE
  // ----------------------------------------------------------

  return {
    uploads:
      uploads.map(
        (upload) => ({
          id: String(
            upload._id
          ),

          platform:
            upload.platform,

          platformName:
            upload.platformName,

          reportDate:
            upload.reportDate,

          market:
            upload.market,

          fileName:
            upload.fileName,

          rowCount:
            upload.rowCount,

          uploadedBy: {
            id: String(
              upload.uploadedBy
            ),

            name:
              names.get(
                String(
                  upload.uploadedBy
                )
              ) ?? null,
          },

          uploadedAt:
            (
              upload as {
                createdAt?: Date;
              }
            ).createdAt ??
            null,

          // IMPORTANT:
          //
          // Even old uploads are considered viewable
          // because we can generate an XLSX from their
          // Campaign documents when storageKey is null.
          hasFile: true,

          hasOriginalFile:
            Boolean(
              upload.storageKey
            ),
        })
      ),

    pagination: {
      page,
      limit,
      total,

      totalPages:
        Math.max(
          1,
          Math.ceil(
            total / limit
          )
        ),
    },
  };
}

// ------------------------------------------------------------
// GENERATE FALLBACK XLSX FOR OLD UPLOADS
// ------------------------------------------------------------

async function generateCampaignWorkbook(
  uploadId: mongoose.Types.ObjectId
): Promise<Buffer> {
  const campaigns =
    await Campaign.find({
      uploadId,
    })
      .sort({
        _id: 1,
      })
      .lean();

  if (!campaigns.length) {
    throw new ApiError(
      404,
      "No campaign data was found for this upload."
    );
  }

  const workbook =
    new ExcelJS.Workbook();

  workbook.creator =
    "Campaign Hub";

  workbook.created =
    new Date();

  const worksheet =
    workbook.addWorksheet(
      "Campaign Data"
    );

  // ----------------------------------------------------------
  // HEADER
  // ----------------------------------------------------------

  worksheet.columns = [
    {
      header:
        "CampaignName",
      key: "CampaignName",
      width: 40,
    },

    {
      header:
        "BrandName",
      key: "BrandName",
      width: 30,
    },

    {
      header: "Budget",
      key: "Budget",
      width: 15,
    },

    {
      header: "Spend",
      key: "Spend",
      width: 15,
    },

    {
      header: "Revenue",
      key: "Revenue",
      width: 15,
    },

    {
      header: "Orders",
      key: "Orders",
      width: 15,
    },

    {
      header: "Roas",
      key: "Roas",
      width: 15,
    },
  ];

  // ----------------------------------------------------------
  // DATA
  // ----------------------------------------------------------

  for (const campaign of campaigns) {
    worksheet.addRow({
      CampaignName:
        campaign.CampaignName,

      BrandName:
        campaign.BrandName,

      Budget:
        campaign.Budget,

      Spend:
        campaign.Spend,

      Revenue:
        campaign.Revenue,

      Orders:
        campaign.Orders,

      Roas:
        campaign.Roas,
    });
  }

  // ----------------------------------------------------------
  // HEADER STYLE
  // ----------------------------------------------------------

  const headerRow =
    worksheet.getRow(1);

  headerRow.font = {
    bold: true,
  };

  headerRow.alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  headerRow.height = 22;

  // Freeze header row.
  worksheet.views = [
    {
      state: "frozen",
      ySplit: 1,
    },
  ];

  // ----------------------------------------------------------
  // NUMBER FORMATS
  // ----------------------------------------------------------

  worksheet
    .getColumn("Budget")
    .numFmt = "#,##0.00";

  worksheet
    .getColumn("Spend")
    .numFmt = "#,##0.00";

  worksheet
    .getColumn("Revenue")
    .numFmt = "#,##0.00";

  worksheet
    .getColumn("Orders")
    .numFmt = "#,##0";

  worksheet
    .getColumn("Roas")
    .numFmt = "0.00";

  // ----------------------------------------------------------
  // WRITE WORKBOOK
  // ----------------------------------------------------------

  const buffer =
    await workbook.xlsx.writeBuffer();

  return Buffer.from(
    buffer
  );
}

// ------------------------------------------------------------
// GET UPLOADED FILE
// ------------------------------------------------------------

export async function getUploadedFile(
  id: string
): Promise<{
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  isOriginal: boolean;
}> {
  if (
    !mongoose.isValidObjectId(
      id
    )
  ) {
    throw new ApiError(
      404,
      "Upload not found"
    );
  }

  const upload =
    await Upload.findById(id)
      .select(
        "_id fileName storageKey mimeType platform platformName reportDate market"
      )
      .lean();

  if (!upload) {
    throw new ApiError(
      404,
      "Upload not found"
    );
  }

  // ----------------------------------------------------------
  // CASE 1:
  // ORIGINAL FILE EXISTS
  // ----------------------------------------------------------

  if (upload.storageKey) {
    try {
      const buffer =
        await readUploadedFile(
          upload.storageKey
        );

      const mimeType =
        upload.mimeType ||
        (
          upload.fileName
            .toLowerCase()
            .endsWith(".csv")
            ? "text/csv"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

      return {
        buffer,
        fileName:
          upload.fileName,
        mimeType,
        isOriginal: true,
      };
    } catch (error) {
      const code =
        (
          error as NodeJS.ErrnoException
        ).code;

      if (code !== "ENOENT") {
        throw error;
      }

      // Physical file was deleted.
      // Continue to fallback generation below.
    }
  }

  // ----------------------------------------------------------
  // CASE 2:
  // OLD UPLOAD
  //
  // No original file exists.
  // Generate XLSX from Campaign documents.
  // ----------------------------------------------------------

  const generatedBuffer =
    await generateCampaignWorkbook(
      upload._id
    );

  const generatedName =
    upload.fileName
      .toLowerCase()
      .endsWith(".csv")
      ? upload.fileName.replace(
          /\.csv$/i,
          ".xlsx"
        )
      : upload.fileName;

  return {
    buffer:
      generatedBuffer,

    fileName:
      generatedName,

    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

    isOriginal: false,
  };
}

// ------------------------------------------------------------
// DELETE UPLOAD
// ------------------------------------------------------------

export async function deleteUpload(
  id: string,
) {
  if (
    !mongoose.isValidObjectId(
      id,
    )
  ) {
    throw new ApiError(
      404,
      "Upload not found",
    );
  }

  const upload =
    await Upload.findById(id);

  if (!upload) {
    throw new ApiError(
      404,
      "Upload not found",
    );
  }

  const storageKey =
    upload.storageKey;

  let deletedRows = 0;

  const session =
    await mongoose.startSession();

  try {
    await session.withTransaction(
      async () => {
        const result =
          await Campaign.deleteMany(
            {
              uploadId:
                upload._id,
            },
            {
              session,
            },
          );

        deletedRows =
          result.deletedCount;

        await Upload.deleteOne(
          {
            _id:
              upload._id,
          },
          {
            session,
          },
        );
      },
    );
  } finally {
    await session.endSession();
  }

  /*
   * Delete the physical uploaded
   * file after the MongoDB transaction
   * succeeds.
   */
  await deleteUploadedFile(
    storageKey,
  );

  return {
    id: String(
      upload._id,
    ),

    platformName:
      upload.platformName,

    reportDate:
      upload.reportDate,

    fileName:
      upload.fileName,

    deletedRows,
  };
}