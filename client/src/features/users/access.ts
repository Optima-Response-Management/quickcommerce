import type { Role } from "./types";

export type Feature =
  | "dashboard"
  | "data_grid"
  | "upload_data"
  | "view_upload_history"
  | "manage_users"
  | "manage_locations";

export type GrantableFeature = Feature;

export const FEATURE_LABELS: Record<Feature, string> = {
  dashboard: "Dashboard",
  data_grid: "Data Grid",
  upload_data: "Upload Data",
  view_upload_history: "File History",
  manage_users: "User Management",
  manage_locations: "Location Management",
};

export const FEATURE_DESCRIPTIONS: Record<Feature, string> = {
  dashboard: "View campaign insights and performance metrics",
  data_grid: "Browse and analyze campaign records",
  upload_data: "Upload and process campaign files",
  view_upload_history: "View uploaded files and upload history",
  manage_users: "Create users and manage user access",
  manage_locations: "Create and manage platform locations",
};

export const GRANTABLE_FEATURES: GrantableFeature[] = [
  "dashboard",
  "data_grid",
  "upload_data",
  "view_upload_history",
  "manage_users",
  "manage_locations",
];

export const ALL_FEATURES: Feature[] = [
  "dashboard",
  "data_grid",
  "upload_data",
  "view_upload_history",
  "manage_users",
  "manage_locations",
];

export const ROLE_ACCESS: Record<Role, Feature[]> = {
  super_admin: [...ALL_FEATURES],

  admin: [
    "dashboard",
    "data_grid",
    "upload_data",
  ],

  user: [
    "dashboard",
  ],
};

export const defaultFeatures = (
  role: Role,
): GrantableFeature[] => {
  return GRANTABLE_FEATURES.filter((feature) =>
    ROLE_ACCESS[role].includes(feature),
  );
};

export const canAccess = (
  user:
    | {
        features?: Feature[];
        role?: Role;
      }
    | null
    | undefined,
  feature: Feature,
): boolean => {
  if (!user) {
    return false;
  }

  if (user.role === "super_admin") {
    return true;
  }

  return Boolean(user.features?.includes(feature));
};
