import {
  CalendarDays,
  Check,
  ChevronDown,
  Filter,
  RotateCcw,
  X,
} from "lucide-react";

import type { FilterOption } from "../filterOptions";
import type { DateFilterValue } from "../dateUtils";

interface SelectFieldProps {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  onClear: () => void;
}

function SelectField({
  label,
  value,
  options,
  onChange,
  onClear,
}: SelectFieldProps) {
  const active = value !== "all";
  const disabled = options.length <= 1;

  return (
    <div className="min-w-0">
      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-brand-gray">
        {label}
      </label>

      <div className="group relative">
        <select
          value={value}
          disabled={disabled}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className={[
            "h-11 w-full appearance-none rounded-xl border",
            "pl-3.5 pr-9 text-sm font-medium",
            "outline-none transition-all duration-200",
            "focus:ring-4 focus:ring-brand-primary/10",
            "disabled:cursor-not-allowed",
            active
              ? "border-brand-primary/30 bg-brand-primary-soft text-brand-primary-dark focus:border-brand-primary"
              : "border-brand-border bg-brand-surface text-brand-ink hover:border-brand-primary/30 hover:bg-white focus:border-brand-primary",
            disabled
              ? "bg-brand-surface text-brand-gray-light"
              : "",
          ].join(" ")}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        {active && (
          <button
            type="button"
            onClick={onClear}
            aria-label={`Clear ${label}`}
            className="absolute right-8 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary transition hover:bg-brand-primary hover:text-white"
          >
            <X className="h-3 w-3" />
          </button>
        )}

        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray-light transition group-focus-within:text-brand-primary" />
      </div>
    </div>
  );
}

const dateInputClass =
  "h-11 w-full rounded-xl border border-brand-border bg-brand-surface px-3.5 text-sm font-medium text-brand-ink outline-none transition focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/10";

interface FilterBarProps {
  platformOptions: FilterOption[];
  dateOptions: FilterOption[];
  marketOptions: FilterOption[];
  cityOptions: FilterOption[];
  brandOptions: FilterOption[];
  productOptions: FilterOption[];

  platform: string;
  date: DateFilterValue;
  market: string;
  city: string;
  brand: string;
  product: string;

  onPlatformChange: (value: string) => void;
  onDateChange: (value: DateFilterValue) => void;
  onMarketChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onBrandChange: (value: string) => void;
  onProductChange: (value: string) => void;

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
  const invalidRange =
    date.preset === "custom" &&
    !!date.from &&
    !!date.to &&
    date.from > date.to;

  const activeCount = [
    platform !== "all",
    market !== "all",
    city !== "all",
    brand !== "all",
    product !== "all",
    date.preset !== "all",
  ].filter(Boolean).length;

  return (
    <div>
      {/* Filter grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
          label="Brand"
          value={brand}
          options={brandOptions}
          onChange={onBrandChange}
          onClear={() => onBrandChange("all")}
        />

        <SelectField
          label="Product"
          value={product}
          options={productOptions}
          onChange={onProductChange}
          onClear={() => onProductChange("all")}
        />

        <SelectField
          label="Date"
          value={date.preset}
          options={dateOptions}
          onChange={(value) =>
            onDateChange({
              ...date,
              preset: value,
            })
          }
          onClear={() =>
            onDateChange({
              preset: "all",
            })
          }
        />

        {/* Custom date */}
        {date.preset === "custom" && (
          <>
            <div className="lg:col-span-1 xl:col-start-5">
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-brand-gray">
                From date
              </label>

              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray-light" />

                <input
                  type="date"
                  value={date.from ?? ""}
                  max={date.to || undefined}
                  onChange={(event) =>
                    onDateChange({
                      ...date,
                      from: event.target.value,
                    })
                  }
                  className={`${dateInputClass} pl-10`}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-brand-gray">
                To date
              </label>

              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray-light" />

                <input
                  type="date"
                  value={date.to ?? ""}
                  min={date.from || undefined}
                  onChange={(event) =>
                    onDateChange({
                      ...date,
                      to: event.target.value,
                    })
                  }
                  className={`${dateInputClass} pl-10`}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Invalid date */}
      {invalidRange && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-600">
          From Date must be on or before To Date.
        </div>
      )}

      {/* Actions */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-brand-border-light pt-5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-primary-soft text-brand-primary">
            <Filter className="h-3.5 w-3.5" />
          </span>

          <span className="text-xs text-brand-gray">
            {activeCount === 0
              ? "No filters applied"
              : `${activeCount} filter${
                  activeCount === 1 ? "" : "s"
                } selected`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClear}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-brand-border bg-white px-4 text-xs font-bold text-brand-gray transition hover:bg-brand-surface hover:text-brand-ink"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>

          <button
            type="button"
            onClick={onApply}
            disabled={invalidRange}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-ink px-5 text-xs font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#25201b] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
          >
            <Check className="h-3.5 w-3.5" />
            Apply filters
          </button>
        </div>
      </div>
    </div>
  );
}