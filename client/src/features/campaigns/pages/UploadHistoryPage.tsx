
import {
  useMemo,
  useState,
} from "react";

import {
  Download,
  Eye,
  FileSpreadsheet,
  Loader2,
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
    let message = "Unable to load file";

    try {
      const contentType =
        response.headers.get("content-type") ?? "";

      if (
        contentType.includes("application/json")
      ) {
        const body = await response.json();

        message =
          body?.message ||
          body?.error ||
          message;
      } else {
        const text = await response.text();

        if (text.trim()) {
          message = text;
        }
      }
    } catch {
      // Keep default error message.
    }

    throw new Error(message);
  }

  return response.blob();
}

async function readWorkbook(
  blob: Blob,
): Promise<SheetData[]> {
  const buffer = await blob.arrayBuffer();

  const workbook = XLSX.read(
    buffer,
    {
      type: "array",
    },
  );

  return workbook.SheetNames.map(
    (name) => {
      const worksheet =
        workbook.Sheets[name];

      const rows =
        XLSX.utils.sheet_to_json<unknown[]>(
          worksheet,
          {
            header: 1,
            defval: "",
            raw: false,
          },
        );

      return {
        name,
        rows: rows.map(
          (row) =>
            row.map(
              (cell) =>
                String(cell ?? ""),
            ),
        ),
      };
    },
  );
}

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

  URL.revokeObjectURL(url);
}

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
  ] = useState<string | null>(null);

  const [
    error,
    setError,
  ] = useState("");

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

  const openFile = async (
    id: string,
    fileName: string,
  ) => {
    setLoadingFileId(id);
    setError("");

    try {
      const blob =
        await fetchFile(id);

      const sheets =
        await readWorkbook(blob);

      if (!sheets.length) {
        throw new Error(
          "The uploaded file does not contain any worksheets.",
        );
      }

      setViewer({
        fileName,
        sheets,
      });

      setActiveSheet(
        sheets[0]?.name ?? "",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to open file",
      );
    } finally {
      setLoadingFileId(null);
    }
  };

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

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-primary">
          <FileSpreadsheet size={14} />

          Data management
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-brand-ink">
          File History
        </h1>

        <p className="mt-1 text-sm leading-6 text-brand-gray">
          View and download the original
          campaign files uploaded to
          Campaign Hub.
        </p>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="shrink-0 rounded-lg p-1 transition hover:bg-red-100"
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-brand-border bg-brand-surface">
              <tr>
                <th className="px-4 py-3 font-semibold text-brand-ink">
                  File
                </th>

                <th className="px-4 py-3 font-semibold text-brand-ink">
                  Platform
                </th>

                <th className="px-4 py-3 font-semibold text-brand-ink">
                  Report date
                </th>

                <th className="px-4 py-3 font-semibold text-brand-ink">
                  Rows
                </th>

                <th className="px-4 py-3 font-semibold text-brand-ink">
                  Uploaded by
                </th>

                <th className="px-4 py-3 text-right font-semibold text-brand-ink">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-brand-border">
              {isLoading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-brand-gray"
                  >
                    Loading upload
                    history...
                  </td>
                </tr>
              )}

              {!isLoading &&
                isError && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-red-600"
                    >
                      Failed to load upload
                      history.

                      <button
                        type="button"
                        onClick={() =>
                          refetch()
                        }
                        className="ml-2 font-semibold underline"
                      >
                        Retry
                      </button>
                    </td>
                  </tr>
                )}

              {!isLoading &&
                !isError &&
                !data?.uploads
                  ?.length && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-brand-gray"
                    >
                      No uploaded files
                      found.
                    </td>
                  </tr>
                )}

              {data?.uploads.map(
                (upload) => {
                  const busy =
                    loadingFileId ===
                    upload.id;

                  return (
                    <tr
                      key={upload.id}
                      className="hover:bg-brand-surface/60"
                    >
                      <td className="max-w-[360px] px-4 py-3">
                        <p className="truncate font-medium text-brand-ink">
                          {upload.fileName}
                        </p>

                        <p className="mt-0.5 text-xs text-brand-gray">
                          {upload.market ??
                            "All markets"}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-brand-gray">
                        {upload.platformName}
                      </td>

                      <td className="px-4 py-3 text-brand-gray">
                        {upload.reportDate}
                      </td>

                      <td className="px-4 py-3 text-brand-gray">
                        {upload.rowCount.toLocaleString()}
                      </td>

                      <td className="px-4 py-3 text-brand-gray">
                        {upload.uploadedBy
                          ?.name ??
                          "Unknown"}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              openFile(
                                upload.id,
                                upload.fileName,
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border px-3 py-2 text-xs font-semibold text-brand-ink transition hover:bg-brand-surface disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {busy ? (
                              <Loader2
                                size={14}
                                className="animate-spin"
                              />
                            ) : (
                              <Eye size={14} />
                            )}

                            View
                          </button>

                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              downloadFile(
                                upload.id,
                                upload.fileName,
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-ink px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
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
      </div>

      {viewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="flex h-[90vh] w-full max-w-[1400px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-brand-border px-5 py-4">
              <div className="min-w-0">
                <h2 className="truncate text-base font-bold text-brand-ink">
                  {viewer.fileName}
                </h2>

                <p className="mt-1 text-xs text-brand-gray">
                  {viewer.sheets.length}{" "}
                  sheet
                  {viewer.sheets.length !==
                  1
                    ? "s"
                    : ""}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setViewer(null)
                }
                className="rounded-lg p-2 text-brand-gray transition hover:bg-brand-surface hover:text-brand-ink"
                aria-label="Close file viewer"
              >
                <X size={20} />
              </button>
            </div>

            {viewer.sheets.length > 1 && (
              <div className="flex gap-1 overflow-x-auto border-b border-brand-border px-4 py-2">
                {viewer.sheets.map(
                  (sheet) => (
                    <button
                      key={sheet.name}
                      type="button"
                      onClick={() =>
                        setActiveSheet(
                          sheet.name,
                        )
                      }
                      className={[
                        "rounded-lg px-3 py-2 text-xs font-semibold",
                        activeSheet ===
                        sheet.name
                          ? "bg-brand-ink text-white"
                          : "text-brand-gray hover:bg-brand-surface",
                      ].join(" ")}
                    >
                      {sheet.name}
                    </button>
                  ),
                )}
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-auto">
              {currentSheet?.rows
                .length ? (
                <table className="min-w-full border-collapse text-xs">
                  <tbody>
                    {currentSheet.rows.map(
                      (
                        row,
                        rowIndex,
                      ) => (
                        <tr
                          key={rowIndex}
                          className={
                            rowIndex ===
                            0
                              ? "bg-brand-surface font-semibold"
                              : ""
                          }
                        >
                          {row.map(
                            (
                              cell,
                              cellIndex,
                            ) => (
                              <td
                                key={
                                  cellIndex
                                }
                                className="whitespace-nowrap border-b border-r border-brand-border px-3 py-2 align-top"
                              >
                                {cell}
                              </td>
                            ),
                          )}
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              ) : (
                <div className="p-10 text-center text-sm text-brand-gray">
                  This sheet is
                  empty.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
