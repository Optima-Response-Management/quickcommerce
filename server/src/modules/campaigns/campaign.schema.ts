
import { z } from "zod";

const isRealDate = (s: string) => {
  const d = new Date(`${s}T00:00:00Z`);

  return (
    !Number.isNaN(d.getTime()) &&
    d.toISOString().slice(0, 10) === s
  );
};

const optionalTrimmedText = (label: string, max = 100) =>
  z.preprocess(
    (value) => value === "" || value === null ? undefined : value,
    z
      .string()
      .trim()
      .max(max, `${label} must be ${max} characters or fewer`)
      .optional()
  );

export const uploadCampaignSchema = z.object({
  platform: z.preprocess(
    (v) => v ?? "",
    z.string().trim().toLowerCase().min(1, "Select a platform")
  ),

  reportDate: z.preprocess(
    (v) => v ?? "",
    z
      .string()
      .trim()
      .refine(
        (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && isRealDate(s),
        "Report date must be a valid date in YYYY-MM-DD format"
      )
  ),

  market: optionalTrimmedText("Market"),
  subMarket: optionalTrimmedText("Submarket"),
});

export type UploadCampaignInput = z.infer<
  typeof uploadCampaignSchema
>;

const emptyToUndefined = (v: unknown) =>
  v === "" ? undefined : v;

const isIsoDate = (s: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(s) && isRealDate(s);

export const SORT_FIELDS = [
  "reportDate",
  "platform",
  "CampaignName",
  "BrandName",
  "SubBrandName",
  "Budget",
  "Spend",
  "Revenue",
  "Orders",
  "Roas",
] as const;

const optionalDate = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .trim()
    .refine(
      isIsoDate,
      "Must be a valid date in YYYY-MM-DD format"
    )
    .optional()
);

export const listCampaignsSchema = z
  .object({
    platform: z.preprocess(
      emptyToUndefined,
      z.string().trim().toLowerCase().optional()
    ),

    from: optionalDate,
    to: optionalDate,

    market: optionalTrimmedText("Market"),
    subMarket: optionalTrimmedText("Submarket"),

    brand: optionalTrimmedText("Brand"),
    subBrand: optionalTrimmedText("Sub-brand"),
    search: optionalTrimmedText("Search"),

    sortBy: z.enum(SORT_FIELDS).default("reportDate"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),

    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .refine(
    (q) => !q.from || !q.to || q.from <= q.to,
    {
      message: "from must be on or before to",
      path: ["from"],
    }
  );

export type ListCampaignsQuery = z.infer<
  typeof listCampaignsSchema
>;
