import { useMemo, useState } from "react";
import BudgetSpendChart from "../components/BudgetSpendChart";
import DateRangeFilter from "../components/DateRangeFilter";
import {
  getRangeForPreset,
  type DateRange,
} from "../components/dateRangeUtils";
import PlatformFilter from "../components/PlatformFilter";
import { useGetDashboardSummaryQuery } from "../dashboardApi";

// Local date as YYYY-MM-DD (toISOString would shift the day for IST)
const toYMD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// 1st of the current month up to today
function getMonthToDateRange(): DateRange {
  const now = new Date();
  return {
    ...getRangeForPreset("mtd"),
    from: toYMD(new Date(now.getFullYear(), now.getMonth(), 1)),
    to: toYMD(now),
  };
}

export default function AdminDashboardPage() {
  const [range, setRange] = useState<DateRange>(getMonthToDateRange);
  const [platforms, setPlatforms] = useState<string[]>([]);

  const { data, isLoading, isError, refetch } = useGetDashboardSummaryQuery({
    platforms: platforms.map((p) => p.toLowerCase()), // slugs are lowercase platform names
    from: range.from ? String(range.from) : undefined,
    to: range.to ? String(range.to) : undefined,
  });

  const totals = data?.totals;

  // Convert API byDate rows into the row shape the chart already uses
  const byPlatform = useMemo(
    () =>
      (data?.byPlatform ?? []).map((p) => ({
        label: p.platformName,
        budget: p.Budget,
        spend: p.Spend,
        revenue: p.Revenue,
        orders: p.Orders,
      })),
    [data]
  );

  const byDate = useMemo(
    () =>
      (data?.byDate ?? []).map((d) => ({
        label: d.reportDate,
        budget: d.Budget,
        spend: d.Spend,
        revenue: d.Revenue,
        orders: d.Orders,
      })),
    [data]
  );

  const stats = [
    {
      label: "Total Budget",
      value: `₹${(totals?.Budget ?? 0).toLocaleString()}`,
      sub: `${totals?.utilisation ?? 0}% utilised`,
    },
    {
      label: "Total Spend",
      value: `₹${(totals?.Spend ?? 0).toLocaleString()}`,
      sub: `${totals?.utilisation ?? 0}% utilised`,
    },
    { label: "Total Revenue", value: `₹${(totals?.Revenue ?? 0).toLocaleString()}` },
    { label: "Total Orders", value: (totals?.Orders ?? 0).toLocaleString() },
    { label: "Avg. ROAS", value: `${(totals?.avgRoas ?? 0).toFixed(2)}x` },
  ];
  return (
    <div className="page-enter space-y-6">
      

      {/* Filters */}
      <div className="rounded-2xl border border-brand-border bg-white p-4 shadow-brand-sm">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-brand-primary" />

          <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-gray">
            Filters
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <PlatformFilter
            selected={platforms}
            onChange={setPlatforms}
          />

          <DateRangeFilter
            value={range}
            onChange={setRange}
          />
        </div>
      </div>

      {/* Error */}
      {isError && (
        <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700">
          <span>
            Could not load dashboard data.
          </span>

          <button
            onClick={() => refetch()}
            className="font-semibold underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats */}
      <div
        className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-5 ${
          isLoading ? "opacity-60" : ""
        }`}
      >
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="stagger-item ui-card rounded-2xl p-5"
          >
            <div className="mb-5 flex items-center justify-between">
              <p className="text-xs font-semibold text-brand-gray">
                {stat.label}
              </p>

              <div className="h-2 w-2 rounded-full bg-brand-primary/60" />
            </div>

            <p className="text-2xl font-bold tracking-[-0.03em] text-brand-ink">
              {isLoading ? "—" : stat.value}
            </p>

            {stat.sub && !isLoading && (
              <p className="mt-2 text-[11px] font-semibold text-brand-primary-dark">
                {stat.sub}
              </p>
            )}

            <div className="mt-5 h-1 overflow-hidden rounded-full bg-brand-surface">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-600"
                style={{
                  width: `${Math.min(100, 35 + index * 13)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="overflow-hidden rounded-2xl border border-brand-border bg-white shadow-brand-sm">
        <div className="flex items-center justify-between border-b border-brand-border-light px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-brand-ink">
              Budget & spend
            </h2>

            <p className="mt-1 text-xs text-brand-gray">
              Performance across the selected period
            </p>
          </div>

          <div className="hidden items-center gap-4 sm:flex">
            <div className="flex items-center gap-2 text-[11px] text-brand-gray">
              <span className="h-2 w-2 rounded-full bg-brand-primary" />
              Spend
            </div>

            <div className="flex items-center gap-2 text-[11px] text-brand-gray">
              <span className="h-2 w-2 rounded-full bg-brand-ink" />
              Budget
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <BudgetSpendChart
            byPlatform={byPlatform}
            byDate={byDate}
            height={280}
          />
        </div>
      </div>
    </div>
  );
}