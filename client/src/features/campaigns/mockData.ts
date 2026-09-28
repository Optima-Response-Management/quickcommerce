import type { CityRow, CampaignRow } from "./types";
import { daysAgo } from "./dateUtils";

export const mockCityData: CityRow[] = [
  { platform: "Blinkit", market: "Andhra Pradesh", city: "Hyderabad", spend: 46514, revenue: 229369, orders: 996, roas: 4.93, brandName: "Gold Winner", product: "Refined Sunflower Oil", date: daysAgo(0) },
  { platform: "Blinkit", market: "Tamil Nadu", city: "Chennai", spend: 24296, revenue: 509305, orders: 2340, roas: 20.96, brandName: "Gold Winner", product: "Gingelly Oil", date: daysAgo(1) },
  { platform: "Blinkit", market: "Tamil Nadu", city: "Coimbatore", spend: 15200, revenue: 78400, orders: 410, roas: 5.16, brandName: "Dheepam", product: "Dheepam Oil", date: daysAgo(2) }, // ✨ Dheepam Oil added
  { platform: "Swiggy Instamart", market: "Karnataka", city: "Mysore", spend: 0, revenue: 43811, orders: 188, roas: 0, brandName: "Gold Winner", product: "Groundnut Oil", date: daysAgo(4) },
  { platform: "Swiggy Instamart", market: "Tamil Nadu", city: "Chennai", spend: 0, revenue: 931868, orders: 3295, roas: 0, brandName: "Dheepam", product: "Rice Bran Oil", date: daysAgo(6) },
  { platform: "BigBasket", market: "Andhra Pradesh", city: "Visakhapatnam", spend: 8500, revenue: 42000, orders: 210, roas: 4.94, brandName: "Dheepam", product: "Dheepam Oil", date: daysAgo(7) }, // ✨ Dheepam Oil added
  { platform: "BigBasket", market: "Kerala", city: "Kochi", spend: 11800, revenue: 84200, orders: 360, roas: 7.14, brandName: "Dheepam", product: "Refined Sunflower Oil", date: daysAgo(12) },
  { platform: "Zepto", market: "Kerala", city: "Thiruvananthapuram", spend: 22000, revenue: 115000, orders: 550, roas: 5.23, brandName: "Dheepam", product: "Dheepam Oil", date: daysAgo(14) }, // ✨ Dheepam Oil added
  { platform: "Zepto", market: "Karnataka", city: "Bengaluru", spend: 33400, revenue: 198500, orders: 820, roas: 5.94, brandName: "Gold Winner", product: "Rice Bran Oil", date: daysAgo(18) },
  { platform: "Flipkart", market: "Karnataka", city: "Mangalore", spend: 5400, revenue: 28500, orders: 130, roas: 5.28, brandName: "Dheepam", product: "Dheepam Oil", date: daysAgo(21) }, // ✨ Dheepam Oil added
  { platform: "Flipkart", market: "Tamil Nadu", city: "Coimbatore", spend: 9600, revenue: 57300, orders: 240, roas: 5.97, brandName: "Dheepam", product: "Groundnut Oil", date: daysAgo(25) },
];

export const mockCampaignData: CampaignRow[] = [
  { platform: "Zepto", campaignName: "GW-Generic-HYD-Aug 2026", brandName: "Gold Winner", campaignType: "AUCTION_UP_SELL", budget: 35000, spend: 29560, revenue: 125711, orders: 562, roas: 4.25, status: "PAUSED", market: "Andhra Pradesh", product: "Refined Sunflower Oil", date: daysAgo(0) },
  { platform: "Blinkit", campaignName: "Dheepam TN Coimbatore Aug", brandName: "Dheepam", campaignType: "AUCTION_UP_SELL", budget: 20000, spend: 15200, revenue: 78400, orders: 410, roas: 5.16, status: "ACTIVE", market: "Tamil Nadu", product: "Dheepam Oil", date: daysAgo(2) }, // ✨ Dheepam Oil added
  { platform: "Zepto", campaignName: "Gold Winner-KA-1L/2L-July 2026", brandName: "Gold Winner", campaignType: "AUCTION_UP_SELL", budget: 12000, spend: 12003, revenue: 106662, orders: 524, roas: 8.89, status: "PAUSED", market: "Karnataka", product: "Groundnut Oil", date: daysAgo(2) },
  { platform: "Zepto", campaignName: "Dheepam TN Aug", brandName: "Dheepam", campaignType: "AUCTION_UP_SELL", budget: 18000, spend: 17500, revenue: 121000, orders: 490, roas: 6.91, status: "ACTIVE", market: "Tamil Nadu", product: "Rice Bran Oil", date: daysAgo(3) },
  { platform: "Swiggy Instamart", campaignName: "Gold winner TN Aug 2026", brandName: "Gold Winner", campaignType: "AUCTION_UP_SELL", budget: 70000, spend: 12651, revenue: 219821, orders: 777, roas: 17.38, status: "PAUSED", market: "Tamil Nadu", product: "Gingelly Oil", date: daysAgo(5) },
  { platform: "BigBasket", campaignName: "Dheepam AP Vizag Aug", brandName: "Dheepam", campaignType: "AUCTION_UP_SELL", budget: 10000, spend: 8500, revenue: 42000, orders: 210, roas: 4.94, status: "ACTIVE", market: "Andhra Pradesh", product: "Dheepam Oil", date: daysAgo(7) }, // ✨ Dheepam Oil added
  { platform: "Swiggy Instamart", campaignName: "Dheepam KAR Aug", brandName: "Dheepam", campaignType: "AUCTION_UP_SELL", budget: 40000, spend: 18200, revenue: 154300, orders: 640, roas: 8.48, status: "ACTIVE", market: "Karnataka", product: "Refined Sunflower Oil", date: daysAgo(8) },
  { platform: "Blinkit", campaignName: "Dheepam KL Aug 2026", brandName: "Dheepam", campaignType: "AUCTION_UP_SELL", budget: 15000, spend: 9800, revenue: 61200, orders: 270, roas: 6.24, status: "ACTIVE", market: "Kerala", product: "Rice Bran Oil", date: daysAgo(10) },
  { platform: "Zepto", campaignName: "Dheepam KL TVM Aug", brandName: "Dheepam", campaignType: "AUCTION_UP_SELL", budget: 25000, spend: 22000, revenue: 115000, orders: 550, roas: 5.23, status: "PAUSED", market: "Kerala", product: "Dheepam Oil", date: daysAgo(14) }, // ✨ Dheepam Oil added
  { platform: "BigBasket", campaignName: "Gold Winner KL Aug 2026", brandName: "Gold Winner", campaignType: "AUCTION_UP_SELL", budget: 20000, spend: 14350, revenue: 98100, orders: 410, roas: 6.84, status: "ACTIVE", market: "Kerala", product: "Refined Sunflower Oil", date: daysAgo(15) },
  { platform: "Flipkart", campaignName: "Dheepam AP Aug 2026", brandName: "Dheepam", campaignType: "AUCTION_UP_SELL", budget: 25000, spend: 21100, revenue: 132500, orders: 505, roas: 6.28, status: "PAUSED", market: "Andhra Pradesh", product: "Groundnut Oil", date: daysAgo(20) },
  { platform: "Flipkart", campaignName: "Dheepam KA Mangalore Aug", brandName: "Dheepam", campaignType: "AUCTION_UP_SELL", budget: 8000, spend: 5400, revenue: 28500, orders: 130, roas: 5.28, status: "ACTIVE", market: "Karnataka", product: "Dheepam Oil", date: daysAgo(21) }, // ✨ Dheepam Oil added
];