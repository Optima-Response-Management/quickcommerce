import type { Feature } from "./access";

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
  platforms: string[];
  features: Feature[]; // which screens this person can open
  createdBy: string;   // email of the super admin who created this user ("system" for seeded accounts)
  createdAt: string;
}