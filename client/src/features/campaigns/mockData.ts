import type { CityRow, CampaignRow } from "./types";
import { daysAgo } from "./dateUtils";

export const mockCityData: CityRow[] = [
  { platform: "Blinkit", market: "Andhra Pradesh", city: "Hyderabad", spend: 46514, revenue: 229369, orders: 996, roas: 4.93, brandName: "Gold Winner", product: "Refined Sunflower Oil", date: daysAgo(0) },
  { platform: "Blinkit", market: "Tamil Nadu", city: "Chennai", spend: 24296, revenue: 509305, orders: 2340, roas: 20.96, brandName: "Gold Winner", product: "Gingelly Oil", date: daysAgo(1) },
  { platform: "Swiggy Instamart", market: "Karnataka", city: "Mysore", spend: 0, revenue: 43811, orders: 188, roas: 0, brandName: "Gold Winner", product: "Groundnut Oil", date: daysAgo(4) },
  { platform: "Swiggy Instamart", market: "Tamil Nadu", city: "Chennai", spend: 0, revenue: 931868, orders: 3295, roas: 0, brandName: "Dheepam", product: "Rice Bran Oil", date: daysAgo(6) },
  { platform: "BigBasket", market: "Kerala", city: "Kochi", spend: 11800, revenue: 84200, orders: 360, roas: 7.14, brandName: "Dheepam", product: "Refined Sunflower Oil", date: daysAgo(12) },
  { platform: "Zepto", market: "Karnataka", city: "Bengaluru", spend: 33400, revenue: 198500, orders: 820, roas: 5.94, brandName: "Gold Winner", product: "Rice Bran Oil", date: daysAgo(18) },
  { platform: "Flipkart", market: "Tamil Nadu", city: "Coimbatore", spend: 9600, revenue: 57300, orders: 240, roas: 5.97, brandName: "Dheepam", product: "Groundnut Oil", date: daysAgo(25) },
];

export const mockCampaignData: CampaignRow[] = [
  { platform: "Zepto", campaignName: "GW-Generic-HYD-Aug 2026", brandName: "Gold Winner", campaignType: "AUCTION_UP_SELL", budget: 35000, spend: 29560, revenue: 125711, orders: 562, roas: 4.25, status: "PAUSED", market: "Andhra Pradesh", product: "Refined Sunflower Oil", date: daysAgo(0) },
  { platform: "Zepto", campaignName: "Gold Winner-KA-1L/2L-July 2026", brandName: "Gold Winner", campaignType: "AUCTION_UP_SELL", budget: 12000, spend: 12003, revenue: 106662, orders: 524, roas: 8.89, status: "PAUSED", market: "Karnataka", product: "Groundnut Oil", date: daysAgo(2) },
  { platform: "Zepto", campaignName: "Dheepam TN Aug", brandName: "Dheepam", campaignType: "AUCTION_UP_SELL", budget: 18000, spend: 17500, revenue: 121000, orders: 490, roas: 6.91, status: "ACTIVE", market: "Tamil Nadu", product: "Rice Bran Oil", date: daysAgo(3) },
  { platform: "Swiggy Instamart", campaignName: "Gold winner TN Aug 2026", brandName: "Gold Winner", campaignType: "AUCTION_UP_SELL", budget: 70000, spend: 12651, revenue: 219821, orders: 777, roas: 17.38, status: "PAUSED", market: "Tamil Nadu", product: "Gingelly Oil", date: daysAgo(5) },
  { platform: "Swiggy Instamart", campaignName: "Dheepam KAR Aug", brandName: "Dheepam", campaignType: "AUCTION_UP_SELL", budget: 40000, spend: 18200, revenue: 154300, orders: 640, roas: 8.48, status: "ACTIVE", market: "Karnataka", product: "Refined Sunflower Oil", date: daysAgo(8) },
  { platform: "Blinkit", campaignName: "Dheepam KL Aug 2026", brandName: "Dheepam", campaignType: "AUCTION_UP_SELL", budget: 15000, spend: 9800, revenue: 61200, orders: 270, roas: 6.24, status: "ACTIVE", market: "Kerala", product: "Rice Bran Oil", date: daysAgo(10) },
  { platform: "BigBasket", campaignName: "Gold Winner KL Aug 2026", brandName: "Gold Winner", campaignType: "AUCTION_UP_SELL", budget: 20000, spend: 14350, revenue: 98100, orders: 410, roas: 6.84, status: "ACTIVE", market: "Kerala", product: "Refined Sunflower Oil", date: daysAgo(15) },
  { platform: "Flipkart", campaignName: "Dheepam AP Aug 2026", brandName: "Dheepam", campaignType: "AUCTION_UP_SELL", budget: 25000, spend: 21100, revenue: 132500, orders: 505, roas: 6.28, status: "PAUSED", market: "Andhra Pradesh", product: "Groundnut Oil", date: daysAgo(20) },
];