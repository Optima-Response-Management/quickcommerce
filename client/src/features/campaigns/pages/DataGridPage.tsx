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

import {
  platformOptions,
  marketOptions,
  brandOptions,
  productOptions,
  dateOptions,
} from "../filterOptions";

import type { CityRow } from "../types";
import {
  useGetCampaignsQuery,
  type CampaignGridRow,
} from "../dashboardApi";

interface AppliedFilters {
  platform: string;
  market: string;
  brand: string;
  product: string;
  date: any;
}

const INITIAL_FILTERS: AppliedFilters = {
  platform: "all",
  market: "all",
  brand: "all",
  product: "all",
  date: { preset: "all" },
};

const PAGE_SIZE = 20;

const platformBadge = (name: string) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-primary/10 bg-brand-primary-soft px-2.5 py-1 text-xs font-semibold text-brand-primary-dark">
    <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
    {name}
  </span>
);

export default function DataGridPage() {
  const [tab, setTab] =
    useState<"campaign" | "city">("campaign");
  const CITY_WISE_ENABLED = false;


  // ============================================================
  // Draft filter state
  // ============================================================

  const [platform, setPlatform] = useState("all");
  const [market, setMarket] = useState("all");
  const [brand, setBrand] = useState("all");
  const [product, setProduct] = useState("all");
  const [date, setDate] = useState<any>({
    preset: "all",
  });

  // ============================================================
  // Applied filters
  // ============================================================

  const [applied, setApplied] =
    useState<AppliedFilters>(INITIAL_FILTERS);

  // ============================================================
  // SERVER PAGINATION
  // ============================================================

  const [page, setPage] = useState(1);

  // ============================================================
  // Campaign API
  //
  // IMPORTANT:
  // The API should return:
  //
  // {
  //   campaigns: [],
  //   pagination: {
  //     page,
  //     limit,
  //     total,
  //     totalPages
  //   }
  // }
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

    platform:
      applied.platform !== "all"
        ? applied.platform
        : undefined,

    brand:
      applied.brand !== "all"
        ? applied.brand
        : undefined,
  });

  const campaigns =
    campaignResponse?.campaigns ?? [];

  const pagination = campaignResponse?.pagination;

  const totalCampaigns =
    pagination?.total ?? 0;

  const totalPages =
    pagination?.totalPages ?? 1;

  // ============================================================
  // IMPORTANT:
  // Reset to page 1 when switching tabs.
  // ============================================================

  const handleTabChange = (
    nextTab: "campaign" | "city"
  ) => {
    setTab(nextTab);
    setPage(1);
  };

  // ============================================================
  // Apply filters
  // ============================================================

  const handleApplyFilters = () => {
    setPage(1);

    setApplied({
      platform,
      market,
      brand,
      product,
      date,
    });
  };

  // ============================================================
  // Clear filters
  // ============================================================

  const handleClearFilters = () => {
    setPlatform("all");
    setMarket("all");
    setBrand("all");
    setProduct("all");
    setDate({
      preset: "all",
    });

    setApplied(INITIAL_FILTERS);
    setPage(1);
  };

  // ============================================================
  // Campaign data
  //
  // Backend already handles:
  // - platform
  // - brand
  // - pagination
  //
  // These remaining filters are retained here for compatibility
  // with your existing data structure.
  // ============================================================

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((row: any) => {
      if (
        applied.market !== "all" &&
        row.market !== applied.market
      ) {
        return false;
      }

      if (
        applied.product !== "all" &&
        row.product !== applied.product
      ) {
        return false;
      }

      return true;
    });
  }, [
    campaigns,
    applied.market,
    applied.product,
  ]);

  // ============================================================
  // City data
  // ============================================================

  const filteredCityData = useMemo(() => {
    return mockCityData.filter((row: any) => {
      if (
        applied.platform !== "all" &&
        String(row.platform).toLowerCase() !==
        applied.platform.toLowerCase()
      ) {
        return false;
      }

      if (
        applied.market !== "all" &&
        row.market !== applied.market
      ) {
        return false;
      }

      if (
        applied.brand !== "all" &&
        row.brandName !== applied.brand
      ) {
        return false;
      }

      if (
        applied.product !== "all" &&
        row.product !== applied.product
      ) {
        return false;
      }

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
            <p className="truncate font-semibold text-brand-ink">
              {r.campaignName}
            </p>

            <p className="mt-0.5 text-xs text-brand-gray">
              Campaign
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
      render: (r) =>
        platformBadge(r.platform),
    },

    {
      key: "brandName",
      label: "Brand",
      render: (r) => (
        <span className="font-semibold text-brand-ink">
          {r.brandName}
        </span>
      ),
    },

    {
      key: "product",
      label: "Product",
      render: (r) => (
        <span className="text-brand-gray">
          {r.product}
        </span>
      ),
    },

    {
      key: "market",
      label: "Market",
      render: (r) => (
        <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-brand-gray">
          {r.market}
        </span>
      ),
    },

    {
      key: "city",
      label: "City",
      render: (r) => (
        <div className="flex items-center gap-2">
          <Building2
            size={14}
            className="text-brand-gray"
          />

          <span className="font-medium text-brand-ink">
            {r.city}
          </span>
        </div>
      ),
    },

    {
      key: "spend",
      label: "Spend",
      render: (r) => (
        <span className="font-medium text-brand-ink">
          {r.spend
            ? `₹${r.spend.toLocaleString()}`
            : "—"}
        </span>
      ),
    },

    {
      key: "revenue",
      label: "Revenue",
      render: (r) => (
        <span className="font-semibold text-emerald-600">
          ₹{r.revenue.toLocaleString()}
        </span>
      ),
    },

    {
      key: "orders",
      label: "Orders",
      render: (r) => (
        <span className="font-medium text-brand-ink">
          {r.orders.toLocaleString()}
        </span>
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
          <span className="text-brand-gray">
            —
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
  // Filter count
  // ============================================================

  const activeFilterCount = [
    applied.platform !== "all",
    applied.market !== "all",
    applied.brand !== "all",
    applied.product !== "all",
    applied.date?.preset !== "all",
  ].filter(Boolean).length;

  const platformTitle =
    applied.platform === "all"
      ? "All"
      : applied.platform;

  // ============================================================
  // Current data
  // ============================================================

  const currentData =
    tab === "campaign"
      ? filteredCampaigns
      : filteredCityData;

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
    if (
      nextPage < 1 ||
      nextPage > totalPages ||
      nextPage === page
    ) {
      return;
    }

    setPage(nextPage);
  };

  // ============================================================
  // Page numbers
  // ============================================================

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];

    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (
        let i = 1;
        i <= totalPages;
        i++
      ) {
        pages.push(i);
      }

      return pages;
    }

    let start = Math.max(
      1,
      page - 2
    );

    let end = Math.min(
      totalPages,
      start + maxVisiblePages - 1
    );

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(
        1,
        end - maxVisiblePages + 1
      );
    }

    for (
      let i = start;
      i <= end;
      i++
    ) {
      pages.push(i);
    }

    return pages;
  }, [page, totalPages]);

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="min-h-full bg-slate-50/60 pb-10">



      {/* ======================================================
          TABS
      ======================================================= */}

      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div className="inline-flex w-fit rounded-xl border border-brand-border bg-white p-1.5 shadow-sm">
          {(["campaign", "city"] as const).map((t) => {
            const active = tab === t;
            const isCityDisabled =
              t === "city" && !CITY_WISE_ENABLED;

            return (
              <button
                key={t}
                type="button"
                onClick={() => {
                  if (isCityDisabled) return;

                  handleTabChange(t);
                }}
                disabled={isCityDisabled}
                className={`
          group flex items-center gap-2 rounded-lg px-5 py-2.5
          text-sm font-semibold transition-all duration-200

          ${isCityDisabled
                    ? "cursor-not-allowed text-gray-300 opacity-60"
                    : active
                      ? "bg-brand-ink text-white shadow-sm"
                      : "text-brand-gray hover:bg-slate-50 hover:text-brand-ink"
                  }
        `}
              >
                {t === "campaign" ? (
                  <BarChart3 size={16} />
                ) : (
                  <Building2 size={16} />
                )}

                {t === "campaign"
                  ? "Campaign Wise"
                  : "City Wise"}

                {active && !isCityDisabled && (
                  <ChevronRight
                    size={14}
                    className="ml-1"
                  />
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

                <h3 className="text-sm font-bold text-brand-ink">
                  Filters
                </h3>

                {activeFilterCount > 0 && (
                  <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-brand-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}

              </div>

              <p className="text-xs text-brand-gray">
                Refine the data displayed in the report
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
            onApply={handleApplyFilters}
          />

        </div>

        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t border-brand-border bg-slate-50/70 px-5 py-3">

            <span className="mr-1 text-xs font-medium text-brand-gray">
              Active:
            </span>

            {applied.platform !== "all" && (
              <span className="rounded-full bg-brand-primary-soft px-2.5 py-1 text-xs font-semibold text-brand-primary-dark">
                Platform: {applied.platform}
              </span>
            )}

            {applied.market !== "all" && (
              <span className="rounded-full bg-brand-primary-soft px-2.5 py-1 text-xs font-semibold text-brand-primary-dark">
                Market: {applied.market}
              </span>
            )}

            {applied.brand !== "all" && (
              <span className="rounded-full bg-brand-primary-soft px-2.5 py-1 text-xs font-semibold text-brand-primary-dark">
                Brand: {applied.brand}
              </span>
            )}

            {applied.product !== "all" && (
              <span className="rounded-full bg-brand-primary-soft px-2.5 py-1 text-xs font-semibold text-brand-primary-dark">
                Product: {applied.product}
              </span>
            )}

            {applied.date?.preset !== "all" && (
              <span className="rounded-full bg-brand-primary-soft px-2.5 py-1 text-xs font-semibold text-brand-primary-dark">
                Date: {applied.date.preset}
              </span>
            )}

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

                <p className="text-sm font-semibold text-red-700">
                  Could not load campaigns
                </p>

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
          TABLE
      ======================================================= */}

      <div className="overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm">



        {/* ====================================================
            TABLE BODY
        ===================================================== */}

        <div>

          {tab === "campaign" ? (
            isLoading ? (
              <div className="space-y-3 p-6">

                {[
                  1,
                  2,
                  3,
                  4,
                  5,
                ].map((item) => (
                  <div
                    key={item}
                    className="flex animate-pulse items-center gap-4"
                  >
                    <div className="h-10 w-10 rounded-lg bg-slate-100" />

                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-1/3 rounded bg-slate-100" />
                      <div className="h-2.5 w-1/5 rounded bg-slate-100" />
                    </div>

                    <div className="h-8 w-24 rounded bg-slate-100" />
                    <div className="h-8 w-24 rounded bg-slate-100" />
                    <div className="h-8 w-24 rounded bg-slate-100" />
                  </div>
                ))}

              </div>
            ) : currentData.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-brand-gray">
                  <Search size={24} />
                </div>

                <h3 className="text-sm font-bold text-brand-ink">
                  No campaigns found
                </h3>

                <p className="mt-1 max-w-sm text-xs leading-5 text-brand-gray">
                  No campaign records match your current filters.
                </p>

                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-ink px-4 py-2 text-xs font-semibold text-white"
                  >
                    <X size={14} />
                    Clear filters
                  </button>
                )}

              </div>
            ) : (
              <Table
                data={
                  filteredCampaigns as CampaignGridRow[]
                }
                columns={campaignColumns}
                title=""
                pageSize={PAGE_SIZE}
              />
            )
          ) : currentData.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-brand-gray">
                <Building2 size={24} />
              </div>

              <h3 className="text-sm font-bold text-brand-ink">
                No city data found
              </h3>

              <p className="mt-1 max-w-sm text-xs leading-5 text-brand-gray">
                No city records match your current filters.
              </p>

            </div>
          ) : (
            <Table
              data={
                filteredCityData as CityRow[]
              }
              columns={cityColumns}
              title=""
              pageSize={10}
            />
          )}

        </div>

        {/* ====================================================
            SERVER PAGINATION
        ===================================================== */}

        {tab === "campaign" &&
          !isLoading &&
          totalCampaigns > 0 && (
            <div className="flex flex-col gap-4 border-t border-brand-border bg-slate-50/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

              {/* Result range */}

              <div className="text-xs text-brand-gray">

                Showing{" "}

                <span className="font-semibold text-brand-ink">
                  {(page - 1) * PAGE_SIZE + 1}
                </span>

                {" – "}

                <span className="font-semibold text-brand-ink">
                  {Math.min(
                    page * PAGE_SIZE,
                    totalCampaigns
                  )}
                </span>

                {" of "}

                <span className="font-semibold text-brand-ink">
                  {totalCampaigns}
                </span>

                {" campaigns"}

              </div>

              {/* Pagination */}

              <div className="flex items-center gap-1">

                <button
                  type="button"
                  onClick={goToPreviousPage}
                  disabled={
                    !canGoPrevious ||
                    isFetching
                  }
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
                      className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-brand-border bg-white px-2 text-xs font-semibold text-brand-gray hover:bg-brand-primary-soft hover:text-brand-primary-dark"
                    >
                      1
                    </button>

                    <span className="px-1 text-brand-gray">
                      ...
                    </span>
                  </>
                )}

                {pageNumbers.map(
                  (pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() =>
                        goToPage(pageNumber)
                      }
                      disabled={isFetching}
                      className={`
                        flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-semibold transition-colors
                        ${pageNumber === page
                          ? "bg-brand-ink text-white shadow-sm"
                          : "border border-brand-border bg-white text-brand-gray hover:bg-brand-primary-soft hover:text-brand-primary-dark"
                        }
                      `}
                    >
                      {pageNumber}
                    </button>
                  )
                )}

                {page < totalPages - 2 &&
                  totalPages > 5 && (
                    <>
                      <span className="px-1 text-brand-gray">
                        ...
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          goToPage(totalPages)
                        }
                        className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-brand-border bg-white px-2 text-xs font-semibold text-brand-gray hover:bg-brand-primary-soft hover:text-brand-primary-dark"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}

                <button
                  type="button"
                  onClick={goToNextPage}
                  disabled={
                    !canGoNext ||
                    isFetching
                  }
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