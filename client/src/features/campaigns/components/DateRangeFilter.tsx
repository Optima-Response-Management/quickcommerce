export type DatePreset = "yesterday" | "last7" | "last30" | "custom";

export interface DateRange {
  preset: DatePreset;
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
}

const toISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toISO(d);
};

export function getRangeForPreset(preset: Exclude<DatePreset, "custom">): DateRange {
  const yesterday = daysAgo(1);
  if (preset === "yesterday") return { preset, from: yesterday, to: yesterday };
  if (preset === "last7") return { preset, from: daysAgo(7), to: yesterday };
  return { preset, from: daysAgo(30), to: yesterday };
}

const PRESETS: { key: DatePreset; label: string }[] = [
  { key: "yesterday", label: "Yesterday" },
  { key: "last7", label: "Last 7 Days" },
  { key: "last30", label: "Last 30 Days" },
  { key: "custom", label: "Custom Range" },
];

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export default function DateRangeFilter({ value, onChange }: Props) {
  const selectPreset = (key: DatePreset) => {
    if (key === "custom") {
      onChange({ preset: "custom", from: value.from, to: value.to });
    } else {
      onChange(getRangeForPreset(key));
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            onClick={() => selectPreset(p.key)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              value.preset === p.key
                ? "bg-brand-primary text-white"
                : "text-brand-gray hover:bg-brand-primary-soft"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {value.preset === "custom" && (
        <div className="flex items-center gap-2 text-sm">
          <label className="text-brand-gray">From</label>
          <input
            type="date"
            value={value.from}
            max={value.to || undefined}
            onChange={(e) => onChange({ ...value, from: e.target.value })}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-brand-black"
          />
          <label className="text-brand-gray">To</label>
          <input
            type="date"
            value={value.to}
            min={value.from || undefined}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-brand-black"
          />
        </div>
      )}
    </div>
  );
}