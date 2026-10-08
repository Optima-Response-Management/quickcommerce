import {
  HydratedDocument,
  FilterQuery,
} from "mongoose";

import { IUser } from "../users/user.model";

import {
  Campaign,
  ICampaign,
} from "./campaign.model";

import {
  ListCampaignsQuery,
} from "./campaign.schema";

import {
  detectPlatformsInFileName,
} from "./campaign.formats";

const MAX_PAGE_LIMIT = 100;

const CAMPAIGN_GRID_PROJECTION = {
  _id: 1,
  uploadId: 1,
  platform: 1,
  reportDate: 1,
  market: 1,

  CampaignName: 1,

  BrandName: 1,

  SubBrandName: 1,

  Budget: 1,
  Spend: 1,
  Revenue: 1,
  Orders: 1,
  Roas: 1,
} as const;

function escapeRegex(
  value: string,
): string {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
}

function allowedPlatformSlugs(
  user: HydratedDocument<IUser>,
): string[] | null {
  if (
    user.role ===
      "super_admin" ||
    user.platformAccess ===
      "all"
  ) {
    return null;
  }

  const platforms =
    user.platforms.flatMap(
      (name) =>
        detectPlatformsInFileName(
          name,
        ),
    );

  return [
    ...new Set(platforms),
  ];
}

function parsePlatforms(
  platform?: string,
): string[] | null {
  if (!platform) {
    return null;
  }

  const platforms = [
    ...new Set(
      platform
        .split(",")
        .map((value) =>
          value.trim(),
        )
        .filter(Boolean),
    ),
  ];

  return platforms.length > 0
    ? platforms
    : null;
}

function normalizePagination(
  page: number,
  limit: number,
) {
  const safePage =
    Number.isFinite(page) &&
    page >= 1
      ? Math.floor(page)
      : 1;

  const safeLimit =
    Number.isFinite(limit) &&
    limit >= 1
      ? Math.min(
          Math.floor(limit),
          MAX_PAGE_LIMIT,
        )
      : 20;

  return {
    page: safePage,
    limit: safeLimit,
  };
}

