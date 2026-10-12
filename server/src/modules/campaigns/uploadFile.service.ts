import mongoose from "mongoose";

import {
  ApiError,
} from "../../utils/ApiError";

import {
  Upload,
} from "./upload.model";

import {
  readUploadedFile,
} from "./upload.storage";

/* =========================================================
   GET ORIGINAL FILE
========================================================= */

export async function getUploadedFile(
  id: string,
) {
  if (
    !mongoose.isValidObjectId(id)
  ) {
    throw new ApiError(
      404,
      "Upload not found",
    );
  }

  const upload =
    await Upload.findById(id).lean();

  if (!upload) {
    throw new ApiError(
      404,
      "Upload not found",
    );
  }

  if (!upload.storageKey) {
    throw new ApiError(
      404,
      "Original uploaded file is not available",
    );
  }

  let buffer: Buffer;

  try {
    buffer =
      await readUploadedFile(
        upload.storageKey,
      );
  } catch {
    throw new ApiError(
      404,
      "Original uploaded file is not available",
    );
  }

  return {
    buffer,

    fileName:
      upload.fileName,

    mimeType:
      upload.mimeType,

    fileSize:
      upload.fileSize,
  };
}