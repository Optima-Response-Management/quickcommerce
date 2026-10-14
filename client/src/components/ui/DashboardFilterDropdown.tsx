
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

interface DashboardFilterDropdownProps {
  label: string;
  value: string;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

export default function DashboardFilterDropdown({
  label,
  value,
  options,
  placeholder = "All",
  disabled = false,
  onChange,
}: DashboardFilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  const selectedLabel = value || placeholder;

  return (
    <div ref={ref} className="relative w-full min-w-0">
      <label className="mb-1 block text-[11px] font-semibold text-brand-gray">
        {label}
      </label>

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        className="flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-brand-border bg-white px-3 py-1.5 text-xs text-brand-ink transition-colors hover:border-brand-primary disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60"
      >
        <span className="truncate">{selectedLabel}</span>

        <ChevronDown
          size={15}
          className={`shrink-0 text-brand-gray transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && !disabled && (
        <div className="absolute left-0 top-full z-50 mt-1.5 max-h-56 w-full min-w-[160px] overflow-y-auto rounded-lg border border-brand-border bg-white p-1 shadow-xl">
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-xs text-brand-ink hover:bg-brand-primary-soft"
          >
            <span>{placeholder}</span>
            {!value && (
              <Check size={14} className="text-brand-primary" />
            )}
          </button>

          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-xs text-brand-ink hover:bg-brand-primary-soft"
            >
              <span className="truncate">{option}</span>

              {value === option && (
                <Check
                  size={14}
                  className="shrink-0 text-brand-primary"
                />
              )}
            </button>
          ))}

          {options.length === 0 && (
            <p className="px-2.5 py-3 text-xs text-brand-gray">
              No options available
            </p>
          )}
        </div>
      )}
    </div>
  );
}
