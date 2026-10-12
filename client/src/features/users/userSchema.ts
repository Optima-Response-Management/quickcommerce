
import { z } from "zod";

export const createUserSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(80, "Name is too long"),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Enter a valid email address"),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(128, "Password is too long"),

    role: z.enum([
      "super_admin",
      "admin",
      "user",
    ]),

    platformAccess: z.enum([
      "all",
      "custom",
    ]),

    platforms: z.array(z.string()),

    features: z
      .array(
        z.enum([
          "dashboard",
          "data_grid",
          "upload_data",
          "view_upload_history",
          "manage_users",
          "manage_locations",
        ]),
      )
      .default([]),
  })
  .superRefine((values, context) => {
    if (
      values.role !== "super_admin" &&
      values.features.length === 0
    ) {
      context.addIssue({
        code: "custom",
        path: ["features"],
        message: "Select at least one feature",
      });
    }

    if (
      values.platformAccess === "custom" &&
      values.platforms.length === 0
    ) {
      context.addIssue({
        code: "custom",
        path: ["platforms"],
        message: "Select at least one platform",
      });
    }
  });

export type CreateUserFormInput =
  z.input<typeof createUserSchema>;

export type CreateUserFormValues =
  z.output<typeof createUserSchema>;
