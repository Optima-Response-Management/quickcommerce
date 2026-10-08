import {
  Request,
  Response,
} from "express";

import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

import {
  ListUploadsQuery,
} from "./upload.schema";

import {
  deleteUpload,
  getUploadedFile,
  listUploads,
} from "./uploadHistory.service";

// ------------------------------------------------------------
// LIST UPLOAD HISTORY
// ------------------------------------------------------------

export const listUploadsController =
  asyncHandler(
    async (
      req: Request,
      res: Response
    ) => {
      const query =
        res.locals
          .query as ListUploadsQuery;

      const result =
        await listUploads(
          query,
          req.user!
        );

      res
        .status(200)
        .json(
          new ApiResponse(
            "Uploads fetched",
            result
          )
        );
    }
  );

// ------------------------------------------------------------
// GET FILE
// ------------------------------------------------------------

export const getUploadedFileController =
  asyncHandler(
    async (
      req: Request,
      res: Response
    ) => {
      const result =
        await getUploadedFile(
          String(
            req.params.id
          )
        );

      res.setHeader(
        "Content-Type",
        result.mimeType
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename*=UTF-8''${encodeURIComponent(
          result.fileName
        )}`
      );

      res.setHeader(
        "Content-Length",
        String(
          result.buffer.length
        )
      );

      res.setHeader(
        "Cache-Control",
        "private, no-store"
      );

      // Let the frontend know whether
      // this was the original physical file
      // or a generated fallback.
      res.setHeader(
        "X-File-Source",
        result.isOriginal
          ? "original"
          : "generated"
      );

      res
        .status(200)
        .send(result.buffer);
    }
  );

// ------------------------------------------------------------
// DELETE
// ------------------------------------------------------------

export const deleteUploadController =
  asyncHandler(
    async (
      req: Request,
      res: Response
    ) => {
      const result =
        await deleteUpload(
          String(
            req.params.id
          )
        );

      res
        .status(200)
        .json(
          new ApiResponse(
            "Upload deleted",
            result
          )
        );
    }
  );