export interface DateFilterValue {
  preset: string;
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
}

// Local date (not UTC) so it doesn't shift a day in IST
export const toISODate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toISODate(d);
};

export function matchesDate(rowDate: string | undefined, filter: DateFilterValue): boolean {
  if (filter.preset === "all") return true;
  if (!rowDate) return false;

  const today = daysAgo(0);
  switch (filter.preset) {
    case "today":
      return rowDate === today;
    case "last7":
      return rowDate >= daysAgo(6) && rowDate <= today;
    case "last30":
      return rowDate >= daysAgo(29) && rowDate <= today;
    case "thisMonth":
      return rowDate.startsWith(today.slice(0, 7));
    case "custom":
      if (filter.from && rowDate < filter.from) return false;
      if (filter.to && rowDate > filter.to) return false;
      return true;
    default:
      return true;
  }
}