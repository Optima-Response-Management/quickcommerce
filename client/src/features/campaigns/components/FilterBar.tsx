import type { FilterOption } from "../filterOptions";
import type { DateFilterValue } from "../dateUtils";

const selectClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange";

interface FilterBarProps {
  platformOptions: FilterOption[];
  dateOptions: FilterOption[];
  marketOptions: FilterOption[];
  brandOptions: FilterOption[];
  productOptions: FilterOption[];

  platform: string;
  date: DateFilterValue;
  market: string;
  brand: string;
  product: string;

  onPlatformChange: (v: string) => void;
  onDateChange: (v: DateFilterValue) => void;
  onMarketChange: (v: string) => void;
  onBrandChange: (v: string) => void;
  onProductChange: (v: string) => void;

  onApply: () => void;
}

export default function FilterBar({
  platformOptions,
  dateOptions,
  marketOptions,
  brandOptions,
  productOptions,
  platform,
  date,
  market,
  brand,
  product,
  onPlatformChange,
  onDateChange,
  onMarketChange,
  onBrandChange,
  onProductChange,
  onApply,
}: FilterBarProps) {
  const invalidRange = date.preset === "custom" && !!date.from && !!date.to && date.from > date.to;

  return (
    <div className="mb-5">
      <div className="grid grid-cols-5 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-brand-black mb-1.5">Platform</label>
          <select value={platform} onChange={(e) => onPlatformChange(e.target.value)} className={selectClass}>
            {platformOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-black mb-1.5">Date</label>
          <select
            value={date.preset}
            onChange={(e) => onDateChange({ ...date, preset: e.target.value })}
            className={selectClass}
          >
            {dateOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-black mb-1.5">Market</label>
          <select value={market} onChange={(e) => onMarketChange(e.target.value)} className={selectClass}>
            {marketOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-black mb-1.5">Brand</label>
          <select value={brand} onChange={(e) => onBrandChange(e.target.value)} className={selectClass}>
            {brandOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-black mb-1.5">Product</label>
          <select value={product} onChange={(e) => onProductChange(e.target.value)} className={selectClass}>
            {productOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Custom range: From / To sit right under the Date column */}
        {date.preset === "custom" && (
          <>
            <div className="col-start-2">
              <label className="block text-sm font-medium text-brand-black mb-1.5">From Date</label>
              <input
                type="date"
                value={date.from ?? ""}
                max={date.to || undefined}
                onChange={(e) => onDateChange({ ...date, from: e.target.value })}
                className={selectClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-black mb-1.5">To Date</label>
              <input
                type="date"
                value={date.to ?? ""}
                min={date.from || undefined}
                onChange={(e) => onDateChange({ ...date, to: e.target.value })}
                className={selectClass}
              />
            </div>
          </>
        )}
      </div>

      {invalidRange && (
        <p className="text-xs text-red-600 mb-3">From Date must be on or before To Date.</p>
      )}

      <button
        onClick={onApply}
        disabled={invalidRange}
        className="bg-brand-orange hover:bg-brand-orange-dark text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        Filter
      </button>
    </div>
  );
}