import {
  useMemo,
  useState,
  useEffect
} from "react";

import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  Loader2,
  Search,
  X,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router";

import * as XLSX from "xlsx";

type SheetData = {
  name: string;
  rows: string[][];
};

const apiBaseUrl = String(
  import.meta.env.VITE_API_BASE_URL,).replace(/\/$/, "");

const MAX_PREVIEW_ROWS = 1000;

const MAX_CELL_LENGTH = 180;

// ------------------------------------------------------------
// FETCH FILE
// ------------------------------------------------------------

async function fetchFile(
  id: string,
): Promise<{
  blob: Blob;
  fileName: string;
}> {
  const response = await fetch(
    `${apiBaseUrl}/uploads/${id}/file`,
    {
      credentials: "include",
    },
  );

  if (!response.ok) {
    let message =
      "Unable to load file.";

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

  const contentDisposition =
    response.headers.get(
      "content-disposition",
    );

  let fileName =
    "campaign-file.xlsx";

  if (contentDisposition) {
    const utf8Match =
      contentDisposition.match(
        /filename\*=UTF-8''([^;]+)/i,
      );

    const normalMatch =
      contentDisposition.match(
        /filename="?([^"]+)"?/i,
      );

    if (utf8Match?.[1]) {
      try {
        fileName =
          decodeURIComponent(
            utf8Match[1],
          );
      } catch {
        fileName =
          utf8Match[1];
      }
    } else if (
      normalMatch?.[1]
    ) {
      fileName =
        normalMatch[1];
    }
  }

  return {
    blob:
      await response.blob(),

    fileName,
  };
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
// COLUMN LETTER
// ------------------------------------------------------------

function getColumnLetter(
  index: number,
): string {
  let result = "";
  let number = index + 1;

  while (number > 0) {
    const remainder =
      (number - 1) % 26;

    result =
      String.fromCharCode(
        65 + remainder,
      ) + result;

    number = Math.floor(
      (number - 1) / 26,
    );
  }

  return result;
}

// ------------------------------------------------------------
// CELL FORMAT
// ------------------------------------------------------------

