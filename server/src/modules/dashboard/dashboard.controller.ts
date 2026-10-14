import { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { DashboardQuery } from "./dashboard.schema";
import { getDashboardSummary } from "./dashboard.service";

export const dashboardSummaryController = asyncHandler(
  async (req: Request, res: Response) => {
    const query = res.locals.query as DashboardQuery;

    const summary = await getDashboardSummary(
      query,
      req.user!
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          "Dashboard summary fetched",
          summary
        )
      );
  }
);
