export interface FilterOption {
  label: string;
  value: string;
}

const toOptions = (list: string[]): FilterOption[] => [
  { label: "All", value: "all" },
  ...list.map((item) => ({ label: item, value: item })),
];

export const PLATFORMS = [
  "Blinkit",
  "BigBasket",
  "Flipkart",
  "Swiggy Instamart",
  "Zepto",
];

export const platformOptions = toOptions(PLATFORMS);
export const marketOptions = toOptions([
  // 28 States
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",

  // 8 Union Territories
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
]);
export const brandOptions = toOptions(["Gold Winner", "Dheepam"]);
export const productOptions = toOptions([
  "Rice Bran Oil",
  "Gingelly Oil",
  "Groundnut Oil",
  "Refined Sunflower Oil",
  "Dheepam Oil",
]);

export const dateOptions: FilterOption[] = [
  { label: "All", value: "all" },
  { label: "Today", value: "today" },
  { label: "Last 7 Days", value: "last7" },
  { label: "Last 30 Days", value: "last30" },
  { label: "This Month", value: "thisMonth" },
  { label: "Custom", value: "custom" },
];
