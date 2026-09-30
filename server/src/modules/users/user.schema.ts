import { z } from "zod";
import mongoose from "mongoose";
import { GRANTABLE_FEATURES, PLATFORMS, ROLES } from "../../config/contstants";

const emptyToUndefined = (v: unknown) => (v === "" ? undefined : v);

export const userIdParamSchema = z.object({
  id: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), "Invalid user id"),
});

export type UserIdParam = z.infer<typeof userIdParamSchema>;

export const createUserSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(80, "Name is too long"),
    email: z.string().trim().toLowerCase().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters").max(128, "Password is too long"),
    role: z.enum(ROLES, { message: "Select a valid role" }),
    platformAccess: z.enum(["all", "custom"], { message: "Select a valid platform access" }),
    platforms: z.array(z.enum(PLATFORMS)).default([]),
    features: z.array(z.enum(GRANTABLE_FEATURES)).default([]),
  })
  .superRefine((d, ctx) => {
    if (d.role !== "super_admin" && d.features.length === 0) {
      ctx.addIssue({ code: "custom", path: ["features"], message: "Select at least one feature" });
    }
    if (d.platformAccess === "custom" && d.platforms.length === 0) {
      ctx.addIssue({ code: "custom", path: ["platforms"], message: "Select at least one platform" });
    }
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateAccessSchema = z
  .object({
    platformAccess: z.enum(["all", "custom"], { message: "Select a valid platform access" }),
    platforms: z.array(z.enum(PLATFORMS)).default([]),
    features: z.array(z.enum(GRANTABLE_FEATURES)).default([]),
  })
  .superRefine((d, ctx) => {
    if (d.platformAccess === "custom" && d.platforms.length === 0) {
      ctx.addIssue({ code: "custom", path: ["platforms"], message: "Select at least one platform" });
    }
  });

export type UpdateAccessInput = z.infer<typeof updateAccessSchema>;

export const listUsersSchema = z.object({
  search: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
  role: z.preprocess(emptyToUndefined, z.enum(ROLES).optional()),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListUsersQuery = z.infer<typeof listUsersSchema>;
