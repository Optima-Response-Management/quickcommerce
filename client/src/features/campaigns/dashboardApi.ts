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

export interface CampaignGridRow {
  id: string;
  campaignName: string;
  platform: string;
  budget: number;
  spend: number;
  revenue: number;
  date: string; // YYYY-MM-DD
}

type RawCampaign = Record<string, any>;

function toGridRow(r: RawCampaign, i: number): CampaignGridRow {
  return {
    id: String(r.id ?? r._id ?? i),
    campaignName: r.CampaignName ?? r.campaignName ?? r.name ?? "",
    platform: r.platform ?? "",
    budget: Number(r.Budget ?? r.budget ?? 0),
    spend: Number(r.Spend ?? r.spend ?? 0),
    revenue: Number(r.Revenue ?? r.revenue ?? 0),
    date: String(r.reportDate ?? r.date ?? "").slice(0, 10),
  };
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
          platform: platforms.length ? platforms.join(",") : undefined,
          from: from || undefined,
          to: to || undefined,
        },
      
      }),
      
      transformResponse: (res: { data: DashboardSummary }) => res.data,
      
    }),
    getCampaigns: builder.query<CampaignGridRow[], void>({
      query: () => "/campaigns",
      transformResponse: (res: { data: unknown }) => {
        const d = res.data as any;
        const list: RawCampaign[] = Array.isArray(d)
          ? d
          : d?.campaigns ?? d?.items ?? d?.rows ?? [];
        return list.map(toGridRow);
      },
    }),
  }),
});

export const { useGetPlatformsQuery, useGetDashboardSummaryQuery , useGetCampaignsQuery} = dashboardApi;