import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Search,
  SlidersHorizontal,
  X,
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
  T extends Record<string, any>,
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

  const filteredData = useMemo(() => {
    if (!search.trim()) {
      return data;
    }

    const query = search
      .toLowerCase()
      .trim();

    return data.filter((row) =>
      columns.some((column) =>
        String(row[column.key] ?? "")
          .toLowerCase()
          .includes(query),
      ),
    );
  }, [data, search, columns]);

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDir) {
      return filteredData;
    }

    return [...filteredData].sort(
      (a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];

        if (
          typeof aValue === "number" &&
          typeof bValue === "number"
        ) {
          return sortDir === "asc"
            ? aValue - bValue
            : bValue - aValue;
        }

        const aString = String(
          aValue ?? "",
        );

        const bString = String(
          bValue ?? "",
        );

        return sortDir === "asc"
          ? aString.localeCompare(bString)
          : bString.localeCompare(aString);
      },
    );
  }, [
    filteredData,
    sortKey,
    sortDir,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      sortedData.length / pageSize,
    ),
  );

  const currentPage = Math.min(
    page,
    totalPages,
  );

  const paginatedData =
    sortedData.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize,
    );

  const startRow =
    sortedData.length === 0
      ? 0
      : (currentPage - 1) *
          pageSize +
        1;

  const endRow = Math.min(
    currentPage * pageSize,
    sortedData.length,
  );

  const handleSort = (
    key: keyof T,
  ) => {
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

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];

    const start = Math.max(
      1,
      currentPage - 2,
    );

    const end = Math.min(
      totalPages,
      start + 4,
    );

    for (
      let i = start;
      i <= end;
      i++
    ) {
      pages.push(i);
    }

    return pages;
  }, [
    currentPage,
    totalPages,
  ]);

  const SortIcon = ({
    columnKey,
  }: {
    columnKey: keyof T;
  }) => {
    if (sortKey !== columnKey) {
      return (
        <ChevronsUpDown className="h-3.5 w-3.5 text-brand-gray-light/60" />
      );
    }

    return sortDir === "asc" ? (
      <ChevronUp className="h-3.5 w-3.5 text-brand-primary" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5 text-brand-primary" />
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-border bg-white shadow-brand-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-brand-border-light p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary-soft text-brand-primary">
            <SlidersHorizontal className="h-4 w-4" />
          </div>

          <div>
            {title && (
              <h3 className="text-sm font-bold text-brand-ink">
                {title}
              </h3>
            )}

            <p className="mt-1 text-xs text-brand-gray">
              {sortedData.length.toLocaleString()}{" "}
              records
              {search && " matching your search"}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-[280px]">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray-light" />

          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search records..."
            className="h-10 w-full rounded-xl border border-brand-border bg-brand-surface pl-10 pr-10 text-xs font-medium text-brand-ink outline-none transition focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/10"
          />

          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-brand-gray-light transition hover:bg-brand-border hover:text-brand-ink"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="max-h-[62vh] overflow-auto">
        <table className="w-full min-w-max text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-brand-border bg-[#fbfaf8] text-left">
              {columns.map(
                (column) => (
                  <th
                    key={String(
                      column.key,
                    )}
                    onClick={() =>
                      handleSort(
                        column.key,
                      )
                    }
                    className="cursor-pointer select-none whitespace-nowrap px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-gray transition hover:bg-brand-primary-soft hover:text-brand-ink"
                  >
                    <div className="flex items-center gap-1.5">
                      {column.label}

                      <SortIcon
                        columnKey={
                          column.key
                        }
                      />
                    </div>
                  </th>
                ),
              )}
            </tr>
          </thead>

          <tbody>
            {paginatedData.length ===
            0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length
                  }
                  className="px-6 py-16 text-center"
                >
                  <div className="mx-auto max-w-xs">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-surface text-brand-gray-light">
                      <Search className="h-5 w-5" />
                    </div>

                    <p className="text-sm font-bold text-brand-ink">
                      No records found
                    </p>

                    <p className="mt-1 text-xs leading-5 text-brand-gray">
                      Try adjusting your
                      filters or search
                      terms.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map(
                (row, index) => (
                  <tr
                    key={String(
                      row.id ??
                        row._id ??
                        `${currentPage}-${index}`,
                    )}
                    className="group border-b border-brand-border-light transition-colors last:border-b-0 hover:bg-orange-50/30"
                  >
                    {columns.map(
                      (column) => (
                        <td
                          key={String(
                            column.key,
                          )}
                          className="whitespace-nowrap px-5 py-3.5 text-brand-gray"
                        >
                          {column.render
                            ? column.render(
                                row,
                              )
                            : String(
                                row[
                                  column.key
                                ] ??
                                  "—",
                              )}
                        </td>
                      ),
                    )}
                  </tr>
                ),
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {sortedData.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-brand-border-light bg-[#fdfcfb] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-brand-gray">
            Showing{" "}
            <span className="font-bold text-brand-ink">
              {startRow}
            </span>{" "}
            –{" "}
            <span className="font-bold text-brand-ink">
              {endRow}
            </span>{" "}
            of{" "}
            <span className="font-bold text-brand-ink">
              {sortedData.length}
            </span>
          </p>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={
                  currentPage === 1
                }
                onClick={() =>
                  setPage((value) =>
                    Math.max(
                      1,
                      value - 1,
                    ),
                  )
                }
                className="rounded-xl border border-brand-border bg-white px-3 py-2 text-xs font-semibold text-brand-gray transition hover:bg-brand-primary-soft hover:text-brand-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              {pageNumbers.map(
                (pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() =>
                      setPage(
                        pageNumber,
                      )
                    }
                    className={[
                      "flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-bold transition",
                      pageNumber ===
                      currentPage
                        ? "bg-brand-ink text-white shadow-sm"
                        : "border border-brand-border bg-white text-brand-gray hover:bg-brand-primary-soft hover:text-brand-primary-dark",
                    ].join(" ")}
                  >
                    {pageNumber}
                  </button>
                ),
              )}

              <button
                type="button"
                disabled={
                  currentPage ===
                  totalPages
                }
                onClick={() =>
                  setPage((value) =>
                    Math.min(
                      totalPages,
                      value + 1,
                    ),
                  )
                }
                className="rounded-xl border border-brand-border bg-white px-3 py-2 text-xs font-semibold text-brand-gray transition hover:bg-brand-primary-soft hover:text-brand-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
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