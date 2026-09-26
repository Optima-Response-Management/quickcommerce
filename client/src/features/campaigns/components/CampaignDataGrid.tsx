import Table, { type Column } from "../../../components/common/Table";
import type { CampaignRow } from "../types";
import { mockCampaignData } from "../mockData";

const columns: Column<CampaignRow>[] = [
  { key: "campaignName", label: "Campaign" },
  {
    key: "platform",
    label: "Platform",
    render: (row) => (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-brand-orange-dark">
        {row.platform}
      </span>
    ),
  },
  { key: "brandName", label: "Brand" },
  { key: "campaignType", label: "Type" },
  { key: "budget", label: "Budget", render: (row) => `₹${row.budget.toLocaleString()}` },
  { key: "spend", label: "Spend", render: (row) => `₹${row.spend.toLocaleString()}` },
  { key: "revenue", label: "Revenue", render: (row) => `₹${row.revenue.toLocaleString()}` },
  { key: "orders", label: "Orders" },
  { key: "roas", label: "ROAS", render: (row) => `${row.roas}x` },
  { key: "status", label: "Status" },
  {
    key: "uniqueConsiderations",
    label: "Unique Considerations",
    render: (row) => row.uniqueConsiderations ?? "—",
  },
  {
    key: "uniqueReach",
    label: "Unique Reach",
    render: (row) => row.uniqueReach ?? "—",
  },
];

export default function CampaignDataGrid() {
  return <Table data={mockCampaignData} columns={columns} pageSize={5} />;
}