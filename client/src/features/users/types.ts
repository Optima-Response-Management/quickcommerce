export type Role = "super_admin" | "admin" | "user";
export type PlatformAccess = "all" | "custom";

export const ROLES: Role[] = ["super_admin", "admin", "user"];

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  user: "User",
};

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  platformAccess: PlatformAccess;
  platforms: string[]; // the platforms this person can see
  createdAt: string;
}