function formatCell(
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

export default function ExcelViewerPage() {

  const navigate =
    useNavigate();

  const { id } =
    useParams<{
      id: string;
    }>();

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    fileName,
    setFileName,
  ] = useState(
    "Campaign File",
  );

  const [
    sheets,
    setSheets,
  ] = useState<SheetData[]>(
    [],
  );

  const [
    activeSheet,
    setActiveSheet,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  // ----------------------------------------------------------
  // LOAD
  // ----------------------------------------------------------

 

  useEffect(() => {
    if (!id) {
      return;
    }
  
    let cancelled = false;
  
    const loadFile = async () => {
      try {
        const result = await fetchFile(id);
  
        if (cancelled) return;
  
        const workbook = await readWorkbook(result.blob);
  
        if (!workbook.length) {
          throw new Error(
            "The uploaded file does not contain any worksheets.",
          );
        }
  
        if (cancelled) return;
  
        setFileName(result.fileName);
        setSheets(workbook);
        setActiveSheet(workbook[0]?.name ?? "");
        setError("");
      } catch (err: unknown) {
        if (cancelled) return;
  
        setError(
          err instanceof Error
            ? err.message
            : "Unable to open file.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
  
    void loadFile();
  
    return () => {
      cancelled = true;
    };
  }, [id]);
  


  // ----------------------------------------------------------
  // CURRENT SHEET
  // ----------------------------------------------------------

  const currentSheet =
    useMemo(
      () =>
        sheets.find(
          (sheet) =>
            sheet.name ===
            activeSheet,
        ),
      [
        sheets,
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
        !search.trim()
      ) {
        return rows.slice(
          0,
          MAX_PREVIEW_ROWS,
        );
      }

      const query =
        search
          .trim()
          .toLowerCase();

      return rows
        .filter((row) =>
          row.some((cell) =>
            cell
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
      search,
    ]);

  // ----------------------------------------------------------
  // COLUMNS
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
  // DOWNLOAD
  // ----------------------------------------------------------

  const handleDownload =
    async () => {
      if (!id) {
        return;
      }

      try {
        const result =
          await fetchFile(id);

        downloadBlob(
          result.blob,
          result.fileName,
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to download file.",
        );
      }
    };

  // ----------------------------------------------------------
  // LOADING
  // ----------------------------------------------------------

  if (loading) {
    return (
      <div
        className="
          flex
          min-h-[calc(100vh-110px)]
          items-center
          justify-center
        "
      >
        <div
          className="
            flex
            flex-col
            items-center
            gap-3
          "
        >
          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              bg-orange-50
              text-orange-500
            "
          >
            <Loader2
              className="
                h-6
                w-6
                animate-spin
              "
            />
          </div>

          <p
            className="
              text-sm
              font-semibold
              text-brand-ink
            "
          >
            Opening spreadsheet...
          </p>

          <p
            className="
              text-xs
              text-brand-gray
            "
          >
            Preparing the file
            preview
          </p>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------
  // ERROR
  // ----------------------------------------------------------

  if (error) {
    return (
      <div className="mx-auto max-w-[900px]">
        <button
          type="button"
          onClick={() =>
            navigate(
              "/admin/file-history",
            )
          }
          className="
            mb-5
            inline-flex
            items-center
            gap-2
            rounded-xl
            border
            border-brand-border
            bg-white
            px-4
            py-2.5
            text-sm
            font-semibold
            text-brand-ink
            shadow-sm
            transition
            hover:bg-brand-surface
          "
        >
          <ArrowLeft
            className="
              h-4
              w-4
            "
          />

          Back to File History
        </button>

        <div
          className="
            rounded-2xl
            border
            border-red-200
            bg-red-50
            p-6
          "
        >
          <h1
            className="
              text-base
              font-bold
              text-red-800
            "
          >
            Unable to open file
          </h1>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-red-700
            "
          >
            {error}
          </p>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------
  // PAGE
  // ----------------------------------------------------------

  return (
    <div
      className="
        flex
        min-h-[calc(100vh-110px)]
        flex-col
        gap-4
      "
    >
      {/* =====================================================
          TOP HEADER
      ====================================================== */}

      <div
        className="
          flex
          shrink-0
          flex-col
          gap-4
          rounded-2xl
          border
          border-brand-border
          bg-white
          p-4
          shadow-sm
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        {/* Left */}

        <div
          className="
            flex
            min-w-0
            items-center
            gap-3
          "
        >
          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/file-history",
              )
            }
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-brand-border
              bg-white
              text-brand-gray
              transition
              hover:bg-brand-surface
              hover:text-brand-ink
            "
            aria-label="Back to File History"
          >
            <ArrowLeft
              className="
                h-4
                w-4
              "
            />
          </button>

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
            <h1
              className="
                truncate
                text-base
                font-bold
                text-brand-ink
                sm:text-lg
              "
            >
              {fileName}
            </h1>

            <div
              className="
                mt-1
                flex
                flex-wrap
                items-center
                gap-2
                text-[11px]
                text-brand-gray
              "
            >
              <span>
                {sheets.length}{" "}
                {sheets.length ===
                1
                  ? "worksheet"
                  : "worksheets"}
              </span>

              <span>•</span>

              <span>
                {currentSheet
                  ? currentSheet.rows.length.toLocaleString()
                  : 0}{" "}
                rows
              </span>

              <span>•</span>

              <span>
                {columnCount} columns
              </span>
            </div>
          </div>
        </div>

        {/* Right */}

        <button
          type="button"
          onClick={
            handleDownload
          }
          className="
            inline-flex
            shrink-0
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-brand-ink
            px-4
            py-2.5
            text-sm
            font-semibold
            text-white
            shadow-sm
            transition
            hover:bg-orange-600
          "
        >
          <Download
            className="
              h-4
              w-4
            "
          />

          Download
        </button>
      </div>

      {/* =====================================================
          SPREADSHEET CONTAINER
      ====================================================== */}

      <section
        className="
          flex
          min-h-0
          flex-1
          flex-col
          overflow-hidden
          rounded-2xl
          border
          border-brand-border
          bg-white
          shadow-sm
        "
      >
        {/* ===================================================
            SHEET TOOLBAR
        ==================================================== */}

        <div
          className="
            flex
            shrink-0
            flex-col
            border-b
            border-brand-border
            bg-[#faf9f7]
            sm:flex-row
            sm:items-center
          "
        >
          {/* Sheets */}

          <div
            className="
              flex
              min-w-0
              flex-1
              gap-1
              overflow-x-auto
              px-3
              py-2
            "
          >
            {sheets.map(
              (sheet) => {
                const active =
                  sheet.name ===
                  activeSheet;

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

                      setSearch(
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
                      "transition",

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
              m-2
              flex
              h-9
              w-auto
              shrink-0
              items-center
              gap-2
              rounded-lg
              border
              border-brand-border
              bg-white
              px-3
              sm:w-[260px]
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
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search spreadsheet..."
              className="
                h-full
                min-w-0
                flex-1
                bg-transparent
                text-xs
                text-brand-ink
                outline-none
                placeholder:text-brand-gray-light
              "
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="
                  text-brand-gray
                  transition
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

        {/* ===================================================
            SPREADSHEET
        ==================================================== */}

        <div
          className="
            min-h-0
            flex-1
            overflow-auto
            bg-[#f6f7f8]
          "
        >
          {currentSheet?.rows
            .length ? (
            <table
              className="
                min-w-max
                border-separate
                border-spacing-0
                text-[12px]
              "
            >
              {/* ------------------------------------------------
                  HEADER
              ------------------------------------------------- */}

              <thead>
                <tr>
                  {/* Corner */}

                  <th
                    className="
                      sticky
                      left-0
                      top-0
                      z-40
                      h-10
                      w-[54px]
                      min-w-[54px]
                      border-b
                      border-r
                      border-brand-border
                      bg-[#eef0f2]
                      px-3
                      text-center
                      text-[10px]
                      font-bold
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
                          z-30
                          h-10
                          min-w-[160px]
                          border-b
                          border-r
                          border-brand-border
                          bg-[#eef0f2]
                          px-4
                          text-left
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-wide
                          text-brand-gray
                        "
                      >
                        <div
                          className="
                            flex
                            items-center
                            gap-2
                          "
                        >
                          <span
                            className="
                              text-[9px]
                              font-medium
                              text-brand-gray-light
                            "
                          >
                            {getColumnLetter(
                              columnIndex,
                            )}
                          </span>

                          <span
                            className="
                              max-w-[180px]
                              truncate
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
                          </span>
                        </div>
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              {/* ------------------------------------------------
                  BODY
              ------------------------------------------------- */}

              <tbody>
                {filteredRows
                  .slice(1)
                  .map(
                    (
                      row,
                      rowIndex,
                    ) => {
                      const rowNumber =
                        rowIndex +
                        2;

                      return (
                        <tr
                          key={`${rowNumber}-${row.join(
                            "|",
                          )}`}
                          className="
                            group
                            hover:bg-orange-50
                          "
                        >
                          {/* Row number */}

                          <td
                            className="
                              sticky
                              left-0
                              z-20
                              w-[54px]
                              min-w-[54px]
                              border-b
                              border-r
                              border-brand-border
                              bg-[#f7f8f9]
                              px-3
                              py-2.5
                              text-center
                              text-[10px]
                              font-medium
                              text-brand-gray
                              group-hover:bg-orange-50
                            "
                          >
                            {rowNumber}
                          </td>

                          {/* Cells */}

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
                                    value.length >
                                    MAX_CELL_LENGTH
                                      ? value
                                      : undefined
                                  }
                                  className="
                                    min-w-[160px]
                                    max-w-[340px]
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
                                    group-hover:bg-orange-50/40
                                  "
                                >
                                  <span
                                    className="
                                      block
                                      max-w-[340px]
                                      truncate
                                    "
                                  >
                                    {formatCell(
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
          ) : (
            <div
              className="
                flex
                h-full
                min-h-[400px]
                items-center
                justify-center
              "
            >
              <div className="text-center">
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
                  This worksheet is
                  empty
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

        {/* ===================================================
            FOOTER
        ==================================================== */}

        <div
          className="
            flex
            min-h-[44px]
            shrink-0
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
          <div
            className="
              flex
              min-w-0
              items-center
              gap-2
            "
          >
            <span
              className="
                font-semibold
                uppercase
                tracking-[0.12em]
              "
            >
              Spreadsheet
            </span>

            <span>•</span>

            <span className="truncate">
              {currentSheet?.name ??
                "Sheet"}
            </span>
          </div>

          <div
            className="
              flex
              shrink-0
              items-center
              gap-2
            "
          >
            {search ? (
              <span>
                {filteredRows.length -
                  1}{" "}
                matching
              </span>
            ) : (
              <span>
                {Math.max(
                  0,
                  (currentSheet
                    ?.rows.length ??
                    1) - 1,
                ).toLocaleString()}{" "}
                rows
              </span>
            )}

            <span>•</span>

            <span>
              {columnCount} columns
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}