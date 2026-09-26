import Table, { type Column } from "../../../components/common/Table";
import type { CityRow } from "../types";
import { mockCityData } from "../mockData";

const columns: Column<CityRow>[] = [
  {
    key: "platform",
    label: "Platform",
    render: (row) => (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-brand-orange-dark">
        {row.platform}
      </span>
    ),
  },
  { key: "market", label: "Market" },
  { key: "city", label: "City" },
  { key: "spend", label: "Spend", render: (row) => (row.spend ? `₹${row.spend.toLocaleString()}` : "—") },
  { key: "revenue", label: "Revenue", render: (row) => `₹${row.revenue.toLocaleString()}` },
  { key: "orders", label: "Orders" },
  { key: "roas", label: "ROAS", render: (row) => (row.roas ? `${row.roas}x` : "—") },
];

export default function CityDataGrid() {
  return <Table data={mockCityData} columns={columns} pageSize={5} />;
}