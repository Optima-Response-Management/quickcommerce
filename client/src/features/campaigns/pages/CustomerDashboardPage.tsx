import BudgetSpendChart from "../components/BudgetSpendChart";
import { mockCampaignData } from "../mockData";

export default function CustomerDashboardPage() {
  const totalBudget = mockCampaignData.reduce((sum, c) => sum + c.budget, 0);
  const totalSpend = mockCampaignData.reduce((sum, c) => sum + c.spend, 0);
  const totalRevenue = mockCampaignData.reduce((sum, c) => sum + c.revenue, 0);
  const avgRoas = (mockCampaignData.reduce((sum, c) => sum + c.roas, 0) / mockCampaignData.length).toFixed(2);
  const utilisation = totalBudget ? Math.round((totalSpend / totalBudget) * 100) : 0;

  const stats = [
    { label: "Total Budget", value: `₹${totalBudget.toLocaleString()}`, sub: `${utilisation}% utilised` },
    { label: "Total Spend", value: `₹${totalSpend.toLocaleString()}` },
    { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}` },
    { label: "Avg. ROAS", value: `${avgRoas}x` },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-brand-black mb-1">Campaign Overview</h2>
      <p className="text-sm text-brand-gray mb-6">Processed data and insights across your campaigns</p>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-brand-gray font-medium mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-brand-black">{s.value}</p>
            {s.sub && <p className="text-xs text-brand-primary-dark font-medium mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>

      <div className="mb-6">
        <BudgetSpendChart data={mockCampaignData} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-brand-black">Campaigns</h3>
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
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-primary-soft text-brand-primary-dark whitespace-nowrap">
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