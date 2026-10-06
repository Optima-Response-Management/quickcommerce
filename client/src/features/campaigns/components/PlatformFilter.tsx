import { useGetPlatformsQuery } from "../dashboardApi";

interface PlatformFilterProps {
  selected: string[]; // platform slugs, empty array = All Platforms
  onChange: (selected: string[]) => void;
}

export default function PlatformFilter({ selected, onChange }: PlatformFilterProps) {
  const { data: platforms = [], isLoading, isError } = useGetPlatformsQuery();

  const allSelected = selected.length === 0;

  const toggle = (slug: string) => {
    const next = selected.includes(slug)
      ? selected.filter((s) => s !== slug)
      : [...selected, slug];

    // Selecting every platform one by one is the same as All Platforms
    if (platforms.length > 0 && next.length === platforms.length) {
      onChange([]);
      return;
    }
    onChange(next);
  };

  const pill = (active: boolean) =>
    `px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
      active
        ? "bg-brand-primary text-white border-brand-primary"
        : "bg-white text-brand-ink border-gray-300 hover:border-brand-primary"
    }`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={() => onChange([])} className={pill(allSelected)}>
        All Platforms
      </button>

      {isLoading &&
        Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-20 rounded-full bg-gray-200 animate-pulse" />
        ))}

      {platforms.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => toggle(p.slug)}
          className={pill(selected.includes(p.slug))}
        >
          {p.name}
        </button>
      ))}

      {isError && <span className="text-xs text-red-600">Could not load platforms</span>}
    </div>
  );
}