// Maps each platform's raw Excel header to our canonical term.
// Used by the parser to normalize any uploaded file into CityRow / CampaignRow.

export const cityMappings: Record<string, Record<keyof CityRowRaw, string>> = {
  GW: {
    market: "Market",
    city: "CityName",
    spend: "Spend",
    revenue: "Revenue",
    orders: "Orders",
    roas: "Roas", // not present in every GW file — treat as optional/0 if missing
  },
  SwiggyInstamart: {
    market: "Market",
    city: "CITY",
    spend: "", // Swiggy's city sheet has no spend column — leave blank/0
    revenue: "BRAND_GMV",
    orders: "BRAND_ORDERS",
    roas: "",
  },
};

export const campaignMappings: Record<string, Record<keyof CampaignRowRaw, string>> = {
  Zepto: {
    campaignName: "CampaignName",
    brandName: "BrandName",
    campaignType: "CampaignType",
    budget: "Daily_budget",
    spend: "Spend",
    revenue: "Revenue",
    orders: "Orders",
    roas: "Roas",
    status: "Status",
  },
  SwiggyInstamart: {
    campaignName: "CampaignName",
    brandName: "BrandName",
    campaignType: "CampaignType",
    budget: "TOTAL_BUDGET",
    spend: "TOTAL_BUDGET_BURNT",
    revenue: "TOTAL_GMV",
    orders: "TOTAL_CONVERSIONS",
    roas: "TOTAL_ROI",
    status: "Status",
  },
};

// Raw shape placeholders — real column names per platform (used above)
type CityRowRaw = { market: string; city: string; spend: string; revenue: string; orders: string; roas: string };
type CampaignRowRaw = { campaignName: string; brandName: string; campaignType: string; budget: string; spend: string; revenue: string; orders: string; roas: string; status: string };