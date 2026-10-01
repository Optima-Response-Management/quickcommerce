import { z } from "zod";

const emptyToUndefined = (v: unknown) => (v === "" ? undefined : v);

// Query string for GET /api/locations
export const locationQuerySchema = z.object({
  platform: z.preprocess(emptyToUndefined, z.string().trim().toLowerCase().optional()), // "swiggy" or "swiggy,zepto"
  state: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
});

export type LocationQuery = z.infer<typeof locationQuerySchema>;