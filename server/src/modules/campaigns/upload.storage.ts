import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

const STORAGE_ROOT = path.resolve(
  process.env.UPLOAD_STORAGE_DIR ??
    path.join(process.cwd(), "uploads")
);

function getExtension(
  fileName: string
): string {
  const extension =
    path.extname(fileName).toLowerCase();

  if (
    extension === ".xlsx" ||
    extension === ".csv"
  ) {
    return extension;
  }

  return "";
}

function resolveStoredPath(
  storageKey: string
): string {
  const root = path.resolve(
    STORAGE_ROOT
  );

  const target = path.resolve(
    root,
    storageKey
  );

  if (
    target !== root &&
    !target.startsWith(
      `${root}${path.sep}`
    )
  ) {
    throw new Error(
      "Invalid storage key"
    );
  }

  return target;
}

export async function saveUploadedFile(
  file: Express.Multer.File
): Promise<{
  storageKey: string;
  mimeType: string;
  fileSize: number;
}> {
  await fs.mkdir(
    STORAGE_ROOT,
    {
      recursive: true,
    }
  );

  const extension =
    getExtension(
      file.originalname
    );

  const storageKey =
    `${randomUUID()}${extension}`;

  const target =
    resolveStoredPath(
      storageKey
    );

  await fs.writeFile(
    target,
    file.buffer
  );

  return {
    storageKey,
    mimeType:
      file.mimetype ||
      "application/octet-stream",
    fileSize: file.size,
  };
}

export async function readUploadedFile(
  storageKey: string
): Promise<Buffer> {
  return fs.readFile(
    resolveStoredPath(
      storageKey
    )
  );
}

export async function deleteUploadedFile(
  storageKey?: string | null
): Promise<void> {
  if (!storageKey) {
    return;
  }

  try {
    await fs.unlink(
      resolveStoredPath(
        storageKey
      )
    );
  } catch (error) {
    const code =
      (error as NodeJS.ErrnoException)
        .code;

    if (code !== "ENOENT") {
      throw error;
    }
  }
}