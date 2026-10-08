import {
  Request,
  Response,
} from "express";

import {
  ApiError,
} from "../../utils/ApiError";

import {
  ApiResponse,
} from "../../utils/ApiResponse";

import {
  asyncHandler,
} from "../../utils/asyncHandler";

import * as campaignService from "./campaign.service";

import {
  listCampaigns,
  getCampaignFilterOptions,
} from "./campaign.query.service";

import {
  ListCampaignsQuery,
} from "./campaign.schema";

export const uploadCampaignController =
  asyncHandler(
    async (
      req: Request,
      res: Response,
    ) => {
      if (!req.file) {
        throw new ApiError(
          400,
          'Attach a .csv or .xlsx file in the form field named "file".',
        );
      }

      const result =
        await campaignService.uploadCampaignFile(
          req.file,
          req.body,
          req.user!,
        );

      const action =
        result.replaced
          ? "Replaced"
          : "Uploaded";

      res
        .status(201)
        .json(
          new ApiResponse(
            `${action} ${result.rowCount} campaigns for ${result.platformName}`,
            result,
          ),
        );
    },
  );

export const listCampaignsController =
  asyncHandler(
    async (
      req: Request,
      res: Response,
    ) => {
      const query =
        res.locals
          .query as ListCampaignsQuery;

      const result =
        await listCampaigns(
          query,
          req.user!,
        );

      res
        .status(200)
        .json(
          new ApiResponse(
            "Campaigns fetched",
            result,
          ),
        );
    },
  );

export const getCampaignFilterOptionsController =
  asyncHandler(
    async (
      req: Request,
      res: Response,
    ) => {
      const platform =
        typeof req.query.platform ===
        "string"
          ? req.query.platform
          : undefined;

      const brand =
        typeof req.query.brand ===
        "string"
          ? req.query.brand
          : undefined;

      const result =
        await getCampaignFilterOptions(
          req.user!,
          {
            platform,
            brand,
          },
        );

      res
        .status(200)
        .json(
          new ApiResponse(
            "Campaign filter options fetched",
            result,
          ),
        );
    },
  );