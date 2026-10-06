import { useMemo, useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";

export interface Column<T> {
  key: keyof T;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  title?: string;
}

type SortDirection = "asc" | "desc" | null;

export default function Table<
  T extends Record<string, any>
>({
  data,
  columns,
  pageSize = 10,
  title,
}: TableProps<T>) {
  const [sortKey, setSortKey] =
    useState<keyof T | null>(null);

  const [sortDir, setSortDir] =
    useState<SortDirection>(null);

  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredData = useMemo(() => {
    if (!search.trim()) {
      return data;
    }

    const q = search.toLowerCase().trim();

    return data.filter((row) =>
      columns.some((col) =>
        String(row[col.key] ?? "")
          .toLowerCase()
          .includes(q)
      )
    );
  }, [data, search, columns]);

  /* =========================================================
     SORT
  ========================================================= */

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDir) {
      return filteredData;
    }

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      /*
       * Numeric sorting
       */
      if (
        typeof aVal === "number" &&
        typeof bVal === "number"
      ) {
        return sortDir === "asc"
          ? aVal - bVal
          : bVal - aVal;
      }

      /*
       * String sorting
       */
      const aString = String(aVal ?? "");
      const bString = String(bVal ?? "");

      return sortDir === "asc"
        ? aString.localeCompare(bString)
        : bString.localeCompare(aString);
    });
  }, [
    filteredData,
    sortKey,
    sortDir,
  ]);

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(sortedData.length / pageSize)
  );

  /*
   * Make sure current page is always valid.
   *
   * Example:
   * Page 3 -> search reduces results to 1 page.
   */
  const currentPage = Math.min(
    page,
    totalPages
  );

  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const startRow =
    sortedData.length === 0
      ? 0
      : (currentPage - 1) * pageSize + 1;

  const endRow = Math.min(
    currentPage * pageSize,
    sortedData.length
  );

  /* =========================================================
     SORT HANDLER
  ========================================================= */

  const handleSort = (key: keyof T) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortKey(null);
      setSortDir(null);
    }

    setPage(1);
  };

  /* =========================================================
     SORT ICON
  ========================================================= */

  const SortIcon = ({
    colKey,
  }: {
    colKey: keyof T;
  }) => {
    if (sortKey !== colKey) {
      return (
        <ChevronsUpDown
          className="h-3.5 w-3.5 text-gray-300"
        />
      );
    }

    return sortDir === "asc" ? (
      <ChevronUp
        className="h-3.5 w-3.5 text-brand-primary"
      />
    ) : (
      <ChevronDown
        className="h-3.5 w-3.5 text-brand-primary"
      />
    );
  };

  /* =========================================================
     PAGE NUMBERS
  ========================================================= */

  const pageNumbers = useMemo(() => {
    const range: number[] = [];

    const start = Math.max(
      1,
      currentPage - 2
    );

    const end = Math.min(
      totalPages,
      start + 4
    );

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    return range;
  }, [
    currentPage,
    totalPages,
  ]);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="overflow-hidden rounded-xl border border-brand-border bg-white">
      {/* =====================================================
          TABLE HEADER
      ===================================================== */}

      <div className="flex items-center justify-between border-b border-brand-border-light px-5 py-4">
        {title && (
          <h3 className="text-sm font-semibold text-brand-ink">
            {title}
          </h3>
        )}

        <div className="ml-auto flex items-center gap-2">
          <label
            htmlFor="table-search"
            className="text-sm text-brand-gray"
          >
            Search:
          </label>

          <input
            id="table-search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search..."
            className="w-48 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
          />
        </div>
      </div>

      {/* =====================================================
          SCROLLABLE TABLE AREA
          
          IMPORTANT:
          Only this area scrolls vertically.
      ===================================================== */}

      <div className="max-h-[60vh] overflow-auto overscroll-contain">
        <table className="w-full text-sm">
          {/* =================================================
              TABLE HEADER
          ================================================= */}

          <thead className="sticky top-0 z-10">
            <tr className="bg-brand-surface text-left text-xs uppercase tracking-wide text-brand-gray">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  onClick={() =>
                    handleSort(col.key)
                  }
                  className="cursor-pointer select-none whitespace-nowrap px-5 py-3 font-medium transition-colors hover:text-brand-ink"
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}

                    <SortIcon
                      colKey={col.key}
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* =================================================
              TABLE BODY
          ================================================= */}

          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-10 text-center text-brand-gray"
                >
                  No matching records found
                </td>
              </tr>
            ) : (
              paginatedData.map(
                (row, index) => (
                  <tr
                    key={
                      String(
                        row.id ??
                          row._id ??
                          `${currentPage}-${index}`
                      )
                    }
                    className="border-t border-brand-border-light transition-colors hover:bg-brand-surface"
                  >
                    {columns.map((col) => (
                      <td
                        key={String(col.key)}
                        className="whitespace-nowrap px-5 py-3 text-brand-gray"
                      >
                        {col.render
                          ? col.render(row)
                          : String(
                              row[col.key] ??
                                "—"
                            )}
                      </td>
                    ))}
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>

      {/* =====================================================
          TABLE PAGINATION
      ===================================================== */}

      {sortedData.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-brand-border-light bg-white px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Result count */}

          <p className="text-xs text-brand-gray">
            Showing{" "}
            <span className="font-semibold text-brand-ink">
              {startRow}
            </span>{" "}
            –{" "}
            <span className="font-semibold text-brand-ink">
              {endRow}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-brand-ink">
              {sortedData.length}
            </span>
          </p>

          {/* Pagination */}

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              {/* Previous */}

              <button
                type="button"
                onClick={() =>
                  setPage((current) =>
                    Math.max(
                      1,
                      current - 1
                    )
                  )
                }
                disabled={currentPage === 1}
                className="rounded-md border border-brand-border px-3 py-1.5 text-xs font-semibold text-brand-gray transition-colors hover:bg-brand-primary-soft hover:text-brand-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              {/* Page numbers */}

              {pageNumbers.map(
                (pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() =>
                      setPage(pageNumber)
                    }
                    className={`
                      flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-xs font-semibold transition-colors
                      ${
                        pageNumber ===
                        currentPage
                          ? "bg-brand-ink text-white"
                          : "border border-brand-border bg-white text-brand-gray hover:bg-brand-primary-soft hover:text-brand-primary-dark"
                      }
                    `}
                  >
                    {pageNumber}
                  </button>
                )
              )}

              {/* Next */}

              <button
                type="button"
                onClick={() =>
                  setPage((current) =>
                    Math.min(
                      totalPages,
                      current + 1
                    )
                  )
                }
                disabled={
                  currentPage ===
                  totalPages
                }
                className="rounded-md border border-brand-border px-3 py-1.5 text-xs font-semibold text-brand-gray transition-colors hover:bg-brand-primary-soft hover:text-brand-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}