import { useState, useMemo } from "react";
import FilterBar, { type FilterOption } from "../components/FilterBar";
import Table, { type Column } from "../../../components/common/Table";
import { mockCampaignData, mockCityData } from "../mockData";
import type { CampaignRow, CityRow } from "../types";

const ALL: FilterOption = { label: "All", value: "all" };
const DATE_OPTIONS: FilterOption[] = [
  ALL,
  { label: "Today", value: "today" },
  { label: "Last 7 Days", value: "last7" },
  { label: "Last 30 Days", value: "last30" },
  { label: "This Month", value: "thisMonth" },
];

export default function DataGridPage() {
  const [tab, setTab] = useState<"campaign" | "city">("campaign");

  const [platform, setPlatform] = useState("all");
  const [date, setDate] = useState("all");
  const [market, setMarket] = useState("all");
  const [brand, setBrand] = useState("all");
  const [product, setProduct] = useState("all");

  const [applied, setApplied] = useState({ platform: "all", market: "all", brand: "all" });

  const source = tab === "campaign" ? mockCampaignData : mockCityData;

  const platformOptions: FilterOption[] = [
    ALL,
    ...Array.from(new Set(source.map((r) => r.platform))).map((p) => ({ label: p, value: p })),
  ];
  const marketOptions: FilterOption[] =
    tab === "city"
      ? [ALL, ...Array.from(new Set((source as CityRow[]).map((r) => r.market))).map((m) => ({ label: m, value: m }))]
      : [ALL];
  const brandOptions: FilterOption[] =
    tab === "campaign"
      ? [ALL, ...Array.from(new Set((source as CampaignRow[]).map((r) => r.brandName))).map((b) => ({ label: b, value: b }))]
      : [ALL];
  const productOptions: FilterOption[] = [ALL];

  const filteredData = useMemo(() => {
    return source.filter((row: any) => {
      if (applied.platform !== "all" && row.platform !== applied.platform) return false;
      if (applied.market !== "all" && row.market !== applied.market) return false;
      if (applied.brand !== "all" && row.brandName !== applied.brand) return false;
      return true;
    });
  }, [source, applied]);

  const campaignColumns: Column<CampaignRow>[] = [
    { key: "campaignName", label: "Campaign" },
    {
      key: "platform",
      label: "Platform",
      render: (r) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-brand-orange-dark">
          {r.platform}
        </span>
      ),
    },
    { key: "brandName", label: "Brand" },
    { key: "campaignType", label: "Type" },
    { key: "budget", label: "Budget", render: (r) => `₹${r.budget.toLocaleString()}` },
    { key: "spend", label: "Spend", render: (r) => `₹${r.spend.toLocaleString()}` },
    { key: "revenue", label: "Revenue", render: (r) => `₹${r.revenue.toLocaleString()}` },
    { key: "orders", label: "Orders" },
    { key: "roas", label: "ROAS", render: (r) => `${r.roas}x` },
    { key: "status", label: "Status" },
    { key: "uniqueConsiderations", label: "Unique Considerations", render: (r) => r.uniqueConsiderations ?? "—" },
    { key: "uniqueReach", label: "Unique Reach", render: (r) => r.uniqueReach ?? "—" },
  ];

  const cityColumns: Column<CityRow>[] = [
    {
      key: "platform",
      label: "Platform",
      render: (r) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-brand-orange-dark">
          {r.platform}
        </span>
      ),
    },
    { key: "market", label: "Market" },
    { key: "city", label: "City" },
    { key: "spend", label: "Spend", render: (r) => (r.spend ? `₹${r.spend.toLocaleString()}` : "—") },
    { key: "revenue", label: "Revenue", render: (r) => `₹${r.revenue.toLocaleString()}` },
    { key: "orders", label: "Orders" },
    { key: "roas", label: "ROAS", render: (r) => (r.roas ? `${r.roas}x` : "—") },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-brand-black mb-1">Campaign Dashboard</h2>
      <p className="text-sm text-brand-gray mb-6">Sortable, filterable view of extracted campaign data</p>

      <div className="flex gap-1 mb-5 bg-gray-100 rounded-lg p-1 w-fit">
        {(["campaign", "city"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-md text-sm font-semibold transition-colors ${
              tab === t ? "bg-brand-black text-white" : "text-brand-gray hover:text-brand-black"
            }`}
          >
            {t === "campaign" ? "Campaign Wise" : "City Wise"}
          </button>
        ))}
      </div>

      <FilterBar
        platformOptions={platformOptions}
        dateOptions={DATE_OPTIONS}
        marketOptions={marketOptions}
        brandOptions={brandOptions}
        productOptions={productOptions}
        platform={platform}
        date={date}
        market={market}
        brand={brand}
        product={product}
        onPlatformChange={setPlatform}
        onDateChange={setDate}
        onMarketChange={setMarket}
        onBrandChange={setBrand}
        onProductChange={setProduct}
        onApply={() => setApplied({ platform, market, brand })}
      />

      {tab === "campaign" ? (
        <Table
          data={filteredData as CampaignRow[]}
          columns={campaignColumns}
          title={`${platform === "all" ? "All" : platform} Campaign Report`}
          pageSize={10}
        />
      ) : (
        <Table
          data={filteredData as CityRow[]}
          columns={cityColumns}
          title={`${platform === "all" ? "All" : platform} City Report`}
          pageSize={10}
        />
      )}
    </div>
  );
}