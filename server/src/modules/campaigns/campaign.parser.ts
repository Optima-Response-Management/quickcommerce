import ExcelJS from "exceljs";
import path from "path";
import { Readable } from "stream";
import { ApiError } from "../../utils/ApiError";
import { normalize, SUPPORTED_FORMATS } from "./campaign.formats";

const MAX_ROWS = 10000;

export interface ParsedRow {
  rowNumber: number; // row number in the file, so errors can point to it
  cells: Record<string, unknown>; // keyed by normalized column name
}

export interface ParsedSheet {
  headers: string[];
  rows: ParsedRow[];
}

// The default format every platform file is converted into
export interface CampaignRow {
  CampaignName: string;
  BrandName: string;
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

const NUMERIC_TERMS = ["Budget", "Spend", "Revenue", "Orders", "Roas"] as const;
type NumericTerm = (typeof NUMERIC_TERMS)[number];

// Rows like "Total" at the bottom of a report must not be counted as a campaign
const TOTAL_LABELS = new Set(["total", "grandtotal", "subtotal"]);

// Turns any Excel cell (number, text, formula, rich text, hyperlink, date) into a plain value
function cellValue(v: ExcelJS.CellValue): unknown {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "object") {
    if ("result" in v) return cellValue(v.result as ExcelJS.CellValue); // formula
    if ("richText" in v) return v.richText.map((t) => t.text).join("");
    if ("error" in v) return String(v.error); // e.g. #DIV/0!, becomes an invalid number
    if ("text" in v) return String(v.text); // hyperlink
  }
  return v;
}

// Handles 1234, "1,234.50", "₹1,234", "5.2x", "12%". A blank cell is 0. Anything else is NaN.
function toNumber(v: unknown): number {
  if (typeof v === "number") return v;
  const cleaned = String(v ?? "")
    .replace(/[₹,%\s]/g, "")
    .replace(/x$/i, "");
  if (cleaned === "") return 0;
  return /^-?\d*\.?\d+$/.test(cleaned) ? Number(cleaned) : NaN;
}

export async function parseSheet(file: { buffer: Buffer; originalname: string }): Promise<ParsedSheet> {
  const ext = path.extname(file.originalname).toLowerCase();
  const workbook = new ExcelJS.Workbook();
  let sheet: ExcelJS.Worksheet | undefined;

  try {
    if (ext === ".xlsx") {
      // An .xlsx file is a zip, so it must start with "PK"
      if (file.buffer.subarray(0, 2).toString("latin1") !== "PK") throw new Error("not an xlsx");
      await workbook.xlsx.load(file.buffer as unknown as ExcelJS.Buffer);
      sheet = workbook.worksheets[0];
    } else {
      // Keep CSV values as text so nothing is guessed (dates, big numbers)
      sheet = await workbook.csv.read(Readable.from(file.buffer), { map: (value: unknown) => value });
    }
  } catch {
    throw new ApiError(400, "The file could not be read. Make sure it is a valid .csv or .xlsx file.");
  }

  if (!sheet) throw new ApiError(400, "The file has no data.");

  // Row 1 must be the column names
  const columns: { name: string; col: number }[] = [];
  sheet.getRow(1).eachCell({ includeEmpty: false }, (cell, col) => {
    const name = String(cellValue(cell.value)).trim();
    if (name) columns.push({ name, col });
  });
  if (columns.length === 0) throw new ApiError(400, "The first row of the file must contain the column names.");

  const rows: ParsedRow[] = [];
  for (let r = 2; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    const cells: Record<string, unknown> = {};
    let hasValue = false;

    for (const { name, col } of columns) {
      const value = cellValue(row.getCell(col).value);
      if (String(value).trim() !== "") hasValue = true;
      cells[normalize(name)] = value;
    }

    if (!hasValue) continue; // skip blank rows
    if (rows.length >= MAX_ROWS) {
      throw new ApiError(400, `The file has more than ${MAX_ROWS} rows. Split it into smaller files.`);
    }
    rows.push({ rowNumber: r, cells });
  }

  return { headers: columns.map((c) => c.name), rows };
}

// Converts parsed rows into the default format, and collects every problem found
export function normalizeRows(platformSlug: string, rows: ParsedRow[]) {
  const campaignKey = normalize(SUPPORTED_FORMATS[platformSlug].campaignColumn);
  const brandKey = normalize("BrandName");

  const valid: CampaignRow[] = [];
  const errors: RowError[] = [];
  let skippedTotalRows = 0;

  for (const { rowNumber, cells } of rows) {
    const CampaignName = String(cells[campaignKey] ?? "").trim();

    if (!CampaignName) {
      errors.push({ row: rowNumber, message: "CampaignName is empty" });
      continue;
    }
    if (TOTAL_LABELS.has(normalize(CampaignName))) {
      skippedTotalRows++;
      continue;
    }

    const numbers = {} as Record<NumericTerm, number>;
    let rowIsValid = true;

    for (const term of NUMERIC_TERMS) {
      const raw = cells[normalize(term)];
      const n = toNumber(raw);
      if (Number.isNaN(n)) {
        errors.push({ row: rowNumber, message: `${term} is not a valid number ("${String(raw).slice(0, 30)}")` });
        rowIsValid = false;
      } else if (n < 0) {
        errors.push({ row: rowNumber, message: `${term} cannot be negative` });
        rowIsValid = false;
      } else {
        numbers[term] = n;
      }
    }

    if (rowIsValid) {
      valid.push({ CampaignName, BrandName: String(cells[brandKey] ?? "").trim(), ...numbers });
    }
  }

  return { valid, errors, skippedTotalRows };
}