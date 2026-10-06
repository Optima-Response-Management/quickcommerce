import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/* =========================================================
   PLATFORM
========================================================= */

export interface Platform {
  id: string;
  name: string;
  slug: string;
}

/* =========================================================
   DASHBOARD SUMMARY
========================================================= */

export interface DashboardSummary {
  totals: {
    Budget: number;
    Spend: number;
    Revenue: number;
    Orders: number;
    Roas: number;
    avgRoas: number;
    utilisation: number;
    campaignCount: number;
  };

  byPlatform: {
    platform: string;
    platformName: string;
    budgetType: string;
    Budget: number;
    Spend: number;
    Revenue: number;
    Orders: number;
    Roas: number;
  }[];

  byDate: {
    reportDate: string;
    Budget: number;
    Spend: number;
    Revenue: number;
    Orders: number;
  }[];
}

/* =========================================================
   CAMPAIGN GRID ROW
========================================================= */

export interface CampaignGridRow {
  id: string;
  campaignName: string;
  platform: string;
  budget: number;
  spend: number;
  revenue: number;
  date: string;
}

/* =========================================================
   RAW CAMPAIGN
========================================================= */

type RawCampaign = Record<string, any>;

/* =========================================================
   CAMPAIGN PAGINATION
========================================================= */

export interface CampaignPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/* =========================================================
   CAMPAIGN API RESPONSE
========================================================= */

export interface CampaignsResponse {
  campaigns: CampaignGridRow[];
  pagination: CampaignPagination;
}

/* =========================================================
   CAMPAIGN QUERY PARAMS
========================================================= */

export interface CampaignQueryParams {
  page?: number;
  limit?: number;

  platform?: string;
  from?: string;
  to?: string;

  brand?: string;
  search?: string;

  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/* =========================================================
   CONVERT RAW CAMPAIGN -> GRID ROW
========================================================= */

function toGridRow(
  r: RawCampaign,
  i: number
): CampaignGridRow {
  return {
    id: String(r.id ?? r._id ?? i),

    campaignName:
      r.CampaignName ??
      r.campaignName ??
      r.name ??
      "",

    platform: r.platform ?? "",

    budget: Number(
      r.Budget ??
      r.budget ??
      0
    ),

    spend: Number(
      r.Spend ??
      r.spend ??
      0
    ),

    revenue: Number(
      r.Revenue ??
      r.revenue ??
      0
    ),

    date: String(
      r.reportDate ??
      r.date ??
      ""
    ).slice(0, 10),
  };
}

/* =========================================================
   SUMMARY ARGS
========================================================= */

interface SummaryArgs {
  platforms: string[];
  from?: string;
  to?: string;
}

/* =========================================================
   API
========================================================= */

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    credentials: "include",
  }),

  endpoints: (builder) => ({
    /* =====================================================
       GET PLATFORMS
    ===================================================== */

    getPlatforms: builder.query<Platform[], void>({
      query: () => "/platforms",

      transformResponse: (
        res: {
          data: {
            platforms: Platform[];
          };
        }
      ) => {
        return res.data.platforms;
      },
    }),

    /* =====================================================
       GET DASHBOARD SUMMARY
    ===================================================== */

    getDashboardSummary: builder.query<
      DashboardSummary,
      SummaryArgs
    >({
      query: ({
        platforms,
        from,
        to,
      }) => ({
        url: "/dashboard/summary",

        params: {
          platform: platforms.length
            ? platforms.join(",")
            : undefined,

          from: from || undefined,

          to: to || undefined,
        },
      }),

      transformResponse: (
        res: {
          data: DashboardSummary;
        }
      ) => {
        return res.data;
      },
    }),

    /* =====================================================
       GET CAMPAIGNS
       
       SERVER-SIDE PAGINATION
    ===================================================== */

    getCampaigns: builder.query<
      CampaignsResponse,
      CampaignQueryParams
    >({
      query: ({
        page = 1,
        limit = 20,
        platform,
        from,
        to,
        brand,
        search,
        sortBy = "reportDate",
        sortOrder = "desc",
      }) => ({
        url: "/campaigns",

        params: {
          page,
          limit,

          platform: platform || undefined,

          from: from || undefined,

          to: to || undefined,

          brand: brand || undefined,

          search: search || undefined,

          sortBy,

          sortOrder,
        },
      }),

      transformResponse: (
        res: {
          data: {
            campaigns?: RawCampaign[];
            items?: RawCampaign[];
            rows?: RawCampaign[];

            pagination?: CampaignPagination;
          };
        }
      ): CampaignsResponse => {
        const data = res.data;

        /*
         * Backend response:
         *
         * {
         *   campaigns: [...],
         *   pagination: {
         *     page: 1,
         *     limit: 20,
         *     total: 115,
         *     totalPages: 6
         *   }
         * }
         */

        const list: RawCampaign[] = Array.isArray(data)
          ? data
          : data?.campaigns ??
            data?.items ??
            data?.rows ??
            [];

        const campaigns = list.map(toGridRow);

        const pagination: CampaignPagination =
          data?.pagination ?? {
            page: 1,
            limit: campaigns.length,
            total: campaigns.length,
            totalPages: campaigns.length > 0 ? 1 : 1,
          };

        return {
          campaigns,
          pagination,
        };
      },
    }),
  }),
});

/* =========================================================
   HOOKS
========================================================= */

export const {
  useGetPlatformsQuery,
  useGetDashboardSummaryQuery,
  useGetCampaignsQuery,
} = dashboardApi;