import { ChevronDown, Filter, RotateCcw, X } from "lucide-react";
import type { FilterOption } from "../filterOptions";
import type { DateFilterValue } from "../dateUtils";

interface SelectFieldProps {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (v: string) => void;
  onClear: () => void;
}

function SelectField({ label, value, options, onChange, onClear }: SelectFieldProps) {
  const active = value !== "all";
  const disabled = options.length <= 1; // only "All" available, e.g. a platform with no states

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-gray">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none rounded-lg border py-2.5 pl-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/30 disabled:cursor-not-allowed disabled:bg-brand-offwhite disabled:text-brand-gray-light ${
            active
              ? "border-brand-primary bg-brand-primary-soft pr-14 text-brand-primary-dark"
              : "border-brand-border bg-white pr-9 text-brand-ink hover:border-brand-primary/50"
          }`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {active && (
          <button
            type="button"
            onClick={onClear}
            aria-label={`Clear ${label}`}
            className="absolute right-8 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-brand-primary-dark transition-colors hover:bg-brand-primary hover:text-white"
          >
            <X size={12} />
          </button>
        )}

        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray"
        />
      </div>
    </div>
  );
}

const dateInputClass =
  "w-full rounded-lg border border-brand-border bg-white px-3 py-2.5 text-sm font-medium text-brand-ink transition-colors hover:border-brand-primary/50 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30";

interface FilterBarProps {
  platformOptions: FilterOption[];
  dateOptions: FilterOption[];
  marketOptions: FilterOption[]; // these are the States for the selected platform
  cityOptions: FilterOption[];
  brandOptions: FilterOption[];
  productOptions: FilterOption[];

  platform: string;
  date: DateFilterValue;
  market: string; // selected State
  city: string;
  brand: string;
  product: string;

  onPlatformChange: (v: string) => void;
  onDateChange: (v: DateFilterValue) => void;
  onMarketChange: (v: string) => void;
  onCityChange: (v: string) => void;
  onBrandChange: (v: string) => void;
  onProductChange: (v: string) => void;

  onApply: () => void;
  onClear: () => void;
}

export default function FilterBar({
  platformOptions,
  dateOptions,
  marketOptions,
  cityOptions,
  brandOptions,
  productOptions,
  platform,
  date,
  market,
  city,
  brand,
  product,
  onPlatformChange,
  onDateChange,
  onMarketChange,
  onCityChange,
  onBrandChange,
  onProductChange,
  onApply,
  onClear,
}: FilterBarProps) {
  const invalidRange = date.preset === "custom" && !!date.from && !!date.to && date.from > date.to;

  return (
    <div>
            <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <SelectField
          label="Platform"
          value={platform}
          options={platformOptions}
          onChange={onPlatformChange}
          onClear={() => onPlatformChange("all")}
        />

        <SelectField
          label="State"
          value={market}
          options={marketOptions}
          onChange={onMarketChange}
          onClear={() => onMarketChange("all")}
        />

        <SelectField
          label="City"
          value={city}
          options={cityOptions}
          onChange={onCityChange}
          onClear={() => onCityChange("all")}
        />

        <SelectField
          label="Product"
          value={product}
          options={productOptions}
          onChange={onProductChange}
          onClear={() => onProductChange("all")}
        />

        <SelectField
          label="Brand"
          value={brand}
          options={brandOptions}
          onChange={onBrandChange}
          onClear={() => onBrandChange("all")}
        />

        <SelectField
          label="Date"
          value={date.preset}
          options={dateOptions}
          onChange={(v) => onDateChange({ ...date, preset: v })}
          onClear={() => onDateChange({ preset: "all" })}
        />

        {/* Custom range: From / To sit on the last row, under Brand and Date */}
        {date.preset === "custom" && (
          <>
            <div className="xl:col-start-5">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-gray">
                From Date
              </label>
              <input
                type="date"
                value={date.from ?? ""}
                max={date.to || undefined}
                onChange={(e) => onDateChange({ ...date, from: e.target.value })}
                className={dateInputClass}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-gray">
                To Date
              </label>
              <input
                type="date"
                value={date.to ?? ""}
                min={date.from || undefined}
                onChange={(e) => onDateChange({ ...date, to: e.target.value })}
                className={dateInputClass}
              />
            </div>
          </>
        )}
      </div>

      {invalidRange && (
        <p className="mb-3 text-xs font-medium text-red-600">From Date must be on or before To Date.</p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onApply}
          disabled={invalidRange}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-orange-500/20 transition-colors hover:bg-brand-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Filter size={15} />
          Apply filters
        </button>

        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-2 rounded-lg border border-brand-border bg-white px-4 py-2.5 text-sm font-semibold text-brand-gray transition-colors hover:bg-brand-orange-tint hover:text-brand-primary-dark"
        >
          <RotateCcw size={15} />
          Reset
        </button>
      </div>
    </div>
  );
}