import { HydratedDocument } from "mongoose";
import { IUser } from "../users/user.model";
import { Campaign } from "./campaign.model";
import { ListCampaignsQuery } from "./campaign.schema";
import { detectPlatformsInFileName } from "./campaign.formats";

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Which platforms this user may see. null means all of them.
// Users store platform names ("Swiggy Instamart"), the data stores slugs ("swiggy"),
// so the names are matched to slugs by keyword.
function allowedPlatformSlugs(user: HydratedDocument<IUser>): string[] | null {
  if (user.role === "super_admin" || user.platformAccess === "all") return null;
  return [...new Set(user.platforms.flatMap((name) => detectPlatformsInFileName(name)))];
}

export async function listCampaigns(query: ListCampaignsQuery, user: HydratedDocument<IUser>) {
  const { platform, from, to, brand, search, sortBy, sortOrder, page, limit } = query;

  const filter: Record<string, unknown> = {};

  // Platform: what was asked for, limited to what this user is allowed to see
  const requested = platform
    ? platform.split(",").map((p) => p.trim()).filter(Boolean)
    : null;
  const allowed = allowedPlatformSlugs(user);
  let platforms = requested;
  if (allowed) platforms = requested ? requested.filter((p) => allowed.includes(p)) : allowed;
  if (platforms) filter.platform = { $in: platforms };

  // Date range (dates are stored as YYYY-MM-DD text, so text comparison is correct)
  if (from || to) {
    filter.reportDate = { ...(from ? { $gte: from } : {}), ...(to ? { $lte: to } : {}) };
  }

  if (brand) filter.BrandName = { $regex: `^${escapeRegex(brand)}$`, $options: "i" };
  if (search) filter.CampaignName = { $regex: escapeRegex(search), $options: "i" };

  // _id is the tie-breaker, so rows never jump between pages
  const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === "asc" ? 1 : -1, _id: 1 };

  const [docs, total] = await Promise.all([
    Campaign.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Campaign.countDocuments(filter),
  ]);

  return {
    campaigns: docs.map((d) => ({
      id: String(d._id),
      uploadId: String(d.uploadId),
      platform: d.platform,
      reportDate: d.reportDate,
      market: d.market,
      CampaignName: d.CampaignName,
      BrandName: d.BrandName,
      Budget: d.Budget,
      Spend: d.Spend,
      Revenue: d.Revenue,
      Orders: d.Orders,
      Roas: d.Roas,
    })),
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}