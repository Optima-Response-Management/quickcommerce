import {
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router";

import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileSpreadsheet,
  Loader2,
  Search,
  X,
} from "lucide-react";

import * as XLSX from "xlsx";

import {
  useListUploadsQuery,
} from "../uploadHistoryApi";

type SheetData = {
  name: string;
  rows: string[][];
};

const apiBaseUrl = String(
  import.meta.env.VITE_API_BASE_URL ?? "",
).replace(/\/$/, "");

const MAX_PREVIEW_ROWS = 500;

const MAX_CELL_LENGTH = 180;

// ------------------------------------------------------------
// FETCH FILE
// ------------------------------------------------------------

async function fetchFile(
  id: string,
): Promise<Blob> {
  const response = await fetch(
    `${apiBaseUrl}/uploads/${id}/file`,
    {
      credentials: "include",
    },
  );

  if (!response.ok) {
    let message =
      "Unable to load file";

    try {
      const contentType =
        response.headers.get(
          "content-type",
        ) ?? "";

      if (
        contentType.includes(
          "application/json",
        )
      ) {
        const body =
          await response.json();

        message =
          body?.message ||
          body?.error ||
          message;
      } else {
        const text =
          await response.text();

        if (text.trim()) {
          message = text;
        }
      }
    } catch {
      // Keep default message.
    }

    throw new Error(message);
  }

  return response.blob();
}

// ------------------------------------------------------------
// READ WORKBOOK
// ------------------------------------------------------------

async function readWorkbook(
  blob: Blob,
): Promise<SheetData[]> {
  const buffer =
    await blob.arrayBuffer();

  const workbook =
    XLSX.read(buffer, {
      type: "array",
      cellDates: true,
    });

  return workbook.SheetNames.map(
    (name) => {
      const worksheet =
        workbook.Sheets[name];

      const rows =
        XLSX.utils.sheet_to_json<
          unknown[]
        >(worksheet, {
          header: 1,
          defval: "",
          raw: false,
        });

      return {
        name,
        rows: rows.map((row) =>
          row.map((cell) =>
            String(cell ?? ""),
          ),
        ),
      };
    },
  );
}

// ------------------------------------------------------------
// DOWNLOAD
// ------------------------------------------------------------

function downloadBlob(
  blob: Blob,
  fileName: string,
) {
  const url =
    URL.createObjectURL(blob);

  const anchor =
    document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;

  document.body.appendChild(anchor);

  anchor.click();

  anchor.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}

// ------------------------------------------------------------
// CELL DISPLAY
// ------------------------------------------------------------

function formatCellValue(
  value: string,
): string {
  if (!value) {
    return "";
  }

  if (
    value.length >
    MAX_CELL_LENGTH
  ) {
    return `${value.slice(
      0,
      MAX_CELL_LENGTH,
    )}…`;
  }

  return value;
}

// ------------------------------------------------------------
// PAGE
// ------------------------------------------------------------

