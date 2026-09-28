import { z } from "zod";

export const createUserSchema = z
  .object({
    name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
    role: z.enum(["super_admin", "admin", "user"]),
    platformAccess: z.enum(["all", "custom"]),
    platforms: z.array(z.string()),
  })
  .refine((d) => d.platformAccess === "all" || d.platforms.length > 0, {
    message: "Select at least one platform",
    path: ["platforms"],
  });

export type CreateUserFormValues = z.infer<typeof createUserSchema>;