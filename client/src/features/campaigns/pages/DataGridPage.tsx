import {
  useMemo,
  useState,
} from "react";

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

import Table, {
  type Column,
} from "../../../components/common/Table";


import {
  dateOptions,
  type FilterOption,
} from "../filterOptions";

import type {
  DateFilterValue,
} from "../dateUtils";

import type {
  CityRow,
} from "../types";

import {
  useGetCampaignsQuery,
  useGetPlatformsQuery,
  type CampaignGridRow,
} from "../dashboardApi";

import {
  useGridFilterOptions,
} from "../useGridFilterOptions";

/* =========================================================
   TYPES
========================================================= */

interface FilterValues {
  platform: string;
  brand: string;
  subBrand: string;
  product: string;
  from: string;
  to: string;
}

interface AppliedFilters {
  platform: string;
  brand: string;
  subBrand: string;
  product: string;
  date: DateFilterValue;
}

type FilterKey =
  | "platform"
  | "brand"
  | "subBrand"
  | "product";

type ChipKey =
  | FilterKey
  | "date";

/*
 * Table<T> requires T extends Record<string, unknown>.
 * Interfaces don't have an index signature, so we
 * intersect them with Record<string, unknown>.
 */
type CampaignTableRow =
  CampaignGridRow &
    Record<string, unknown>;

type CityTableRow =
  CityRow &
    Record<string, unknown>;

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_FILTERS: FilterValues = {
  platform: "all",
  brand: "all",
  subBrand: "all",
  product: "all",
  from: "",
  to: "",
};

const INITIAL_FILTERS: AppliedFilters = {
  platform: "all",
  brand: "all",
  subBrand: "all",
  product: "all",
  date: {
    preset: "all",
  },
};

const PAGE_SIZE = 20;

/**
 * City-wise API is not enabled yet.
 */
const CITY_WISE_ENABLED = false;

/**
 * Placeholder until the city-wise API is ready.
 */
const CITY_DATA: CityRow[] = [];

/* =========================================================
   DEPENDENCIES
========================================================= */

const DEPENDENTS: Record<
  FilterKey,
  FilterKey[]
> = {
  platform: [
    "brand",
    "subBrand",
    "product",
  ],

  brand: [
    "subBrand",
    "product",
  ],

  subBrand: [],

  product: [],
};

/* =========================================================
   HELPERS
========================================================= */

const platformBadge = (
  name: string,
) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-primary/10 bg-brand-primary-soft px-2.5 py-1 text-xs font-semibold text-brand-primary-dark">
    <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
    {name}
  </span>
);

const withAll = (
  label: string,
  items: string[],
): FilterOption[] => [
  {
    value: "all",
    label,
  },

  ...items.map(
    (value) => ({
      value,
      label: value,
    }),
  ),
];

/* =========================================================
   PAGE
========================================================= */

