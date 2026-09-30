import { RequestHandler } from "express";
import multer, { MulterError } from "multer";
import path from "path";
import { ApiError } from "../utils/ApiError";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXTENSIONS = [".csv", ".xlsx"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(new ApiError(400, "Only .csv and .xlsx files are allowed"));
    }
    cb(null, true);
  },
});

// Reads one file from the form field `field` into req.file (in memory)
export const uploadSingleFile =
  (field = "file"): RequestHandler =>
  (req, res, next) => {
    upload.single(field)(req, res, (err: unknown) => {
      if (!err) return next();

      if (err instanceof MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(new ApiError(413, "The file is too large. The maximum size is 5 MB."));
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return next(new ApiError(400, `Send the file in a form field named "${field}".`));
        }
        return next(new ApiError(400, err.message));
      }
      next(err);
    });
  };