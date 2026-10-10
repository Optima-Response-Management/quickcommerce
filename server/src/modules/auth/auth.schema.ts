
import { z } from "zod";

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email is required")
    .email("Enter a valid email"),

  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password is too long"),
});

export type SignInInput = z.infer<typeof signInSchema>;
