
import { useMemo } from "react";

import {
  AlertCircle,
  BarChart3,
  IndianRupee,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { useSelector } from "react-redux";

import BudgetSpendChart from "../components/BudgetSpendChart";
import {
  useGetCampaignsQuery,
  useGetDashboardSummaryQuery,
} from "../dashboardApi";
import type { RootState } from "../../../app/store";

export default function CustomerDashboardPage() {
  const user = useSelector((state: RootState) => state.auth.user);

  /**
   * The backend applies platform-level access filtering using
   * the authenticated user.
   *
   * For a custom-access user:
   * user.platforms = ["zepto", "blinkit"]
   *
   * For an "all" user, no platform filter is required.
   */
  const allowedPlatforms = useMemo(() => {
    if (!user) {
      return [];
    }

    if (user.platformAccess === "all") {
      return [];
    }

    return Array.isArray(user.platforms)
      ? user.platforms
      : [];
  }, [user]);

  /**
   * Dashboard summary.
   *
   * Backend returns totals, byPlatform and byDate.
   */
  const {
    data: dashboard,
    isLoading: dashboardLoading,
    isFetching: dashboardFetching,
    isError: dashboardError,
    refetch: refetchDashboard,
  } = useGetDashboardSummaryQuery(
    {
      platforms: allowedPlatforms,
    },
    {
      skip: !user,
    },
  );

  /**
   * Campaign table.
   *
   * /campaigns requires data_grid permission.
   * Dashboard-only users can still see their analytics.
   */
  const canViewDataGrid =
    user?.role === "super_admin" ||
    user?.features?.includes("data_grid");

  const {
    data: campaignsResponse,
    isLoading: campaignsLoading,
    isError: campaignsError,
    refetch: refetchCampaigns,
  } = useGetCampaignsQuery(
    {
      page: 1,
      limit: 20,
      platform:
        allowedPlatforms.length === 1
          ? allowedPlatforms[0]
          : undefined,
    },
    {
      skip: !user || !canViewDataGrid,
    },
  );

  const totals = dashboard?.totals ?? {
    Budget: 0,
    Spend: 0,
    Revenue: 0,
    Orders: 0,
    Roas: 0,
    avgRoas: 0,
    utilisation: 0,
    campaignCount: 0,
  };

  const campaigns = Array.isArray(campaignsResponse?.campaigns)
    ? campaignsResponse.campaigns
    : [];

  const isLoading = dashboardLoading;

  const handleRefresh = () => {
    void refetchDashboard();

    if (canViewDataGrid) {
      void refetchCampaigns();
    }
  };

  /**
   * Convert backend platform data to the format expected
   * by BudgetSpendChart.
   *
   * Validation is inside useMemo to avoid creating new
   * fallback arrays on every render.
   */
  const chartByPlatform = (
    Array.isArray(dashboard?.byPlatform)
      ? dashboard.byPlatform
      : []
  ).map((item) => ({
    label: item.platformName ?? item.platform,
    budget: Number(item.Budget ?? 0),
    spend: Number(item.Spend ?? 0),
    revenue: Number(item.Revenue ?? 0),
    orders: Number(item.Orders ?? 0),
  }));
  
  const chartByDate = (
    Array.isArray(dashboard?.byDate)
      ? dashboard.byDate
      : []
  ).map((item) => ({
    label: item.reportDate,
    budget: Number(item.Budget ?? 0),
    spend: Number(item.Spend ?? 0),
    revenue: Number(item.Revenue ?? 0),
    orders: Number(item.Orders ?? 0),
  }));

  const stats = [
    {
      label: "Total Budget",
      value: `₹${Number(totals.Budget).toLocaleString("en-IN")}`,
      sub: `${totals.utilisation}% utilised`,
      icon: IndianRupee,
    },
    {
      label: "Total Spend",
      value: `₹${Number(totals.Spend).toLocaleString("en-IN")}`,
      sub:
        totals.Budget > 0
          ? `${totals.utilisation}% of budget`
          : "No budget data",
      icon: TrendingUp,
    },
    {
      label: "Total Revenue",
      value: `₹${Number(totals.Revenue).toLocaleString("en-IN")}`,
      sub: `${Number(totals.Orders).toLocaleString("en-IN")} orders`,
      icon: BarChart3,
    },
    {
      label: "ROAS",
      value: `${Number(totals.Roas).toFixed(2)}x`,
      sub: `Avg. ${Number(totals.avgRoas).toFixed(2)}x`,
      icon: ShoppingCart,
    },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-ink">
            Campaign Overview
          </h2>

          <p className="mt-1 text-sm text-brand-gray">
            Processed campaign performance and insights
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={dashboardFetching}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-brand-border bg-white px-3.5 py-2 text-sm font-medium text-brand-ink transition-colors hover:bg-brand-primary-soft disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              dashboardFetching ? "animate-spin" : ""
            }`}
          />

          {dashboardFetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ERROR */}
      {dashboardError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

          <div>
            <p className="text-sm font-semibold text-red-800">
              Unable to load dashboard data
            </p>

            <p className="mt-1 text-xs text-red-700">
              Please refresh the page or try again in a moment.
            </p>
          </div>
        </div>
      )}

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-xl border border-brand-border bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-medium text-brand-gray">
                  {stat.label}
                </p>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary-soft">
                  <Icon className="h-4 w-4 text-brand-primary-dark" />
                </div>
              </div>

              {isLoading ? (
                <div className="h-8 w-32 animate-pulse rounded-md bg-brand-surface" />
              ) : (
                <p className="text-2xl font-bold text-brand-ink">
                  {stat.value}
                </p>
              )}

              <p className="mt-2 text-xs font-medium text-brand-gray">
                {stat.sub}
              </p>
            </div>
          );
        })}
      </div>

      {/* NO DATA STATE */}
      {!isLoading &&
        !dashboardError &&
        totals.campaignCount === 0 && (
          <div className="rounded-xl border border-brand-border bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary-soft">
              <BarChart3 className="h-5 w-5 text-brand-primary-dark" />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-brand-ink">
              No campaign data available
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm text-brand-gray">
              There are currently no campaign records available
              for your assigned platform access.
            </p>
          </div>
        )}

      {/* CHART */}
      {totals.campaignCount > 0 && (
        <BudgetSpendChart
          byPlatform={chartByPlatform}
          byDate={chartByDate}
        />
      )}

      {/* CAMPAIGN TABLE */}
      {canViewDataGrid ? (
        <div className="overflow-hidden rounded-xl border border-brand-border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-brand-border-light px-5 py-4">
            <div>
              <h3 className="text-sm font-semibold text-brand-ink">
                Campaigns
              </h3>

              <p className="mt-1 text-xs text-brand-gray">
                Latest campaign records available to you
              </p>
            </div>

            <span className="rounded-full bg-brand-surface px-3 py-1 text-xs font-medium text-brand-gray">
              {campaignsResponse?.pagination?.total ?? campaigns.length}{" "}
              records
            </span>
          </div>

          {campaignsLoading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3, 4, 5].map((row) => (
                <div
                  key={row}
                  className="h-10 animate-pulse rounded-md bg-brand-surface"
                />
              ))}
            </div>
          ) : campaignsError ? (
            <div className="p-8 text-center">
              <p className="text-sm font-semibold text-brand-ink">
                Unable to load campaign records
              </p>

              <p className="mt-1 text-xs text-brand-gray">
                The dashboard is available, but campaign records
                could not be loaded.
              </p>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm font-semibold text-brand-ink">
                No campaign records
              </p>

              <p className="mt-1 text-sm text-brand-gray">
                No campaign records are available for your access.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-brand-surface text-left text-xs uppercase tracking-wide text-brand-gray">
                    {[
                      "Campaign",
                      "Platform",
                      "Budget",
                      "Spend",
                      "Revenue",
                      "Orders",
                      "Date",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="whitespace-nowrap px-5 py-3 font-medium"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {campaigns.map((campaign) => (
                    <tr
                      key={campaign.id}
                      className="border-t border-brand-border-light transition-colors hover:bg-brand-surface"
                    >
                      <td className="whitespace-nowrap px-5 py-3 font-medium text-brand-ink">
                        {campaign.campaignName || "—"}
                      </td>

                      <td className="px-5 py-3">
                        <span className="inline-flex whitespace-nowrap rounded-full bg-brand-primary-soft px-2.5 py-1 text-xs font-medium text-brand-primary-dark">
                          {campaign.platform || "—"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-3 text-brand-gray">
                        ₹
                        {Number(campaign.budget).toLocaleString(
                          "en-IN",
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-3 text-brand-gray">
                        ₹
                        {Number(campaign.spend).toLocaleString(
                          "en-IN",
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-3 text-brand-gray">
                        ₹
                        {Number(campaign.revenue).toLocaleString(
                          "en-IN",
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-3 text-brand-gray">
                        {Number(campaign.orders).toLocaleString(
                          "en-IN",
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-3 text-brand-gray">
                        {campaign.date || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* LIMITED USER STATE */
        <div className="rounded-xl border border-brand-border bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary-soft">
              <BarChart3 className="h-4 w-4 text-brand-primary-dark" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-brand-ink">
                Campaign records
              </h3>

              <p className="mt-1 text-sm text-brand-gray">
                You don&apos;t have Data Grid permission. Dashboard
                analytics are available based on your assigned access.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
