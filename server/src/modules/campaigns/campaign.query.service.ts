import { HydratedDocument, FilterQuery } from "mongoose";
import { IUser } from "../users/user.model";
import { Campaign, ICampaign } from "./campaign.model";
import { ListCampaignsQuery } from "./campaign.schema";
import { detectPlatformsInFileName } from "./campaign.formats";

/* ============================================================
   CONSTANTS
============================================================ */

const MAX_PAGE_LIMIT = 100;

/*
 * Only select fields that the campaign grid actually needs.
 *
 * This reduces:
 * - MongoDB document transfer
 * - Node.js memory usage
 * - serialization cost
 * - API response size
 */
const CAMPAIGN_GRID_PROJECTION = {
  _id: 1,
  uploadId: 1,
  platform: 1,
  reportDate: 1,
  market: 1,
  CampaignName: 1,
  BrandName: 1,
  Budget: 1,
  Spend: 1,
  Revenue: 1,
  Orders: 1,
  Roas: 1,
} as const;

/* ============================================================
   HELPERS
============================================================ */

/**
 * Escape user-provided text before using it inside MongoDB regex.
 *
 * This prevents characters such as:
 * . * + ? ^ $ ( ) [ ] { } |
 * from changing the intended regex.
 */
function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Returns the platforms the current user is allowed to access.
 *
 * null = unrestricted access.
 */
function allowedPlatformSlugs(
  user: HydratedDocument<IUser>
): string[] | null {
  if (
    user.role === "super_admin" ||
    user.platformAccess === "all"
  ) {
    return null;
  }

  const platforms = user.platforms.flatMap((name) =>
    detectPlatformsInFileName(name)
  );

  return [...new Set(platforms)];
}

/**
 * Normalizes the platform query parameter.
 *
 * Example:
 *
 * "swiggy,zepto, swiggy"
 *
 * becomes:
 *
 * ["swiggy", "zepto"]
 */
function parsePlatforms(
  platform?: string
): string[] | null {
  if (!platform) {
    return null;
  }

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

/**
 * Makes sure pagination values are safe even if this service
 * gets called without schema validation somewhere else.
 */
function normalizePagination(
  page: number,
  limit: number
) {
  const safePage =
    Number.isFinite(page) && page >= 1
      ? Math.floor(page)
      : 1;

  const safeLimit =
    Number.isFinite(limit) && limit >= 1
      ? Math.min(Math.floor(limit), MAX_PAGE_LIMIT)
      : 20;

  return {
    page: safePage,
    limit: safeLimit,
  };
}

/* ============================================================
   SERVICE
============================================================ */

export async function listCampaigns(
  query: ListCampaignsQuery,
  user: HydratedDocument<IUser>
) {
  /* ==========================================================
     PAGINATION
  ========================================================== */

  const { page, limit } = normalizePagination(
    query.page,
    query.limit
  );

  const {
    platform,
    from,
    to,
    brand,
    search,
    sortBy,
    sortOrder,
  } = query;

  /* ==========================================================
     FILTER
  ========================================================== */

  const filter: FilterQuery<ICampaign> = {};

  /* ==========================================================
     PLATFORM + USER ACCESS
  ========================================================== */

  const requestedPlatforms = parsePlatforms(platform);

  const allowedPlatforms =
    allowedPlatformSlugs(user);

  let effectivePlatforms:
    | string[]
    | null = requestedPlatforms;

  /*
   * super_admin / platformAccess=all
   *
   * -> requested platform filter is respected
   *
   * restricted user
   *
   * -> intersection of requested + allowed platforms
   */
  if (allowedPlatforms !== null) {
    if (requestedPlatforms) {
      effectivePlatforms =
        requestedPlatforms.filter((requested) =>
          allowedPlatforms.includes(requested)
        );

      /*
       * User requested platforms that they are not allowed
       * to access.
       *
       * Return no records rather than accidentally exposing
       * another platform.
       */
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
    } else {
      effectivePlatforms = allowedPlatforms;

      /*
       * User has no assigned platforms.
       */
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
  }

  if (effectivePlatforms) {
    filter.platform = {
      $in: effectivePlatforms,
    };
  }

  /* ==========================================================
     DATE FILTER
  ========================================================== */

  if (from || to) {
    filter.reportDate = {
      ...(from ? { $gte: from } : {}),
      ...(to ? { $lte: to } : {}),
    };
  }

  /* ==========================================================
     BRAND FILTER
  ========================================================== */

  if (brand?.trim()) {
    const escapedBrand = escapeRegex(
      brand.trim()
    );

    filter.BrandName = {
      $regex: `^${escapedBrand}$`,
      $options: "i",
    };
  }

  /* ==========================================================
     CAMPAIGN SEARCH
  ========================================================== */

  if (search?.trim()) {
    const escapedSearch = escapeRegex(
      search.trim()
    );

    filter.CampaignName = {
      $regex: escapedSearch,
      $options: "i",
    };
  }

  /* ==========================================================
     SORT
  ========================================================== */

  const sortDirection: 1 | -1 =
    sortOrder === "asc" ? 1 : -1;

  /*
   * _id is used as a deterministic tie-breaker.
   *
   * Without this, two records having the same sort value
   * could move between pages between requests.
   */
  const sort = {
    [sortBy]: sortDirection,
    _id: 1,
  } as Record<string, 1 | -1>;

  /* ==========================================================
     PAGINATION
  ========================================================== */

  const skip = (page - 1) * limit;

  /* ==========================================================
     DATABASE QUERIES
  ========================================================== */

  const [docs, total] = await Promise.all([
    Campaign.find(filter)
      .select(CAMPAIGN_GRID_PROJECTION)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),

    Campaign.countDocuments(filter),
  ]);

  /* ==========================================================
     TOTAL PAGES
  ========================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(total / limit)
  );

  /* ==========================================================
     RESPONSE
  ========================================================== */

  return {
    campaigns: docs.map((doc) => ({
      id: String(doc._id),

      uploadId: String(doc.uploadId),

      platform: doc.platform,

      reportDate: doc.reportDate,

      market: doc.market,

      CampaignName: doc.CampaignName,

      BrandName: doc.BrandName,

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
      totalPages,
    },
  };
}