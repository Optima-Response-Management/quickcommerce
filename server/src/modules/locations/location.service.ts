import { HydratedDocument } from "mongoose";
import { platformFilter } from "../campaigns/campaign.access";
import { Platform } from "../platforms/platform.model";
import { IUser } from "../users/user.model";
import { PlatformLocation } from "./location.model";
import { DropdownLocationsQuery } from "./location.schema";

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const byText = (a: string, b: string) => a.localeCompare(b);

// Feeds the filter dropdowns: every active location, no pagination
export async function getLocations(query: DropdownLocationsQuery, user: HydratedDocument<IUser>) {
  const filter: Record<string, unknown> = { isActive: true };

  // Only the platforms this user is allowed to see
  const platform = platformFilter(query.platform, user);
  if (platform) filter.platform = platform;

  if (query.state) filter.state = { $regex: `^${escapeRegex(query.state)}$`, $options: "i" };

  const [rows, platforms] = await Promise.all([
    PlatformLocation.find(filter).sort({ platform: 1, state: 1, city: 1 }).lean(),
    Platform.find().select("slug name").lean(),
  ]);
  const names = new Map(platforms.map((p) => [p.slug, p.name]));

  const grouped = new Map<string, Map<string, string[]>>();
  for (const row of rows) {
    const states = grouped.get(row.platform) ?? new Map<string, string[]>();
    grouped.set(row.platform, states);
    if (!row.state) continue; // platform with no states: it still appears, with an empty list

    const cities = states.get(row.state) ?? [];
    if (row.city) cities.push(row.city); // a state with no cities yet keeps an empty list
    states.set(row.state, cities);
  }

  return {
    // Flat rows with brands, used by the filter dropdowns
    locations: rows.map((row) => ({
      id: String(row._id),
      platform: row.platform,
      state: row.state ?? null,
      city: row.city ?? null,
      brands: row.brands ?? [],
    })),

    // Grouped view: platform -> states -> cities
    platforms: [...grouped.entries()]
      .map(([slug, states]) => ({
        platform: slug,
        platformName: names.get(slug) ?? slug,
        states: [...states.entries()]
          .map(([state, cities]) => ({ state, cities: cities.sort(byText) }))
          .sort((a, b) => byText(a.state, b.state)),
      }))
      .sort((a, b) => byText(a.platformName, b.platformName)),
  };
}