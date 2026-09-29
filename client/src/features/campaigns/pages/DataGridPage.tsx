import { useState, useMemo } from "react";
import FilterBar from "../components/FilterBar";
import Table, { type Column } from "../../../components/common/Table";
import { mockCampaignData, mockCityData } from "../mockData";
import {
  platformOptions,
  marketOptions,
  brandOptions,
  productOptions,
  dateOptions,
} from "../filterOptions";
import { matchesDate, type DateFilterValue } from "../dateUtils";
import type { CampaignRow, CityRow } from "../types";

interface AppliedFilters {
  platform: string;
  market: string;
  brand: string;
  product: string;
  date: DateFilterValue;
}

const INITIAL_FILTERS: AppliedFilters = {
  platform: "all",
  market: "all",
  brand: "all",
  product: "all",
  date: { preset: "all" },
};

const platformBadge = (name: string) => (
  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-primary-soft text-brand-primary-dark">
    {name}
  </span>
);

export default function DataGridPage() {
  const [tab, setTab] = useState<"campaign" | "city">("campaign");

  // Draft values (what the dropdowns show) vs applied values (what the table uses)
  const [platform, setPlatform] = useState("all");
  const [market, setMarket] = useState("all");
  const [brand, setBrand] = useState("all");
  const [product, setProduct] = useState("all");
  const [date, setDate] = useState<DateFilterValue>({ preset: "all" });
  const [applied, setApplied] = useState<AppliedFilters>(INITIAL_FILTERS);

  const source = tab === "campaign" ? mockCampaignData : mockCityData;

  const filteredData = useMemo(() => {
    return source.filter((row: any) => {
      if (applied.platform !== "all" && row.platform !== applied.platform) return false;
      if (applied.market !== "all" && row.market !== applied.market) return false;
      if (applied.brand !== "all" && row.brandName !== applied.brand) return false;
      if (applied.product !== "all" && row.product !== applied.product) return false;
      return matchesDate(row.date, applied.date);
    });
  }, [source, applied]);

  const campaignColumns: Column<CampaignRow>[] = [
    { key: "campaignName", label: "Campaign" },
    { key: "platform", label: "Platform", render: (r) => platformBadge(r.platform) },
    { key: "brandName", label: "Brand" },
    { key: "product", label: "Product" },
    { key: "market", label: "Market" },
    { key: "campaignType", label: "Type" },
    { key: "budget", label: "Budget", render: (r) => `₹${r.budget.toLocaleString()}` },
    { key: "spend", label: "Spend", render: (r) => `₹${r.spend.toLocaleString()}` },
    { key: "revenue", label: "Revenue", render: (r) => `₹${r.revenue.toLocaleString()}` },
    { key: "orders", label: "Orders" },
    { key: "roas", label: "ROAS", render: (r) => `${r.roas}x` },
    { key: "status", label: "Status" },
    { key: "date", label: "Date" },
  ];

  const cityColumns: Column<CityRow>[] = [
    { key: "platform", label: "Platform", render: (r) => platformBadge(r.platform) },
    { key: "brandName", label: "Brand" },
    { key: "product", label: "Product" },
    { key: "market", label: "Market" },
    { key: "city", label: "City" },
    { key: "spend", label: "Spend", render: (r) => (r.spend ? `₹${r.spend.toLocaleString()}` : "—") },
    { key: "revenue", label: "Revenue", render: (r) => `₹${r.revenue.toLocaleString()}` },
    { key: "orders", label: "Orders" },
    { key: "roas", label: "ROAS", render: (r) => (r.roas ? `${r.roas}x` : "—") },
    { key: "date", label: "Date" },
  ];

  const platformTitle = applied.platform === "all" ? "All" : applied.platform;
  // Remounts the table when filters change so page/search/sort reset cleanly
  const tableKey = `${tab}-${JSON.stringify(applied)}`;

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
        dateOptions={dateOptions}
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
        onApply={() => setApplied({ platform, market, brand, product, date })}
      />

      {tab === "campaign" ? (
        <Table
          key={tableKey}
          data={filteredData as CampaignRow[]}
          columns={campaignColumns}
          title={`${platformTitle} Campaign Report`}
          pageSize={10}
        />
      ) : (
        <Table
          key={tableKey}
          data={filteredData as CityRow[]}
          columns={cityColumns}
          title={`${platformTitle} City Report`}
          pageSize={10}
        />
      )}
    </div>
  );
}