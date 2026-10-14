
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import {
  getRangeForPreset,
  type DatePreset,
  type DateRange,
} from "./dateRangeUtils";

const PRESETS: { key: DatePreset; label: string }[] = [
  { key: "mtd", label: "Month to Date" },
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
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedPreset =
    PRESETS.find((preset) => preset.key === value.preset) ??
    PRESETS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

    setOpen(false);
  };

  return (
    <div className="w-full min-w-0">
      <label className="mb-1.5 block text-xs font-semibold text-brand-gray">
        Date Range
      </label>

      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((previous) => !previous)}
          aria-expanded={open}
          aria-haspopup="listbox"
          className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-left text-sm text-brand-ink transition-colors hover:border-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
        >
          <span className="truncate">{selectedPreset.label}</span>

          <ChevronDown
            size={17}
            className={`shrink-0 text-brand-gray transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open && (
          <div className="absolute left-0 top-full z-50 mt-2 w-full min-w-[220px] overflow-hidden rounded-xl border border-brand-border bg-white p-1.5 shadow-xl">
            {PRESETS.map((preset) => {
              const active = value.preset === preset.key;

              return (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => selectPreset(preset.key)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    active
                      ? "bg-brand-primary-soft font-semibold text-brand-primary-dark"
                      : "text-brand-ink hover:bg-brand-surface"
                  }`}
                >
                  <span>{preset.label}</span>

                  {active && (
                    <span className="ml-3 text-brand-primary">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {value.preset === "custom" && (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="min-w-0">
            <label
              htmlFor="date-range-from"
              className="mb-1.5 block text-xs font-medium text-brand-gray"
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
              className="min-h-11 w-full min-w-0 rounded-xl border border-brand-border bg-white px-3 py-2 text-sm text-brand-ink focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>

          <div className="min-w-0">
            <label
              htmlFor="date-range-to"
              className="mb-1.5 block text-xs font-medium text-brand-gray"
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
              className="min-h-11 w-full min-w-0 rounded-xl border border-brand-border bg-white px-3 py-2 text-sm text-brand-ink focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>
        </div>
      )}
    </div>
  );
}
