import type { ManagedUser } from "./types";
import { PLATFORMS } from "../campaigns/filterOptions";

export const mockUsers: ManagedUser[] = [
  {
    id: "1",
    name: "Super Admin",
    email: "admin@test.com",
    role: "super_admin",
    platformAccess: "all",
    platforms: PLATFORMS,
    createdAt: "2026-09-01",
  },
  {
    id: "2",
    name: "Priya Sharma",
    email: "priya@company.com",
    role: "admin",
    platformAccess: "all",
    platforms: PLATFORMS,
    createdAt: "2026-09-20",
  },
  {
    id: "3",
    name: "Arjun Mehta",
    email: "arjun@company.com",
    role: "admin",
    platformAccess: "custom",
    platforms: ["BigBasket", "Flipkart"],
    createdAt: "2026-09-22",
  },
  {
    id: "4",
    name: "Kavya Nair",
    email: "kavya@company.com",
    role: "user",
    platformAccess: "custom",
    platforms: ["Zepto"],
    createdAt: "2026-09-25",
  },
  {
    id: "5",
    name: "Rahul Verma",
    email: "rahul@company.com",
    role: "user",
    platformAccess: "custom",
    platforms: ["Blinkit", "BigBasket"],
    createdAt: "2026-09-26",
  },
];