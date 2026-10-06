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
} from "recharts";
import { toPng, toJpeg } from "html-to-image";
import { Download } from "lucide-react";

type ChartType = "bar" | "line";
type ExportFormat = "png" | "jpeg";
type SeriesKey = "budget" | "spend" | "revenue" | "orders";

export interface ChartPoint {
  label: string;
  budget: number;
  spend: number;
  revenue: number;
  orders: number;
}

interface Props {
  byPlatform: ChartPoint[];
  byDate: ChartPoint[];
  height?: number;
}

interface SeriesDef {
  key: SeriesKey;
  name: string;
  color: string;
  outline?: string; // white needs a visible outline
  axis: "left" | "right";
  money: boolean;
}

const SERIES: SeriesDef[] = [
  { key: "budget", name: "Budget", color: "#F97316", axis: "left", money: true },   // vivid orange
  { key: "spend", name: "Spend", color: "#0D9488", axis: "left", money: true },     // fresh teal
  { key: "revenue", name: "Revenue", color: "#7C3AED", axis: "left", money: true }, // electric violet
  { key: "orders", name: "Orders", color: "#94A3B8", axis: "right", money: false }, // soft slate grey
];

const INK = "#1C1917";
const GRID = "#F5E6D8";
const TICK = "#78716C";

const compact = new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 });

