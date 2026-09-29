import { useState, useRef } from "react";
import { UploadCloud, FileSpreadsheet, X, Loader2 } from "lucide-react";
import Table, { type Column } from "../../../components/common/Table";
import { parseExcelFile } from "../excelParser";
import type { CityRow, CampaignRow } from "../types";

const PLATFORMS = ["Zepto", "SwiggyInstamart", "GW"] as const;
const REPORT_TYPES = ["campaign", "city"] as const;

export default function UploadExcel() {
  const [platform, setPlatform] = useState<(typeof PLATFORMS)[number]>("Zepto");
  const [reportType, setReportType] = useState<(typeof REPORT_TYPES)[number]>("campaign");
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [parsedData, setParsedData] = useState<CityRow[] | CampaignRow[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selected: File | null) => {
    if (!selected) return;
    if (!selected.name.match(/\.(xlsx|xls)$/i)) {
      setError("Please upload a valid Excel file (.xlsx or .xls)");
      return;
    }
    setError("");
    setFile(selected);
    setParsedData(null);
  };

  const handleProcess = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const result = await parseExcelFile(file, platform, reportType);
      setParsedData(result);
    } catch {
      setError("Failed to parse the file. Please check the format and try again.");
    } finally {
      setLoading(false);
    }
  };

  const campaignColumns: Column<CampaignRow>[] = [
    { key: "campaignName", label: "Campaign" },
    { key: "brandName", label: "Brand" },
    { key: "spend", label: "Spend", render: (r) => `₹${r.spend.toLocaleString()}` },
    { key: "revenue", label: "Revenue", render: (r) => `₹${r.revenue.toLocaleString()}` },
    { key: "orders", label: "Orders" },
    { key: "roas", label: "ROAS", render: (r) => `${r.roas}x` },
    { key: "status", label: "Status" },
  ];

  const cityColumns: Column<CityRow>[] = [
    { key: "market", label: "Market" },
    { key: "city", label: "City" },
    { key: "spend", label: "Spend", render: (r) => (r.spend ? `₹${r.spend.toLocaleString()}` : "—") },
    { key: "revenue", label: "Revenue", render: (r) => `₹${r.revenue.toLocaleString()}` },
    { key: "orders", label: "Orders" },
    { key: "roas", label: "ROAS", render: (r) => (r.roas ? `${r.roas}x` : "—") },
  ];

  return (
    <div className="space-y-6">
      {/* Platform + report type selectors */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-brand-ink mb-1.5">Platform</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as typeof platform)}
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary"
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-ink mb-1.5">Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as typeof reportType)}
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary"
          >
            {REPORT_TYPES.map((r) => (
              <option key={r} value={r} className="capitalize">{r}-wise</option>
            ))}
          </select>
        </div>
      </div>

      {/* Drag & drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFile(e.dataTransfer.files?.[0] ?? null);
        }}
        onClick={() => inputRef.current?.click()}
        className={`rounded-xl border-2 border-dashed p-12 text-center cursor-pointer transition-colors ${
          dragActive ? "border-brand-primary bg-brand-primary-soft" : "border-gray-300 bg-white hover:border-gray-400"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />

        {file ? (
          <div className="flex items-center justify-center gap-3">
            <FileSpreadsheet className="w-8 h-8 text-brand-primary" />
            <div className="text-left">
              <p className="text-sm font-medium text-brand-ink">{file.name}</p>
              <p className="text-xs text-brand-gray">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setFile(null); setParsedData(null); }}
              className="p-1 rounded-md hover:bg-gray-100 text-brand-gray"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-brand-ink mb-1">
              Drag & drop your Excel file here
            </p>
            <p className="text-xs text-brand-gray">or click to browse — .xlsx, .xls</p>
          </>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
          {error}
        </p>
      )}

      <button
        onClick={handleProcess}
        disabled={!file || loading}
        className="flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary-dark text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
        {loading ? "Processing..." : "Process File"}
      </button>

      {/* Preview */}
      {parsedData && (
        <div>
          <h3 className="text-sm font-semibold text-brand-ink mb-3">
            Preview — {parsedData.length} rows extracted
          </h3>
          {reportType === "campaign" ? (
            <Table data={parsedData as CampaignRow[]} columns={campaignColumns} pageSize={5} />
          ) : (
            <Table data={parsedData as CityRow[]} columns={cityColumns} pageSize={5} />
          )}
        </div>
      )}
    </div>
  );
}