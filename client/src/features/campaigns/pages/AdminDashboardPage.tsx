
import { useMemo, useState } from "react";

import BudgetSpendChart from "../components/BudgetSpendChart";
import DateRangeFilter from "../components/DateRangeFilter";
import {
  getRangeForPreset,
  type DateRange,
} from "../components/dateRangeUtils";
import PlatformFilter from "../components/PlatformFilter";

import {
  useGetCampaignFilterOptionsQuery,
  useGetDashboardSummaryQuery,
  useGetLocationsQuery,
} from "../dashboardApi";

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
        className="h-10 w-full min-w-0 rounded-xl border border-brand-border bg-white px-3 text-sm text-brand-ink outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 disabled:cursor-not-allowed disabled:bg-brand-surface disabled:opacity-60"
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

// Local date as YYYY-MM-DD to avoid UTC date shifts.
const toYMD = (date: Date) =>
  `${date.getFullYear()}-${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

// First day of the current month through today.
function getMonthToDateRange(): DateRange {
  const now = new Date();

  return {
    ...getRangeForPreset("mtd"),
    from: toYMD(
      new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      ),
    ),
    to: toYMD(now),
  };
}

// Normalize names so "Tamilnadu", "Tamil Nadu",
// and "TAMIL NADU" compare as the same location.
const normalizeLocationName = (
  value: string | null | undefined,
) =>
  (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

export default function AdminDashboardPage() {
  const [range, setRange] =
    useState<DateRange>(getMonthToDateRange);

  const [platforms, setPlatforms] = useState<string[]>([]);
  const [market, setMarket] = useState("");
  const [subMarket, setSubMarket] = useState("");
  const [brand, setBrand] = useState("");
  const [subBrand, setSubBrand] = useState("");

  // Convert selected platforms to the format expected
  // by GET /locations/list.
  const selectedPlatform =
    platforms.length > 0
      ? platforms
          .map((platform) => platform.toLowerCase())
          .join(",")
      : undefined;

  // Market and Submarket options come from the locations API.
  // The API returns all matching records without pagination.
  const {
    data: locations = [],
    isLoading: isLocationsLoading,
    isError: isLocationsError,
  } = useGetLocationsQuery({
    platform: selectedPlatform,
  });

  // Brand and Sub-brand options come from campaign filter options.
  const filterOptionsPlatform =
    platforms.length === 1
      ? platforms[0].toLowerCase()
      : undefined;

  const {
    data: filterOptions,
    isLoading: isFilterOptionsLoading,
  } = useGetCampaignFilterOptionsQuery({
    platform: filterOptionsPlatform,
    market: market || undefined,
    brand: brand || undefined,
  });

  // Filter locations by the selected platforms.
  const platformLocations = useMemo(() => {
    if (platforms.length === 0) {
      return locations;
    }

    const selected = new Set(
      platforms.map((platform) =>
        platform.toLowerCase(),
      ),
    );

    return locations.filter((location) =>
      selected.has(location.platform.toLowerCase()),
    );
  }, [locations, platforms]);

  // Fetch dashboard metrics using the selected filters.
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGetDashboardSummaryQuery({
    platforms: platforms.map((platform) =>
      platform.toLowerCase(),
    ),
    from: range.from
      ? String(range.from)
      : undefined,
    to: range.to
      ? String(range.to)
      : undefined,
    market: market || undefined,
    subMarket: subMarket || undefined,
    brand: brand || undefined,
    subBrand: subBrand || undefined,
  });

  // Market is represented by the state's name.
  // Prefer dashboard breakdown labels so campaign data labels
  // remain consistent with the existing dashboard.
  const markets = useMemo(() => {
    const dashboardMarkets = (data?.byMarket ?? [])
      .map((item) => item.name.trim())
      .filter(Boolean);

    const locationMarkets = platformLocations
      .map((location) => location.state.trim())
      .filter(Boolean);

    const availableMarkets =
      dashboardMarkets.length > 0
        ? dashboardMarkets
        : locationMarkets;

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
  }, [data?.byMarket, platformLocations]);

  // Submarket is represented by the city's name.
  // Match market names after normalization to handle
  // variations such as "Tamilnadu" and "Tamil Nadu".
  const subMarkets = useMemo(() => {
    if (!market) {
      return [];
    }

    const selectedMarket = normalizeLocationName(market);

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

      const normalizedCity = normalizeLocationName(city);

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

  const handlePlatformsChange = (
    nextPlatforms: string[],
  ) => {
    setPlatforms(nextPlatforms);
    setMarket("");
    setSubMarket("");
    setBrand("");
    setSubBrand("");
  };

  const handleMarketChange = (nextMarket: string) => {
    setMarket(nextMarket);
    setSubMarket("");
  };

  const handleBrandChange = (nextBrand: string) => {
    setBrand(nextBrand);
    setSubBrand("");
  };

  const handleClearFilters = () => {
    setPlatforms([]);
    setRange(getMonthToDateRange());
    setMarket("");
    setSubMarket("");
    setBrand("");
    setSubBrand("");
  };

  const totals = data?.totals;

  // Convert platform API data to the chart's expected format.
  const byPlatform = useMemo(
    () =>
      (data?.byPlatform ?? []).map((platform) => ({
        label: platform.platformName,
        budget: platform.Budget,
        spend: platform.Spend,
        revenue: platform.Revenue,
        orders: platform.Orders,
      })),
    [data],
  );

  // Convert date API data to the chart's expected format.
  const byDate = useMemo(
    () =>
      (data?.byDate ?? []).map((date) => ({
        label: date.reportDate,
        budget: date.Budget,
        spend: date.Spend,
        revenue: date.Revenue,
        orders: date.Orders,
      })),
    [data],
  );

  const stats = [
    {
      label: "Total Budget",
      value: `₹${(
        totals?.Budget ?? 0
      ).toLocaleString("en-IN")}`,
      sub: `${totals?.utilisation ?? 0}% utilised`,
    },
    {
      label: "Total Spend",
      value: `₹${(
        totals?.Spend ?? 0
      ).toLocaleString("en-IN")}`,
      sub: `${totals?.utilisation ?? 0}% utilised`,
    },
    {
      label: "Total Revenue",
      value: `₹${(
        totals?.Revenue ?? 0
      ).toLocaleString("en-IN")}`,
    },
    {
      label: "Total Orders",
      value: (
        totals?.Orders ?? 0
      ).toLocaleString("en-IN"),
    },
    {
      label: "Avg. ROAS",
      value: `${(
        totals?.avgRoas ?? 0
      ).toFixed(2)}x`,
    },
  ];

  return (
    <div className="page-enter w-full min-w-0 max-w-full space-y-4 sm:space-y-6">
      {/* Filters */}
      <section className="w-full min-w-0 rounded-2xl border border-brand-border bg-white p-3 shadow-brand-sm sm:p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-2 w-2 shrink-0 rounded-full bg-brand-primary" />

          <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-gray sm:tracking-[0.15em]">
            Filters
          </p>
        </div>

        <div className="space-y-4">
          {/* Platform and Date Range */}
          <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="w-full min-w-0">
              <PlatformFilter
                selected={platforms}
                onChange={handlePlatformsChange}
              />
            </div>

            <div className="w-full min-w-0">
              <DateRangeFilter
                value={range}
                onChange={setRange}
              />
            </div>
          </div>

          {/* Market, Submarket, Brand and Sub-brand */}
          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <FilterSelect
              label="Market"
              value={market}
              options={markets}
              onChange={handleMarketChange}
              placeholder={
                isLocationsLoading
                  ? "Loading markets..."
                  : isLocationsError
                    ? "Could not load markets"
                    : "All Markets"
              }
              disabled={
                isLocationsLoading ||
                isLocationsError
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
                  : isLocationsLoading
                    ? "Loading submarkets..."
                    : isLocationsError
                      ? "Could not load submarkets"
                      : "All Submarkets"
              }
              disabled={
                !market ||
                isLocationsLoading ||
                isLocationsError
              }
            />

            <FilterSelect
              label="Brand"
              value={brand}
              options={brands}
              onChange={handleBrandChange}
              placeholder={
                isFilterOptionsLoading
                  ? "Loading brands..."
                  : "All Brands"
              }
              disabled={isFilterOptionsLoading}
            />

            <FilterSelect
              label="Sub-brand"
              value={subBrand}
              options={subBrands}
              onChange={setSubBrand}
              placeholder={
                !brand
                  ? "Select a brand first"
                  : isFilterOptionsLoading
                    ? "Loading sub-brands..."
                    : "All Sub-brands"
              }
              disabled={
                !brand || isFilterOptionsLoading
              }
            />
          </div>

          {/* Clear Filters */}
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

      {/* Error State */}
      {isError && (
        <div className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
          <span>Could not load dashboard data.</span>

          <button
            type="button"
            onClick={() => refetch()}
            className="self-start rounded-lg font-semibold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 sm:self-auto"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <section
        aria-label="Campaign performance metrics"
        aria-busy={isLoading}
        className={`grid min-w-0 grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:gap-4 xl:grid-cols-5 ${
          isLoading ? "opacity-70" : ""
        }`}
      >
        {stats.map((stat, index) => (
          <article
            key={stat.label}
            className="stagger-item ui-card min-w-0 rounded-2xl p-4 sm:p-5"
          >
            <div className="mb-4 flex min-w-0 items-center justify-between gap-2 sm:mb-5">
              <p className="min-w-0 break-words text-xs font-semibold text-brand-gray">
                {stat.label}
              </p>

              <div className="h-2 w-2 shrink-0 rounded-full bg-brand-primary/60" />
            </div>

            <p className="break-words text-xl font-bold tracking-[-0.03em] text-brand-ink min-[380px]:text-2xl">
              {isLoading ? "—" : stat.value}
            </p>

            {stat.sub && !isLoading && (
              <p className="mt-2 break-words text-[11px] font-semibold text-brand-primary-dark">
                {stat.sub}
              </p>
            )}

            <div className="mt-4 h-1 overflow-hidden rounded-full bg-brand-surface sm:mt-5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-600"
                style={{
                  width: `${Math.min(
                    100,
                    35 + index * 13,
                  )}%`,
                }}
              />
            </div>
          </article>
        ))}
      </section>

      {/* Budget and Spend Chart */}
      <section className="w-full min-w-0 overflow-hidden rounded-2xl border border-brand-border bg-white shadow-brand-sm">
        <div className="flex min-w-0 flex-col gap-3 border-b border-brand-border-light px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-brand-ink">
              Budget &amp; spend
            </h2>

            <p className="mt-1 text-xs leading-5 text-brand-gray">
              Performance across the selected period
            </p>
          </div>

          {/* Chart Legend */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-2 text-[11px] text-brand-gray">
              <span className="h-2 w-2 shrink-0 rounded-full bg-brand-primary" />
              Spend
            </div>

            <div className="flex items-center gap-2 text-[11px] text-brand-gray">
              <span className="h-2 w-2 shrink-0 rounded-full bg-brand-ink" />
              Budget
            </div>
          </div>
        </div>

        <div className="w-full min-w-0 p-2 sm:p-4 md:p-6">
          <div className="w-full min-w-0">
            <BudgetSpendChart
              byPlatform={byPlatform}
              byDate={byDate}
              height={280}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