const formatINR = (v: number) => `₹${v.toLocaleString()}`;
const formatNum = (v: number) => v.toLocaleString();
const formatAxisINR = (v: number) => `₹${compact.format(v)}`;
const formatValue = (s: SeriesDef, v: number) => (s.money ? formatINR(v) : formatNum(v));

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export default function BudgetSpendChart({ byPlatform, byDate, height = 240 }: Props) {
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [active, setActive] = useState<Record<SeriesKey, boolean>>({
    budget: true,
    spend: true,
    revenue: false,
    orders: false,
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const sortedByDate = useMemo(
    () => [...byDate].sort((a, b) => a.label.localeCompare(b.label)),
    [byDate]
  );

  const rows = chartType === "bar" ? byPlatform : sortedByDate;
  const firstColumn = chartType === "bar" ? "Platform" : "Date";
  const displayLabel = (l: string) => (chartType === "line" ? formatDate(l) : l);

  const visible = SERIES.filter((s) => active[s.key]);
  const hasLeft = visible.some((s) => s.axis === "left");
  const hasRight = visible.some((s) => s.axis === "right");
  const showUtilisation = active.budget && active.spend;

  // Click to show or hide a series, but never hide the last one
  const toggle = (key: SeriesKey) =>
    setActive((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      return Object.values(next).some(Boolean) ? next : prev;
    });

  const totals = useMemo(() => {
    const t: Record<SeriesKey, number> = { budget: 0, spend: 0, revenue: 0, orders: 0 };
    rows.forEach((r) => {
      t.budget += r.budget;
      t.spend += r.spend;
      t.revenue += r.revenue;
      t.orders += r.orders;
    });
    return t;
  }, [rows]);

  const utilisation = (budget: number, spend: number) =>
    budget ? `${Math.round((spend / budget) * 100)}%` : "-";

  const renderChart = (width?: number, chartHeight?: number, animate = true) => {
    const axes = (
      <>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
        <XAxis dataKey="label" tickFormatter={displayLabel} tick={{ fontSize: 12, fill: TICK }} />
        <YAxis yAxisId="left" hide={!hasLeft} tick={{ fontSize: 12, fill: TICK }} tickFormatter={formatAxisINR} />
        {hasRight && (
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12, fill: TICK }}
            tickFormatter={(v) => formatNum(Number(v))}
          />
        )}
        <Tooltip
          formatter={(v, name) => {
            const s = SERIES.find((x) => x.name === name);
            return s ? formatValue(s, Number(v)) : String(v);
          }}
          labelFormatter={displayLabel}
        />
      </>
    );

    if (chartType === "bar") {
      return (
        <BarChart data={rows} width={width} height={chartHeight}>
          {axes}
          {visible.map((s) => (
            <Bar
              key={s.key}
              yAxisId={s.axis}
              dataKey={s.key}
              name={s.name}
              fill={s.color}
              stroke={s.outline}
              strokeWidth={s.outline ? 1.5 : 0}
              radius={[4, 4, 0, 0]}
              isAnimationActive={animate}
            />
          ))}
        </BarChart>
      );
    }

    return (
      <LineChart data={rows} width={width} height={chartHeight}>
        {axes}
        {visible.map((s) => (
          <Line
            key={s.key}
            yAxisId={s.axis}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.outline ?? s.color}
            strokeWidth={2}
            dot={{ r: 4, fill: s.color, stroke: s.outline ?? s.color, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
            isAnimationActive={animate}
          />
        ))}
      </LineChart>
    );
  };

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
      link.download = `campaign-performance.${format === "png" ? "png" : "jpg"}`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Chart export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  const title = chartType === "bar" ? "Performance by Platform" : "Performance Over Time";

  return (
    <div className="bg-white rounded-xl border border-brand-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-brand-ink">{title}</h3>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-brand-border p-1">
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
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-brand-border text-brand-ink hover:bg-brand-primary-soft transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {exporting ? "Exporting..." : "Download"}
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-1 w-32 bg-white border border-brand-border rounded-lg shadow-lg z-10 overflow-hidden">
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

      {/* Click a chip to show or hide that series */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs text-brand-gray mr-1">Show:</span>
        {SERIES.map((s) => {
          const on = active[s.key];
          return (
            <button
              key={s.key}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(s.key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                on
                  ? "border-brand-border bg-white text-brand-ink"
                  : "border-brand-border bg-brand-surface text-brand-gray-light line-through"
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  background: on ? s.color : "transparent",
                  border: `1.5px solid ${s.outline ?? s.color}`,
                }}
              />
              {s.name}
            </button>
          );
        })}
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
          <h3 style={{ fontSize: 16, fontWeight: 600, color: INK, marginBottom: 8 }}>{title}</h3>

          <div style={{ display: "flex", gap: 16, marginBottom: 8, fontSize: 12, color: INK }}>
            {visible.map((s) => (
              <span key={s.key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: s.color,
                    border: `1.5px solid ${s.outline ?? s.color}`,
                  }}
                />
                {s.name}
              </span>
            ))}
          </div>

          {renderChart(852, 320, false)}

          <table style={{ width: "100%", marginTop: 16, fontSize: 13, borderCollapse: "collapse", color: INK }}>
            <thead>
              <tr style={{ background: "#FFF7ED", textAlign: "left" }}>
                {[firstColumn, ...visible.map((s) => s.name), ...(showUtilisation ? ["Utilisation"] : [])].map((h) => (
                  <th key={h} style={{ padding: "8px 12px", fontWeight: 600, borderBottom: "1px solid #F5E6D8" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label}>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid #FAF3ED" }}>{displayLabel(r.label)}</td>
                  {visible.map((s) => (
                    <td key={s.key} style={{ padding: "8px 12px", borderBottom: "1px solid #FAF3ED" }}>
                      {formatValue(s, r[s.key])}
                    </td>
                  ))}
                  {showUtilisation && (
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #FAF3ED" }}>
                      {utilisation(r.budget, r.spend)}
                    </td>
                  )}
                </tr>
              ))}
              <tr style={{ fontWeight: 700, background: "#FFF7ED" }}>
                <td style={{ padding: "8px 12px" }}>Total</td>
                {visible.map((s) => (
                  <td key={s.key} style={{ padding: "8px 12px" }}>
                    {formatValue(s, totals[s.key])}
                  </td>
                ))}
                {showUtilisation && (
                  <td style={{ padding: "8px 12px" }}>{utilisation(totals.budget, totals.spend)}</td>
                )}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}