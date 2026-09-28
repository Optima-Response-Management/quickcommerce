import type { Role } from "./types";

export type Feature = "dashboard" | "data_grid" | "upload_data" | "manage_users";
export type GrantableFeature = Exclude<Feature, "manage_users">;

export const FEATURE_LABELS: Record<Feature, string> = {
  dashboard: "Dashboard",
  data_grid: "Data Grid",
  upload_data: "Upload Data",
  manage_users: "Manage Users",
};

export const FEATURE_DESCRIPTIONS: Record<GrantableFeature, string> = {
  dashboard: "View processed insights and metrics",
  data_grid: "View the campaign and city data grids",
  upload_data: "Upload and process Excel files",
};

// The features a super admin can tick or untick per person
export const GRANTABLE_FEATURES: GrantableFeature[] = ["dashboard", "data_grid", "upload_data"];

export const ALL_FEATURES: Feature[] = [...GRANTABLE_FEATURES, "manage_users"];

// Defaults pre-ticked when a role is picked; the creator can change them per person
export const ROLE_ACCESS: Record<Role, Feature[]> = {
  super_admin: ["dashboard", "data_grid", "upload_data", "manage_users"],
  admin: ["dashboard", "data_grid", "upload_data"],
  user: ["dashboard"],
};

export const defaultFeatures = (role: Role): GrantableFeature[] =>
  GRANTABLE_FEATURES.filter((f) => ROLE_ACCESS[role].includes(f));

// Checks the person's own features (set when they were created or edited)
export const canAccess = (user: { features?: Feature[] } | null | undefined, feature: Feature): boolean =>
  !!user?.features?.includes(feature);