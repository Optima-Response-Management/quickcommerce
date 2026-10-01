import { HydratedDocument } from "mongoose";
import { IUser } from "../users/user.model";
import { detectPlatformsInFileName } from "./campaign.formats";

// The platform slugs this user may see. null means all platforms.
// A user's platforms can be stored as slugs ("zepto") or names ("Swiggy Instamart"),
// so both are matched to slugs by keyword.
export function allowedPlatformSlugs(user: HydratedDocument<IUser>): string[] | null {
  if (user.role === "super_admin" || user.platformAccess === "all") return null;
  return [...new Set(user.platforms.flatMap((p) => detectPlatformsInFileName(p)))];
}

// Combines the platforms asked for ("zepto" or "zepto,blinkit") with what the user may see.
// Returns the value for the `platform` field of a Mongo filter, or undefined for "no restriction".
export function platformFilter(
  requested: string | undefined,
  user: HydratedDocument<IUser>
): { $in: string[] } | undefined {
  const asked = requested
    ? requested
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
    : null;
  const allowed = allowedPlatformSlugs(user);

  let list = asked;
  if (allowed) list = asked ? asked.filter((p) => allowed.includes(p)) : allowed;

  return list ? { $in: list } : undefined;
}