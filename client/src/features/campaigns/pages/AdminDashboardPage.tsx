import { Link } from "react-router";
import { Upload, TrendingUp } from "lucide-react";
import BudgetSpendChart from "../components/BudgetSpendChart";
import { mockCampaignData } from "../mockData";

export default function AdminDashboardPage() {
  const totalBudget = mockCampaignData.reduce((sum, c) => sum + c.budget, 0);
  const totalSpend = mockCampaignData.reduce((sum, c) => sum + c.spend, 0);
  const totalRevenue = mockCampaignData.reduce((sum, c) => sum + c.revenue, 0);
  const totalOrders = mockCampaignData.reduce((sum, c) => sum + c.orders, 0);
  const avgRoas = (mockCampaignData.reduce((sum, c) => sum + c.roas, 0) / mockCampaignData.length).toFixed(2);
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

      <div className="grid grid-cols-5 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-brand-gray font-medium mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-brand-black">{s.value}</p>
            {s.sub && <p className="text-xs text-brand-orange-dark font-medium mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="col-span-2">
          <BudgetSpendChart data={mockCampaignData} height={240} />
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-brand-gray uppercase tracking-wide">
                {["Campaign", "Platform", "Brand", "Budget", "Spend", "Revenue", "Orders", "ROAS", "Status"].map((h) => (
                  <th key={h} className="px-5 py-3 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockCampaignData.map((c, i) => (
                <tr key={i} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-brand-black whitespace-nowrap">{c.campaignName}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-brand-orange-dark whitespace-nowrap">
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
    </div>
  );
}