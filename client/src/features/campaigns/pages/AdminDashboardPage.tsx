import { useMemo, useState } from "react";
import BudgetSpendChart from "../components/BudgetSpendChart";
import DateRangeFilter, { getRangeForPreset, type DateRange } from "../components/DateRangeFilter";
import PlatformFilter from "../components/PlatformFilter";
import { useGetDashboardSummaryQuery } from "../dashboardApi";

// Local date as YYYY-MM-DD (toISOString would shift the day for IST)
const toYMD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// 1st of the current month up to today
function getMonthToDateRange(): DateRange {
  const now = new Date();
  return {
    ...getRangeForPreset("thisMonth"),
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-brand-ink mb-1">Admin Dashboard</h2>
          <p className="text-sm text-brand-gray">Full visibility across all uploaded campaign data</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        <PlatformFilter selected={platforms} onChange={setPlatforms} />
        <DateRangeFilter value={range} onChange={setRange} />
      </div>

      {isError && (
        <div className="flex items-center justify-between text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">
          <span>Could not load dashboard data.</span>
          <button onClick={() => refetch()} className="font-medium underline">
            Retry
          </button>
        </div>
      )}

      <div className={`grid grid-cols-5 gap-4 mb-6 ${isLoading ? "opacity-60" : ""}`}>
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-brand-border p-5">
            <p className="text-xs text-brand-gray font-medium mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-brand-ink">{isLoading ? "—" : s.value}</p>
            {s.sub && !isLoading && (
              <p className="text-xs text-brand-primary-dark font-medium mt-1">{s.sub}</p>
            )}
          </div>
        ))}
      </div>

      <BudgetSpendChart byPlatform={byPlatform} byDate={byDate} height={240} />
          </div>
  );
}