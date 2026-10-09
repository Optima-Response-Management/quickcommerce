
export type DatePreset =
  | "mtd"
  | "yesterday"
  | "last7"
  | "last30"
  | "custom";

export interface DateRange {
  preset: DatePreset;
  from: string;
  to: string;
}

const toISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const daysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);

  return toISO(date);
};

export function getRangeForPreset(
  preset: Exclude<DatePreset, "custom">,
): DateRange {
  if (preset === "mtd") {
    const now = new Date();

    return {
      preset,
      from: toISO(
        new Date(now.getFullYear(), now.getMonth(), 1),
      ),
      to: toISO(now),
    };
  }

  const yesterday = daysAgo(1);

  if (preset === "yesterday") {
    return {
      preset,
      from: yesterday,
      to: yesterday,
    };
  }

  if (preset === "last7") {
    return {
      preset,
      from: daysAgo(7),
      to: yesterday,
    };
  }

  return {
    preset,
    from: daysAgo(30),
    to: yesterday,
  };
}
