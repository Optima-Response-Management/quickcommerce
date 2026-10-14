
import { useMemo, useState } from "react";

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
import DateRangeFilter from "../components/DateRangeFilter";
import {
  getRangeForPreset,
  type DateRange,
} from "../components/dateRangeUtils";
import PlatformFilter from "../components/PlatformFilter";

import {
  useGetCampaignsQuery,
  useGetCampaignFilterOptionsQuery,
  useGetDashboardSummaryQuery,
  useGetLocationsQuery,
} from "../dashboardApi";

import type { RootState } from "../../../app/store";

type FilterSelectProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

function FilterSelect({
  label,
  value,
  options,
  onChange,
  placeholder = "All",
  disabled = false,
}: FilterSelectProps) {
  return (
    <div className="w-full min-w-0">
      <label className="mb-1.5 block text-xs font-semibold text-brand-gray">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="h-11 w-full min-w-0 rounded-xl border border-brand-border bg-white px-3 text-sm text-brand-ink outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 disabled:cursor-not-allowed disabled:bg-brand-surface disabled:opacity-60"
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

// Local date formatting avoids UTC date shifts.
const toYMD = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;

function getMonthToDateRange(): DateRange {
  const now = new Date();

  return {
    ...getRangeForPreset("mtd"),
    from: toYMD(
      new Date(now.getFullYear(), now.getMonth(), 1),
    ),
    to: toYMD(now),
  };
}

// Normalize names such as "Tamil Nadu" and "Tamilnadu".
const normalizeLocationName = (
  value: string | null | undefined,
) =>
  (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

export default function CustomerDashboardPage() {
  const user = useSelector(
    (state: RootState) => state.auth.user,
  );

  const [range, setRange] =
    useState<DateRange>(getMonthToDateRange);

  const [selectedPlatforms, setSelectedPlatforms] =
    useState<string[]>([]);

  const [market, setMarket] = useState("");
  const [subMarket, setSubMarket] = useState("");
  const [brand, setBrand] = useState("");
  const [subBrand, setSubBrand] = useState("");

  /**
   * The backend must enforce the authenticated user's
   * platform permissions independently of these filters.
   *
   * Empty allowedPlatforms means the user has all-platform
   * access, based on the existing user model.
   */
  const allowedPlatforms = useMemo(() => {
    if (!user || user.platformAccess === "all") {
      return [];
    }

    return Array.isArray(user.platforms)
      ? user.platforms.map((platform) =>
          platform.toLowerCase(),
        )
      : [];
  }, [user]);

  const hasRestrictedPlatformAccess =
    Boolean(user) && user?.platformAccess !== "all";

  /**
   * Only users with all-platform access can choose arbitrary
   * platforms. Restricted users retain their assigned access.
   */
  const effectivePlatforms = useMemo(() => {
    if (hasRestrictedPlatformAccess) {
      if (selectedPlatforms.length === 0) {
        return allowedPlatforms;
      }

      return selectedPlatforms.filter((platform) =>
        allowedPlatforms.includes(platform.toLowerCase()),
      );
    }

    return selectedPlatforms.map((platform) =>
      platform.toLowerCase(),
    );
  }, [
    hasRestrictedPlatformAccess,
    selectedPlatforms,
    allowedPlatforms,
  ]);

  const selectedPlatformParam =
    effectivePlatforms.length > 0
      ? effectivePlatforms.join(",")
      : undefined;

  /**
   * Locations provide Market (state) and Submarket (city).
   */
  const {
    data: locations = [],
    isLoading: locationsLoading,
    isError: locationsError,
  } = useGetLocationsQuery(
    {
      platform: selectedPlatformParam,
    },
    {
      skip: !user,
    },
  );

  const platformLocations = useMemo(() => {
    if (effectivePlatforms.length === 0) {
      return locations;
    }

    const platformSet = new Set(
      effectivePlatforms.map((platform) =>
        platform.toLowerCase(),
      ),
    );

    return locations.filter((location) =>
      platformSet.has(location.platform.toLowerCase()),
    );
  }, [locations, effectivePlatforms]);

  /**
   * Brand and Sub-brand options come from the existing
   * campaign filter-options endpoint.
   */
  const filterOptionsPlatform =
    effectivePlatforms.length === 1
      ? effectivePlatforms[0]
      : undefined;

  const {
    data: filterOptions,
    isLoading: filterOptionsLoading,
    isError: filterOptionsError,
  } = useGetCampaignFilterOptionsQuery(
    {
      platform: filterOptionsPlatform,
      market: market || undefined,
      brand: brand || undefined,
    },
    {
      skip: !user,
    },
  );

  /**
   * Dashboard metrics respond to every selected filter.
   */
  const {
    data: dashboard,
    isLoading: dashboardLoading,
    isFetching: dashboardFetching,
    isError: dashboardError,
    refetch: refetchDashboard,
  } = useGetDashboardSummaryQuery(
    {
      platforms: effectivePlatforms,
      from: range.from || undefined,
      to: range.to || undefined,
      market: market || undefined,
      subMarket: subMarket || undefined,
      brand: brand || undefined,
      subBrand: subBrand || undefined,
    },
    {
      skip: !user,
    },
  );

  /**
   * Preserve the existing permission requirement for
   * the campaign table.
   */
  const canViewDataGrid =
    user?.role === "super_admin" ||
    user?.features?.includes("data_grid");

  /**
   * Campaign table uses the same active filters as analytics.
   * The API currently loads the first 20 matching records.
   */
  const {
    data: campaignsResponse,
    isLoading: campaignsLoading,
    isFetching: campaignsFetching,
    isError: campaignsError,
    refetch: refetchCampaigns,
  } = useGetCampaignsQuery(
    {
      page: 1,
      limit: 20,
      platform:
        effectivePlatforms.length > 0
          ? effectivePlatforms.join(",")
          : undefined,
      from: range.from || undefined,
      to: range.to || undefined,
      market: market || undefined,
      subMarket: subMarket || undefined,
      brand: brand || undefined,
      subBrand: subBrand || undefined,
    },
    {
      skip: !user || !canViewDataGrid,
    },
  );

  /**
   * Market options.
   * Use the locations endpoint as the main source, with
   * dashboard breakdowns as a fallback.
   */
  const markets = useMemo(() => {
    const locationMarkets = platformLocations
      .map((location) => location.state.trim())
      .filter(Boolean);

    const dashboardMarkets = (dashboard?.byMarket ?? [])
      .map((item) => item.name.trim())
      .filter(Boolean);

    const availableMarkets =
      locationMarkets.length > 0
        ? locationMarkets
        : dashboardMarkets;

    const unique = new Map<string, string>();

    for (const name of availableMarkets) {
      const normalized = normalizeLocationName(name);

      if (normalized && !unique.has(normalized)) {
        unique.set(normalized, name);
      }
    }

    return [...unique.values()].sort((a, b) =>
      a.localeCompare(b),
    );
  }, [platformLocations, dashboard?.byMarket]);

  /**
   * Submarket depends on the selected Market.
   */
  const subMarkets = useMemo(() => {
    if (!market) {
      return [];
    }

    const selectedMarket =
      normalizeLocationName(market);

    const unique = new Map<string, string>();

    for (const location of platformLocations) {
      if (
        normalizeLocationName(location.state) !==
        selectedMarket
      ) {
        continue;
      }

      const city = location.city.trim();

      if (!city) {
        continue;
      }

      const normalizedCity =
        normalizeLocationName(city);

      if (!unique.has(normalizedCity)) {
        unique.set(normalizedCity, city);
      }
    }

    return [...unique.values()].sort((a, b) =>
      a.localeCompare(b),
    );
  }, [platformLocations, market]);

  const brands = filterOptions?.brands ?? [];
  const subBrands = filterOptions?.subBrands ?? [];

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

  const campaigns = campaignsResponse?.campaigns ?? [];

  const handlePlatformsChange = (
    nextPlatforms: string[],
  ) => {
    setSelectedPlatforms(nextPlatforms);
    setMarket("");
    setSubMarket("");
    setBrand("");
    setSubBrand("");
  };

  const handleMarketChange = (nextMarket: string) => {
    setMarket(nextMarket);
    setSubMarket("");
    setBrand("");
    setSubBrand("");
  };

  const handleBrandChange = (nextBrand: string) => {
    setBrand(nextBrand);
    setSubBrand("");
  };

  const handleClearFilters = () => {
    setSelectedPlatforms([]);
    setRange(getMonthToDateRange());
    setMarket("");
    setSubMarket("");
    setBrand("");
    setSubBrand("");
  };

  const handleRefresh = () => {
    void refetchDashboard();

    if (canViewDataGrid) {
      void refetchCampaigns();
    }
  };

  const chartByPlatform = useMemo(
    () =>
      (dashboard?.byPlatform ?? []).map((item) => ({
        label: item.platformName ?? item.platform,
        budget: Number(item.Budget ?? 0),
        spend: Number(item.Spend ?? 0),
        revenue: Number(item.Revenue ?? 0),
        orders: Number(item.Orders ?? 0),
      })),
    [dashboard?.byPlatform],
  );

  const chartByDate = useMemo(
    () =>
      (dashboard?.byDate ?? []).map((item) => ({
        label: item.reportDate,
        budget: Number(item.Budget ?? 0),
        spend: Number(item.Spend ?? 0),
        revenue: Number(item.Revenue ?? 0),
        orders: Number(item.Orders ?? 0),
      })),
    [dashboard?.byDate],
  );

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
    <div className="w-full min-w-0 space-y-6">
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

      {/* FILTERS */}
      <section className="w-full min-w-0 rounded-xl border border-brand-border bg-white p-3 shadow-sm sm:p-4">
        <div className="mb-4 flex items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full bg-brand-primary" />

          <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-brand-gray">
            Filters
          </h3>
        </div>

        <div className="space-y-4">
          {/* PLATFORM AND DATE RANGE */}
          <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-2">
            {!hasRestrictedPlatformAccess ? (
              <PlatformFilter
                selected={selectedPlatforms}
                onChange={handlePlatformsChange}
              />
            ) : (
              <div className="w-full min-w-0">
                <label className="mb-1.5 block text-xs font-semibold text-brand-gray">
                  Platform Access
                </label>

                <div className="flex min-h-11 items-center rounded-xl border border-brand-border bg-brand-surface px-3.5 py-2.5 text-sm text-brand-ink">
                  {allowedPlatforms.length > 0
                    ? `${allowedPlatforms.length} assigned platform${
                        allowedPlatforms.length === 1 ? "" : "s"
                      }`
                    : "Assigned platforms"}
                </div>
              </div>
            )}

            <DateRangeFilter
              value={range}
              onChange={setRange}
            />
          </div>

          {/* MARKET, SUBMARKET, BRAND, SUB-BRAND */}
          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <FilterSelect
              label="Market"
              value={market}
              options={markets}
              onChange={handleMarketChange}
              placeholder={
                locationsLoading
                  ? "Loading markets..."
                  : locationsError
                    ? "Could not load markets"
                    : "All Markets"
              }
              disabled={
                locationsLoading ||
                locationsError ||
                markets.length === 0
              }
            />

            <FilterSelect
              label="Submarket"
              value={subMarket}
              options={subMarkets}
              onChange={setSubMarket}
              placeholder={
                !market
                  ? "Select a market first"
                  : locationsLoading
                    ? "Loading submarkets..."
                    : "All Submarkets"
              }
              disabled={
                !market ||
                locationsLoading ||
                locationsError ||
                subMarkets.length === 0
              }
            />

            <FilterSelect
              label="Brand"
              value={brand}
              options={brands}
              onChange={handleBrandChange}
              placeholder={
                filterOptionsLoading
                  ? "Loading brands..."
                  : filterOptionsError
                    ? "Could not load brands"
                    : "All Brands"
              }
              disabled={
                filterOptionsLoading ||
                filterOptionsError ||
                brands.length === 0
              }
            />

            <FilterSelect
              label="Sub-brand"
              value={subBrand}
              options={subBrands}
              onChange={setSubBrand}
              placeholder={
                !brand
                  ? "Select a brand first"
                  : filterOptionsLoading
                    ? "Loading sub-brands..."
                    : "All Sub-brands"
              }
              disabled={
                !brand ||
                filterOptionsLoading ||
                filterOptionsError ||
                subBrands.length === 0
              }
            />
          </div>

          {/* CLEAR FILTERS */}
          <div className="flex justify-end border-t border-brand-border-light pt-3">
            <button
              type="button"
              onClick={handleClearFilters}
              className="rounded-lg px-3 py-2 text-xs font-semibold text-brand-gray transition hover:bg-brand-surface hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              Clear filters
            </button>
          </div>
        </div>
      </section>

      {/* DASHBOARD ERROR */}
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

      {/* KPI CARDS */}
      <section
        aria-label="Campaign performance metrics"
        aria-busy={dashboardLoading}
        className={`grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 ${
          dashboardFetching ? "opacity-70" : ""
        }`}
      >
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
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

              {dashboardLoading ? (
                <div className="h-8 w-32 animate-pulse rounded-md bg-brand-surface" />
              ) : (
                <p className="text-2xl font-bold text-brand-ink">
                  {stat.value}
                </p>
              )}

              <p className="mt-2 text-xs font-medium text-brand-gray">
                {stat.sub}
              </p>
            </article>
          );
        })}
      </section>

      {/* NO DATA STATE */}
      {!dashboardLoading &&
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
              No campaign records match your current filters
              or assigned platform access.
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

      
    </div>
  );
}
