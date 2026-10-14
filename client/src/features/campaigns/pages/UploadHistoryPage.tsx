import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  AlertTriangle,
  Download,
  Eye,
  FileSpreadsheet,
  Loader2,
  Trash2,
  X,
} from "lucide-react";

import {
  useNavigate,
} from "react-router";

import {
  useDeleteUploadMutation,
  useLazyListUploadsQuery,
  type UploadHistoryItem,
} from "../uploadHistoryApi";

/*
 * ============================================================
 * CONSTANTS
 * ============================================================
 */

const PAGE_SIZE = 20;

function formatUploadedAt(value: string | null): string {
  if (!value) {
    return "Timestamp unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Timestamp unavailable";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);
}

const apiBaseUrl = String(
  import.meta.env
    .VITE_API_BASE_URL ?? "",
).replace(/\/$/, "");

/*
 * ============================================================
 * FETCH FILE
 * ============================================================
 */

async function fetchFile(
  id: string,
): Promise<Blob> {
  const response =
    await fetch(
      `${apiBaseUrl}/uploads/${id}/file`,
      {
        credentials:
          "include",
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

    throw new Error(
      message,
    );
  }

  return response.blob();
}

/*
 * ============================================================
 * DOWNLOAD
 * ============================================================
 */

function downloadBlob(
  blob: Blob,
  fileName: string,
) {
  const url =
    URL.createObjectURL(
      blob,
    );

  const anchor =
    document.createElement(
      "a",
    );

  anchor.href = url;

  anchor.download =
    fileName;

  document.body.appendChild(
    anchor,
  );

  anchor.click();

  anchor.remove();

  setTimeout(() => {
    URL.revokeObjectURL(
      url,
    );
  }, 100);
}

/*
 * ============================================================
 * SKELETON
 * ============================================================
 */

function Skeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={[
        "animate-pulse",
        "rounded-md",
        "bg-slate-200",
        className,
      ].join(" ")}
    />
  );
}

/*
 * ============================================================
 * INITIAL SKELETON
 * ============================================================
 */