export async function listCampaigns(
  query: ListCampaignsQuery,
  user: HydratedDocument<IUser>,
) {
  const {
    page,
    limit,
  } = normalizePagination(
    query.page,
    query.limit,
  );

  const {
    platform,
    from,
    to,
    brand,
    subBrand,
    search,
    sortBy,
    sortOrder,
  } = query;

  const filter: FilterQuery<ICampaign> =
    {};

  // ==========================================================
  // PLATFORM
  // ==========================================================

  const requestedPlatforms =
    parsePlatforms(platform);

  const allowedPlatforms =
    allowedPlatformSlugs(user);

  let effectivePlatforms:
    | string[]
    | null =
    requestedPlatforms;

  if (
    allowedPlatforms !== null
  ) {
    if (requestedPlatforms) {
      effectivePlatforms =
        requestedPlatforms.filter(
          (requested) =>
            allowedPlatforms.includes(
              requested,
            ),
        );

      if (
        effectivePlatforms.length ===
        0
      ) {
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
      effectivePlatforms =
        allowedPlatforms;

      if (
        effectivePlatforms.length ===
        0
      ) {
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

  // ==========================================================
  // DATE
  // ==========================================================

  if (from || to) {
    filter.reportDate = {
      ...(from
        ? { $gte: from }
        : {}),

      ...(to
        ? { $lte: to }
        : {}),
    };
  }

  // ==========================================================
  // BRAND
  // ==========================================================

  if (brand?.trim()) {
    const escapedBrand =
      escapeRegex(
        brand.trim(),
      );

    filter.BrandName = {
      $regex: `^${escapedBrand}$`,
      $options: "i",
    };
  }

  // ==========================================================
  // SUB BRAND
  // ==========================================================

  if (subBrand?.trim()) {
    const escapedSubBrand =
      escapeRegex(
        subBrand.trim(),
      );

    filter.SubBrandName = {
      $regex: `^${escapedSubBrand}$`,
      $options: "i",
    };
  }

  // ==========================================================
  // SEARCH
  // ==========================================================

  if (search?.trim()) {
    const escapedSearch =
      escapeRegex(
        search.trim(),
      );

    filter.CampaignName = {
      $regex: escapedSearch,
      $options: "i",
    };
  }

  // ==========================================================
  // SORT
  // ==========================================================

  const sortDirection: 1 | -1 =
    sortOrder === "asc"
      ? 1
      : -1;

  const sort = {
    [sortBy]:
      sortDirection,

    _id: 1,
  } as Record<
    string,
    1 | -1
  >;

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const skip =
    (page - 1) * limit;

  // ==========================================================
  // DATABASE
  // ==========================================================

  const [docs, total] =
    await Promise.all([
      Campaign.find(filter)
        .select(
          CAMPAIGN_GRID_PROJECTION,
        )
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),

      Campaign.countDocuments(
        filter,
      ),
    ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      total / limit,
    ),
  );

  // ==========================================================
  // RESPONSE
  // ==========================================================

  return {
    campaigns: docs.map(
      (doc) => ({
        id: String(
          doc._id,
        ),

        uploadId: String(
          doc.uploadId,
        ),

        platform:
          doc.platform,

        reportDate:
          doc.reportDate,

        market:
          doc.market,

        CampaignName:
          doc.CampaignName,

        BrandName:
          doc.BrandName,

        SubBrandName:
          doc.SubBrandName ??
          "",

        Budget:
          doc.Budget,

        Spend:
          doc.Spend,

        Revenue:
          doc.Revenue,

        Orders:
          doc.Orders,

        Roas:
          doc.Roas,
      }),
    ),

    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

// ============================================================
// CAMPAIGN FILTER OPTIONS
//
// IMPORTANT:
// These options come from Campaign documents,
// NOT the Locations collection.
// ============================================================

export async function getCampaignFilterOptions(
  user: HydratedDocument<IUser>,
  params: {
    platform?: string;
    brand?: string;
  },
) {
  const filter: FilterQuery<ICampaign> =
    {};

  const allowedPlatforms =
    allowedPlatformSlugs(user);

  const requestedPlatforms =
    parsePlatforms(
      params.platform,
    );

  let effectivePlatforms:
    | string[]
    | null =
    requestedPlatforms;

  if (
    allowedPlatforms !== null
  ) {
    if (requestedPlatforms) {
      effectivePlatforms =
        requestedPlatforms.filter(
          (requested) =>
            allowedPlatforms.includes(
              requested,
            ),
        );
    } else {
      effectivePlatforms =
        allowedPlatforms;
    }
  }

  if (
    effectivePlatforms !== null
  ) {
    filter.platform = {
      $in: effectivePlatforms,
    };
  }

  if (params.brand?.trim()) {
    filter.BrandName = {
      $regex: `^${escapeRegex(
        params.brand.trim(),
      )}$`,
      $options: "i",
    };
  }

  const rows =
    await Campaign.find(filter)
      .select({
        BrandName: 1,
        SubBrandName: 1,
      })
      .lean();

  const brands =
    new Set<string>();

  const subBrands =
    new Set<string>();

  for (const row of rows) {
    const brandName =
      String(
        row.BrandName ?? "",
      ).trim();

    const subBrandName =
      String(
        row.SubBrandName ?? "",
      ).trim();

    if (brandName) {
      brands.add(
        brandName,
      );
    }

    if (subBrandName) {
      subBrands.add(
        subBrandName,
      );
    }
  }

  return {
    brands: [
      ...brands,
    ].sort((a, b) =>
      a.localeCompare(b),
    ),

    subBrands: [
      ...subBrands,
    ].sort((a, b) =>
      a.localeCompare(b),
    ),
  };
}