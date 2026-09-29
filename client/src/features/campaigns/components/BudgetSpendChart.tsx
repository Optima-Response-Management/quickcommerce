import { useMemo, useRef, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { toPng, toJpeg } from "html-to-image";
import { Download } from "lucide-react";

type ChartType = "bar" | "line";
type ExportFormat = "png" | "jpeg";

interface Row {
  label: string;
  budget: number;
  spend: number;
}

interface Props {
  data: { platform: string; date: string; budget: number; spend: number }[];
  height?: number;
}

const PRIMARY = "#F97316"; // Spend
const MUTED = "#94A3B8";   // Budget
const INK = "#1E3A5F";

const formatINR = (v: number) => `₹${v.toLocaleString()}`;

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export default function BudgetSpendChart({ data, height = 240 }: Props) {
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [menuOpen, setMenuOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Bar view: grouped by platform
  const byPlatform = useMemo<Row[]>(() => {
    const map = new Map<string, Row>();
    data.forEach((c) => {
      const row = map.get(c.platform) ?? { label: c.platform, budget: 0, spend: 0 };
      row.budget += c.budget;
      row.spend += c.spend;
      map.set(c.platform, row);
    });
    return Array.from(map.values());
  }, [data]);

  // Line view: grouped by date, sorted oldest to newest
  const byDate = useMemo<Row[]>(() => {
    const map = new Map<string, Row>();
    data.forEach((c) => {
      const row = map.get(c.date) ?? { label: c.date, budget: 0, spend: 0 };
      row.budget += c.budget;
      row.spend += c.spend;
      map.set(c.date, row);
    });
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [data]);

  const rows = chartType === "bar" ? byPlatform : byDate;
  const firstColumn = chartType === "bar" ? "Platform" : "Date";
  const displayLabel = (l: string) => (chartType === "line" ? formatDate(l) : l);

  const totals = useMemo(
    () => rows.reduce((acc, r) => ({ budget: acc.budget + r.budget, spend: acc.spend + r.spend }), { budget: 0, spend: 0 }),
    [rows]
  );

  const utilisation = (budget: number, spend: number) =>
    budget ? `${Math.round((spend / budget) * 100)}%` : "-";

  const commonAxes = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
      <XAxis dataKey="label" tickFormatter={displayLabel} tick={{ fontSize: 12, fill: "#475569" }} />
      <YAxis tick={{ fontSize: 12, fill: "#475569" }} tickFormatter={formatINR} />
      <Tooltip formatter={(v: number) => formatINR(v)} labelFormatter={displayLabel} />
      <Legend />
    </>
  );

  const renderChart = (width?: number, chartHeight?: number, animate = true) =>
    chartType === "bar" ? (
      <BarChart data={rows} width={width} height={chartHeight}>
        {commonAxes}
        <Bar dataKey="budget" name="Budget" fill={MUTED} radius={[4, 4, 0, 0]} isAnimationActive={animate} />
        <Bar dataKey="spend" name="Spend" fill={PRIMARY} radius={[4, 4, 0, 0]} isAnimationActive={animate} />
      </BarChart>
    ) : (
      <LineChart data={rows} width={width} height={chartHeight}>
        {commonAxes}
        <Line type="monotone" dataKey="budget" name="Budget" stroke={MUTED} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} isAnimationActive={animate} />
        <Line type="monotone" dataKey="spend" name="Spend" stroke={PRIMARY} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} isAnimationActive={animate} />
      </LineChart>
    );

  const handleExport = async (format: ExportFormat) => {
    if (!exportRef.current) return;
    setMenuOpen(false);
    setExporting(true);
    try {
      const options = { pixelRatio: 2, backgroundColor: "#ffffff", cacheBust: true };
      const dataUrl =
        format === "png"
          ? await toPng(exportRef.current, options)
          : await toJpeg(exportRef.current, { ...options, quality: 0.95 });

      const link = document.createElement("a");
      link.download = `budget-vs-spend.${format === "png" ? "png" : "jpg"}`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Chart export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  const title = chartType === "bar" ? "Budget vs Spend by Platform" : "Budget vs Spend Over Time";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-brand-ink">{title}</h3>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-gray-200 p-1">
            {(["bar", "line"] as ChartType[]).map((t) => (
              <button
                key={t}
                onClick={() => setChartType(t)}
                className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                  chartType === t ? "bg-brand-primary text-white" : "text-brand-gray hover:bg-brand-primary-soft"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              disabled={exporting || rows.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-brand-ink hover:bg-brand-primary-soft transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {exporting ? "Exporting..." : "Download"}
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                <button onClick={() => handleExport("png")} className="w-full text-left px-3 py-2 text-xs text-brand-ink hover:bg-brand-primary-soft">
                  PNG image
                </button>
                <button onClick={() => handleExport("jpeg")} className="w-full text-left px-3 py-2 text-xs text-brand-ink hover:bg-brand-primary-soft">
                  JPEG image
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="flex items-center justify-center text-sm text-brand-gray" style={{ height }}>
          No data for the selected filters
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      )}

      {/* Off-screen export version */}
      <div style={{ position: "absolute", left: -9999, top: 0 }} aria-hidden="true">
        <div ref={exportRef} style={{ width: 900, padding: 24, background: "#ffffff" }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: INK, marginBottom: 12 }}>{title}</h3>

          {renderChart(852, 320, false)}

          <table style={{ width: "100%", marginTop: 16, fontSize: 13, borderCollapse: "collapse", color: INK }}>
            <thead>
              <tr style={{ background: "#FFF7ED", textAlign: "left" }}>
                {[firstColumn, "Budget", "Spend", "Utilisation"].map((h) => (
                  <th key={h} style={{ padding: "8px 12px", fontWeight: 600, borderBottom: "1px solid #E2E8F0" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label}>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid #F1F5F9" }}>{displayLabel(r.label)}</td>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid #F1F5F9" }}>{formatINR(r.budget)}</td>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid #F1F5F9" }}>{formatINR(r.spend)}</td>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid #F1F5F9" }}>{utilisation(r.budget, r.spend)}</td>
                </tr>
              ))}
              <tr style={{ fontWeight: 700, background: "#FFF7ED" }}>
                <td style={{ padding: "8px 12px" }}>Total</td>
                <td style={{ padding: "8px 12px" }}>{formatINR(totals.budget)}</td>
                <td style={{ padding: "8px 12px" }}>{formatINR(totals.spend)}</td>
                <td style={{ padding: "8px 12px" }}>{utilisation(totals.budget, totals.spend)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}