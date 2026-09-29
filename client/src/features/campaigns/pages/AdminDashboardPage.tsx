import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Upload } from "lucide-react";
import BudgetSpendChart from "../components/BudgetSpendChart";
import DateRangeFilter, { getRangeForPreset, type DateRange } from "../components/DateRangeFilter";
import PlatformFilter from "../components/PlatformFilter";
import { mockCampaignData } from "../mockData";

export default function AdminDashboardPage() {
  const [range, setRange] = useState<DateRange>(getRangeForPreset("yesterday"));
  const [platforms, setPlatforms] = useState<string[]>([]);

  const filtered = useMemo(
    () =>
      mockCampaignData.filter(
        (c) =>
          (!range.from || c.date >= range.from) &&
          (!range.to || c.date <= range.to) &&
          (platforms.length === 0 || platforms.includes(c.platform))
      ),
    [range, platforms]
  );

  const totalBudget = filtered.reduce((sum, c) => sum + c.budget, 0);
  const totalSpend = filtered.reduce((sum, c) => sum + c.spend, 0);
  const totalRevenue = filtered.reduce((sum, c) => sum + c.revenue, 0);
  const totalOrders = filtered.reduce((sum, c) => sum + c.orders, 0);
  const avgRoas = filtered.length
    ? (filtered.reduce((sum, c) => sum + c.roas, 0) / filtered.length).toFixed(2)
    : "0.00";
  const utilisation = totalBudget ? Math.round((totalSpend / totalBudget) * 100) : 0;

  const stats = [
    { label: "Total Budget", value: `₹${totalBudget.toLocaleString()}`, sub: `${utilisation}% utilised` },
    { label: "Total Spend", value: `₹${totalSpend.toLocaleString()}` },
    { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}` },
    { label: "Total Orders", value: totalOrders.toLocaleString() },
    { label: "Avg. ROAS", value: `${avgRoas}x` },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-brand-ink mb-1">Admin Dashboard</h2>
          <p className="text-sm text-brand-gray">Full visibility across all uploaded campaign data</p>
        </div>
        <Link
          to="/admin/upload"
          className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-dark text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload Data
        </Link>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        <PlatformFilter selected={platforms} onChange={setPlatforms} />
        <DateRangeFilter value={range} onChange={setRange} />
      </div>

      <div className="grid grid-cols-5 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-brand-gray font-medium mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-brand-ink">{s.value}</p>
            {s.sub && <p className="text-xs text-brand-primary-dark font-medium mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>

      <BudgetSpendChart data={filtered} height={240} />
    </div>
  );
}