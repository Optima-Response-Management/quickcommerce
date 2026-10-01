import { HydratedDocument } from "mongoose";
import { platformFilter } from "../campaigns/campaign.access";
import { Platform } from "../platforms/platform.model";
import { IUser } from "../users/user.model";
import { PlatformLocation } from "./location.model";
import { LocationQuery } from "./location.schema";

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const byText = (a: string, b: string) => a.localeCompare(b);

// States and cities grouped by platform: platform -> states -> cities
export async function getLocations(query: LocationQuery, user: HydratedDocument<IUser>) {
  const filter: Record<string, unknown> = { isActive: true };

  // Only the platforms this user is allowed to see
  const platform = platformFilter(query.platform, user);
  if (platform) filter.platform = platform;

  if (query.state) filter.state = { $regex: `^${escapeRegex(query.state)}$`, $options: "i" };

  const [rows, platforms] = await Promise.all([
    PlatformLocation.find(filter).lean(),
    Platform.find().select("slug name").lean(),
  ]);
  const names = new Map(platforms.map((p) => [p.slug, p.name]));

  const grouped = new Map<string, Map<string, string[]>>();
  for (const row of rows) {
    const states = grouped.get(row.platform) ?? new Map<string, string[]>();
    const cities = states.get(row.state) ?? [];
    if (row.city) cities.push(row.city); // a state with no cities yet keeps an empty list
    states.set(row.state, cities);
    grouped.set(row.platform, states);
  }

  return {
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