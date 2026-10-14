
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check, X } from "lucide-react";

import { useGetPlatformsQuery } from "../dashboardApi";

interface PlatformFilterProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function PlatformFilter({
  selected,
  onChange,
}: PlatformFilterProps) {
  const { data: platforms = [], isLoading, isError } =
    useGetPlatformsQuery();

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const allSelected = selected.length === 0;

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

  const togglePlatform = (slug: string) => {
    const next = selected.includes(slug)
      ? selected.filter((item) => item !== slug)
      : [...selected, slug];

    // Empty selection means All Platforms.
    if (platforms.length > 0 && next.length === platforms.length) {
      onChange([]);
      return;
    }

    onChange(next);
  };

  const selectedLabels = platforms
    .filter((platform) => selected.includes(platform.slug))
    .map((platform) => platform.name);

  const buttonLabel = allSelected
    ? "All Platforms"
    : selectedLabels.length > 0
      ? selectedLabels.join(", ")
      : "Select platforms";

  return (
    <div ref={containerRef} className="relative w-full min-w-0">
      <label className="mb-1.5 block text-xs font-semibold text-brand-gray">
        Platform
      </label>

      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-left text-sm text-brand-ink transition-colors hover:border-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
      >
        <span className="min-w-0 flex-1 truncate">
          {isLoading ? "Loading platforms..." : buttonLabel}
        </span>

        <ChevronDown
          size={17}
          className={`shrink-0 text-brand-gray transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full min-w-[240px] overflow-hidden rounded-xl border border-brand-border bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-brand-border-light px-3.5 py-3">
            <span className="text-xs font-bold uppercase tracking-wide text-brand-gray">
              Select platforms
            </span>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close platform dropdown"
              className="rounded-md p-1 text-brand-gray hover:bg-brand-surface"
            >
              <X size={15} />
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto p-2">
            <button
              type="button"
              onClick={() => onChange([])}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-brand-primary-soft"
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                  allSelected
                    ? "border-brand-primary bg-brand-primary text-white"
                    : "border-gray-300 bg-white"
                }`}
              >
                {allSelected && <Check size={12} />}
              </span>

              <span className="flex-1 font-medium text-brand-ink">
                All Platforms
              </span>
            </button>

            {isLoading &&
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="mx-3 my-3 h-4 animate-pulse rounded bg-gray-200"
                />
              ))}

            {!isLoading &&
              platforms.map((platform) => {
                const checked = selected.includes(platform.slug);

                return (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => togglePlatform(platform.slug)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-brand-primary-soft"
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                        checked
                          ? "border-brand-primary bg-brand-primary text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {checked && <Check size={12} />}
                    </span>

                    <span className="flex-1 text-brand-ink">
                      {platform.name}
                    </span>
                  </button>
                );
              })}

            {isError && (
              <p className="px-3 py-3 text-xs text-red-600">
                Could not load platforms.
              </p>
            )}

            {!isLoading && !isError && platforms.length === 0 && (
              <p className="px-3 py-3 text-xs text-brand-gray">
                No platforms available.
              </p>
            )}
          </div>

          {!allSelected && (
            <div className="flex items-center justify-between gap-3 border-t border-brand-border-light px-3.5 py-3">
              <span className="text-xs text-brand-gray">
                {selected.length} selected
              </span>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-brand-primary px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
              >
                Done
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
