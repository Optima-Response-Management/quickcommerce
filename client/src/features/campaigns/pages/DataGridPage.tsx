import { useMemo, useState } from "react";
import {
  BarChart3,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Database,
  Filter,
  RefreshCw,
  Search,
  TrendingUp,
  X,
} from "lucide-react";

import FilterBar from "../components/FilterBar";
import Table, { type Column } from "../../../components/common/Table";
import { mockCityData } from "../mockData";
import { dateOptions, type FilterOption } from "../filterOptions";
import type { DateFilterValue } from "../dateUtils";
import type { CityRow } from "../types";
import {
  useGetCampaignsQuery,
  useGetPlatformsQuery,
  type CampaignGridRow,
} from "../dashboardApi";
import { useGridFilterOptions } from "../useGridFilterOptions";

interface AppliedFilters {
  platform: string;
  market: string; // State
  city: string;
  brand: string;
  product: string;
  date: DateFilterValue;
}

type FilterKey = "platform" | "market" | "city" | "brand" | "product";
type ChipKey = FilterKey | "date";

// Removing a filter also clears the ones that depend on it
const DEPENDENTS: Record<FilterKey, FilterKey[]> = {
  platform: ["market", "city", "brand", "product"],
  market: ["city", "brand", "product"],
  city: ["brand", "product"],
  brand: [],
  product: [],
};

const INITIAL_FILTERS: AppliedFilters = {
  platform: "all",
  market: "all",
  city: "all",
  brand: "all",
  product: "all",
  date: { preset: "all" },
};

const PAGE_SIZE = 20;
const CITY_WISE_ENABLED = false;

const platformBadge = (name: string) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-primary/10 bg-brand-primary-soft px-2.5 py-1 text-xs font-semibold text-brand-primary-dark">
    <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
    {name}
  </span>
);

const withAll = (label: string, items: string[]): FilterOption[] => [
  { value: "all", label },
  ...items.map((v) => ({ value: v, label: v })),
];

