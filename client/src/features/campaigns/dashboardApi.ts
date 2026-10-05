import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Platform {
  id: string;
  name: string;
  slug: string;
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

interface SummaryArgs {
  platforms: string[]; // slugs
  from?: string;
  to?: string;
}

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getPlatforms: builder.query<Platform[], void>({
      query: () => "/platforms",
      transformResponse: (res: { data: { platforms: Platform[] } }) => res.data.platforms,
    }),
    getDashboardSummary: builder.query<DashboardSummary, SummaryArgs>({
      query: ({ platforms, from, to }) => ({
        url: "/dashboard/summary", // change if your route is different
        params: {
          platforms: platforms.length ? platforms.join(",") : undefined,
          from: from || undefined,
          to: to || undefined,
        },
      }),
      transformResponse: (res: { data: DashboardSummary }) => res.data,
    }),
  }),
});

export const { useGetPlatformsQuery, useGetDashboardSummaryQuery } = dashboardApi;