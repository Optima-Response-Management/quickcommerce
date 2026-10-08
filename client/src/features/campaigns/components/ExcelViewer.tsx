import {
    useEffect,
    useMemo,
    useState,
  } from "react";
  
  import * as XLSX from "xlsx";
  
  import {
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    FileSpreadsheet,
    Loader2,
    X,
  } from "lucide-react";
  
  interface ExcelViewerProps {
    fileUrl: string;
    fileName: string;
    onClose: () => void;
  }
  
  interface SheetData {
    name: string;
    rows: unknown[][];
  }
  
  const ROWS_PER_PAGE = 50;
  
  export default function ExcelViewer({
    fileUrl,
    fileName,
    onClose,
  }: ExcelViewerProps) {
    const [sheets, setSheets] = useState<SheetData[]>([]);
    const [activeSheet, setActiveSheet] =
      useState(0);
  
    const [loading, setLoading] =
      useState(true);
  
    const [error, setError] =
      useState<string | null>(null);
  
    const [page, setPage] = useState(1);
  
    /* =====================================================
       LOAD EXCEL
    ====================================================== */
  
    useEffect(() => {
      let cancelled = false;
  
      const loadExcel = async () => {
        try {
          setLoading(true);
          setError(null);
  
          const response = await fetch(fileUrl, {
            credentials: "include",
          });
  
          if (!response.ok) {
            throw new Error(
              `Unable to load ${fileName}`,
            );
          }
  
          const arrayBuffer =
            await response.arrayBuffer();
  
          const workbook = XLSX.read(
            arrayBuffer,
            {
              type: "array",
              cellDates: true,
            },
          );
  
          const parsedSheets: SheetData[] =
            workbook.SheetNames.map(
              (sheetName) => {
                const worksheet =
                  workbook.Sheets[sheetName];
  
                const rows =
                  XLSX.utils.sheet_to_json<
                    unknown[]
                  >(worksheet, {
                    header: 1,
                    defval: "",
                    raw: false,
                  });
  
                return {
                  name: sheetName,
                  rows,
                };
              },
            );
  
          if (!cancelled) {
            setSheets(parsedSheets);
            setActiveSheet(0);
            setPage(1);
          }
        } catch (err) {
          if (!cancelled) {
            setError(
              err instanceof Error
                ? err.message
                : "Unable to load Excel file.",
            );
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };
  
      void loadExcel();
  
      return () => {
        cancelled = true;
      };
    }, [fileUrl, fileName]);
  
    /* =====================================================
       ACTIVE SHEET
    ====================================================== */
  
    const activeData =
      sheets[activeSheet];
  
    const headers = useMemo(() => {
      if (!activeData?.rows.length) {
        return [];
      }
  
      return activeData.rows[0] ?? [];
    }, [activeData]);
  
    const bodyRows = useMemo(() => {
      if (!activeData?.rows.length) {
        return [];
      }
  
      return activeData.rows.slice(1);
    }, [activeData]);
  
    const totalPages = Math.max(
      1,
      Math.ceil(
        bodyRows.length / ROWS_PER_PAGE,
      ),
    );
  
    const visibleRows = useMemo(() => {
      const start =
        (page - 1) * ROWS_PER_PAGE;
  
      return bodyRows.slice(
        start,
        start + ROWS_PER_PAGE,
      );
    }, [bodyRows, page]);
  
    const pageStart =
      bodyRows.length === 0
        ? 0
        : (page - 1) *
            ROWS_PER_PAGE +
          1;
  
    const pageEnd = Math.min(
      page * ROWS_PER_PAGE,
      bodyRows.length,
    );
  
    /* =====================================================
       RENDER
    ====================================================== */
  
    return (
      <div className="fixed inset-0 z-[100] flex flex-col bg-[#faf9f7]">
        {/* =================================================
            HEADER
        ================================================== */}
  
        <header className="flex shrink-0 items-center justify-between border-b border-brand-border bg-white px-5 py-3 shadow-sm">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
  
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-brand-ink">
                {fileName}
              </p>
  
              <p className="mt-0.5 text-[11px] text-brand-gray">
                Excel preview
              </p>
            </div>
          </div>
  
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-border text-brand-gray transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
            aria-label="Close viewer"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
  
        {/* =================================================
            CONTENT
        ================================================== */}
  
        <div className="min-h-0 flex-1 overflow-hidden">
          {loading && (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50">
                  <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
                </div>
  
                <p className="text-sm font-medium text-brand-gray">
                  Loading Excel file...
                </p>
              </div>
            </div>
          )}
  
          {!loading && error && (
            <div className="flex h-full items-center justify-center p-6">
              <div className="max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                </div>
  
                <h3 className="mt-4 text-sm font-bold text-red-900">
                  Unable to preview file
                </h3>
  
                <p className="mt-2 text-xs leading-5 text-red-700">
                  {error}
                </p>
              </div>
            </div>
          )}
  
          {!loading &&
            !error &&
            sheets.length > 0 && (
              <div className="flex h-full flex-col">
                {/* =========================================
                    SHEET TABS
                ========================================== */}
  
                <div className="shrink-0 overflow-x-auto border-b border-brand-border bg-white px-5">
                  <div className="flex min-w-max gap-1">
                    {sheets.map(
                      (sheet, index) => {
                        const active =
                          index ===
                          activeSheet;
  
                        return (
                          <button
                            key={sheet.name}
                            type="button"
                            onClick={() => {
                              setActiveSheet(
                                index,
                              );
                              setPage(1);
                            }}
                            className={[
                              "relative px-4 py-3 text-xs font-semibold transition",
                              active
                                ? "text-orange-600"
                                : "text-brand-gray hover:text-brand-ink",
                            ].join(" ")}
                          >
                            {sheet.name}
  
                            {active && (
                              <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-orange-500" />
                            )}
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>
  
                {/* =========================================
                    TABLE
                ========================================== */}
  
                <div className="min-h-0 flex-1 overflow-auto p-5">
                  <div className="min-w-max overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm">
                    <table className="border-collapse text-left text-xs">
                      <thead>
                        <tr className="bg-[#faf8f5]">
                          <th className="sticky left-0 z-20 w-14 border-b border-r border-brand-border bg-[#faf8f5] px-3 py-3 text-center font-bold text-brand-gray">
                            #
                          </th>
  
                          {headers.map(
                            (
                              header,
                              index,
                            ) => (
                              <th
                                key={index}
                                className="border-b border-brand-border px-5 py-3 font-bold whitespace-nowrap text-brand-ink"
                              >
                                {String(
                                  header ??
                                    "",
                                )}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
  
                      <tbody>
                        {visibleRows.length ===
                          0 && (
                          <tr>
                            <td
                              colSpan={
                                Math.max(
                                  headers.length +
                                    1,
                                  2,
                                )
                              }
                              className="px-6 py-16 text-center text-brand-gray"
                            >
                              This sheet is empty.
                            </td>
                          </tr>
                        )}
  
                        {visibleRows.map(
                          (row, rowIndex) => (
                            <tr
                              key={`${page}-${rowIndex}`}
                              className="border-b border-brand-border/70 transition hover:bg-orange-50/40"
                            >
                              <td className="sticky left-0 z-10 border-r border-brand-border bg-white px-3 py-3 text-center font-semibold text-brand-gray">
                                {pageStart +
                                  rowIndex}
                              </td>
  
                              {headers.map(
                                (
                                  _,
                                  columnIndex,
                                ) => (
                                  <td
                                    key={
                                      columnIndex
                                    }
                                    className="max-w-[320px] px-5 py-3 whitespace-nowrap text-brand-ink"
                                  >
                                    {String(
                                      row[
                                        columnIndex
                                      ] ??
                                        "",
                                    )}
                                  </td>
                                ),
                              )}
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
  
                {/* =========================================
                    PAGINATION
                ========================================== */}
  
                <div className="flex shrink-0 items-center justify-between border-t border-brand-border bg-white px-5 py-3">
                  <p className="text-xs text-brand-gray">
                    Showing{" "}
                    <span className="font-semibold text-brand-ink">
                      {pageStart}
                    </span>{" "}
                    –{" "}
                    <span className="font-semibold text-brand-ink">
                      {pageEnd}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-brand-ink">
                      {bodyRows.length}
                    </span>{" "}
                    rows
                  </p>
  
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() =>
                        setPage(
                          (value) =>
                            Math.max(
                              1,
                              value - 1,
                            ),
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-border text-brand-gray transition hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
  
                    <span className="min-w-[70px] text-center text-xs font-semibold text-brand-ink">
                      {page} / {totalPages}
                    </span>
  
                    <button
                      type="button"
                      disabled={
                        page >= totalPages
                      }
                      onClick={() =>
                        setPage(
                          (value) =>
                            Math.min(
                              totalPages,
                              value + 1,
                            ),
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-border text-brand-gray transition hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    );
  }