export default function DataGridPage() {
  const [tab, setTab] = useState<"campaign" | "city">("campaign");

  // ============================================================
  // Draft filter state (what the dropdowns show)
  // ============================================================

  const [platform, setPlatform] = useState("all");
  const [market, setMarket] = useState("all"); // State
  const [city, setCity] = useState("all");
  const [brand, setBrand] = useState("all");
  const [product, setProduct] = useState("all");
  const [date, setDate] = useState<DateFilterValue>({ preset: "all" });

  // ============================================================
  // Applied filters (what the table and the API use)
  // ============================================================

  const [applied, setApplied] = useState<AppliedFilters>(INITIAL_FILTERS);

  // ============================================================
  // Server pagination
  // ============================================================

  const [page, setPage] = useState(1);

  // ============================================================
  // Dropdown options that depend on the selected platform
  // ============================================================

  const { data: platforms = [] } = useGetPlatformsQuery();
  const filterLists = useGridFilterOptions(platform, market, city, brand, product);
  const platformOptions: FilterOption[] = [
    { value: "all", label: "All Platforms" },
    ...platforms.map((p) => ({ value: p.slug, label: p.name })),
  ];
  const stateOptions = withAll("All States", filterLists.states);
  const cityOptions = withAll("All Cities", filterLists.cities);
  const brandOptions = withAll("All Brands", filterLists.brands);
  const productOptions = withAll("All Products", filterLists.products);

  // A higher filter changing clears everything below it
  const handlePlatformChange = (v: string) => {
    setPlatform(v);
    setMarket("all");
    setCity("all");
    setBrand("all");
    setProduct("all");
  };

  

  const handleBrandChange = (v: string) => {
    setBrand(v);
    setProduct("all");
  };

  const handleCityChange = (v: string) => {
    setCity(v);
    setBrand("all");
    setProduct("all");
  };

  const handleStateChange = (v: string) => {
    setMarket(v);
    setCity("all");
    setBrand("all");
    setProduct("all");
  };

  // ============================================================
  // Campaign API (server-side pagination and filters)
  //
  // Expected response:
  // { campaigns: [], pagination: { page, limit, total, totalPages } }
  // ============================================================

  const {
    data: campaignResponse,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetCampaignsQuery({
    page,
    limit: PAGE_SIZE,
    platform: applied.platform !== "all" ? applied.platform : undefined,
    state: applied.market !== "all" ? applied.market : undefined,
    city: applied.city !== "all" ? applied.city : undefined,
    brand: applied.brand !== "all" ? applied.brand : undefined,
    product: applied.product !== "all" ? applied.product : undefined,
  });

  const campaigns = campaignResponse?.campaigns ?? [];
  const pagination = campaignResponse?.pagination;
  const totalCampaigns = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;

  // Campaign rows come already filtered by the server
  const filteredCampaigns = campaigns;

  // ============================================================
  // Tab, apply and clear handlers
  // ============================================================

  const handleTabChange = (nextTab: "campaign" | "city") => {
    setTab(nextTab);
    setPage(1);
  };

  const handleApplyFilters = () => {
    setPage(1);
    setApplied({ platform, market, city, brand, product, date });
  };

  const handleClearFilters = () => {
    setPlatform("all");
    setMarket("all");
    setCity("all");
    setBrand("all");
    setProduct("all");
    setDate({ preset: "all" });

    setApplied(INITIAL_FILTERS);
    setPage(1);
  };

    // The "x" on an active filter chip: removes that filter and updates the table right away
    const removeFilter = (key: ChipKey) => {
      setPage(1);
  
      if (key === "date") {
        setDate({ preset: "all" });
        setApplied((prev) => ({ ...prev, date: { preset: "all" } }));
        return;
      }
  
      const keys: FilterKey[] = [key, ...DEPENDENTS[key]];
      const setters: Record<FilterKey, (v: string) => void> = {
        platform: setPlatform,
        market: setMarket,
        city: setCity,
        brand: setBrand,
        product: setProduct,
      };
  
      keys.forEach((k) => setters[k]("all"));
      setApplied((prev) => {
        const next = { ...prev };
        keys.forEach((k) => {
          next[k] = "all";
        });
        return next;
      });
    };

  // ============================================================
  // City data (mock until its API is ready)
  // ============================================================

  const filteredCityData = useMemo(() => {
    return mockCityData.filter((row: any) => {
      if (
        applied.platform !== "all" &&
        String(row.platform).toLowerCase() !== applied.platform.toLowerCase()
      ) {
        return false;
      }
      if (applied.market !== "all" && row.market !== applied.market) return false;
      if (applied.brand !== "all" && row.brandName !== applied.brand) return false;
      if (applied.product !== "all" && row.product !== applied.product) return false;
      return true;
    });
  }, [applied]);

  // ============================================================
  // Campaign columns
  // ============================================================

  const campaignColumns: Column<CampaignGridRow>[] = [
    {
      key: "campaignName",
      label: "Campaign Name",
      render: (r) => (
        <div className="flex min-w-[220px] items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary-soft text-brand-primary-dark">
            <BarChart3 size={17} />
          </div>

          <div className="min-w-0">
            <p className="truncate font-semibold text-brand-ink">{r.campaignName}</p>
            <p className="mt-0.5 text-xs capitalize text-brand-gray">
              {r.platform || "Campaign"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "budget",
      label: "Budget",
      render: (r) => (
        <span className="font-medium text-brand-ink">
          ₹{Number(r.budget ?? 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "spend",
      label: "Spend",
      render: (r) => (
        <span className="font-medium text-brand-ink">
          ₹{Number(r.spend ?? 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "revenue",
      label: "Revenue",
      render: (r) => (
        <span className="font-semibold text-emerald-600">
          ₹{Number(r.revenue ?? 0).toLocaleString()}
        </span>
      ),
    },

    {
      key: "orders",
      label: "Orders",
      render: (r) => (
        <span className="font-medium text-brand-ink">
          {Number(r.orders ?? 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (r) => (
        <div className="flex items-center gap-2 text-sm text-brand-gray">
          <CalendarDays size={14} />
          {r.date}
        </div>
      ),
    },
  ];

  // ============================================================
  // City columns
  // ============================================================

  const cityColumns: Column<CityRow>[] = [
    {
      key: "platform",
      label: "Platform",
      render: (r) => platformBadge(r.platform),
    },
    {
      key: "brandName",
      label: "Brand",
      render: (r) => <span className="font-semibold text-brand-ink">{r.brandName}</span>,
    },
    {
      key: "product",
      label: "Product",
      render: (r) => <span className="text-brand-gray">{r.product}</span>,
    },
    {
      key: "market",
      label: "Market",
      render: (r) => (
        <span className="inline-flex items-center rounded-md bg-brand-primary-soft px-2 py-1 text-xs font-medium text-brand-gray">
          {r.market}
        </span>
      ),
    },
    {
      key: "city",
      label: "City",
      render: (r) => (
        <div className="flex items-center gap-2">
          <Building2 size={14} className="text-brand-gray" />
          <span className="font-medium text-brand-ink">{r.city}</span>
        </div>
      ),
    },
    {
      key: "spend",
      label: "Spend",
      render: (r) => (
        <span className="font-medium text-brand-ink">
          {r.spend ? `₹${r.spend.toLocaleString()}` : "—"}
        </span>
      ),
    },
    {
      key: "revenue",
      label: "Revenue",
      render: (r) => (
        <span className="font-semibold text-emerald-600">₹{r.revenue.toLocaleString()}</span>
      ),
    },
    {
      key: "orders",
      label: "Orders",
      render: (r) => (
        <span className="font-medium text-brand-ink">{r.orders.toLocaleString()}</span>
      ),
    },
    {
      key: "roas",
      label: "ROAS",
      render: (r) =>
        r.roas ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
            <TrendingUp size={13} />
            {r.roas}x
          </span>
        ) : (
          <span className="text-brand-gray">—</span>
        ),
    },
    {
      key: "date",
      label: "Date",
      render: (r) => (
        <div className="flex items-center gap-2 text-sm text-brand-gray">
          <CalendarDays size={14} />
          {r.date}
        </div>
      ),
    },
  ];

  // ============================================================
  // Active filters (count and chips)
  // ============================================================

  const platformLabel =
    platforms.find((p) => p.slug === applied.platform)?.name ?? applied.platform;

  const dateLabel = (() => {
    if (applied.date.preset === "all") return "";
    if (applied.date.preset === "custom") {
      return applied.date.from && applied.date.to
        ? `${applied.date.from} → ${applied.date.to}`
        : "Custom range";
    }
    return (
      dateOptions.find((o) => o.value === applied.date.preset)?.label ?? applied.date.preset
    );
  })();

  const activeChips = [
    applied.platform !== "all" && { key: "platform", label: "Platform", value: platformLabel },
    applied.market !== "all" && { key: "market", label: "State", value: applied.market },
    applied.city !== "all" && { key: "city", label: "City", value: applied.city },
    applied.product !== "all" && { key: "product", label: "Product", value: applied.product },
    applied.brand !== "all" && { key: "brand", label: "Brand", value: applied.brand },
    applied.date.preset !== "all" && { key: "date", label: "Date", value: dateLabel },
  ].filter(Boolean) as { key: ChipKey; label: string; value: string }[];

  const activeFilterCount = activeChips.length;

  const platformTitle = applied.platform === "all" ? "All Platforms" : platformLabel;

  // ============================================================
  // Current data
  // ============================================================

  const currentData = tab === "campaign" ? filteredCampaigns : filteredCityData;

  const recordCount = tab === "campaign" ? totalCampaigns : filteredCityData.length;

  // ============================================================
  // Pagination helpers
  // ============================================================

  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  const goToPreviousPage = () => {
    if (!canGoPrevious) return;
    setPage((current) => current - 1);
  };

  const goToNextPage = () => {
    if (!canGoNext) return;
    setPage((current) => current + 1);
  };

  const goToPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;
    setPage(nextPage);
  };

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    let start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [page, totalPages]);

  const pageButton =
    "flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-semibold transition-colors";
  const pageButtonIdle =
    "border border-brand-border bg-white text-brand-gray hover:bg-brand-primary-soft hover:text-brand-primary-dark";

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="min-h-full pb-10">
      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-ink">Data Grid</h2>
          <p className="mt-1 text-sm text-brand-gray">
            Browse, filter and review your extracted campaign data
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-brand-border bg-white px-4 py-2 text-xs font-semibold text-brand-ink shadow-sm transition-colors hover:bg-brand-primary-soft disabled:opacity-60"
        >
          <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ======================================================
          TABS
      ======================================================= */}

      <div className="mb-5">
        <div className="inline-flex w-fit rounded-xl border border-brand-border bg-white p-1.5 shadow-sm">
          {(["campaign", "city"] as const).map((t) => {
            const active = tab === t;
            const isCityDisabled = t === "city" && !CITY_WISE_ENABLED;

            return (
              <button
                key={t}
                type="button"
                onClick={() => {
                  if (isCityDisabled) return;
                  handleTabChange(t);
                }}
                disabled={isCityDisabled}
                className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  isCityDisabled
                    ? "cursor-not-allowed text-brand-gray-light opacity-70"
                    : active
                      ? "bg-brand-primary text-white shadow-sm shadow-orange-500/20"
                      : "text-brand-gray hover:bg-brand-orange-tint hover:text-brand-primary-dark"
                }`}
              >
                {t === "campaign" ? <BarChart3 size={16} /> : <Building2 size={16} />}

                {t === "campaign" ? "Campaign Wise" : "City Wise"}

                {isCityDisabled && (
                  <span className="rounded-full bg-brand-primary-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-primary-dark">
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================
          FILTERS
      ======================================================= */}

      <div className="mb-6 overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-brand-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary-soft text-brand-primary-dark">
              <Filter size={17} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-brand-ink">Filters</h3>

                {activeFilterCount > 0 && (
                  <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-brand-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </div>

              <p className="text-xs text-brand-gray">
                Choose a platform to see its states, cities, brands and products
              </p>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-brand-gray transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <X size={14} />
              Clear filters
            </button>
          )}
        </div>

        <div className="p-5">
          <FilterBar
            platformOptions={platformOptions}
            dateOptions={dateOptions}
            marketOptions={stateOptions}
            cityOptions={cityOptions}
            brandOptions={brandOptions}
            productOptions={productOptions}
            platform={platform}
            date={date}
            market={market}
            city={city}
            brand={brand}
            product={product}
            onPlatformChange={handlePlatformChange}
            onDateChange={setDate}
            onMarketChange={handleStateChange}
            onCityChange={setCity}
            onBrandChange={handleBrandChange}
            onProductChange={setProduct}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
            onBrandChange={setBrand}
          />
        </div>

        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t border-brand-border bg-brand-offwhite px-5 py-3">
            <span className="mr-1 text-xs font-medium text-brand-gray">Active filters:</span>

            {activeChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => removeFilter(chip.key)}
                aria-label={`Remove ${chip.label} filter`}
                className="group inline-flex items-center gap-1.5 rounded-full border border-brand-primary/20 bg-brand-primary-soft py-1 pl-3 pr-1.5 text-xs font-semibold text-brand-primary-dark transition-colors hover:border-brand-primary hover:bg-brand-primary hover:text-white"
              >
                <span className="font-medium text-brand-gray group-hover:text-white/80">
                  {chip.label}:
                </span>
                {chip.value}
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/70 group-hover:bg-white/25">
                  <X size={11} />
                </span>
              </button>
            ))}

            <button
              type="button"
              onClick={handleClearFilters}
              className="ml-1 text-xs font-semibold text-brand-gray underline-offset-2 transition-colors hover:text-red-600 hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ======================================================
          ERROR
      ======================================================= */}

      {tab === "campaign" && isError && (
        <div className="mb-5 rounded-xl border border-red-200 bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <Database size={17} />
              </div>

              <div>
                <p className="text-sm font-semibold text-red-700">Could not load campaigns</p>
                <p className="text-xs text-brand-gray">
                  There was a problem fetching campaign data.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* ======================================================
          TABLE CARD
      ======================================================= */}

      <div className="overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm">
        {/* Card header */}
        <div className="flex flex-col gap-2 border-b border-brand-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-bold text-brand-ink">
              {platformTitle} {tab === "campaign" ? "Campaign Report" : "City Report"}
            </h3>
            <p className="mt-0.5 text-xs text-brand-gray">
              {tab === "campaign"
                ? "Campaign name, budget, spend, revenue and date"
                : "City level performance"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {tab === "campaign" && isFetching && !isLoading && (
              <span className="text-xs font-medium text-brand-primary-dark">Updating...</span>
            )}

            <span className="rounded-full bg-brand-primary-soft px-3 py-1 text-xs font-semibold text-brand-primary-dark">
              {recordCount.toLocaleString()} records
            </span>
          </div>
        </div>

        {/* Table body */}
        <div className={tab === "campaign" && isFetching && !isLoading ? "opacity-70" : ""}>
          {tab === "campaign" ? (
            isLoading ? (
              <div className="space-y-3 p-6">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="flex animate-pulse items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-brand-primary-soft" />

                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-1/3 rounded bg-brand-primary-soft" />
                      <div className="h-2.5 w-1/5 rounded bg-brand-primary-soft" />
                    </div>

                    <div className="h-8 w-24 rounded bg-brand-primary-soft" />
                    <div className="h-8 w-24 rounded bg-brand-primary-soft" />
                    <div className="h-8 w-24 rounded bg-brand-primary-soft" />
                  </div>
                ))}
              </div>
            ) : currentData.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary-soft text-brand-primary-dark">
                  <Search size={24} />
                </div>

                <h3 className="text-sm font-bold text-brand-ink">No campaigns found</h3>

                <p className="mt-1 max-w-sm text-xs leading-5 text-brand-gray">
                  No campaign records match your current filters.
                </p>

                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-primary-dark"
                  >
                    <X size={14} />
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <Table
                data={filteredCampaigns as CampaignGridRow[]}
                columns={campaignColumns}
                title=""
                pageSize={PAGE_SIZE}
              />
            )
          ) : currentData.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary-soft text-brand-primary-dark">
                <Building2 size={24} />
              </div>

              <h3 className="text-sm font-bold text-brand-ink">No city data found</h3>

              <p className="mt-1 max-w-sm text-xs leading-5 text-brand-gray">
                No city records match your current filters.
              </p>
            </div>
          ) : (
            <Table
              data={filteredCityData as CityRow[]}
              columns={cityColumns}
              title=""
              pageSize={10}
            />
          )}
        </div>

        {/* ====================================================
            SERVER PAGINATION
        ===================================================== */}

        {tab === "campaign" && !isLoading && totalCampaigns > 0 && (
          <div className="flex flex-col gap-4 border-t border-brand-border bg-brand-offwhite px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Result range */}
            <div className="text-xs text-brand-gray">
              Showing{" "}
              <span className="font-semibold text-brand-ink">
                {(page - 1) * PAGE_SIZE + 1}
              </span>
              {" – "}
              <span className="font-semibold text-brand-ink">
                {Math.min(page * PAGE_SIZE, totalCampaigns)}
              </span>
              {" of "}
              <span className="font-semibold text-brand-ink">
                {totalCampaigns.toLocaleString()}
              </span>
              {" campaigns"}
            </div>

            {/* Page controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={goToPreviousPage}
                disabled={!canGoPrevious || isFetching}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-border bg-white text-brand-gray transition-colors hover:bg-brand-primary-soft hover:text-brand-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>

              {page > 3 && totalPages > 5 && (
                <>
                  <button
                    type="button"
                    onClick={() => goToPage(1)}
                    className={`${pageButton} ${pageButtonIdle}`}
                  >
                    1
                  </button>

                  <span className="px-1 text-brand-gray">...</span>
                </>
              )}

              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => goToPage(pageNumber)}
                  disabled={isFetching}
                  className={`${pageButton} ${
                    pageNumber === page
                      ? "bg-brand-primary text-white shadow-sm shadow-orange-500/20"
                      : pageButtonIdle
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              {page < totalPages - 2 && totalPages > 5 && (
                <>
                  <span className="px-1 text-brand-gray">...</span>

                  <button
                    type="button"
                    onClick={() => goToPage(totalPages)}
                    className={`${pageButton} ${pageButtonIdle}`}
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={goToNextPage}
                disabled={!canGoNext || isFetching}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-border bg-white text-brand-gray transition-colors hover:bg-brand-primary-soft hover:text-brand-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}