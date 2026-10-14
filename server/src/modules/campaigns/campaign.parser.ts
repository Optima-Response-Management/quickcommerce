import ExcelJS from "exceljs";
import path from "path";
import { Readable } from "stream";

import { ApiError } from "../../utils/ApiError";
import {
  normalize,
  SUPPORTED_FORMATS,
} from "./campaign.formats";

const MAX_ROWS = 10000;

export interface ParsedRow {
  rowNumber: number;
  cells: Record<string, unknown>;
}

export interface ParsedSheet {
  headers: string[];
  rows: ParsedRow[];
}

export interface CampaignRow {
  CampaignName: string;
  BrandName: string;
  SubBrandName: string;
  market: string | null;
  subMarket: string | null;
  Budget: number;
  Spend: number;
  Revenue: number;
  Orders: number;
  Roas: number;
}

export interface RowError {
  row: number;
  message: string;
}

const NUMERIC_TERMS = [
  "Budget",
  "Spend",
  "Revenue",
  "Orders",
  "Roas",
] as const;

type NumericTerm = (typeof NUMERIC_TERMS)[number];

const TOTAL_LABELS = new Set([
  "total",
  "grandtotal",
  "subtotal",
]);

function cellValue(v: ExcelJS.CellValue): unknown {
  if (v === null || v === undefined) {
    return "";
  }

  if (v instanceof Date) {
    return v.toISOString().slice(0, 10);
  }

  if (typeof v === "object") {
    if ("result" in v) {
      return cellValue(v.result as ExcelJS.CellValue);
    }

    if ("richText" in v) {
      return v.richText
        .map((t) => t.text)
        .join("");
    }

    if ("error" in v) {
      return String(v.error);
    }

    if ("text" in v) {
      return String(v.text);
    }
  }

  return v;
}

function toNumber(v: unknown): number {
  if (typeof v === "number") {
    return Number.isFinite(v) ? v : NaN;
  }

  const cleaned = String(v ?? "")
    .replace(/[₹,%\s]/g, "")
    .replace(/x$/i, "");

  if (cleaned === "") {
    return 0;
  }

  return /^-?\d*\.?\d+$/.test(cleaned)
    ? Number(cleaned)
    : NaN;
}

function normalizeLocation(value: unknown): string | null {
  const text = String(value ?? "").trim();

  if (
    !text ||
    text.toLowerCase() === "null" ||
    text.toLowerCase() === "undefined"
  ) {
    return null;
  }

  return text;
}

export async function parseSheet(
  file: {
    buffer: Buffer;
    originalname: string;
  },
): Promise<ParsedSheet> {
  const ext = path
    .extname(file.originalname)
    .toLowerCase();

  const workbook = new ExcelJS.Workbook();

  let sheet: ExcelJS.Worksheet | undefined;

  try {
    if (ext === ".xlsx") {
      if (
        file.buffer
          .subarray(0, 2)
          .toString("latin1") !== "PK"
      ) {
        throw new Error("not an xlsx");
      }

      await workbook.xlsx.load(
        file.buffer as unknown as ExcelJS.Buffer,
      );

      sheet = workbook.worksheets[0];
    } else if (ext === ".csv") {
      sheet = await workbook.csv.read(
        Readable.from(file.buffer),
        {
          map: (value: unknown) => value,
        },
      );
    } else {
      throw new Error("unsupported file extension");
    }
  } catch {
    throw new ApiError(
      400,
      "The file could not be read. Make sure it is a valid .csv or .xlsx file.",
    );
  }

  if (!sheet) {
    throw new ApiError(
      400,
      "The file has no data.",
    );
  }

  const columns: {
    name: string;
    col: number;
  }[] = [];

  sheet.getRow(1).eachCell(
    {
      includeEmpty: false,
    },
    (cell, col) => {
      const name = String(
        cellValue(cell.value),
      ).trim();

      if (name) {
        columns.push({
          name,
          col,
        });
      }
    },
  );

  if (columns.length === 0) {
    throw new ApiError(
      400,
      "The first row of the file must contain the column names.",
    );
  }

  const rows: ParsedRow[] = [];

  for (let r = 2; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);

    const cells: Record<string, unknown> = {};

    let hasValue = false;

    for (const { name, col } of columns) {
      const value = cellValue(
        row.getCell(col).value,
      );

      if (String(value).trim() !== "") {
        hasValue = true;
      }

      cells[normalize(name)] = value;
    }

    if (!hasValue) {
      continue;
    }

    if (rows.length >= MAX_ROWS) {
      throw new ApiError(
        400,
        `The file has more than ${MAX_ROWS} rows. Split it into smaller files.`,
      );
    }

    rows.push({
      rowNumber: r,
      cells,
    });
  }

  return {
    headers: columns.map((column) => column.name),
    rows,
  };
}