function FileHistorySkeleton() {
  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        border
        border-brand-border
        bg-white
        shadow-brand-sm
      "
    >
      {/* Header */}

      <div
        className="
          border-b
          border-brand-border
          bg-brand-surface
          px-5
          py-4
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
          "
        >
          <Skeleton
            className="
              h-4
              w-28
            "
          />

          <Skeleton
            className="
              h-4
              w-20
            "
          />
        </div>
      </div>

      {/* Rows */}

      <div
        className="
          divide-y
          divide-brand-border
        "
      >
        {Array.from({
          length: 8,
        }).map(
          (_, index) => (
            <div
              key={index}
              className="
                flex
                items-center
                gap-5
                px-5
                py-4
              "
            >
              <div
                className="
                  flex
                  min-w-[280px]
                  flex-1
                  items-center
                  gap-3
                "
              >
                <Skeleton
                  className="
                    h-10
                    w-10
                    rounded-xl
                  "
                />

                <div
                  className="
                    space-y-2
                  "
                >
                  <Skeleton
                    className="
                      h-3.5
                      w-44
                    "
                  />

                  <Skeleton
                    className="
                      h-3
                      w-20
                    "
                  />
                </div>
              </div>

              <Skeleton
                className="
                  hidden
                  h-3.5
                  w-20
                  md:block
                "
              />

              <Skeleton
                className="
                  hidden
                  h-3.5
                  w-24
                  lg:block
                "
              />

              <Skeleton
                className="
                  hidden
                  h-3.5
                  w-12
                  xl:block
                "
              />

              <div
                className="
                  flex
                  gap-2
                "
              >
                <Skeleton
                  className="
                    h-8
                    w-16
                    rounded-xl
                  "
                />

                <Skeleton
                  className="
                    h-8
                    w-24
                    rounded-xl
                  "
                />

                <Skeleton
                  className="
                    h-8
                    w-9
                    rounded-xl
                  "
                />
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

/*
 * ============================================================
 * LOADING MORE SKELETON
 * ============================================================
 */

function LoadingMoreSkeleton() {
  return (
    <div
      className="
        mt-2
        divide-y
        divide-brand-border
        overflow-hidden
        rounded-xl
        border
        border-brand-border
        bg-white
      "
    >
      {Array.from({
        length: 3,
      }).map(
        (_, index) => (
          <div
            key={index}
            className="
              flex
              items-center
              gap-5
              px-5
              py-4
            "
          >
            <div
              className="
                flex
                flex-1
                items-center
                gap-3
              "
            >
              <Skeleton
                className="
                  h-9
                  w-9
                  rounded-xl
                "
              />

              <div
                className="
                  space-y-2
                "
              >
                <Skeleton
                  className="
                    h-3
                    w-48
                  "
                />

                <Skeleton
                  className="
                    h-2.5
                    w-24
                  "
                />
              </div>
            </div>

            <Skeleton
              className="
                hidden
                h-3
                w-20
                md:block
              "
            />

            <Skeleton
              className="
                hidden
                h-3
                w-24
                lg:block
              "
            />

            <Skeleton
              className="
                hidden
                h-3
                w-10
                xl:block
              "
            />

            <Skeleton
              className="
                h-8
                w-24
                rounded-xl
              "
            />
          </div>
        ),
      )}
    </div>
  );
}

/*
 * ============================================================
 * PAGE
 * ============================================================
 */

export default function UploadHistoryPage() {
  const navigate =
    useNavigate();

  /*
   * ----------------------------------------------------------
   * API
   * ----------------------------------------------------------
   */

  const [
    triggerListUploads,
    {
      isFetching,
    },
  ] =
    useLazyListUploadsQuery();

  const [
    deleteUpload,
    {
      isLoading:
        isDeleting,
    },
  ] =
    useDeleteUploadMutation();

  /*
   * ----------------------------------------------------------
   * STATE
   * ----------------------------------------------------------
   */

  const [
    uploads,
    setUploads,
  ] = useState<
    UploadHistoryItem[]
  >([]);

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    totalPages,
    setTotalPages,
  ] = useState(1);

  const [
    total,
    setTotal,
  ] = useState(0);

  const [
    initialLoading,
    setInitialLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    loadingFileId,
    setLoadingFileId,
  ] = useState<
    string | null
  >(null);

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState<{
    id: string;
    fileName: string;
  } | null>(null);

  /*
   * ----------------------------------------------------------
   * REFS
   * ----------------------------------------------------------
   */

  const loadMoreRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const loadingRef =
    useRef(false);

  const pageRef =
    useRef(1);

  const totalPagesRef =
    useRef(1);

  /*
   * ----------------------------------------------------------
   * LOAD PAGE
   * ----------------------------------------------------------
   */

  
const loadPage = useCallback(
  async (
    nextPage: number,
    replace = false,
  ) => {
    if (loadingRef.current) {
      return;
    }

    if (
      !replace &&
      nextPage > totalPagesRef.current
    ) {
      return;
    }

    loadingRef.current = true;

    try {
      const result = await triggerListUploads(
        {
          page: nextPage,
          limit: PAGE_SIZE,
        },
        true,
      ).unwrap();

      setError("");

      setUploads((previous) => {
        if (replace) {
          return result.uploads;
        }

        const existingIds = new Set(
          previous.map((item) => item.id),
        );

        const newItems = result.uploads.filter(
          (item) => !existingIds.has(item.id),
        );

        return [...previous, ...newItems];
      });

      pageRef.current = nextPage;

      totalPagesRef.current =
        result.pagination.totalPages;

      setPage(nextPage);
      setTotalPages(result.pagination.totalPages);
      setTotal(result.pagination.total);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load upload history.",
      );
    } finally {
      loadingRef.current = false;
      setInitialLoading(false);
    }
  },
  [triggerListUploads],
);


  /*
   * ----------------------------------------------------------
   * INITIAL LOAD
   * ----------------------------------------------------------
   */

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadPage(1, true);
    }, 0);
  
    return () => {
      clearTimeout(timer);
    };
  }, [loadPage]);

  /*
   * ----------------------------------------------------------
   * INFINITE SCROLL
   * ----------------------------------------------------------
   */

  useEffect(() => {
    const element =
      loadMoreRef.current;

    if (!element) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          const entry =
            entries[0];

          if (
            !entry?.isIntersecting
          ) {
            return;
          }

          if (
            loadingRef.current
          ) {
            return;
          }

          const nextPage =
            pageRef.current +
            1;

          if (
            nextPage >
            totalPagesRef.current
          ) {
            return;
          }

          void loadPage(
            nextPage,
            false,
          );
        },
        {
          rootMargin:
            "400px 0px",
        },
      );

    observer.observe(
      element,
    );

    return () => {
      observer.disconnect();
    };
  }, [loadPage]);

  /*
   * ----------------------------------------------------------
   * OPEN
   * ----------------------------------------------------------
   */

  const openFile = (
    id: string,
  ) => {
    navigate(
      `/admin/file-history/${id}`,
    );
  };

  /*
   * ----------------------------------------------------------
   * DOWNLOAD
   * ----------------------------------------------------------
   */

  const downloadFile =
    async (
      id: string,
      fileName: string,
    ) => {
      setLoadingFileId(
        id,
      );

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
            : "Unable to download file.",
        );
      } finally {
        setLoadingFileId(
          null,
        );
      }
    };

  /*
   * ----------------------------------------------------------
   * DELETE
   * ----------------------------------------------------------
   */

  const handleDelete =
    async () => {
      if (!deleteTarget) {
        return;
      }

      try {
        setError("");

        await deleteUpload(
          deleteTarget.id,
        ).unwrap();

        /*
         * Close dialog immediately.
         */

        setDeleteTarget(
          null,
        );

        /*
         * Rebuild the list from
         * page 1 so pagination
         * remains correct.
         */

        setUploads([]);

        setPage(1);

        setTotalPages(1);

        pageRef.current =
          1;

        totalPagesRef.current =
          1;

        setInitialLoading(
          true,
        );

        await loadPage(
          1,
          true,
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to delete upload.",
        );
      }
    };

  /*
   * ----------------------------------------------------------
   * RENDER
   * ----------------------------------------------------------
   */

  return (
    <div
      className="
        mx-auto
        w-full
        max-w-[1500px]
        space-y-6
      "
    >
      {/* =====================================================
          HEADER
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

        <div
          className="
            relative
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div>
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
                className="
                  h-3.5
                  w-3.5
                "
              />

              Data management
            </div>

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
              View, download and
              manage uploaded
              campaign files.
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

            {total.toLocaleString()}{" "}
            files
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
          <span>
            {error}
          </span>

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
          INITIAL SKELETON
      ====================================================== */}

      {initialLoading ? (
        <FileHistorySkeleton />
      ) : (
        <>
          {/* =================================================
              EMPTY
          ================================================== */}

          {uploads.length ===
            0 && (
            <div
              className="
                rounded-2xl
                border
                border-brand-border
                bg-white
                px-6
                py-16
                text-center
                shadow-brand-sm
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
                  bg-orange-50
                  text-orange-500
                "
              >
                <FileSpreadsheet
                  className="
                    h-6
                    w-6
                  "
                />
              </div>

              <h2
                className="
                  mt-4
                  text-base
                  font-bold
                  text-brand-ink
                "
              >
                No uploaded files
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-brand-gray
                "
              >
                Uploaded campaign
                files will appear
                here.
              </p>
            </div>
          )}

          {/* =================================================
              TABLE
          ================================================== */}

          {uploads.length >
            0 && (
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
                        Uploaded at
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
                    {uploads.map(
                      (
                        upload,
                      ) => {
                        const busy =
                          loadingFileId ===
                          upload.id;

                        return (
                          <tr
                            key={
                              upload.id
                            }
                            className="
                              transition-colors
                              hover:bg-brand-surface/60
                            "
                          >
                            {/* FILE */}

                            <td className="max-w-[420px] px-5 py-4">
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
                                    title={
                                      upload.fileName
                                    }
                                  >
                                    {
                                      upload.fileName
                                    }
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

                            {/* PLATFORM */}

                            <td className="px-5 py-4 text-brand-gray">
                              {
                                upload.platformName
                              }
                            </td>

                            {/* DATE */}

                            <td className="px-5 py-4 text-brand-gray">
                              {
                                upload.reportDate
                              }
                            </td>

                            {/* UPLOAD TIMESTAMP */}

                            <td className="whitespace-nowrap px-5 py-4 text-brand-gray">
                              <time
                                dateTime={upload.uploadedAt ?? undefined}
                                title={
                                  upload.uploadedAt
                                    ? new Date(upload.uploadedAt).toLocaleString()
                                    : undefined
                                }
                              >
                                {formatUploadedAt(upload.uploadedAt)}
                              </time>
                            </td>

                            {/* ROWS */}

                            <td className="px-5 py-4 text-brand-gray">
                              {upload.rowCount.toLocaleString()}
                            </td>

                            {/* USER */}

                            <td className="px-5 py-4 text-brand-gray">
                              {
                                upload
                                  .uploadedBy
                                  ?.name ??
                                "Unknown"
                              }
                            </td>

                            {/* ACTIONS */}

                            <td className="px-5 py-4">
                              <div
                                className="
                                  flex
                                  justify-end
                                  gap-2
                                "
                              >
                                {/* VIEW */}

                                <button
                                  type="button"
                                  disabled={
                                    busy ||
                                    isDeleting
                                  }
                                  onClick={() =>
                                    openFile(
                                      upload.id,
                                    )
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
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                  "
                                >
                                  <Eye
                                    size={14}
                                  />

                                  View
                                </button>

                                {/* DOWNLOAD */}

                                <button
                                  type="button"
                                  disabled={
                                    busy ||
                                    isDeleting
                                  }
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

                                {/* DELETE */}

                                <button
                                  type="button"
                                  disabled={
                                    busy ||
                                    isDeleting
                                  }
                                  onClick={() =>
                                    setDeleteTarget(
                                      {
                                        id: upload.id,
                                        fileName:
                                          upload.fileName,
                                      },
                                    )
                                  }
                                  className="
                                    inline-flex
                                    h-8
                                    w-8
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border
                                    border-red-200
                                    bg-red-50
                                    text-red-600
                                    transition
                                    hover:border-red-300
                                    hover:bg-red-100
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                  "
                                  title="Delete upload"
                                  aria-label={`Delete ${upload.fileName}`}
                                >
                                  <Trash2
                                    className="
                                      h-4
                                      w-4
                                    "
                                  />
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

              {/* =================================================
                  LOAD MORE
              ================================================== */}

              <div
                ref={
                  loadMoreRef
                }
                className="
                  min-h-[20px]
                "
              />

              {isFetching &&
                !initialLoading && (
                  <LoadingMoreSkeleton />
                )}

              {/* =================================================
                  PAGINATION STATUS
              ================================================== */}

              <div
                className="
                  flex
                  min-h-[52px]
                  items-center
                  justify-between
                  border-t
                  border-brand-border
                  bg-white
                  px-5
                  text-xs
                  text-brand-gray
                "
              >
                <span>
                  Showing{" "}
                  <strong className="text-brand-ink">
                    {uploads.length}
                  </strong>{" "}
                  of{" "}
                  <strong className="text-brand-ink">
                    {total}
                  </strong>{" "}
                  files
                </span>

                {page <
                totalPages ? (
                  <span className="flex items-center gap-2">
                    <Loader2
                      className="
                        h-3.5
                        w-3.5
                        animate-spin
                      "
                    />

                    Loading more...
                  </span>
                ) : (
                  <span>
                    All files loaded
                  </span>
                )}
              </div>
            </section>
          )}
        </>
      )}

      {/* =====================================================
          DELETE CONFIRMATION
      ====================================================== */}

      {deleteTarget && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/50
            p-4
            backdrop-blur-[2px]
          "
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
                event.currentTarget &&
              !isDeleting
            ) {
              setDeleteTarget(
                null,
              );
            }
          }}
        >
          <div
            className="
              w-full
              max-w-[460px]
              overflow-hidden
              rounded-2xl
              border
              border-brand-border
              bg-white
              shadow-[0_30px_90px_rgba(0,0,0,0.3)]
            "
            onMouseDown={(
              event,
            ) =>
              event.stopPropagation()
            }
          >
            {/* =================================================
                DIALOG CONTENT
            ================================================== */}

            <div className="p-6">
              <div
                className="
                  flex
                  items-start
                  gap-4
                "
              >
                <div
                  className="
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-red-50
                    text-red-600
                  "
                >
                  <AlertTriangle
                    className="
                      h-6
                      w-6
                    "
                  />
                </div>

                <div className="min-w-0">
                  <h2
                    className="
                      text-lg
                      font-bold
                      text-brand-ink
                    "
                  >
                    Delete upload?
                  </h2>

                  <p
                    className="
                      mt-1.5
                      text-sm
                      leading-6
                      text-brand-gray
                    "
                  >
                    This action cannot be
                    undone. The uploaded file
                    and all campaign records
                    associated with it will be
                    permanently deleted.
                  </p>
                </div>
              </div>

              {/* FILE */}

              <div
                className="
                  mt-5
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  border
                  border-brand-border
                  bg-brand-surface
                  p-3
                "
              >
                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
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
                      text-sm
                      font-semibold
                      text-brand-ink
                    "
                    title={
                      deleteTarget.fileName
                    }
                  >
                    {
                      deleteTarget.fileName
                    }
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-xs
                      text-brand-gray
                    "
                  >
                    This file will be
                    permanently removed.
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                ACTIONS
            ================================================== */}

            <div
              className="
                flex
                justify-end
                gap-2
                border-t
                border-brand-border
                bg-brand-surface/50
                p-4
              "
            >
              <button
                type="button"
                disabled={
                  isDeleting
                }
                onClick={() =>
                  setDeleteTarget(
                    null,
                  )
                }
                className="
                  rounded-xl
                  border
                  border-brand-border
                  bg-white
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-brand-ink
                  transition
                  hover:bg-brand-surface
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  isDeleting
                }
                onClick={
                  handleDelete
                }
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-red-600
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-red-700
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {isDeleting ? (
                  <>
                    <Loader2
                      className="
                        h-4
                        w-4
                        animate-spin
                      "
                    />

                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2
                      className="
                        h-4
                        w-4
                      "
                    />

                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}