export default function UploadHistoryPage() {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useListUploadsQuery({
    page: 1,
    limit: 50,
  });
  const navigate =
  useNavigate();
  // ----------------------------------------------------------
  // VIEWER
  // ----------------------------------------------------------

  const [
    viewer,
    setViewer,
  ] = useState<{
    fileName: string;
    sheets: SheetData[];
  } | null>(null);

  const [
    activeSheet,
    setActiveSheet,
  ] = useState("");

  const [
    loadingFileId,
    setLoadingFileId,
  ] = useState<string | null>(
    null,
  );

  const [
    error,
    setError,
  ] = useState("");

  const [
    sheetSearch,
    setSheetSearch,
  ] = useState("");

  // ----------------------------------------------------------
  // CURRENT SHEET
  // ----------------------------------------------------------

  const currentSheet =
    useMemo(
      () =>
        viewer?.sheets.find(
          (sheet) =>
            sheet.name ===
            activeSheet,
        ),
      [
        viewer,
        activeSheet,
      ],
    );

  // ----------------------------------------------------------
  // FILTERED ROWS
  // ----------------------------------------------------------

  const filteredRows =
    useMemo(() => {
      if (
        !currentSheet
      ) {
        return [];
      }

      const rows =
        currentSheet.rows;

      if (
        !sheetSearch.trim()
      ) {
        return rows.slice(
          0,
          MAX_PREVIEW_ROWS,
        );
      }

      const query =
        sheetSearch
          .trim()
          .toLowerCase();

      return rows
        .filter((row) =>
          row.some((cell) =>
            String(cell)
              .toLowerCase()
              .includes(query),
          ),
        )
        .slice(
          0,
          MAX_PREVIEW_ROWS,
        );
    }, [
      currentSheet,
      sheetSearch,
    ]);

  // ----------------------------------------------------------
  // COLUMN COUNT
  // ----------------------------------------------------------

  const columnCount =
    currentSheet
      ? Math.max(
          0,
          ...currentSheet.rows.map(
            (row) =>
              row.length,
          ),
        )
      : 0;

  // ----------------------------------------------------------
  // OPEN FILE
  // ----------------------------------------------------------

  const openFile = (
    id: string,
  ) => {
    navigate(
      `/admin/file-history/${id}`,
    );
  };

  // ----------------------------------------------------------
  // DOWNLOAD FILE
  // ----------------------------------------------------------

  const downloadFile = async (
    id: string,
    fileName: string,
  ) => {
    setLoadingFileId(id);
    setError("");

    try {
      const blob =
        await fetchFile(id);

      downloadBlob(
        blob,
        fileName,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to download file",
      );
    } finally {
      setLoadingFileId(null);
    }
  };

  // ----------------------------------------------------------
  // CLOSE VIEWER
  // ----------------------------------------------------------

  const closeViewer = () => {
    setViewer(null);
    setActiveSheet("");
    setSheetSearch("");
  };

  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <section
        className="
          relative
          overflow-hidden
          rounded-3xl
          border
          border-brand-border
          bg-white
          p-6
          shadow-brand-sm
        "
      >
        {/* Decorative glow */}

        <div
          className="
            pointer-events-none
            absolute
            -right-24
            -top-24
            h-64
            w-64
            rounded-full
            bg-orange-200/20
            blur-3xl
          "
        />

        <div className="relative">
          <div
            className="
              mb-3
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-brand-primary/10
              bg-brand-primary-soft
              px-3
              py-1.5
              text-[10px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-brand-primary-dark
            "
          >
            <FileSpreadsheet
              className="h-3.5 w-3.5"
            />

            Data management
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1
                className="
                  text-2xl
                  font-bold
                  tracking-tight
                  text-brand-ink
                "
              >
                File History
              </h1>

              <p
                className="
                  mt-1
                  max-w-2xl
                  text-sm
                  leading-6
                  text-brand-gray
                "
              >
                View and download uploaded
                campaign files and inspect
                their spreadsheet data.
              </p>
            </div>

            <div
              className="
                inline-flex
                w-fit
                items-center
                gap-2
                rounded-xl
                border
                border-brand-border
                bg-brand-surface
                px-3
                py-2
                text-xs
                font-semibold
                text-brand-gray
              "
            >
              <FileSpreadsheet
                className="
                  h-4
                  w-4
                  text-orange-500
                "
              />

              {data?.pagination?.total ??
                0}{" "}
              files
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div
          className="
            flex
            items-center
            justify-between
            gap-4
            rounded-xl
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-sm
            text-red-700
          "
        >
          <span>{error}</span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            className="
              shrink-0
              rounded-lg
              p-1
              transition
              hover:bg-red-100
            "
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* =====================================================
          FILE TABLE
      ====================================================== */}

      <section
        className="
          overflow-hidden
          rounded-2xl
          border
          border-brand-border
          bg-white
          shadow-brand-sm
        "
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead
              className="
                border-b
                border-brand-border
                bg-brand-surface
              "
            >
              <tr>
                <th className="px-5 py-3.5 font-semibold text-brand-ink">
                  File
                </th>

                <th className="px-5 py-3.5 font-semibold text-brand-ink">
                  Platform
                </th>

                <th className="px-5 py-3.5 font-semibold text-brand-ink">
                  Report date
                </th>

                <th className="px-5 py-3.5 font-semibold text-brand-ink">
                  Rows
                </th>

                <th className="px-5 py-3.5 font-semibold text-brand-ink">
                  Uploaded by
                </th>

                <th className="px-5 py-3.5 text-right font-semibold text-brand-ink">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-brand-border">
              {/* Loading */}

              {isLoading && (
                <tr>
                  <td
                    colSpan={6}
                    className="
                      px-5
                      py-14
                      text-center
                      text-sm
                      text-brand-gray
                    "
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Loader2
                        className="
                          h-4
                          w-4
                          animate-spin
                        "
                      />

                      Loading upload
                      history...
                    </div>
                  </td>
                </tr>
              )}

              {/* Error */}

              {!isLoading &&
                isError && (
                  <tr>
                    <td
                      colSpan={6}
                      className="
                        px-5
                        py-14
                        text-center
                        text-sm
                        text-red-600
                      "
                    >
                      Failed to load upload
                      history.

                      <button
                        type="button"
                        onClick={() =>
                          refetch()
                        }
                        className="
                          ml-2
                          font-semibold
                          underline
                        "
                      >
                        Retry
                      </button>
                    </td>
                  </tr>
                )}

              {/* Empty */}

              {!isLoading &&
                !isError &&
                !data?.uploads
                  ?.length && (
                  <tr>
                    <td
                      colSpan={6}
                      className="
                        px-5
                        py-14
                        text-center
                        text-sm
                        text-brand-gray
                      "
                    >
                      No uploaded files
                      found.
                    </td>
                  </tr>
                )}

              {/* Rows */}

              {data?.uploads.map(
                (upload) => {
                  const busy =
                    loadingFileId ===
                    upload.id;

                  return (
                    <tr
                      key={upload.id}
                      className="
                        transition-colors
                        hover:bg-brand-surface/60
                      "
                    >
                      {/* File */}

                      <td className="max-w-[400px] px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="
                              flex
                              h-10
                              w-10
                              shrink-0
                              items-center
                              justify-center
                              rounded-xl
                              bg-orange-50
                              text-orange-500
                            "
                          >
                            <FileSpreadsheet
                              className="
                                h-5
                                w-5
                              "
                            />
                          </div>

                          <div className="min-w-0">
                            <p
                              className="
                                truncate
                                font-semibold
                                text-brand-ink
                              "
                            >
                              {upload.fileName}
                            </p>

                            <p
                              className="
                                mt-0.5
                                truncate
                                text-xs
                                text-brand-gray
                              "
                            >
                              {upload.market ??
                                "All markets"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Platform */}

                      <td className="px-5 py-4 text-brand-gray">
                        {upload.platformName}
                      </td>

                      {/* Date */}

                      <td className="px-5 py-4 text-brand-gray">
                        {upload.reportDate}
                      </td>

                      {/* Rows */}

                      <td className="px-5 py-4 text-brand-gray">
                        {upload.rowCount.toLocaleString()}
                      </td>

                      {/* User */}

                      <td className="px-5 py-4 text-brand-gray">
                        {upload.uploadedBy
                          ?.name ??
                          "Unknown"}
                      </td>

                      {/* Actions */}

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          {/* View */}

                          <button
  type="button"
  onClick={() =>
    openFile(upload.id)
  }
  className="
    inline-flex
    items-center
    gap-1.5
    rounded-xl
    border
    border-brand-border
    bg-white
    px-3
    py-2
    text-xs
    font-semibold
    text-brand-ink
    shadow-sm
    transition
    hover:border-orange-200
    hover:bg-orange-50
    hover:text-orange-600
  "
>
  <Eye
    size={14}
  />

  View
</button>

                          {/* Download */}

                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              downloadFile(
                                upload.id,
                                upload.fileName,
                              )
                            }
                            className="
                              inline-flex
                              items-center
                              gap-1.5
                              rounded-xl
                              bg-brand-ink
                              px-3
                              py-2
                              text-xs
                              font-semibold
                              text-white
                              shadow-sm
                              transition
                              hover:bg-orange-600
                              disabled:cursor-not-allowed
                              disabled:opacity-40
                            "
                          >
                            {busy ? (
                              <Loader2
                                size={14}
                                className="animate-spin"
                              />
                            ) : (
                              <Download
                                size={14}
                              />
                            )}

                            Download
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                },
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* =====================================================
          EXCEL VIEWER
      ====================================================== */}

      {viewer && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/65
            p-3
            backdrop-blur-[2px]
            sm:p-5
            lg:p-7
          "
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeViewer();
            }
          }}
        >
          <div
            className="
              flex
              h-[94vh]
              w-full
              max-w-[1700px]
              flex-col
              overflow-hidden
              rounded-2xl
              border
              border-black/10
              bg-white
              shadow-[0_30px_90px_rgba(0,0,0,0.35)]
            "
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            {/* =================================================
                VIEWER HEADER
            ================================================== */}

            <div
              className="
                shrink-0
                border-b
                border-brand-border
                bg-white
              "
            >
              {/* Top toolbar */}

              <div
                className="
                  flex
                  min-h-[72px]
                  items-center
                  justify-between
                  gap-4
                  px-4
                  py-3
                  sm:px-6
                "
              >
                {/* File information */}

                <div
                  className="
                    flex
                    min-w-0
                    items-center
                    gap-3
                  "
                >
                  <div
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-orange-50
                      text-orange-500
                    "
                  >
                    <FileSpreadsheet
                      className="
                        h-5
                        w-5
                      "
                    />
                  </div>

                  <div className="min-w-0">
                    <div
                      className="
                        flex
                        items-center
                        gap-2
                      "
                    >
                      <h2
                        className="
                          max-w-[500px]
                          truncate
                          text-sm
                          font-bold
                          text-brand-ink
                          sm:text-base
                        "
                      >
                        {viewer.fileName}
                      </h2>

                      <span
                        className="
                          hidden
                          rounded-full
                          border
                          border-emerald-200
                          bg-emerald-50
                          px-2
                          py-0.5
                          text-[9px]
                          font-bold
                          uppercase
                          tracking-wide
                          text-emerald-600
                          sm:inline-flex
                        "
                      >
                        Preview
                      </span>
                    </div>

                    <p
                      className="
                        mt-1
                        text-[11px]
                        text-brand-gray
                      "
                    >
                      {viewer.sheets.length}{" "}
                      {viewer.sheets.length ===
                      1
                        ? "worksheet"
                        : "worksheets"}

                      {currentSheet
                        ? ` • ${currentSheet.rows.length.toLocaleString()} rows`
                        : ""}

                      {columnCount > 0
                        ? ` • ${columnCount} columns`
                        : ""}
                    </p>
                  </div>
                </div>

                {/* Header actions */}

                <div
                  className="
                    flex
                    shrink-0
                    items-center
                    gap-2
                  "
                >
                  <button
                    type="button"
                    onClick={() =>
                      closeViewer()
                    }
                    className="
                      inline-flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-brand-border
                      text-brand-gray
                      transition
                      hover:bg-brand-surface
                      hover:text-brand-ink
                    "
                    aria-label="Close viewer"
                  >
                    <X
                      className="
                        h-5
                        w-5
                      "
                    />
                  </button>
                </div>
              </div>

              {/* =================================================
                  SHEET BAR
              ================================================== */}

              <div
                className="
                  flex
                  min-h-[52px]
                  items-center
                  gap-3
                  border-t
                  border-brand-border
                  bg-[#faf9f7]
                  px-4
                  sm:px-6
                "
              >
                {/* Sheet navigation */}

                <div
                  className="
                    flex
                    min-w-0
                    flex-1
                    items-center
                    gap-1
                    overflow-x-auto
                  "
                >
                  {viewer.sheets.map(
                    (sheet) => {
                      const active =
                        activeSheet ===
                        sheet.name;

                      return (
                        <button
                          key={
                            sheet.name
                          }
                          type="button"
                          onClick={() => {
                            setActiveSheet(
                              sheet.name,
                            );
                            setSheetSearch(
                              "",
                            );
                          }}
                          className={[
                            "shrink-0",
                            "rounded-lg",
                            "px-3",
                            "py-2",
                            "text-xs",
                            "font-semibold",
                            "transition-all",

                            active
                              ? "bg-white text-brand-ink shadow-sm ring-1 ring-brand-border"
                              : "text-brand-gray hover:bg-white hover:text-brand-ink",
                          ].join(" ")}
                        >
                          {sheet.name}
                        </button>
                      );
                    },
                  )}
                </div>

                {/* Search */}

                <div
                  className="
                    hidden
                    w-[240px]
                    shrink-0
                    items-center
                    gap-2
                    rounded-lg
                    border
                    border-brand-border
                    bg-white
                    px-3
                    sm:flex
                  "
                >
                  <Search
                    className="
                      h-3.5
                      w-3.5
                      shrink-0
                      text-brand-gray
                    "
                  />

                  <input
                    value={sheetSearch}
                    onChange={(event) =>
                      setSheetSearch(
                        event.target.value,
                      )
                    }
                    placeholder="Search this sheet..."
                    className="
                      h-9
                      w-full
                      bg-transparent
                      text-xs
                      text-brand-ink
                      outline-none
                      placeholder:text-brand-gray-light
                    "
                  />

                  {sheetSearch && (
                    <button
                      type="button"
                      onClick={() =>
                        setSheetSearch(
                          "",
                        )
                      }
                      className="
                        text-brand-gray
                        hover:text-brand-ink
                      "
                    >
                      <X
                        className="
                          h-3.5
                          w-3.5
                        "
                      />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* =================================================
                MOBILE SEARCH
            ================================================== */}

            <div
              className="
                border-b
                border-brand-border
                bg-white
                px-4
                py-2
                sm:hidden
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                  rounded-lg
                  border
                  border-brand-border
                  bg-brand-surface
                  px-3
                "
              >
                <Search
                  className="
                    h-3.5
                    w-3.5
                    text-brand-gray
                  "
                />

                <input
                  value={sheetSearch}
                  onChange={(event) =>
                    setSheetSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Search this sheet..."
                  className="
                    h-9
                    w-full
                    bg-transparent
                    text-xs
                    text-brand-ink
                    outline-none
                  "
                />

                {sheetSearch && (
                  <button
                    type="button"
                    onClick={() =>
                      setSheetSearch(
                        "",
                      )
                    }
                  >
                    <X
                      className="
                        h-3.5
                        w-3.5
                        text-brand-gray
                      "
                    />
                  </button>
                )}
              </div>
            </div>

            {/* =================================================
                SPREADSHEET
            ================================================== */}

            <div
              className="
                min-h-0
                flex-1
                overflow-hidden
                bg-[#f6f7f8]
              "
            >
              {currentSheet?.rows
                .length ? (
                <div
                  className="
                    h-full
                    overflow-auto
                  "
                >
                  <table
                    className="
                      min-w-max
                      border-separate
                      border-spacing-0
                      text-[12px]
                    "
                  >
                    <thead>
                      <tr>
                        {/* Row number header */}

                        <th
                          className="
                            sticky
                            left-0
                            top-0
                            z-30
                            h-10
                            min-w-[54px]
                            border-b
                            border-r
                            border-brand-border
                            bg-[#f0f1f2]
                            px-3
                            text-center
                            text-[10px]
                            font-semibold
                            text-brand-gray
                          "
                        >
                          #
                        </th>

                        {Array.from({
                          length:
                            columnCount,
                        }).map(
                          (
                            _,
                            columnIndex,
                          ) => (
                            <th
                              key={
                                columnIndex
                              }
                              className="
                                sticky
                                top-0
                                z-20
                                h-10
                                min-w-[150px]
                                max-w-[320px]
                                border-b
                                border-r
                                border-brand-border
                                bg-[#f0f1f2]
                                px-4
                                text-left
                                text-[11px]
                                font-bold
                                text-brand-ink
                              "
                            >
                              {currentSheet
                                .rows[0]?.[
                                columnIndex
                              ] ||
                                `Column ${
                                  columnIndex +
                                  1
                                }`}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {filteredRows
                        .slice(1)
                        .map(
                          (
                            row,
                            rowIndex,
                          ) => {
                            const actualRowNumber =
                              rowIndex +
                              2;

                            return (
                              <tr
                                key={`${actualRowNumber}-${row.join(
                                  "|",
                                )}`}
                                className="
                                  group
                                  hover:bg-orange-50/60
                                "
                              >
                                {/* Row number */}

                                <td
                                  className="
                                    sticky
                                    left-0
                                    z-10
                                    border-b
                                    border-r
                                    border-brand-border
                                    bg-[#f8f9fa]
                                    px-3
                                    py-2.5
                                    text-center
                                    text-[10px]
                                    font-medium
                                    text-brand-gray
                                    group-hover:bg-orange-50
                                  "
                                >
                                  {actualRowNumber}
                                </td>

                                {Array.from({
                                  length:
                                    columnCount,
                                }).map(
                                  (
                                    _,
                                    columnIndex,
                                  ) => {
                                    const value =
                                      row[
                                        columnIndex
                                      ] ??
                                      "";

                                    return (
                                      <td
                                        key={
                                          columnIndex
                                        }
                                        title={
                                          value
                                            .length >
                                          MAX_CELL_LENGTH
                                            ? value
                                            : undefined
                                        }
                                        className="
                                          min-w-[150px]
                                          max-w-[320px]
                                          border-b
                                          border-r
                                          border-brand-border
                                          bg-white
                                          px-4
                                          py-2.5
                                          align-top
                                          text-[12px]
                                          leading-5
                                          text-brand-ink
                                          group-hover:bg-orange-50/30
                                        "
                                      >
                                        <span
                                          className="
                                            block
                                            max-w-[320px]
                                            truncate
                                          "
                                        >
                                          {formatCellValue(
                                            value,
                                          )}
                                        </span>
                                      </td>
                                    );
                                  },
                                )}
                              </tr>
                            );
                          },
                        )}
                    </tbody>
                  </table>

                  {/* Search / preview footer */}

                  <div
                    className="
                      flex
                      min-h-[42px]
                      items-center
                      justify-between
                      gap-4
                      border-t
                      border-brand-border
                      bg-white
                      px-4
                      text-[11px]
                      text-brand-gray
                    "
                  >
                    <span>
                      {sheetSearch
                        ? `Showing ${filteredRows.length.toLocaleString()} matching rows`
                        : `Showing ${Math.max(
                            0,
                            Math.min(
                              currentSheet
                                .rows
                                .length -
                                1,
                              MAX_PREVIEW_ROWS,
                            ),
                          ).toLocaleString()} rows`}
                    </span>

                    {currentSheet
                      .rows.length -
                      1 >
                      MAX_PREVIEW_ROWS &&
                      !sheetSearch && (
                        <span>
                          Preview limited to{" "}
                          {MAX_PREVIEW_ROWS.toLocaleString()}{" "}
                          rows
                        </span>
                      )}
                  </div>
                </div>
              ) : (
                <div
                  className="
                    flex
                    h-full
                    items-center
                    justify-center
                    p-10
                  "
                >
                  <div
                    className="
                      text-center
                    "
                  >
                    <div
                      className="
                        mx-auto
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-2xl
                        bg-white
                        text-brand-gray
                        shadow-sm
                      "
                    >
                      <FileSpreadsheet
                        className="
                          h-6
                          w-6
                        "
                      />
                    </div>

                    <p
                      className="
                        mt-4
                        text-sm
                        font-semibold
                        text-brand-ink
                      "
                    >
                      This worksheet is empty
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-brand-gray
                      "
                    >
                      There is no spreadsheet
                      data to preview.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* =================================================
                VIEWER FOOTER
            ================================================== */}

            <div
              className="
                flex
                min-h-[48px]
                shrink-0
                items-center
                justify-between
                gap-4
                border-t
                border-brand-border
                bg-white
                px-4
                sm:px-6
              "
            >
              <div
                className="
                  flex
                  min-w-0
                  items-center
                  gap-3
                "
              >
                <span
                  className="
                    hidden
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-wider
                    text-brand-gray
                    sm:inline
                  "
                >
                  Spreadsheet preview
                </span>

                <span
                  className="
                    h-1
                    w-1
                    rounded-full
                    bg-brand-gray-light
                  "
                />

                <span
                  className="
                    truncate
                    text-[11px]
                    text-brand-gray
                  "
                >
                  {currentSheet?.name ??
                    "Sheet"}
                </span>
              </div>

              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-[11px]
                  text-brand-gray
                "
              >
                <span>
                  {columnCount} columns
                </span>

                <span>•</span>

                <span>
                  {Math.max(
                    0,
                    (currentSheet
                      ?.rows
                      .length ??
                      1) - 1,
                  ).toLocaleString()}{" "}
                  rows
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}