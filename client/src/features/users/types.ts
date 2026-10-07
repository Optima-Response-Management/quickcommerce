import type { Feature } from "./access";

export type Role =
  | "super_admin"
  | "admin"
  | "user";

export type PlatformAccess =
  | "all"
  | "custom";

export const ROLES: Role[] = [
  "super_admin",
  "admin",
  "user",
];

export const ROLE_LABELS: Record<
  Role,
  string
> = {
  super_admin: "Super Admin",
  admin: "Admin",
  user: "User",
};

export const ROLE_DESCRIPTIONS: Record<
  Role,
  string
> = {
  super_admin:
    "Full system control and unrestricted access",
  admin:
    "Operational access with configurable permissions",
  user:
    "Standard access to assigned workspace features",
};

export interface CreatedByUser {
  id: string;
  name: string | null;
  email: string;
}

export interface ManagedUser {
  id: string;

  name: string;

  email: string;

  role: Role;

  platformAccess: PlatformAccess;

  platforms: string[];

  features: Feature[];

  isActive: boolean;

  lastLoginAt: string | null;

  createdBy:
    | CreatedByUser
    | null;

  createdAt: string | null;
}