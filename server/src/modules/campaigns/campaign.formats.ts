import { ApiError } from "../../utils/ApiError";

// true: the file name must contain the platform name (recommended, it is the only
// way to catch a file uploaded under the wrong platform).
// false: files with no platform name in the file name are accepted.
export const REQUIRE_PLATFORM_IN_FILE_NAME = true;

// "Brand Name", "BrandName" and "BRAND_NAME" all become "brandname"
export const normalize = (s: unknown) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

// Columns every file must have (the default format)
const COMMON_COLUMNS = ["BrandName", "Budget", "Spend", "Revenue", "Orders", "Roas"];

// Platforms that can be uploaded. Only the campaign column differs between them.
// Amazon is not here yet because its format has not been defined.
export const SUPPORTED_FORMATS: Record<string, { campaignColumn: string }> = {
  zepto: { campaignColumn: "CampaignName" },
  swiggy: { campaignColumn: "CAMPAIGN_NAME" },
  bigbasket: { campaignColumn: "Campaign Name" },
  blinkit: { campaignColumn: "Campaign Name" },
  flipkart: { campaignColumn: "Campaign Type" },
};

// Words in a file name that identify a platform (matched after removing spaces and symbols)
const FILE_NAME_KEYWORDS: Record<string, { label: string; keywords: string[] }> = {
  swiggy: { label: "Swiggy", keywords: ["swiggy", "instamart"] },
  zepto: { label: "Zepto", keywords: ["zepto"] },
  flipkart: { label: "Flipkart", keywords: ["flipkart"] },
  bigbasket: { label: "BigBasket", keywords: ["bigbasket"] },
  blinkit: { label: "Blinkit", keywords: ["blinkit"] },
  amazon: { label: "Amazon", keywords: ["amazon"] },
};

const labelOf = (slug: string) => FILE_NAME_KEYWORDS[slug]?.label ?? slug;

export function detectPlatformsInFileName(fileName: string): string[] {
  const name = normalize(fileName.replace(/\.[^.]+$/, ""));
  return Object.entries(FILE_NAME_KEYWORDS)
    .filter(([, p]) => p.keywords.some((k) => name.includes(k)))
    .map(([slug]) => slug);
}

// Throws when the file name belongs to a different platform than the one selected
export function assertFileNameMatchesPlatform(fileName: string, selectedSlug: string) {
  const found = detectPlatformsInFileName(fileName);

  if (found.length === 0) {
    if (!REQUIRE_PLATFORM_IN_FILE_NAME) return;
    throw new ApiError(
      400,
      `The file name must include the platform name so it can be checked. Rename the file, for example "${selectedSlug}_campaign_report.xlsx".`
    );
  }

  if (found.length > 1) {
    const names = found.map(labelOf).join(", ");
    throw new ApiError(
      400,
      `The file name mentions more than one platform (${names}). Keep only the platform this file is from.`
    );
  }

  if (found[0] !== selectedSlug) {
    throw new ApiError(
      400,
      `This looks like a ${labelOf(found[0])} file, but you selected ${labelOf(selectedSlug)}. Select ${labelOf(found[0])}, or upload the correct file.`
    );
  }
}

// Returns the required columns that are missing from the file's header row
export function findMissingColumns(platformSlug: string, headers: string[]): string[] {
  const format = SUPPORTED_FORMATS[platformSlug];
  const present = new Set(headers.map(normalize));
  return [format.campaignColumn, ...COMMON_COLUMNS].filter((c) => !present.has(normalize(c)));
}