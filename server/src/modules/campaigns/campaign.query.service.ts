import { HydratedDocument, QueryFilter } from "mongoose";
import { IUser } from "../users/user.model";
import { Campaign, ICampaign } from "./campaign.model";
import { ListCampaignsQuery } from "./campaign.schema";
import { detectPlatformsInFileName } from "./campaign.formats";

const MAX_PAGE_LIMIT = 100;

const CAMPAIGN_GRID_PROJECTION = {
  _id: 1,
  uploadId: 1,
  platform: 1,
  reportDate: 1,
  market: 1,
  subMarket: 1,
  CampaignName: 1,
  BrandName: 1,
  SubBrandName: 1,
  Budget: 1,
  Spend: 1,
  Revenue: 1,
  Orders: 1,
  Roas: 1,
} as const;

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function allowedPlatformSlugs(
  user: HydratedDocument<IUser>
): string[] | null {
  if (
    user.role === "super_admin" ||
    user.platformAccess === "all"
  ) {
    return null;
  }

  return [
    ...new Set(
      user.platforms.flatMap((name) =>
        detectPlatformsInFileName(name)
      )
    ),
  ];
}

function parsePlatforms(
  platform?: string
): string[] | null {
  if (!platform) return null;

  const platforms = [
    ...new Set(
      platform
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    ),
  ];

  return platforms.length > 0 ? platforms : null;
}

function normalizePagination(
  page: number,
  limit: number
) {
  return {
    page:
      Number.isFinite(page) && page >= 1
        ? Math.floor(page)
        : 1,
    limit:
      Number.isFinite(limit) && limit >= 1
        ? Math.min(Math.floor(limit), MAX_PAGE_LIMIT)
        : 20,
  };
}

export async function listCampaigns(
  query: ListCampaignsQuery,
  user: HydratedDocument<IUser>
) {
  const { page, limit } = normalizePagination(
    query.page,
    query.limit
  );

  const {
    platform,
    from,
    to,
    market,
    subMarket,
    brand,
    subBrand,
    search,
    sortBy,
    sortOrder,
  } = query;

  const filter: QueryFilter<ICampaign> = {};

  const requestedPlatforms = parsePlatforms(platform);
  const allowedPlatforms = allowedPlatformSlugs(user);

  let effectivePlatforms: string[] | null =
    requestedPlatforms;

  if (allowedPlatforms !== null) {
    effectivePlatforms = requestedPlatforms
      ? requestedPlatforms.filter((requested) =>
          allowedPlatforms.includes(requested)
        )
      : allowedPlatforms;

    if (effectivePlatforms.length === 0) {
      return {
        campaigns: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 1,
        },
      };
    }
  }

  if (effectivePlatforms) {
    filter.platform = { $in: effectivePlatforms };
  }

  if (from || to) {
    filter.reportDate = {
      ...(from ? { $gte: from } : {}),
      ...(to ? { $lte: to } : {}),
    };
  }

  if (market?.trim()) {
    filter.market = {
      $regex: `^${escapeRegex(market.trim())}$`,
      $options: "i",
    };
  }

  if (subMarket?.trim()) {
    filter.subMarket = {
      $regex: `^${escapeRegex(subMarket.trim())}$`,
      $options: "i",
    };
  }

  if (brand?.trim()) {
    filter.BrandName = {
      $regex: `^${escapeRegex(brand.trim())}$`,
      $options: "i",
    };
  }

  if (subBrand?.trim()) {
    filter.SubBrandName = {
      $regex: `^${escapeRegex(subBrand.trim())}$`,
      $options: "i",
    };
  }

  if (search?.trim()) {
    filter.CampaignName = {
      $regex: escapeRegex(search.trim()),
      $options: "i",
    };
  }

  const sortDirection: 1 | -1 =
    sortOrder === "asc" ? 1 : -1;

  const sort = {
    [sortBy]: sortDirection,
    _id: 1,
  } as Record<string, 1 | -1>;

  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    Campaign.find(filter)
      .select(CAMPAIGN_GRID_PROJECTION)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),

    Campaign.countDocuments(filter),
  ]);

  return {
    campaigns: docs.map((doc) => ({
      id: String(doc._id),
      uploadId: String(doc.uploadId),
      platform: doc.platform,
      reportDate: doc.reportDate,
      market: doc.market,
      subMarket: doc.subMarket ?? null,
      CampaignName: doc.CampaignName,
      BrandName: doc.BrandName,
      SubBrandName: doc.SubBrandName ?? "",
      Budget: doc.Budget,
      Spend: doc.Spend,
      Revenue: doc.Revenue,
      Orders: doc.Orders,
      Roas: doc.Roas,
    })),

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(
        1,
        Math.ceil(total / limit)
      ),
    },
  };
}

export async function getCampaignFilterOptions(
  user: HydratedDocument<IUser>,
  params: {
    platform?: string;
    brand?: string;
  }
) {
  const filter: QueryFilter<ICampaign> = {};

  const allowedPlatforms = allowedPlatformSlugs(user);
  const requestedPlatforms = parsePlatforms(
    params.platform
  );

  let effectivePlatforms: string[] | null =
    requestedPlatforms;

  if (allowedPlatforms !== null) {
    effectivePlatforms = requestedPlatforms
      ? requestedPlatforms.filter((requested) =>
          allowedPlatforms.includes(requested)
        )
      : allowedPlatforms;
  }

  if (effectivePlatforms !== null) {
    filter.platform = { $in: effectivePlatforms };
  }

  if (params.brand?.trim()) {
    filter.BrandName = {
      $regex: `^${escapeRegex(params.brand.trim())}$`,
      $options: "i",
    };
  }

  const rows = await Campaign.find(filter)
    .select({
      BrandName: 1,
      SubBrandName: 1,
      market: 1,
      subMarket: 1,
    })
    .lean();

  const brands = new Set<string>();
  const subBrands = new Set<string>();
  const markets = new Set<string>();
  const subMarkets = new Set<string>();

  for (const row of rows) {
    const brandName = String(
      row.BrandName ?? ""
    ).trim();

    const subBrandName = String(
      row.SubBrandName ?? ""
    ).trim();

    const marketName = String(
      row.market ?? ""
    ).trim();

    const subMarketName = String(
      row.subMarket ?? ""
    ).trim();

    if (brandName) brands.add(brandName);
    if (subBrandName) subBrands.add(subBrandName);
    if (marketName) markets.add(marketName);
    if (subMarketName) subMarkets.add(subMarketName);
  }

  return {
    brands: [...brands].sort((a, b) =>
      a.localeCompare(b)
    ),
    subBrands: [...subBrands].sort((a, b) =>
      a.localeCompare(b)
    ),
    markets: [...markets].sort((a, b) =>
      a.localeCompare(b)
    ),
    subMarkets: [...subMarkets].sort((a, b) =>
      a.localeCompare(b)
    ),
  };
}
