import { HydratedDocument } from "mongoose";

import { Platform } from "../platforms/platform.model";
import { platformFilter } from "../campaigns/campaign.access";
import { Campaign } from "../campaigns/campaign.model";
import { IUser } from "../users/user.model";
import { DashboardQuery } from "../../modules/dashboard/dashboard.schema";

// Zepto and BigBasket report a daily budget, the others a total budget.
// These values label the budget type; they do not change the sums.
const BUDGET_TYPE: Record<string, "daily" | "total"> = {
  zepto: "daily",
  bigbasket: "daily",
  swiggy: "total",
  blinkit: "total",
  flipkart: "total",
};

const round2 = (n: number) =>
  Math.round((n || 0) * 100) / 100;

const roasOf = (revenue: number, spend: number) =>
  spend > 0 ? round2(revenue / spend) : 0;

const sums = {
  Budget: { $sum: { $ifNull: ["$Budget", 0] } },
  Spend: { $sum: { $ifNull: ["$Spend", 0] } },
  Revenue: { $sum: { $ifNull: ["$Revenue", 0] } },
  Orders: { $sum: { $ifNull: ["$Orders", 0] } },
};

interface Sums {
  Budget: number;
  Spend: number;
  Revenue: number;
  Orders: number;
}

interface GroupedSums extends Sums {
  _id: string;
  campaignCount: number;
}

type Match = Record<string, unknown>;

type Breakdown = {
  name: string;
  Budget: number;
  Spend: number;
  Revenue: number;
  Orders: number;
  Roas: number;
  campaignCount: number;
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function addTextFilter(
  match: Match,
  field: string,
  value?: string,
) {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return;
  }

  match[field] = {
    $regex: `^${escapeRegex(normalizedValue)}$`,
    $options: "i",
  };
}

function buildMatch(
  query: DashboardQuery,
  user: HydratedDocument<IUser>,
  excludedFilters: string[] = [],
): Match {
  const match: Match = {};

  // Only the platforms this user is allowed to see.
  const platform = platformFilter(query.platform, user);

  if (platform) {
    match.platform = platform;
  }

  if (query.from || query.to) {
    match.reportDate = {
      ...(query.from ? { $gte: query.from } : {}),
      ...(query.to ? { $lte: query.to } : {}),
    };
  }

  if (!excludedFilters.includes("market")) {
    addTextFilter(match, "market", query.market);
  }

  if (!excludedFilters.includes("subMarket")) {
    addTextFilter(match, "subMarket", query.subMarket);
  }

  if (!excludedFilters.includes("brand")) {
    addTextFilter(match, "BrandName", query.brand);
  }

  if (!excludedFilters.includes("subBrand")) {
    addTextFilter(match, "SubBrandName", query.subBrand);
  }

  return match;
}

async function aggregateBreakdown(
  match: Match,
  field: "market" | "subMarket" | "BrandName" | "SubBrandName",
): Promise<Breakdown[]> {
  const rows = await Campaign.aggregate<GroupedSums>([
    { $match: match },
    {
      $group: {
        _id: {
          $trim: {
            input: {
              $convert: {
                input: `$${field}`,
                to: "string",
                onError: "",
                onNull: "",
              },
            },
          },
        },
        ...sums,
        campaignCount: { $sum: 1 },
      },
    },
    {
      $match: {
        _id: { $nin: ["", null] },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return rows.map((row) => ({
    name: row._id,
    Budget: round2(row.Budget),
    Spend: round2(row.Spend),
    Revenue: round2(row.Revenue),
    Orders: round2(row.Orders),
    Roas: roasOf(row.Revenue, row.Spend),
    campaignCount: row.campaignCount,
  }));
}

export async function getDashboardSummary(
  query: DashboardQuery,
  user: HydratedDocument<IUser>,
) {
  // Main totals and existing charts respect all selected filters.
  const match = buildMatch(query, user);

  // Each breakdown omits its own selected filter so the user can
  // compare values within that dimension.
  //
  // Submarket still respects Market.
  // Sub-brand still respects Brand.
  const marketMatch = buildMatch(query, user, ["market"]);
  const subMarketMatch = buildMatch(query, user, ["subMarket"]);
  const brandMatch = buildMatch(query, user, ["brand"]);
  const subBrandMatch = buildMatch(query, user, ["subBrand"]);

  const [
    totalRows,
    platformRows,
    dateRows,
    platforms,
    byMarket,
    bySubMarket,
    byBrand,
    bySubBrand,
  ] = await Promise.all([
    // Overall totals.
    Campaign.aggregate<
      Sums & {
        avgRoas: number;
        campaignCount: number;
      }
    >([
      { $match: match },
      {
        $group: {
          _id: null,
          ...sums,
          avgRoas: { $avg: "$Roas" },
          campaignCount: { $sum: 1 },
        },
      },
    ]),

    // Existing platform chart.
    Campaign.aggregate<Sums & { _id: string }>([
      { $match: match },
      {
        $group: {
          _id: "$platform",
          ...sums,
        },
      },
      { $sort: { _id: 1 } },
    ]),

    // Existing date chart.
    Campaign.aggregate<Sums & { _id: string }>([
      { $match: match },
      {
        $group: {
          _id: "$reportDate",
          ...sums,
        },
      },
      { $sort: { _id: 1 } },
    ]),

    // Platform display names.
    Platform.find()
      .select("slug name")
      .lean(),

    // Breakdown data.
    aggregateBreakdown(marketMatch, "market"),
    aggregateBreakdown(subMarketMatch, "subMarket"),
    aggregateBreakdown(brandMatch, "BrandName"),
    aggregateBreakdown(subBrandMatch, "SubBrandName"),
  ]);

  const t = totalRows[0] ?? {
    Budget: 0,
    Spend: 0,
    Revenue: 0,
    Orders: 0,
    avgRoas: 0,
    campaignCount: 0,
  };

  const names = new Map(
    platforms.map((platform) => [
      platform.slug,
      platform.name,
    ]),
  );

  return {
    // Stat cards.
    totals: {
      Budget: round2(t.Budget),
      Spend: round2(t.Spend),
      Revenue: round2(t.Revenue),
      Orders: round2(t.Orders),
      Roas: roasOf(t.Revenue, t.Spend),
      avgRoas: round2(t.avgRoas),
      utilisation:
        t.Budget > 0
          ? Math.round((t.Spend / t.Budget) * 100)
          : 0,
      campaignCount: t.campaignCount,
    },

    // Existing platform chart.
    byPlatform: platformRows.map((row) => ({
      platform: row._id,
      platformName: names.get(row._id) ?? row._id,
      budgetType: BUDGET_TYPE[row._id] ?? "total",
      Budget: round2(row.Budget),
      Spend: round2(row.Spend),
      Revenue: round2(row.Revenue),
      Orders: round2(row.Orders),
      Roas: roasOf(row.Revenue, row.Spend),
    })),

    // Existing date chart.
    byDate: dateRows.map((row) => ({
      reportDate: row._id,
      Budget: round2(row.Budget),
      Spend: round2(row.Spend),
      Revenue: round2(row.Revenue),
      Orders: round2(row.Orders),
    })),

    // Breakdown data.
    byMarket,
    bySubMarket,
    byBrand,
    bySubBrand,
  };
}