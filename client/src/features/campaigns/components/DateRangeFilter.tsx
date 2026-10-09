
import {
  getRangeForPreset,
  type DatePreset,
  type DateRange,
} from "./dateRangeUtils";

const PRESETS: { key: DatePreset; label: string }[] = [
  { key: "mtd", label: "MTD" },
  { key: "yesterday", label: "Yesterday" },
  { key: "last7", label: "Last 7 Days" },
  { key: "last30", label: "Last 30 Days" },
  { key: "custom", label: "Custom Range" },
];

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export default function DateRangeFilter({
  value,
  onChange,
}: Props) {
  const selectPreset = (key: DatePreset) => {
    if (key === "custom") {
      onChange({
        preset: "custom",
        from: value.from,
        to: value.to,
      });
    } else {
      onChange(getRangeForPreset(key));
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex rounded-lg border border-brand-border bg-white p-1">
        {PRESETS.map((preset) => (
          <button
            key={preset.key}
            type="button"
            onClick={() => selectPreset(preset.key)}
            aria-pressed={value.preset === preset.key}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              value.preset === preset.key
                ? "bg-brand-primary text-white"
                : "text-brand-gray hover:bg-brand-primary-soft"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {value.preset === "custom" && (
        <div className="flex items-center gap-2 text-sm">
          <label
            htmlFor="date-range-from"
            className="text-brand-gray"
          >
            From
          </label>

          <input
            id="date-range-from"
            type="date"
            value={value.from}
            max={value.to || undefined}
            onChange={(event) =>
              onChange({
                ...value,
                from: event.target.value,
              })
            }
            className="rounded-lg border border-brand-border px-3 py-1.5 text-brand-ink"
          />

          <label
            htmlFor="date-range-to"
            className="text-brand-gray"
          >
            To
          </label>

          <input
            id="date-range-to"
            type="date"
            value={value.to}
            min={value.from || undefined}
            onChange={(event) =>
              onChange({
                ...value,
                to: event.target.value,
              })
            }
            className="rounded-lg border border-brand-border px-3 py-1.5 text-brand-ink"
          />
        </div>
      )}
    </div>
  );
}
