
import mongoose from "mongoose";
import { GridFSBucket, ObjectId } from "mongodb";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { Readable } from "node:stream";

const BUCKET_NAME = "uploads";

const ALLOWED_EXTENSIONS = new Set<string>([
  ".xlsx",
  ".csv",
]);

interface StoredUploadedFile {
  storageKey: string;
  mimeType: string;
  fileSize: number;
}

function getExtension(fileName: string): string {
  const extension = path.extname(fileName).toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw new Error(
      "Unsupported file type. Only .xlsx and .csv files are allowed.",
    );
  }

  return extension;
}

function getBucket(): GridFSBucket {
  if (mongoose.connection.readyState !== 1) {
    throw new Error("MongoDB connection is not ready.");
  }

  const db = mongoose.connection.db;

  if (!db) {
    throw new Error("MongoDB database connection is unavailable.");
  }

  return new GridFSBucket(db, {
    bucketName: BUCKET_NAME,
    chunkSizeBytes: 255 * 1024,
  });
}

/**
 * Save an uploaded file in MongoDB GridFS.
 *
 * storageKey is the GridFS ObjectId stored as a string.
 */
export async function saveUploadedFile(
  file: Express.Multer.File,
): Promise<StoredUploadedFile> {
  if (!file?.buffer || !Buffer.isBuffer(file.buffer)) {
    throw new Error(
      "Uploaded file buffer is missing. Check your Multer memoryStorage configuration.",
    );
  }

  const extension = getExtension(file.originalname);
  const bucket = getBucket();

  const storedFileName = `${randomUUID()}${extension}`;
  const mimeType = file.mimetype || "application/octet-stream";
  const fileSize = file.buffer.length;

  return new Promise<StoredUploadedFile>((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(storedFileName, {
      metadata: {
        originalName: path.basename(file.originalname),
        mimeType,
        fileSize,
        uploadedAt: new Date(),
      },
    });

    let settled = false;

    uploadStream.once("error", (error: Error) => {
      if (settled) {
        return;
      }

      settled = true;

      // Attempt to clean up any partially stored GridFS file.
      void bucket.delete(uploadStream.id).catch(() => undefined);

      reject(error);
    });

    uploadStream.once("finish", () => {
      if (settled) {
        return;
      }

      settled = true;

      resolve({
        storageKey: uploadStream.id.toString(),
        mimeType,
        fileSize,
      });
    });

    Readable.from([file.buffer]).pipe(uploadStream);
  });
}

/**
 * Create an ENOENT-compatible error.
 *
 * The existing upload-history service uses ENOENT to decide
 * when it should generate a fallback workbook for old uploads.
 */
function createFileNotFoundError(): NodeJS.ErrnoException {
  const error = new Error(
    "Uploaded file was not found in MongoDB GridFS.",
  ) as NodeJS.ErrnoException;

  error.code = "ENOENT";

  return error;
}

/**
 * Read a file from GridFS.
 *
 * Returns the complete file as a Buffer, matching the existing API.
 */
export async function readUploadedFile(
  storageKey: string,
): Promise<Buffer> {
  if (
    typeof storageKey !== "string" ||
    !/^[a-fA-F0-9]{24}$/.test(storageKey)
  ) {
    // Older records may contain local filenames instead of ObjectIds.
    throw createFileNotFoundError();
  }

  const bucket = getBucket();
  const fileId = new ObjectId(storageKey);

  const files = await bucket
    .find({ _id: fileId })
    .limit(1)
    .toArray();

  if (files.length === 0) {
    throw createFileNotFoundError();
  }

  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    const downloadStream = bucket.openDownloadStream(fileId);

    downloadStream.on("data", (chunk: Buffer | Uint8Array) => {
      chunks.push(Buffer.from(chunk));
    });

    downloadStream.once("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") {
        reject(createFileNotFoundError());
        return;
      }

      reject(error);
    });

    downloadStream.once("end", () => {
      resolve(Buffer.concat(chunks));
    });
  });
}

/**
 * Delete a file from GridFS.
 *
 * Missing files are ignored.
 * Old local-filename storage keys are ignored because they are
 * not valid GridFS ObjectIds.
 */
export async function deleteUploadedFile(
  storageKey?: string | null,
): Promise<void> {
  if (!storageKey) {
    return;
  }

  if (!/^[a-fA-F0-9]{24}$/.test(storageKey)) {
    // Legacy local filename; it is not a GridFS identifier.
    return;
  }

  const bucket = getBucket();
  const fileId = new ObjectId(storageKey);

  const files = await bucket
    .find({ _id: fileId })
    .limit(1)
    .toArray();

  if (files.length === 0) {
    return;
  }

  await bucket.delete(fileId);
}
