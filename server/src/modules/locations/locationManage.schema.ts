
import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
  value === "" ? undefined : value;

const collapseSpaces = (value: string) =>
  value.replace(/\s+/g, " ").trim();

// Body for POST /api/locations.
// City is optional because a platform may support an entire state.
export const createLocationSchema = z.object({
  platform: z.preprocess(
    (value) => value ?? "",
    z
      .string()
      .trim()
      .toLowerCase()
      .min(1, "Select a platform"),
  ),

  state: z.preprocess(
    (value) => value ?? "",
    z
      .string()
      .trim()
      .min(2, "State must be at least 2 characters")
      .max(60, "State is too long")
      .transform(collapseSpaces),
  ),

  city: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .trim()
      .min(2, "City must be at least 2 characters")
      .max(80, "City is too long")
      .transform(collapseSpaces)
      .optional(),
  ),
});

// Body for PATCH /api/locations/:id/status.
export const updateLocationStatusSchema = z.object({
  isActive: z.boolean({
    message: "isActive must be true or false",
  }),
});

// Query string for GET /api/locations/list.
// No pagination: return all matching locations.
export const listLocationsSchema = z.object({
  platform: z.preprocess(
    emptyToUndefined,
    z.string().trim().toLowerCase().optional(),
  ),

  state: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(100).optional(),
  ),

  search: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(100).optional(),
  ),

  status: z
    .enum(["active", "inactive", "all"], {
      message: "status must be active, inactive or all",
    })
    .default("all"),
});

export type CreateLocationInput = z.infer<
  typeof createLocationSchema
>;

export type UpdateLocationStatusInput = z.infer<
  typeof updateLocationStatusSchema
>;

export type ListLocationsQuery = z.infer<
  typeof listLocationsSchema
>;
