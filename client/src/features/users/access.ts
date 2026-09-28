import type { Role } from "./types";

export type Feature = "dashboard" | "data_grid" | "upload_data" | "manage_users";

export const FEATURE_LABELS: Record<Feature, string> = {
  dashboard: "Dashboard",
  data_grid: "Data Grid",
  upload_data: "Upload Data",
  manage_users: "Manage Users",
};

// Edit this table to change what each role can open
export const ROLE_ACCESS: Record<Role, Feature[]> = {
  super_admin: ["dashboard", "data_grid", "upload_data", "manage_users"],
  admin: ["dashboard", "data_grid", "upload_data"],
  user: ["dashboard"],
};

export const canAccess = (role: Role | undefined, feature: Feature): boolean =>
  !!role && (ROLE_ACCESS[role]?.includes(feature) ?? false);