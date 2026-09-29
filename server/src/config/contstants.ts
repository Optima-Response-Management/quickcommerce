export const ROLES = ["super_admin", "admin", "user"] as const;
export const PLATFORMS = ["Blinkit", "BigBasket", "Flipkart", "Swiggy Instamart", "Zepto"] as const;
export const FEATURES = ["dashboard", "data_grid", "upload_data", "manage_users"] as const;

export type Role = (typeof ROLES)[number];
export type Platform = (typeof PLATFORMS)[number];
export type Feature = (typeof FEATURES)[number];