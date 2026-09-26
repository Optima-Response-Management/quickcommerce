import type { CityRow, CampaignRow } from "./types";

export const mockCityData: CityRow[] = [
  { platform: "GW", market: "Andhra Pradesh", city: "Hyderabad", spend: 46514, revenue: 229369, orders: 996, roas: 4.93 },
  { platform: "GW", market: "Tamil Nadu", city: "Chennai", spend: 24296, revenue: 509305, orders: 2340, roas: 20.96 },
  { platform: "Swiggy Instamart", market: "Karnataka", city: "Mysore", spend: 0, revenue: 43811, orders: 188, roas: 0 },
  { platform: "Swiggy Instamart", market: "Tamil Nadu", city: "Chennai", spend: 0, revenue: 931868, orders: 3295, roas: 0 },
];

export const mockCampaignData: CampaignRow[] = [
  {
    platform: "Zepto",
    campaignName: "GW- Generic - HYD-Aug 2026",
    brandName: "Gold Winner",
    campaignType: "AUCTION_UP_SELL",
    budget: 35000,
    spend: 29560,
    revenue: 125711,
    orders: 562,
    roas: 4.25,
    status: "PAUSED",
    uniqueConsiderations: 0,
    uniqueReach: 0,
  },
  {
    platform: "Zepto",
    campaignName: "Gold Winner-KA-1L/2L-July 2026",
    brandName: "Gold Winner",
    campaignType: "AUCTION_UP_SELL",
    budget: 12000,
    spend: 12003,
    revenue: 106662,
    orders: 524,
    roas: 8.89,
    status: "PAUSED",
    uniqueConsiderations: 0,
    uniqueReach: 0,
  },
  {
    platform: "Swiggy Instamart",
    campaignName: "Gold winner TN Aug 2026",
    brandName: "Gold Winner",
    campaignType: "AUCTION_UP_SELL",
    budget: 70000,
    spend: 12651,
    revenue: 219821,
    orders: 777,
    roas: 17.38,
    status: "PAUSED",
  },
];