import { Link } from "react-router";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Upload, TrendingUp } from "lucide-react";
import { mockCampaignData } from "../mockData";

export default function AdminDashboardPage() {
  const totalSpend = mockCampaignData.reduce((sum, c) => sum + c.spend, 0);
  const totalRevenue = mockCampaignData.reduce((sum, c) => sum + c.revenue, 0);
  const totalOrders = mockCampaignData.reduce((sum, c) => sum + c.orders, 0);
  const avgRoas = (mockCampaignData.reduce((sum, c) => sum + c.roas, 0) / mockCampaignData.length).toFixed(2);

  const stats = [
    { label: "Total Spend", value: `₹${totalSpend.toLocaleString()}` },
    { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}` },
    { label: "Total Orders", value: totalOrders.toLocaleString() },
    { label: "Avg. ROAS", value: `${avgRoas}x` },
  ];

  const spendByPlatform = Object.values(
    mockCampaignData.reduce((acc, c) => {
      acc[c.platform] = acc[c.platform] || { platform: c.platform, spend: 0 };
      acc[c.platform].spend += c.spend;
      return acc;
    }, {} as Record<string, { platform: string; spend: number }>)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-brand-black mb-1">Admin Dashboard</h2>
          <p className="text-sm text-brand-gray">Full visibility across all uploaded campaign data</p>
        </div>
        <Link
          to="/admin/upload"
          className="flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload Data
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-brand-gray font-medium mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-brand-black">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-brand-black mb-4">Spend by Platform</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={spendByPlatform}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="platform" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }} />
              <Bar dataKey="spend" fill="#FF6B00" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-brand-black mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Link
              to="/admin/upload"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-brand-black hover:bg-orange-50 transition-colors"
            >
              <Upload className="w-4 h-4 text-brand-orange" />
              Upload new campaign file
            </Link>
            <Link
              to="/admin/grid"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-brand-black hover:bg-orange-50 transition-colors"
            >
              <TrendingUp className="w-4 h-4 text-brand-orange" />
              View raw data grid
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-brand-black">All Campaigns</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs text-brand-gray uppercase tracking-wide">
              <th className="px-5 py-3 font-medium">Campaign</th>
              <th className="px-5 py-3 font-medium">Platform</th>
              <th className="px-5 py-3 font-medium">Brand</th>
              <th className="px-5 py-3 font-medium">Budget</th>
              <th className="px-5 py-3 font-medium">Spend</th>
              <th className="px-5 py-3 font-medium">Revenue</th>
              <th className="px-5 py-3 font-medium">Orders</th>
              <th className="px-5 py-3 font-medium">ROAS</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockCampaignData.map((c, i) => (
              <tr key={i} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 font-medium text-brand-black">{c.campaignName}</td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-brand-orange-dark">
                    {c.platform}
                  </span>
                </td>
                <td className="px-5 py-3 text-brand-gray">{c.brandName}</td>
                <td className="px-5 py-3 text-brand-gray">₹{c.budget.toLocaleString()}</td>
                <td className="px-5 py-3 text-brand-gray">₹{c.spend.toLocaleString()}</td>
                <td className="px-5 py-3 text-brand-gray">₹{c.revenue.toLocaleString()}</td>
                <td className="px-5 py-3 text-brand-gray">{c.orders.toLocaleString()}</td>
                <td className="px-5 py-3 text-brand-gray">{c.roas}x</td>
                <td className="px-5 py-3 text-brand-gray">{c.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}