import path from "path";
import dotenv from "dotenv";
import { z } from "zod";

const nodeEnv = process.env.NODE_ENV ?? "production";

dotenv.config({
  path: path.resolve(process.cwd(), `.env.${nodeEnv}`),
});

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("production"),

  PORT: z.coerce.number().default(5000),

  CLIENT_URLS: z
    .string()
    .min(1, "CLIENT_URLS is required"),

  MONGODB_URI: z
    .string()
    .min(1, "MONGODB_URI is required"),

  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters"),

  JWT_EXPIRES_IN: z
    .string()
    .default("1d"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");

  parsed.error.issues.forEach((issue) => {
    console.error(
      `  ${issue.path.join(".")}: ${issue.message}`,
    );
  });

  process.exit(1);
}

export const env = parsed.data;