export default function DataGridPage() {
  /* =======================================================
     TAB
  ======================================================= */

  const [tab, setTab] = useState<
    "campaign" | "city"
  >("campaign");

  /* =======================================================
     FILTER STATE

     IMPORTANT:
     State and City have been completely removed.
  ======================================================= */

  const [
    filters,
    setFilters,
  ] = useState<FilterValues>(
    DEFAULT_FILTERS,
  );

  /* =======================================================
     APPLIED FILTER STATE
  ======================================================= */

  const [
    applied,
    setApplied,
  ] = useState<AppliedFilters>(
    INITIAL_FILTERS,
  );

  /* =======================================================
     SERVER PAGINATION
  ======================================================= */

  const [
    page,
    setPage,
  ] = useState(1);

  /* =======================================================
     PLATFORM / FILTER OPTIONS
  ======================================================= */

  const {
    data: platforms = [],
  } = useGetPlatformsQuery();

  const filterLists =
    useGridFilterOptions(
      filters.platform,
      "all",
      "all",
      filters.brand,
    );

  /* =======================================================
     FILTER OPTIONS
  ======================================================= */

  const platformOptions: FilterOption[] = [
    {
      value: "all",
      label: "All Platforms",
    },

    ...platforms.map(
      (item) => ({
        value: item.slug,
        label: item.name,
      }),
    ),
  ];

  const brandOptions =
    withAll(
      "All Brands",
      filterLists.brands ?? [],
    );

  const subBrandOptions =
    withAll(
      "All Sub Brands",
      filterLists.subBrands ?? [],
    );

  const productOptions =
    withAll(
      "All Products",
      filterLists.products ?? [],
    );

  /*
   * Keep the filter options object separate so the
   * FilterBar receives exactly the shape it expects.
   */
  const filterOptions = {
    platforms: platformOptions.map(
      (option) => option.value,
    ).filter(
      (value) => value !== "all",
    ),

    brands: brandOptions.map(
      (option) => option.value,
    ).filter(
      (value) => value !== "all",
    ),

    subBrands: subBrandOptions.map(
      (option) => option.value,
    ).filter(
      (value) => value !== "all",
    ),

    products: productOptions.map(
      (option) => option.value,
    ).filter(
      (value) => value !== "all",
    ),
  };

  /* =======================================================
     FILTER HANDLERS
  ======================================================= */

  const handleFilterChange = (
    nextFilters: FilterValues,
  ) => {
    setFilters(nextFilters);
  };

  

  const handleApplyFilters = () => {
    setPage(1);

    setApplied({
      platform: filters.platform,
      brand: filters.brand,
      subBrand: filters.subBrand,
      product: filters.product,
      date: {
        preset:
          filters.from || filters.to
            ? "custom"
            : "all",
        from:
          filters.from || undefined,
        to:
          filters.to || undefined,
      },
    });
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);

    setApplied(INITIAL_FILTERS);

    setPage(1);
  };

  /* =======================================================
     CAMPAIGN API
  ======================================================= */

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

    subBrand:
      applied.subBrand !== "all"
        ? applied.subBrand
        : undefined,
  });

  const campaigns =
    campaignResponse?.campaigns ?? [];

  const pagination =
    campaignResponse?.pagination;

  const totalCampaigns =
    pagination?.total ?? 0;

  const totalPages =
    pagination?.totalPages ?? 1;

  /*
   * Campaign records are already filtered
   * by the backend.
   */
  const filteredCampaigns =
    campaigns;

  /* =======================================================
     REMOVE ACTIVE FILTER CHIP
  ======================================================= */

  const removeFilter = (
    key: ChipKey,
  ) => {
    setPage(1);

    if (key === "date") {
      setFilters(
        (previous) => ({
          ...previous,
          from: "",
          to: "",
        }),
      );

      setApplied(
        (previous) => ({
          ...previous,
          date: {
            preset: "all",
          },
        }),
      );

      return;
    }

    const keys: FilterKey[] = [
      key,
      ...DEPENDENTS[key],
    ];

    setFilters(
      (previous) => {
        const next = {
          ...previous,
        };

        keys.forEach(
          (filterKey) => {
            next[filterKey] = "all";
          },
        );

        return next;
      },
    );

    setApplied(
      (previous) => {
        const next = {
          ...previous,
        };

        keys.forEach(
          (filterKey) => {
            next[filterKey] = "all";
          },
        );

        return next;
      },
    );
  };

  /* =======================================================
     CITY DATA
  ======================================================= */

  const filteredCityData =
    useMemo(() => {
      return CITY_DATA.filter(
        (row) => {
          if (
            applied.platform !==
              "all" &&
            String(
              row.platform,
            ).toLowerCase() !==
              applied.platform.toLowerCase()
          ) {
            return false;
          }

          if (
            applied.brand !==
              "all" &&
            row.brandName !==
              applied.brand
          ) {
            return false;
          }

          if (
            applied.product !==
              "all" &&
            row.product !==
              applied.product
          ) {
            return false;
          }

          return true;
        },
      );
    }, [applied]);

  /* =======================================================
     CAMPAIGN TABLE COLUMNS
  ======================================================= */

  const campaignColumns:
    Column<CampaignTableRow>[] =
    [
      {
        key: "campaignName",

        label: "Campaign",

        render: (row) => (
          <div className="flex min-w-[250px] items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary-soft text-brand-primary-dark transition-transform duration-200 group-hover:scale-105">
              <BarChart3 className="h-[17px] w-[17px]" />
            </div>

            <div className="min-w-0">
              <p className="truncate font-semibold text-brand-ink">
                {row.campaignName}
              </p>

              <p className="mt-1 text-[11px] capitalize text-brand-gray">
                {row.platform ||
                  "Campaign"}
              </p>
            </div>
          </div>
        ),
      },

      {
        key: "brandName",

        label: "Brand",

        render: (row) => (
          <span className="font-semibold text-brand-ink">
            {row.brandName || "—"}
          </span>
        ),
      },

      {
        key: "subBrandName",

        label: "Sub Brand",

        render: (row) => (
          <span className="text-brand-gray">
            {row.subBrandName || "—"}
          </span>
        ),
      },

      {
        key: "budget",

        label: "Budget",

        render: (row) => (
          <span className="font-medium text-brand-ink">
            ₹
            {Number(
              row.budget ?? 0,
            ).toLocaleString()}
          </span>
        ),
      },

      {
        key: "spend",

        label: "Spend",

        render: (row) => (
          <span className="font-medium text-brand-ink">
            ₹
            {Number(
              row.spend ?? 0,
            ).toLocaleString()}
          </span>
        ),
      },

      {
        key: "revenue",

        label: "Revenue",

        render: (row) => (
          <span className="font-semibold text-emerald-600">
            ₹
            {Number(
              row.revenue ?? 0,
            ).toLocaleString()}
          </span>
        ),
      },

      {
        key: "orders",

        label: "Orders",

        render: (row) => (
          <span className="font-medium text-brand-ink">
            {Number(
              row.orders ?? 0,
            ).toLocaleString()}
          </span>
        ),
      },

      {
        key: "date",

        label: "Date",

        render: (row) => (
          <div className="flex items-center gap-2 text-xs text-brand-gray">
            <CalendarDays className="h-3.5 w-3.5 text-brand-gray-light" />
            {row.date}
          </div>
        ),
      },
    ];

  /* =======================================================
     CITY TABLE COLUMNS
  ======================================================= */

  const cityColumns:
    Column<CityTableRow>[] =
    [
      {
        key: "platform",

        label: "Platform",

        render: (row) =>
          platformBadge(
            row.platform,
          ),
      },

      {
        key: "brandName",

        label: "Brand",

        render: (row) => (
          <span className="font-semibold text-brand-ink">
            {row.brandName}
          </span>
        ),
      },

      {
        key: "product",

        label: "Product",

        render: (row) => (
          <span className="text-brand-gray">
            {row.product}
          </span>
        ),
      },

      {
        key: "market",

        label: "Market",

        render: (row) => (
          <span className="inline-flex items-center rounded-lg bg-brand-surface px-2.5 py-1 text-xs font-medium text-brand-gray">
            {row.market}
          </span>
        ),
      },

      {
        key: "city",

        label: "City",

        render: (row) => (
          <div className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 text-brand-gray-light" />

            <span className="font-medium text-brand-ink">
              {row.city}
            </span>
          </div>
        ),
      },

      {
        key: "spend",

        label: "Spend",

        render: (row) => (
          <span className="font-medium text-brand-ink">
            {row.spend
              ? `₹${row.spend.toLocaleString()}`
              : "—"}
          </span>
        ),
      },

      {
        key: "revenue",

        label: "Revenue",

        render: (row) => (
          <span className="font-semibold text-emerald-600">
            ₹
            {row.revenue.toLocaleString()}
          </span>
        ),
      },

      {
        key: "orders",

        label: "Orders",

        render: (row) => (
          <span className="font-medium text-brand-ink">
            {row.orders.toLocaleString()}
          </span>
        ),
      },

      {
        key: "roas",

        label: "ROAS",

        render: (row) =>
          row.roas ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" />
              {row.roas}x
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

        render: (row) => (
          <div className="flex items-center gap-2 text-xs text-brand-gray">
            <CalendarDays className="h-3.5 w-3.5 text-brand-gray-light" />
            {row.date}
          </div>
        ),
      },
    ];

  /* =======================================================
     ACTIVE FILTER LABELS
  ======================================================= */

  const platformLabel =
    platforms.find(
      (item) =>
        item.slug ===
        applied.platform,
    )?.name ??
    applied.platform;

  const dateLabel =
    (() => {
      if (
        applied.date.preset ===
        "all"
      ) {
        return "";
      }

      if (
        applied.date.preset ===
        "custom"
      ) {
        return applied.date.from &&
          applied.date.to
          ? `${applied.date.from} → ${applied.date.to}`
          : "Custom range";
      }

      return (
        dateOptions.find(
          (option) =>
            option.value ===
            applied.date.preset,
        )?.label ??
        applied.date.preset
      );
    })();

  const activeChips = [
    applied.platform !==
      "all" && {
      key: "platform" as const,
      label: "Platform",
      value: platformLabel,
    },

    applied.brand !==
      "all" && {
      key: "brand" as const,
      label: "Brand",
      value: applied.brand,
    },

    applied.subBrand !==
      "all" && {
      key: "subBrand" as const,
      label: "Sub Brand",
      value: applied.subBrand,
    },

    applied.product !==
      "all" && {
      key: "product" as const,
      label: "Product",
      value: applied.product,
    },

    applied.date.preset !==
      "all" && {
      key: "date" as const,
      label: "Date",
      value: dateLabel,
    },
  ].filter(
    Boolean,
  ) as {
    key: ChipKey;
    label: string;
    value: string;
  }[];

  const activeFilterCount =
    activeChips.length;

  /* =======================================================
     CURRENT DATA
  ======================================================= */

  const currentData =
    tab === "campaign"
      ? filteredCampaigns
      : filteredCityData;

  const recordCount =
    tab === "campaign"
      ? totalCampaigns
      : filteredCityData.length;

  const platformTitle =
    applied.platform ===
    "all"
      ? "All Platforms"
      : platformLabel;

  /* =======================================================
     PAGINATION
  ======================================================= */

  const canGoPrevious =
    page > 1;

  const canGoNext =
    page < totalPages;

  const goToPreviousPage = () => {
    if (!canGoPrevious) {
      return;
    }

    setPage(
      (current) =>
        current - 1,
    );
  };

  const goToNextPage = () => {
    if (!canGoNext) {
      return;
    }

    setPage(
      (current) =>
        current + 1,
    );
  };

  const goToPage = (
    nextPage: number,
  ) => {
    if (
      nextPage < 1 ||
      nextPage > totalPages ||
      nextPage === page
    ) {
      return;
    }

    setPage(nextPage);
  };

  const pageNumbers =
    useMemo(() => {
      const pages: number[] = [];

      const maxVisiblePages = 5;

      if (
        totalPages <=
        maxVisiblePages
      ) {
        for (
          let index = 1;
          index <= totalPages;
          index++
        ) {
          pages.push(index);
        }

        return pages;
      }

      let start = Math.max(
        1,
        page - 2,
      );

      const end = Math.min(
        totalPages,
        start +
          maxVisiblePages -
          1,
      );

      if (
        end - start + 1 <
        maxVisiblePages
      ) {
        start = Math.max(
          1,
          end -
            maxVisiblePages +
            1,
        );
      }

      for (
        let index = start;
        index <= end;
        index++
      ) {
        pages.push(index);
      }

      return pages;
    }, [
      page,
      totalPages,
    ]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="page-enter min-h-full pb-10">
      {/* ===================================================
          PAGE HEADER
      ==================================================== */}

      <section className="relative mb-7 overflow-hidden rounded-3xl border border-brand-border bg-white p-6 shadow-brand-sm sm:p-7">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-200/25 blur-3xl" />

        <div className="pointer-events-none absolute bottom-0 right-1/4 h-32 w-32 rounded-full bg-orange-100/20 blur-3xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-primary/10 bg-brand-primary-soft px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-primary-dark">
              <span className="h-1.5 w-1.5 animate-soft-pulse rounded-full bg-brand-primary" />
              Data workspace
            </div>

            <h1 className="text-2xl font-bold tracking-[-0.035em] text-brand-ink sm:text-3xl">
              Data Grid
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-gray">
              Explore, filter and review
              campaign records across
              platforms, brands and
              products.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              refetch()
            }
            disabled={isFetching}
            className="group inline-flex h-10 w-fit items-center gap-2 rounded-xl border border-brand-border bg-white px-4 text-xs font-bold text-brand-ink shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-primary/20 hover:bg-brand-surface hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <RefreshCw
              className={[
                "h-3.5 w-3.5 transition-transform",
                isFetching
                  ? "animate-spin"
                  : "group-hover:rotate-90",
              ].join(" ")}
            />

            {isFetching
              ? "Refreshing..."
              : "Refresh data"}
          </button>
        </div>
      </section>

      {/* ===================================================
          VIEW SWITCHER
      ==================================================== */}

      <div className="mb-5">
        <div className="inline-flex rounded-2xl border border-brand-border bg-white p-1.5 shadow-brand-sm">
          {(
            [
              "campaign",
              "city",
            ] as const
          ).map((type) => {
            const active =
              tab === type;

            const disabled =
              type === "city" &&
              !CITY_WISE_ENABLED;

            return (
              <button
                key={type}
                type="button"
                disabled={disabled}
                onClick={() => {
                  if (disabled) {
                    return;
                  }

                  setTab(type);
                  setPage(1);
                }}
                className={[
                  "flex h-10 items-center gap-2 rounded-xl px-5 text-xs font-bold transition-all duration-200",

                  disabled
                    ? "cursor-not-allowed text-brand-gray-light"
                    : active
                      ? "bg-brand-ink text-white shadow-md"
                      : "text-brand-gray hover:bg-brand-surface hover:text-brand-ink",
                ].join(" ")}
              >
                {type ===
                "campaign" ? (
                  <BarChart3 className="h-4 w-4" />
                ) : (
                  <Building2 className="h-4 w-4" />
                )}

                {type ===
                "campaign"
                  ? "Campaign Wise"
                  : "City Wise"}

                {disabled && (
                  <span className="rounded-full bg-brand-primary-soft px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-primary-dark">
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ===================================================
          FILTER PANEL
      ==================================================== */}

      <section className="mb-6 overflow-hidden rounded-2xl border border-brand-border bg-white shadow-brand-sm">
        <div className="border-b border-brand-border-light bg-[#fdfcfb] px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary-soft text-brand-primary">
                <Filter className="h-4 w-4" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-brand-ink">
                    Filter records
                  </h2>

                  {activeFilterCount >
                    0 && (
                    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-brand-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </div>

                <p className="mt-0.5 text-xs text-brand-gray">
                  Narrow down the
                  campaign dataset
                  using multiple
                  dimensions.
                </p>
              </div>
            </div>

            {activeFilterCount >
              0 && (
              <button
                type="button"
                onClick={
                  handleClearFilters
                }
                className="inline-flex w-fit items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-brand-gray transition hover:bg-red-50 hover:text-red-600"
              >
                <X className="h-3.5 w-3.5" />
                Clear filters
              </button>
            )}
          </div>
        </div>

        <div className="p-5">
          <FilterBar
            filters={filters}
            options={filterOptions}
            onChange={
              handleFilterChange
            }
            onReset={
              handleClearFilters
            }
            onApply={
              handleApplyFilters
            }
            isLoading={isLoading}
          />
        </div>

        {/* =================================================
            ACTIVE FILTER CHIPS
        ================================================== */}

        {activeChips.length >
          0 && (
          <div className="flex flex-wrap items-center gap-2 border-t border-brand-border bg-brand-offwhite px-5 py-3.5">
            <span className="mr-1 text-[11px] font-semibold text-brand-gray">
              Active filters
            </span>

            {activeChips.map(
              (chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() =>
                    removeFilter(
                      chip.key,
                    )
                  }
                  aria-label={`Remove ${chip.label} filter`}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-brand-primary/20 bg-brand-primary-soft py-1.5 pl-3 pr-1.5 text-[11px] font-semibold text-brand-primary-dark transition-all hover:border-brand-primary hover:bg-brand-primary hover:text-white"
                >
                  <span className="font-medium text-brand-gray group-hover:text-white/70">
                    {chip.label}:
                  </span>

                  {chip.value}

                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/70 transition group-hover:bg-white/20">
                    <X className="h-2.5 w-2.5" />
                  </span>
                </button>
              ),
            )}

            <button
              type="button"
              onClick={
                handleClearFilters
              }
              className="ml-1 text-[11px] font-semibold text-brand-gray underline-offset-2 transition hover:text-red-600 hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </section>

      {/* ===================================================
          ERROR
      ==================================================== */}

      {tab === "campaign" &&
        isError && (
          <section className="mb-6 overflow-hidden rounded-2xl border border-red-200 bg-white shadow-brand-sm">
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <Database className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-bold text-red-700">
                    Could not load
                    campaigns
                  </p>

                  <p className="mt-1 text-xs text-brand-gray">
                    There was a problem
                    fetching campaign
                    data.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  refetch()
                }
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-xs font-bold text-red-600 transition hover:bg-red-100"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </button>
            </div>
          </section>
        )}

      {/* ===================================================
          DATA SECTION
      ==================================================== */}

      <section className="overflow-hidden rounded-2xl border border-brand-border bg-white shadow-brand-sm">
        {/* DATA HEADER */}

        <div className="border-b border-brand-border-light px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-brand-ink">
                  {platformTitle}{" "}
                  {tab === "campaign"
                    ? "Campaign Report"
                    : "City Report"}
                </h2>

                {tab ===
                  "campaign" &&
                  isFetching &&
                  !isLoading && (
                    <span className="flex items-center gap-1.5 text-[10px] font-semibold text-brand-primary">
                      <span className="h-1.5 w-1.5 animate-soft-pulse rounded-full bg-brand-primary" />
                      Updating
                    </span>
                  )}
              </div>

             
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 text-[11px] text-brand-gray sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live data
              </div>

              <span className="rounded-full border border-brand-primary/10 bg-brand-primary-soft px-3 py-1.5 text-[10px] font-bold text-brand-primary-dark">
                {recordCount.toLocaleString()}{" "}
                records
              </span>
            </div>
          </div>
        </div>

        {/* DATA CONTENT */}

        <div
          className={
            tab === "campaign" &&
            isFetching &&
            !isLoading
              ? "opacity-70 transition-opacity"
              : "transition-opacity"
          }
        >
          {/* CAMPAIGN */}

          {tab ===
            "campaign" && (
            <>
              {isLoading ? (
                <div className="space-y-3 p-5">
                  {[
                    1,
                    2,
                    3,
                    4,
                    5,
                  ].map(
                    (item) => (
                      <div
                        key={item}
                        className="flex animate-pulse items-center gap-4 rounded-xl border border-brand-border-light bg-brand-surface p-4"
                      >
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-brand-primary-soft" />

                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="h-3 w-1/3 rounded-full bg-brand-primary-soft" />

                          <div className="h-2.5 w-1/5 rounded-full bg-brand-primary-soft" />
                        </div>

                        <div className="hidden h-8 w-24 rounded-lg bg-brand-primary-soft sm:block" />

                        <div className="hidden h-8 w-24 rounded-lg bg-brand-primary-soft md:block" />

                        <div className="h-8 w-16 rounded-lg bg-brand-primary-soft" />
                      </div>
                    ),
                  )}
                </div>
              ) : filteredCampaigns.length ===
                0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-surface text-brand-gray-light">
                    <Search className="h-5 w-5" />
                  </div>

                  <h3 className="text-sm font-bold text-brand-ink">
                    No campaigns
                    found
                  </h3>

                  <p className="mt-1 max-w-sm text-xs leading-5 text-brand-gray">
                    No campaign
                    records match
                    your current
                    filters.
                  </p>

                  {activeFilterCount >
                    0 && (
                    <button
                      type="button"
                      onClick={
                        handleClearFilters
                      }
                      className="mt-5 inline-flex h-9 items-center gap-2 rounded-xl bg-brand-ink px-4 text-xs font-bold text-white transition hover:bg-[#25201b]"
                    >
                      <X className="h-3.5 w-3.5" />
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <Table<CampaignTableRow>
                  data={
                    filteredCampaigns as CampaignTableRow[]
                  }
                  columns={campaignColumns}
                  title=""
                  pageSize={PAGE_SIZE}
                />
              )}
            </>
          )}

          {/* CITY */}

          {tab === "city" && (
            <>
              {currentData.length ===
              0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-surface text-brand-gray-light">
                    <Building2 className="h-5 w-5" />
                  </div>

                  <h3 className="text-sm font-bold text-brand-ink">
                    No city data
                    found
                  </h3>

                  <p className="mt-1 max-w-sm text-xs leading-5 text-brand-gray">
                    No city records
                    match your
                    current filters.
                  </p>
                </div>
              ) : (
                <Table<CityTableRow>
                  data={
                    filteredCityData as CityTableRow[]
                  }
                  columns={cityColumns}
                  title=""
                  pageSize={10}
                />
              )}
            </>
          )}
        </div>

        {/* SERVER PAGINATION */}

        {tab === "campaign" &&
          !isLoading &&
          totalCampaigns > 0 && (
            <div className="flex flex-col gap-4 border-t border-brand-border bg-[#fdfcfb] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-brand-gray">
                Showing{" "}
                <span className="font-bold text-brand-ink">
                  {(page - 1) *
                    PAGE_SIZE +
                    1}
                </span>

                {" – "}

                <span className="font-bold text-brand-ink">
                  {Math.min(
                    page *
                      PAGE_SIZE,
                    totalCampaigns,
                  )}
                </span>

                {" of "}

                <span className="font-bold text-brand-ink">
                  {totalCampaigns.toLocaleString()}
                </span>

                {" campaigns"}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={
                    goToPreviousPage
                  }
                  disabled={
                    !canGoPrevious ||
                    isFetching
                  }
                  aria-label="Previous page"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-border bg-white text-brand-gray transition hover:bg-brand-primary-soft hover:text-brand-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {page > 3 &&
                  totalPages > 5 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          goToPage(1)
                        }
                        className="flex h-9 min-w-9 items-center justify-center rounded-xl border border-brand-border bg-white px-2 text-xs font-bold text-brand-gray transition hover:bg-brand-primary-soft hover:text-brand-primary-dark"
                      >
                        1
                      </button>

                      <span className="px-1 text-xs text-brand-gray-light">
                        ...
                      </span>
                    </>
                  )}

                {pageNumbers.map(
                  (pageNumber) => (
                    <button
                      key={
                        pageNumber
                      }
                      type="button"
                      onClick={() =>
                        goToPage(
                          pageNumber,
                        )
                      }
                      disabled={
                        isFetching
                      }
                      className={[
                        "flex h-9 min-w-9 items-center justify-center rounded-xl px-2 text-xs font-bold transition-all",

                        pageNumber ===
                        page
                          ? "bg-brand-ink text-white shadow-sm"
                          : "border border-brand-border bg-white text-brand-gray hover:bg-brand-primary-soft hover:text-brand-primary-dark",
                      ].join(" ")}
                    >
                      {pageNumber}
                    </button>
                  ),
                )}

                {page <
                  totalPages - 2 &&
                  totalPages > 5 && (
                    <>
                      <span className="px-1 text-xs text-brand-gray-light">
                        ...
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          goToPage(
                            totalPages,
                          )
                        }
                        className="flex h-9 min-w-9 items-center justify-center rounded-xl border border-brand-border bg-white px-2 text-xs font-bold text-brand-gray transition hover:bg-brand-primary-soft hover:text-brand-primary-dark"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}

                <button
                  type="button"
                  onClick={
                    goToNextPage
                  }
                  disabled={
                    !canGoNext ||
                    isFetching
                  }
                  aria-label="Next page"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-border bg-white text-brand-gray transition hover:bg-brand-primary-soft hover:text-brand-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
      </section>
    </div>
  );
}