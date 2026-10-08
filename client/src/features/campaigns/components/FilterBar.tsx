import {
  CalendarDays,
  ChevronDown,
  Filter,
  RotateCcw,
} from "lucide-react";

export interface FilterValues {
  platform: string;
  brand: string;
  subBrand: string;
  product: string;
  from: string;
  to: string;
}

interface FilterOptions {
  platforms: string[];
  brands: string[];
  subBrands: string[];
  products: string[];
}

interface FilterBarProps {
  filters: FilterValues;
  options: FilterOptions;
  onChange: (filters: FilterValues) => void;
  onReset: () => void;
  onApply: () => void;
  isLoading?: boolean;
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: string[];
  placeholder: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

function SelectField({
  label,
  value,
  options,
  placeholder,
  disabled = false,
  onChange,
}: SelectFieldProps) {
  return (
    <div className="min-w-0 flex-1">
      <label className="mb-1.5 block text-xs font-semibold text-brand-gray">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className={[
            "h-10 w-full appearance-none rounded-xl border",
            "border-brand-border bg-white px-3 pr-9",
            "text-sm text-brand-ink outline-none",
            "transition",
            "focus:border-brand-primary",
            "focus:ring-2 focus:ring-brand-primary/10",
            disabled
              ? "cursor-not-allowed bg-brand-surface text-brand-gray-light"
              : "cursor-pointer",
          ].join(" ")}
        >
          <option value="">{placeholder}</option>

          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

export default function FilterBar({
  filters,
  options,
  onChange,
  onReset,
  onApply,
  isLoading = false,
}: FilterBarProps) {
  const updateFilter = (
    key: keyof FilterValues,
    value: string,
  ) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  const handleBrandChange = (value: string) => {
    onChange({
      ...filters,
      brand: value,
      subBrand: "",
    });
  };

  return (
    <section className="rounded-2xl border border-brand-border bg-white p-4 shadow-brand-sm">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary-soft">
            <Filter
              className="h-4 w-4 text-brand-primary"
              aria-hidden="true"
            />
          </div>

          <div>
            <h2 className="text-sm font-bold text-brand-ink">
              Filters
            </h2>

            <p className="text-xs text-brand-gray">
              Filter campaign data
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          disabled={isLoading}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-brand-border bg-white px-3 text-xs font-semibold text-brand-gray transition hover:border-brand-primary hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw
            className="h-3.5 w-3.5"
            aria-hidden="true"
          />

          Reset
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Platform */}
        <SelectField
          label="Platform"
          value={filters.platform}
          options={options.platforms}
          placeholder="All Platforms"
          onChange={(value) =>
            updateFilter("platform", value)
          }
          disabled={isLoading}
        />

        {/* Brand */}
        <SelectField
          label="Brand"
          value={filters.brand}
          options={options.brands}
          placeholder="All Brands"
          onChange={handleBrandChange}
          disabled={isLoading}
        />

        {/* Sub Brand */}
        <SelectField
          label="Sub Brand"
          value={filters.subBrand}
          options={options.subBrands}
          placeholder={
            filters.brand
              ? "All Sub Brands"
              : "Select Brand First"
          }
          onChange={(value) =>
            updateFilter("subBrand", value)
          }
          disabled={isLoading || !filters.brand}
        />

        {/* Product */}
        <SelectField
          label="Product"
          value={filters.product}
          options={options.products}
          placeholder="All Products"
          onChange={(value) =>
            updateFilter("product", value)
          }
          disabled={isLoading}
        />

        {/* From Date */}
        <div className="min-w-0 flex-1">
          <label className="mb-1.5 block text-xs font-semibold text-brand-gray">
            From Date
          </label>

          <div className="relative">
            <CalendarDays
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray"
              aria-hidden="true"
            />

            <input
              type="date"
              value={filters.from}
              disabled={isLoading}
              onChange={(event) =>
                updateFilter("from", event.target.value)
              }
              className="h-10 w-full rounded-xl border border-brand-border bg-white pl-9 pr-3 text-sm text-brand-ink outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 disabled:cursor-not-allowed disabled:bg-brand-surface disabled:text-brand-gray-light"
            />
          </div>
        </div>

        {/* To Date */}
        <div className="min-w-0 flex-1">
          <label className="mb-1.5 block text-xs font-semibold text-brand-gray">
            To Date
          </label>

          <div className="relative">
            <CalendarDays
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray"
              aria-hidden="true"
            />

            <input
              type="date"
              value={filters.to}
              disabled={isLoading}
              onChange={(event) =>
                updateFilter("to", event.target.value)
              }
              className="h-10 w-full rounded-xl border border-brand-border bg-white pl-9 pr-3 text-sm text-brand-ink outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 disabled:cursor-not-allowed disabled:bg-brand-surface disabled:text-brand-gray-light"
            />
          </div>
        </div>

        {/* Apply */}
        <div className="flex items-end">
          <button
            type="button"
            onClick={onApply}
            disabled={isLoading}
            className="h-10 w-full rounded-xl bg-brand-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Applying..." : "Apply Filters"}
          </button>
        </div>
      </div>
    </section>
  );
}