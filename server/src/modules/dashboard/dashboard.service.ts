import { HydratedDocument } from "mongoose";
import { Platform } from "../platforms/platform.model";
import { platformFilter } from "../campaigns/campaign.access";
import { Campaign } from "../campaigns/campaign.model";
import { IUser } from "../users/user.model";
import { DashboardQuery } from "../../modules/dashboard/dashboard.schema";

// Zepto and BigBasket report a daily budget, the others a total budget.
// The numbers are added as they are, this only lets the screen label them.
const BUDGET_TYPE: Record<string, "daily" | "total"> = {
  zepto: "daily",
  bigbasket: "daily",
  swiggy: "total",
  blinkit: "total",
  flipkart: "total",
};

const round2 = (n: number) => Math.round((n || 0) * 100) / 100;

// ROAS from the totals (Revenue / Spend), not an average of each row's ROAS
const roasOf = (revenue: number, spend: number) => (spend > 0 ? round2(revenue / spend) : 0);

const sums = {
  Budget: { $sum: "$Budget" },
  Spend: { $sum: "$Spend" },
  Revenue: { $sum: "$Revenue" },
  Orders: { $sum: "$Orders" },
};

interface Sums {
  Budget: number;
  Spend: number;
  Revenue: number;
  Orders: number;
}

export async function getDashboardSummary(query: DashboardQuery, user: HydratedDocument<IUser>) {
  const match: Record<string, unknown> = {};

  // Only the platforms this user is allowed to see
  const platform = platformFilter(query.platform, user);
  if (platform) match.platform = platform;

  if (query.from || query.to) {
    match.reportDate = {
      ...(query.from ? { $gte: query.from } : {}),
      ...(query.to ? { $lte: query.to } : {}),
    };
  }

  const [totalRows, platformRows, dateRows, platforms] = await Promise.all([
    Campaign.aggregate<Sums & { avgRoas: number; campaignCount: number }>([
      { $match: match },
      { $group: { _id: null, ...sums, avgRoas: { $avg: "$Roas" }, campaignCount: { $sum: 1 } } },
    ]),
    Campaign.aggregate<Sums & { _id: string }>([
      { $match: match },
      { $group: { _id: "$platform", ...sums } },
      { $sort: { _id: 1 } },
    ]),
    Campaign.aggregate<Sums & { _id: string }>([
      { $match: match },
      { $group: { _id: "$reportDate", ...sums } },
      { $sort: { _id: 1 } },
    ]),
    Platform.find().select("slug name").lean(),
  ]);

  const t = totalRows[0] ?? { Budget: 0, Spend: 0, Revenue: 0, Orders: 0, avgRoas: 0, campaignCount: 0 };
  const names = new Map(platforms.map((p) => [p.slug, p.name]));

  return {
    // For the stat cards
    totals: {
      Budget: round2(t.Budget),
      Spend: round2(t.Spend),
      Revenue: round2(t.Revenue),
      Orders: round2(t.Orders),
      Roas: roasOf(t.Revenue, t.Spend), // Revenue / Spend
      avgRoas: round2(t.avgRoas), // simple average of each campaign's Roas
      utilisation: t.Budget > 0 ? Math.round((t.Spend / t.Budget) * 100) : 0, // Spend as a % of Budget
      campaignCount: t.campaignCount,
    },
    // For the Bar chart: Budget vs Spend by platform
    byPlatform: platformRows.map((r) => ({
      platform: r._id,
      platformName: names.get(r._id) ?? r._id,
      budgetType: BUDGET_TYPE[r._id] ?? "total",
      Budget: round2(r.Budget),
      Spend: round2(r.Spend),
      Revenue: round2(r.Revenue),
      Orders: round2(r.Orders),
      Roas: roasOf(r.Revenue, r.Spend),
    })),
    // For the Line chart: Budget vs Spend over time
    byDate: dateRows.map((r) => ({
      reportDate: r._id,
      Budget: round2(r.Budget),
      Spend: round2(r.Spend),
      Revenue: round2(r.Revenue),
      Orders: round2(r.Orders),
    })),
  };
}