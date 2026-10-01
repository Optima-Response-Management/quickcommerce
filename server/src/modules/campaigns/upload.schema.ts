import { z } from "zod";

const emptyToUndefined = (v: unknown) => (v === "" ? undefined : v);

const isRealDate = (s: string) => {
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};
const isIsoDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && isRealDate(s);

const optionalDate = z.preprocess(
  emptyToUndefined,
  z.string().trim().refine(isIsoDate, "Must be a valid date in YYYY-MM-DD format").optional()
);

// Query string for GET /api/campaigns/uploads (from and to filter on the report date)
export const listUploadsSchema = z
  .object({
    platform: z.preprocess(emptyToUndefined, z.string().trim().toLowerCase().optional()),
    from: optionalDate,
    to: optionalDate,
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .refine((q) => !q.from || !q.to || q.from <= q.to, {
    message: "from must be on or before to",
    path: ["from"],
  });

export type ListUploadsQuery = z.infer<typeof listUploadsSchema>;