export function normalizeRows(
  platformSlug: string,
  rows: ParsedRow[],
) {
  const format = SUPPORTED_FORMATS[platformSlug];

  if (!format) {
    throw new ApiError(
      400,
      `Unsupported platform: ${platformSlug}`,
    );
  }

  const campaignKey = normalize(format.campaignColumn);

  const brandKeys = [
    "BrandName",
    "Brand Name",
    "Brand",
    "BRAND_NAME",
  ].map(normalize);

  const subBrandKeys = [
    "SubBrandName",
    "Sub Brand Name",
    "SubBrand",
    "Sub Brand",
    "SUB_BRAND_NAME",
  ].map(normalize);

  const marketKeys = [
    "Market",
  ].map(normalize);

  const subMarketKeys = [
    "Submarket",
    "SubMarket",
    "Sub Market",
    "Sub-Market",
  ].map(normalize);

  const findCell = (
    cells: Record<string, unknown>,
    keys: string[],
  ): unknown => {
    for (const key of keys) {
      if (
        Object.prototype.hasOwnProperty.call(
          cells,
          key,
        )
      ) {
        return cells[key];
      }
    }

    return "";
  };

  const valid: CampaignRow[] = [];
  const errors: RowError[] = [];

  let skippedTotalRows = 0;

  for (const { rowNumber, cells } of rows) {
    const CampaignName = String(
      cells[campaignKey] ?? "",
    ).trim();

    if (!CampaignName) {
      errors.push({
        row: rowNumber,
        message: "CampaignName is empty",
      });

      continue;
    }

    if (TOTAL_LABELS.has(normalize(CampaignName))) {
      skippedTotalRows++;
      continue;
    }

    const BrandName = String(
      findCell(cells, brandKeys) ?? "",
    ).trim();

    const SubBrandName = String(
      findCell(cells, subBrandKeys) ?? "",
    ).trim();

    // Read location from each Excel row.
    // normalize() makes Market and market equivalent,
    // and Submarket and SubMarket equivalent.
    const market = normalizeLocation(
      findCell(cells, marketKeys),
    );

    const subMarket = normalizeLocation(
      findCell(cells, subMarketKeys),
    );

    const numbers = {} as Record<NumericTerm, number>;

    let rowIsValid = true;

    for (const term of NUMERIC_TERMS) {
      const raw = cells[normalize(term)];
      const n = toNumber(raw);

      if (Number.isNaN(n)) {
        errors.push({
          row: rowNumber,
          message: `${term} is not a valid number ("${String(
            raw,
          ).slice(0, 30)}")`,
        });

        rowIsValid = false;
      } else if (n < 0) {
        errors.push({
          row: rowNumber,
          message: `${term} cannot be negative`,
        });

        rowIsValid = false;
      } else {
        numbers[term] = n;
      }
    }

    if (rowIsValid) {
      valid.push({
        CampaignName,
        BrandName,
        SubBrandName,
        market,
        subMarket,
        ...numbers,
      });
    }
  }

  return {
    valid,
    errors,
    skippedTotalRows,
  };
}