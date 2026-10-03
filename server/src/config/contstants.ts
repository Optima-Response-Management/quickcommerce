export const ROLES = ["super_admin", "admin", "user"] as const;
export const PLATFORMS = ["Blinkit", "BigBasket", "Flipkart", "Swiggy Instamart", "Zepto"] as const;
export const FEATURES = ["dashboard", "data_grid", "upload_data", "manage_users", "manage_locations"] as const;
export const GRANTABLE_FEATURES = ["dashboard", "data_grid", "upload_data" , "manage_users", "manage_locations"] as const;

export type Role = (typeof ROLES)[number];
export type Platform = (typeof PLATFORMS)[number];
export type Feature = (typeof FEATURES)[number];
export type GrantableFeature = (typeof GRANTABLE_FEATURES)[number];