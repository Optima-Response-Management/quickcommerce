import * as XLSX from "xlsx";
import type { CityRow, CampaignRow } from "./types";

type Platform = "GW" | "SwiggyInstamart" | "Zepto";
type ReportType = "city" | "campaign";

const cityColumnMap: Record<Platform, Record<string, string>> = {
  GW: { market: "Market", city: "CityName", spend: "Spend", revenue: "Revenue", orders: "Orders", roas: "Roas" },
  SwiggyInstamart: { market: "Market", city: "CITY", spend: "", revenue: "BRAND_GMV", orders: "BRAND_ORDERS", roas: "" },
  Zepto: { market: "", city: "", spend: "", revenue: "", orders: "", roas: "" }, // Zepto has no city report
};

const campaignColumnMap: Record<Platform, Record<string, string>> = {
  Zepto: {
    campaignName: "CampaignName", brandName: "BrandName", campaignType: "CampaignType",
    budget: "Daily_budget", spend: "Spend", revenue: "Revenue", orders: "Orders",
    roas: "Roas", status: "Status", uniqueConsiderations: "Unique_considerations", uniqueReach: "Unique_reach",
  },
  SwiggyInstamart: {
    campaignName: "CampaignName", brandName: "BrandName", campaignType: "CampaignType",
    budget: "TOTAL_BUDGET", spend: "TOTAL_BUDGET_BURNT", revenue: "TOTAL_GMV", orders: "TOTAL_CONVERSIONS",
    roas: "TOTAL_ROI", status: "Status", uniqueConsiderations: "", uniqueReach: "",
  },
  GW: {
    campaignName: "", brandName: "", campaignType: "", budget: "", spend: "",
    revenue: "", orders: "", roas: "", status: "", uniqueConsiderations: "", uniqueReach: "",
  },
};

function toNumber(val: unknown): number {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

export async function parseExcelFile(
  file: File,
  platform: Platform,
  reportType: ReportType
): Promise<CityRow[] | CampaignRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

  if (reportType === "city") {
    const map = cityColumnMap[platform];
    return rows.map((row): CityRow => ({
      platform,
      market: String(row[map.market] ?? ""),
      city: String(row[map.city] ?? ""),
      spend: map.spend ? toNumber(row[map.spend]) : 0,
      revenue: toNumber(row[map.revenue]),
      orders: toNumber(row[map.orders]),
      roas: map.roas ? toNumber(row[map.roas]) : 0,
    }));
  }

  const map = campaignColumnMap[platform];
  return rows.map((row): CampaignRow => ({
    platform,
    campaignName: String(row[map.campaignName] ?? ""),
    brandName: String(row[map.brandName] ?? ""),
    campaignType: String(row[map.campaignType] ?? ""),
    budget: toNumber(row[map.budget]),
    spend: toNumber(row[map.spend]),
    revenue: toNumber(row[map.revenue]),
    orders: toNumber(row[map.orders]),
    roas: toNumber(row[map.roas]),
    status: String(row[map.status] ?? ""),
   
  }));
}