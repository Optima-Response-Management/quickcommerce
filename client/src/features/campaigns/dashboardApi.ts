
import {
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

// =========================================================
// PLATFORM
// =========================================================

export interface Platform {
  id: string;
  name: string;
  slug: string;
}

// =========================================================
// DASHBOARD SUMMARY
// =========================================================

export interface DashboardBreakdown {
  name: string;
  Budget: number;
  Spend: number;
  Revenue: number;
  Orders: number;
  Roas: number;
  campaignCount: number;
}

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
    budgetType: "daily" | "total";
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

  byMarket: DashboardBreakdown[];
  bySubMarket: DashboardBreakdown[];
  byBrand: DashboardBreakdown[];
  bySubBrand: DashboardBreakdown[];
}

// =========================================================
// CAMPAIGN GRID ROW
// =========================================================

export interface CampaignGridRow {
  id: string;
  campaignName: string;
  platform: string;
  brandName: string;
  subBrandName: string;
  budget: number;
  spend: number;
  revenue: number;
  orders: number;
  roas: number;
  date: string;
}

// =========================================================
// RAW CAMPAIGN
// =========================================================

type RawCampaign = Record<string, unknown>;

// =========================================================
// PAGINATION
// =========================================================

export interface CampaignPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// =========================================================
// CAMPAIGN RESPONSE
// =========================================================

export interface CampaignsResponse {
  campaigns: CampaignGridRow[];
  pagination: CampaignPagination;
}

// =========================================================
// CAMPAIGN QUERY
// =========================================================

export interface CampaignQueryParams {
  page?: number;
  limit?: number;
  platform?: string;
  from?: string;
  to?: string;
  market?: string;
  subMarket?: string;
  brand?: string;
  subBrand?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// =========================================================
// CAMPAIGN FILTER OPTIONS
// =========================================================

export interface CampaignFilterOptions {
  brands: string[];
  subBrands: string[];
  markets: string[];
  subMarkets: string[];
}

export interface CampaignFilterOptionsArgs {
  platform?: string;
  market?: string;
  brand?: string;
}

// =========================================================
// RAW -> GRID
// =========================================================

function toGridRow(
  r: RawCampaign,
  i: number,
): CampaignGridRow {
  return {
    id: String(r.id ?? r._id ?? i),

    campaignName: String(
      r.CampaignName ??
        r.campaignName ??
        r.name ??
        "",
    ),

    platform: String(r.platform ?? ""),

    brandName: String(
      r.BrandName ??
        r.brandName ??
        "",
    ),

    subBrandName: String(
      r.SubBrandName ??
        r.subBrandName ??
        "",
    ),

    budget: Number(
      r.Budget ??
        r.budget ??
        0,
    ),

    spend: Number(
      r.Spend ??
        r.spend ??
        0,
    ),

    revenue: Number(
      r.Revenue ??
        r.revenue ??
        0,
    ),

    orders: Number(
      r.Orders ??
        r.orders ??
        0,
    ),

    roas: Number(
      r.Roas ??
        r.roas ??
        0,
    ),

    date: String(
      r.reportDate ??
        r.date ??
        "",
    ).slice(0, 10),
  };
}

// =========================================================
// SUMMARY ARGS
// =========================================================

export interface SummaryArgs {
  platforms: string[];
  from?: string;
  to?: string;
  market?: string;
  subMarket?: string;
  brand?: string;
  subBrand?: string;
}

// =========================================================
// LOCATION
// Matches GET /api/locations/list
// =========================================================

export interface LocationItem {
  id: string;
  platform: string;
  platformName: string;
  state: string;
  city: string;
  isActive: boolean;
}

export interface LocationsArgs {
  platform?: string;
}

// =========================================================
// SAFE RESPONSE TYPE GUARDS
// =========================================================

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

// =========================================================
// API
// =========================================================

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",

  baseQuery: fetchBaseQuery({
    // VITE_API_BASE_URL should include /api.
    // Example: https://example.com/api
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    credentials: "include",
  }),

