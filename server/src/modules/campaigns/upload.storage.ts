
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

const DEFAULT_STORAGE_DIR = path.resolve(
  process.cwd(),
  "uploads",
);

const STORAGE_ROOT = path.resolve(
  process.env.UPLOAD_STORAGE_DIR?.trim() ||
    DEFAULT_STORAGE_DIR,
);

const ALLOWED_EXTENSIONS = new Set([
  ".xlsx",
  ".csv",
]);

function getExtension(fileName: string): string {
  const extension = path.extname(fileName).toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw new Error(
      "Unsupported file type. Only .xlsx and .csv files are allowed.",
    );
  }

  return extension;
}

function resolveStoredPath(storageKey: string): string {
  if (
    !storageKey ||
    path.isAbsolute(storageKey) ||
    storageKey.includes("/") ||
    storageKey.includes("\\") ||
    storageKey === "." ||
    storageKey === ".."
  ) {
    throw new Error("Invalid storage key");
  }

  const target = path.resolve(STORAGE_ROOT, storageKey);

  if (
    target === STORAGE_ROOT ||
    !target.startsWith(`${STORAGE_ROOT}${path.sep}`)
  ) {
    throw new Error("Invalid storage key");
  }

  return target;
}

async function ensureStorageDirectory(): Promise<void> {
  await fs.mkdir(STORAGE_ROOT, {
    recursive: true,
  });
}

export async function saveUploadedFile(
  file: Express.Multer.File,
): Promise<{
  storageKey: string;
  mimeType: string;
  fileSize: number;
}> {
  if (!file?.buffer || !Buffer.isBuffer(file.buffer)) {
    throw new Error(
      "Uploaded file buffer is missing. Check your Multer memoryStorage configuration.",
    );
  }

  const extension = getExtension(file.originalname);
  const storageKey = `${randomUUID()}${extension}`;
  const target = resolveStoredPath(storageKey);

  await ensureStorageDirectory();

  // Use exclusive creation so an existing file is never overwritten.
  const handle = await fs.open(target, "wx");

  try {
    await handle.writeFile(file.buffer);
  } catch (error) {
    await handle.close().catch(() => undefined);
    await fs.unlink(target).catch(() => undefined);
    throw error;
  }

  await handle.close();

  return {
    storageKey,
    mimeType:
      file.mimetype || "application/octet-stream",
    fileSize: file.size ?? file.buffer.length,
  };
}

export async function readUploadedFile(
  storageKey: string,
): Promise<Buffer> {
  const target = resolveStoredPath(storageKey);

  return fs.readFile(target);
}

export async function deleteUploadedFile(
  storageKey?: string | null,
): Promise<void> {
  if (!storageKey) {
    return;
  }

  const target = resolveStoredPath(storageKey);

  try {
    await fs.unlink(target);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;

    if (code !== "ENOENT") {
      throw error;
    }
  }
}
