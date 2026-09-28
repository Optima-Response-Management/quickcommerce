export const PERMISSIONS = [
  { key: "upload_data", label: "Upload Data", description: "Upload and process Excel files" },
  { key: "view_data_grid", label: "Data Grid", description: "View the campaign and city data grids" },
  { key: "view_dashboard", label: "Dashboard", description: "View processed insights and metrics" },
] as const;



export type PermissionKey = (typeof PERMISSIONS)[number]["key"];

export const ALL_PERMISSION_KEYS = PERMISSIONS.map((p) => p.key) as PermissionKey[];