  endpoints: (builder) => ({
    // =====================================================
    // PLATFORMS
    // =====================================================

    getPlatforms: builder.query<Platform[], void>({
      query: () => "/platforms",

      transformResponse: (res: {
        data: {
          platforms: Platform[];
        };
      }) => res.data.platforms,
    }),

    // =====================================================
    // DASHBOARD SUMMARY
    // =====================================================

    getDashboardSummary: builder.query<
      DashboardSummary,
      SummaryArgs
    >({
      query: ({
        platforms,
        from,
        to,
        market,
        subMarket,
        brand,
        subBrand,
      }) => ({
        url: "/dashboard/summary",

        params: {
          platform: platforms.length
            ? platforms.join(",")
            : undefined,

          from: from || undefined,
          to: to || undefined,

          market: market || undefined,
          subMarket: subMarket || undefined,
          brand: brand || undefined,
          subBrand: subBrand || undefined,
        },
      }),

      // Expected: { message, data: DashboardSummary, success }
      transformResponse: (res: {
        data: DashboardSummary;
      }): DashboardSummary => res.data,
    }),

    // =====================================================
    // CAMPAIGNS
    // =====================================================

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
        market,
        subMarket,
        brand,
        subBrand,
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

          market: market || undefined,
          subMarket: subMarket || undefined,
          brand: brand || undefined,
          subBrand: subBrand || undefined,

          search: search || undefined,
          sortBy,
          sortOrder,
        },
      }),

      transformResponse: (res: {
        data:
          | {
              campaigns?: RawCampaign[];
              items?: RawCampaign[];
              rows?: RawCampaign[];
              pagination?: CampaignPagination;
            }
          | RawCampaign[];
      }): CampaignsResponse => {
        const data = res.data;

        const response = isRecord(data)
          ? data
          : undefined;

        const list: RawCampaign[] = Array.isArray(data)
          ? data.filter(isRecord)
          : Array.isArray(response?.campaigns)
            ? response.campaigns.filter(isRecord)
            : Array.isArray(response?.items)
              ? response.items.filter(isRecord)
              : Array.isArray(response?.rows)
                ? response.rows.filter(isRecord)
                : [];

        const campaigns = list.map(toGridRow);
        const rawPagination = response?.pagination;

        const pagination: CampaignPagination =
          isRecord(rawPagination) &&
          typeof rawPagination.page === "number" &&
          typeof rawPagination.limit === "number" &&
          typeof rawPagination.total === "number" &&
          typeof rawPagination.totalPages === "number"
            ? {
                page: rawPagination.page,
                limit: rawPagination.limit,
                total: rawPagination.total,
                totalPages: rawPagination.totalPages,
              }
            : {
                page: 1,
                limit: campaigns.length,
                total: campaigns.length,
                totalPages: 1,
              };

        return {
          campaigns,
          pagination,
        };
      },
    }),

    // =====================================================
    // CAMPAIGN FILTER OPTIONS
    // Used for Brand and Sub-brand
    // =====================================================

    getCampaignFilterOptions: builder.query<
      CampaignFilterOptions,
      CampaignFilterOptionsArgs
    >({
      query: ({
        platform,
        market,
        brand,
      }) => ({
        url: "/campaigns/filter-options",

        params: {
          platform:
            platform && platform !== "all"
              ? platform
              : undefined,

          market: market || undefined,
          brand: brand || undefined,
        },
      }),

      transformResponse: (res: {
        data: Partial<CampaignFilterOptions>;
      }): CampaignFilterOptions => ({
        brands: res.data?.brands ?? [],
        subBrands: res.data?.subBrands ?? [],
        markets: res.data?.markets ?? [],
        subMarkets: res.data?.subMarkets ?? [],
      }),
    }),

    // =====================================================
    // LOCATIONS
    // Market = state
    // Submarket = city
    // No pagination on this endpoint
    // =====================================================

    getLocations: builder.query<
      LocationItem[],
      LocationsArgs | void
    >({
      query: (args) => ({
        url: "/locations/list",

        params: {
          platform:
            args?.platform &&
            args.platform !== "all"
              ? args.platform
              : undefined,
        },
      }),

      transformResponse: (res: {
        data: unknown;
      }): LocationItem[] => {
        const data: unknown = res.data;

        const response = isRecord(data)
          ? data
          : undefined;

        // Supports:
        // { data: { locations: [...] } }
        // { data: [...] }
        // { data: { items: [...] } }
        const rawList: unknown = Array.isArray(data)
          ? data
          : response?.locations ??
            response?.items ??
            response?.rows ??
            [];

        const list = Array.isArray(rawList)
          ? rawList.filter(isRecord)
          : [];

        return list
          .filter(
            (location) => location.isActive !== false,
          )
          .map(
            (location, index): LocationItem => ({
              id: String(
                location.id ??
                  location._id ??
                  index,
              ),

              platform: String(
                location.platform ?? "",
              ).trim().toLowerCase(),

              platformName: String(
                location.platformName ?? "",
              ),

              state: String(
                location.state ?? "",
              ).trim(),

              city: String(
                location.city ?? "",
              ).trim(),

              isActive: location.isActive !== false,
            }),
          );
      },
    }),
  }),
});

// =========================================================
// HOOKS
// =========================================================

export const {
  useGetPlatformsQuery,
  useGetDashboardSummaryQuery,
  useGetCampaignsQuery,
  useGetCampaignFilterOptionsQuery,
  useGetLocationsQuery,
} = dashboardApi;
