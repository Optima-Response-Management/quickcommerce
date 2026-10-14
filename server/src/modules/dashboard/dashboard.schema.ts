
import { z } from "zod";

const optionalText = z.preprocess(
  (value) =>
    value === "" || value === null ? undefined : value,
  z.string().trim().max(100).optional()
);

const optionalDate = z.preprocess(
  (value) =>
    value === "" || value === null ? undefined : value,
  z
    .string()
    .trim()
    .refine((value) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
      }

      const date = new Date(`${value}T00:00:00Z`);

      return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
      );
    }, "Must be a valid date in YYYY-MM-DD format")
    .optional()
);

export const dashboardQuerySchema = z
  .object({
    platform: optionalText,
    from: optionalDate,
    to: optionalDate,
    market: optionalText,
    subMarket: optionalText,
    brand: optionalText,
    subBrand: optionalText,
  })
  .refine(
    (query) =>
      !query.from ||
      !query.to ||
      query.from <= query.to,
    {
      message: "from must be on or before to",
      path: ["from"],
    }
  );

export type DashboardQuery = z.infer<
  typeof dashboardQuerySchema
>;
