export interface FilterOption {
  label: string;
  value: string;
}

const toOptions = (list: string[]): FilterOption[] => [
  { label: "All", value: "all" },
  ...list.map((item) => ({ label: item, value: item })),
];

export const PLATFORMS = ["Blinkit", "BigBasket", "Flipkart", "Swiggy Instamart", "Zepto"];

export const platformOptions = toOptions(PLATFORMS);
export const marketOptions = toOptions(["Tamil Nadu", "Karnataka", "Andhra Pradesh", "Kerala"]);
export const brandOptions = toOptions(["Gold Winner", "Dheepam"]);
export const productOptions = toOptions(["Rice Bran Oil", "Gingelly Oil", "Groundnut Oil", "Refined Sunflower Oil" , "Dheepam Oil"]);

export const dateOptions: FilterOption[] = [
  { label: "All", value: "all" },
  { label: "Today", value: "today" },
  { label: "Last 7 Days", value: "last7" },
  { label: "Last 30 Days", value: "last30" },
  { label: "This Month", value: "thisMonth" },
  { label: "Custom", value: "custom" },
];