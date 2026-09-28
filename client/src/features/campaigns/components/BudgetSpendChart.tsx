import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import type { CampaignRow } from "../types";

interface BudgetSpendChartProps {
  data: CampaignRow[];
  height?: number;
}

export default function BudgetSpendChart({ data, height = 260 }: BudgetSpendChartProps) {
  const byPlatform = Object.values(
    data.reduce((acc, c) => {
      acc[c.platform] = acc[c.platform] || { platform: c.platform, budget: 0, spend: 0 };
      acc[c.platform].budget += c.budget;
      acc[c.platform].spend += c.spend;
      return acc;
    }, {} as Record<string, { platform: string; budget: number; spend: number }>)
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-brand-black mb-4">Budget vs Spend by Platform</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={byPlatform}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="platform" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
          <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
          <Tooltip
            formatter={(v) => `₹${Number(v).toLocaleString()}`}
            contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="budget" name="Budget" fill="#171717" radius={[6, 6, 0, 0]} />
          <Bar dataKey="spend" name="Spend" fill="#FF6B00" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}