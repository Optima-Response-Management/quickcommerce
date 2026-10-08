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

type RawCampaign =
  Record<string, any>;

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

  brand?: string;

  subBrand?: string;

  search?: string;

  sortBy?: string;

  sortOrder?: "asc" | "desc";
}

// =========================================================
// FILTER OPTIONS
// =========================================================

export interface CampaignFilterOptions {
  brands: string[];

  subBrands: string[];
}

// =========================================================
// RAW -> GRID
// =========================================================

function toGridRow(
  r: RawCampaign,
  i: number,
): CampaignGridRow {
  return {
    id: String(
      r.id ??
        r._id ??
        i,
    ),

    campaignName:
      r.CampaignName ??
      r.campaignName ??
      r.name ??
      "",

    platform:
      r.platform ?? "",

    brandName:
      r.BrandName ??
      r.brandName ??
      "",

    subBrandName:
      r.SubBrandName ??
      r.subBrandName ??
      "",

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

interface SummaryArgs {
  platforms: string[];

  from?: string;

  to?: string;
}

// =========================================================
// LOCATION
// =========================================================

export interface LocationItem {
  id: string;

  platform: string;

  state: string;

  city: string;

  brands: {
    name: string;
    products: string[];
  }[];
}

// =========================================================
// API
// =========================================================

export const dashboardApi =
  createApi({
    reducerPath:
      "dashboardApi",

    baseQuery:
      fetchBaseQuery({
        baseUrl:
          import.meta.env
            .VITE_API_BASE_URL,

        credentials: "include",
      }),

    endpoints: (builder) => ({
      // =====================================================
      // PLATFORMS
      // =====================================================

      getPlatforms:
        builder.query<
          Platform[],
          void
        >({
          query: () =>
            "/platforms",

          transformResponse: (
            res: {
              data: {
                platforms: Platform[];
              };
            },
          ) =>
            res.data
              .platforms,
        }),

      // =====================================================
      // DASHBOARD SUMMARY
      // =====================================================

      getDashboardSummary:
        builder.query<
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
              platform:
                platforms.length
                  ? platforms.join(
                      ",",
                    )
                  : undefined,

              from:
                from ||
                undefined,

              to:
                to ||
                undefined,
            },
          }),

          transformResponse: (
            res: {
              data: DashboardSummary;
            },
          ) =>
            res.data,
        }),

      // =====================================================
      // CAMPAIGNS
      // =====================================================

      getCampaigns:
        builder.query<
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
            subBrand,

            search,

            sortBy =
              "reportDate",

            sortOrder =
              "desc",
          }) => ({
            url: "/campaigns",

            params: {
              page,

              limit,

              platform:
                platform ||
                undefined,

              from:
                from ||
                undefined,

              to:
                to ||
                undefined,

              brand:
                brand ||
                undefined,

              subBrand:
                subBrand ||
                undefined,

              search:
                search ||
                undefined,

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
            },
          ): CampaignsResponse => {
            const data =
              res.data;

            const list: RawCampaign[] =
              Array.isArray(data)
                ? data
                : data?.campaigns ??
                  data?.items ??
                  data?.rows ??
                  [];

            const campaigns =
              list.map(
                toGridRow,
              );

            const pagination =
              data?.pagination ??
              {
                page: 1,

                limit:
                  campaigns.length,

                total:
                  campaigns.length,

                totalPages:
                  campaigns.length >
                  0
                    ? 1
                    : 1,
              };

            return {
              campaigns,

              pagination,
            };
          },
        }),

      // =====================================================
      // CAMPAIGN FILTER OPTIONS
      // =====================================================

      getCampaignFilterOptions:
        builder.query<
          CampaignFilterOptions,
          {
            platform?: string;
            brand?: string;
          }
        >({
          query: ({
            platform,
            brand,
          }) => ({
            url:
              "/campaigns/filter-options",

            params: {
              platform:
                platform &&
                platform !== "all"
                  ? platform
                  : undefined,

              brand:
                brand &&
                brand !== "all"
                  ? brand
                  : undefined,
            },
          }),

          transformResponse: (
            res: {
              data: CampaignFilterOptions;
            },
          ) =>
            res.data,
        }),

      // =====================================================
      // LOCATIONS
      // =====================================================

      getLocations:
        builder.query<
          LocationItem[],
          void
        >({
          query: () =>
            "/locations",

          transformResponse: (
            res: {
              data: unknown;
            },
          ) => {
            const d =
              res.data as any;

            const list =
              Array.isArray(d)
                ? d
                : d?.locations ??
                  d?.items ??
                  d?.rows ??
                  [];

            return list
              .filter(
                (l: any) =>
                  l.isActive !==
                  false,
              )
              .map(
                (
                  l: any,
                  i: number,
                ) => ({
                  id: String(
                    l.id ??
                      l._id ??
                      i,
                  ),

                  platform:
                    String(
                      l.platform ??
                        "",
                    ).toLowerCase(),

                  state:
                    l.state ?? "",

                  city:
                    l.city ?? "",

                  brands:
                    Array.isArray(
                      l.brands,
                    )
                      ? l.brands.map(
                          (
                            b: any,
                          ) => ({
                            name: String(
                              b.name ??
                                "",
                            ),

                            products:
                              Array.isArray(
                                b.products,
                              )
                                ? b.products.map(
                                    String,
                                  )
                                : [],
                          }),
                        )
                      : [],
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