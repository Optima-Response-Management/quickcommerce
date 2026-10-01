import mongoose from "mongoose";
import { ApiError } from "../../utils/ApiError";
import { Platform } from "../platforms/platform.model";
import { PlatformLocation } from "./location.model";
import { CreateLocationInput, ListLocationsQuery } from "./locationManage.schema";

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Matches the whole text, ignoring capitals
const exactIgnoreCase = (s: string) => ({ $regex: `^${escapeRegex(s)}$`, $options: "i" });

interface LocationLike {
  _id: unknown;
  platform: string;
  state: string;
  city: string | null;
  isActive: boolean;
}

const toDto = (l: LocationLike, platformName: string) => ({
  id: String(l._id),
  platform: l.platform,
  platformName,
  state: l.state,
  city: l.city ?? null,
  isActive: l.isActive,
});

const platformNames = async () => {
  const platforms = await Platform.find().select("slug name").lean();
  return new Map(platforms.map((p) => [p.slug, p.name]));
};

// Flat list for the management screen. Disabled locations are included so they can be enabled again.
export async function listLocations(query: ListLocationsQuery) {
  const { platform, state, search, status, page, limit } = query;

  const filter: Record<string, unknown> = {};
  if (platform) {
    filter.platform = {
      $in: platform
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean),
    };
  }
  if (state) filter.state = exactIgnoreCase(state);
  if (status !== "all") filter.isActive = status === "active";
  if (search) {
    const part = { $regex: escapeRegex(search), $options: "i" };
    filter.$or = [{ city: part }, { state: part }];
  }

  const [rows, total, names] = await Promise.all([
    PlatformLocation.find(filter)
      .sort({ platform: 1, state: 1, city: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    PlatformLocation.countDocuments(filter),
    platformNames(),
  ]);

  return {
    locations: rows.map((l) => toDto(l, names.get(l.platform) ?? l.platform)),
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

export async function createLocation(input: CreateLocationInput) {
  const platform = await Platform.findOne({ slug: input.platform, isActive: true });
  if (!platform) throw new ApiError(400, "Unknown platform");

  // Reuse the spelling already used for this state, so "tamil nadu" never becomes a second state
  const sameState = await PlatformLocation.findOne({ state: exactIgnoreCase(input.state) }).lean();
  const state = sameState?.state ?? input.state;
  const city = input.city ?? null;

  const existing = await PlatformLocation.findOne({
    platform: input.platform,
    state: exactIgnoreCase(state),
    city: city === null ? null : exactIgnoreCase(city),
  });
  if (existing) {
    throw new ApiError(
      409,
      existing.isActive
        ? "This location already exists"
        : "This location already exists but is disabled. Enable it instead."
    );
  }

  try {
    const created = await PlatformLocation.create({ platform: input.platform, state, city, isActive: true });
    return toDto(created, platform.name);
  } catch (err) {
    if ((err as { code?: number }).code === 11000) throw new ApiError(409, "This location already exists");
    throw err;
  }
}

// Disabling hides a location instead of deleting it. Enabling brings it back.
export async function setLocationStatus(id: string, isActive: boolean) {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(404, "Location not found");

  const location = await PlatformLocation.findById(id);
  if (!location) throw new ApiError(404, "Location not found");

  location.isActive = isActive;
  await location.save();

  const names = await platformNames();
  return toDto(location, names.get(location.platform) ?? location.platform);
}