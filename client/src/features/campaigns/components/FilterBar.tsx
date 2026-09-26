export interface FilterOption {
  label: string;
  value: string;
}

const selectClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange";

interface FilterBarProps {
  platformOptions: FilterOption[];
  dateOptions: FilterOption[];
  marketOptions: FilterOption[];
  brandOptions: FilterOption[];
  productOptions: FilterOption[];
  platform: string;
  date: string;
  market: string;
  brand: string;
  product: string;
  onPlatformChange: (v: string) => void;
  onDateChange: (v: string) => void;
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
          <select value={date} onChange={(e) => onDateChange(e.target.value)} className={selectClass}>
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
      </div>
      <button
        onClick={onApply}
        className="bg-brand-orange hover:bg-brand-orange-dark text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
      >
        Filter
      </button>
    </div>
  );
}