export const PLATFORMS = ["Blinkit", "BigBasket", "Flipkart", "Swiggy Instamart", "Zepto"];

interface Props {
  selected: string[]; // empty array means All
  onChange: (selected: string[]) => void;
}

export default function PlatformFilter({ selected, onChange }: Props) {
  const toggle = (p: string) =>
    onChange(selected.includes(p) ? selected.filter((s) => s !== p) : [...selected, p]);

  const chip = (active: boolean) =>
    `px-3 py-1.5 text-sm font-medium rounded-full border transition-colors ${
      active
        ? "bg-brand-primary border-brand-primary text-white"
        : "bg-white border-gray-200 text-brand-gray hover:bg-brand-primary-soft"
    }`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button onClick={() => onChange([])} className={chip(selected.length === 0)}>
        All Platforms
      </button>
      {PLATFORMS.map((p) => (
        <button key={p} onClick={() => toggle(p)} className={chip(selected.includes(p))}>
          {p}
        </button>
      ))}
    </div>
  );
}