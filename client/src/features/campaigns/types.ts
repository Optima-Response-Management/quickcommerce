export interface CityRow {
  platform: string;
  market: string;
  city: string;
  spend: number;
  revenue: number;
  orders: number;
  roas: number;
}

export interface CampaignRow {
  platform: string;
  campaignName: string;
  brandName: string;
  campaignType: string;
  budget: number;
  spend: number;
  revenue: number;
  orders: number;
  roas: number;
  status: string;
}