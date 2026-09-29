import { z } from "zod";
import { ROLES } from "../../config/contstants";

export const signInSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Enter a valid email"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .max(128, "Password is too long"),
  role: z.enum(ROLES, { errorMap: () => ({ message: "Select a valid role" }) }),
});

export type SignInInput = z.infer<typeof signInSchema>;