import { z } from "zod";

const emptyToUndefined = (v: unknown) => (v === "" ? undefined : v);
const collapseSpaces = (s: string) => s.replace(/\s+/g, " ");

// Body for POST /api/locations. A city is optional: a state on its own is allowed (like Blinkit).
export const createLocationSchema = z.object({
  platform: z.preprocess((v) => v ?? "", z.string().trim().toLowerCase().min(1, "Select a platform")),
  state: z.preprocess(
    (v) => v ?? "",
    z.string().trim().min(2, "State must be at least 2 characters").max(60, "State is too long").transform(collapseSpaces)
  ),
  city: z.preprocess(
    emptyToUndefined,
    z.string().trim().min(2, "City must be at least 2 characters").max(80, "City is too long").transform(collapseSpaces).optional()
  ),
});

// Body for PATCH /api/locations/:id/status
export const updateLocationStatusSchema = z.object({
  isActive: z.boolean({ message: "isActive must be true or false" }),
});

// Query string for the super admin's paginated list
export const listLocationsSchema = z.object({
  platform: z.preprocess(emptyToUndefined, z.string().trim().toLowerCase().optional()), // "swiggy" or "swiggy,zepto"
  state: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
  search: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()), // part of a city or state name
  status: z.enum(["active", "inactive", "all"], { message: "status must be active, inactive or all" }).default("all"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

// Query string for GET /api/locations/list (filter dropdowns): no pagination
export const dropdownLocationsSchema = listLocationsSchema.pick({ platform: true, state: true });

export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type UpdateLocationStatusInput = z.infer<typeof updateLocationStatusSchema>;
export type ListLocationsQuery = z.infer<typeof listLocationsSchema>;
export type DropdownLocationsQuery = z.infer<typeof dropdownLocationsSchema>;