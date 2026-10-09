import type { CSSProperties } from "react";

interface SkeletonProps {
    className?: string;
    style?: CSSProperties;

  }
  
  export function Skeleton({ className = "" }: SkeletonProps) {
    return (
      <div
        aria-hidden="true"
        className={[
          "animate-pulse",
          "rounded-md",
          "bg-slate-200",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      />
    );
  }
  
  /* -------------------------------------------------------------------------- */
  /* Page Header                                                                */
  /* -------------------------------------------------------------------------- */
  
  export function PageHeaderSkeleton() {
    return (
      <section className="overflow-hidden rounded-3xl border border-brand-border bg-white p-6 shadow-brand-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1">
            <Skeleton className="mb-4 h-7 w-40" />
  
            <Skeleton className="h-3.5 w-72 max-w-full" />
  
            <Skeleton className="mt-2 h-3 w-96 max-w-full" />
          </div>
  
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </section>
    );
  }
  
  /* -------------------------------------------------------------------------- */
  /* Table                                                                      */
  /* -------------------------------------------------------------------------- */
  
  interface TableSkeletonProps {
    columns?: number;
    rows?: number;
  }
  
  export function TableSkeleton({
    columns = 6,
    rows = 8,
  }: TableSkeletonProps) {
    return (
      <section className="overflow-hidden rounded-2xl border border-brand-border bg-white shadow-brand-sm">
        {/* Header */}
  
        <div className="flex items-center gap-6 border-b border-brand-border bg-brand-surface px-5 py-4">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-3.5 flex-1"
            />
          ))}
        </div>
  
        {/* Rows */}
  
        <div className="divide-y divide-brand-border">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="flex items-center gap-6 px-5 py-4"
            >
              {Array.from({ length: columns }).map(
                (_, columnIndex) => (
                  <Skeleton
                    key={columnIndex}
                    className={[
                      "h-3.5",
                      "flex-1",
                      columnIndex === 0
                        ? "max-w-[280px]"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  />
                ),
              )}
            </div>
          ))}
        </div>
      </section>
    );
  }
  
  /* -------------------------------------------------------------------------- */
  /* Card                                                                       */
  /* -------------------------------------------------------------------------- */
  
  export function CardSkeleton() {
    return (
      <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-brand-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Skeleton className="h-3 w-24" />
  
            <Skeleton className="mt-3 h-7 w-32" />
          </div>
  
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
  
        <Skeleton className="mt-5 h-2.5 w-20" />
      </div>
    );
  }
  
  /* -------------------------------------------------------------------------- */
  /* Chart                                                                      */
  /* -------------------------------------------------------------------------- */
  
  export function ChartSkeleton({
    className = "",
  }: {
    className?: string;
  }) {
    const barHeights = [
      40,
      70,
      52,
      82,
      60,
      90,
      48,
      72,
      56,
      78,
    ];
  
    return (
      <div
        className={[
          "rounded-2xl",
          "border",
          "border-brand-border",
          "bg-white",
          "p-5",
          "shadow-brand-sm",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <Skeleton className="h-4 w-36" />
  
        <Skeleton className="mt-2 h-3 w-56" />
  
        <div className="mt-6 flex h-[280px] items-end gap-3">
          {barHeights.map((height, index) => (
            <Skeleton
              key={index}
              className="flex-1"
              style={{
                height: `${height}%`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }
  
  /* -------------------------------------------------------------------------- */
  /* Dashboard                                                                  */
  /* -------------------------------------------------------------------------- */
  
  export function DashboardSkeleton() {
    return (
      <div className="mx-auto w-full max-w-[1500px] space-y-6">
        <PageHeaderSkeleton />
  
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
  
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ChartSkeleton />
  
          <ChartSkeleton />
        </div>
  
        <TableSkeleton
          columns={6}
          rows={6}
        />
      </div>
    );
  }
  
  /* -------------------------------------------------------------------------- */
  /* Data Grid                                                                  */
  /* -------------------------------------------------------------------------- */
  
  export function DataGridSkeleton() {
    return (
      <div className="mx-auto w-full max-w-[1500px] space-y-6">
        <PageHeaderSkeleton />
  
        <TableSkeleton
          columns={8}
          rows={12}
        />
      </div>
    );
  }
  
  /* -------------------------------------------------------------------------- */
  /* Users                                                                      */
  /* -------------------------------------------------------------------------- */
  
  export function UsersSkeleton() {
    return (
      <div className="mx-auto w-full max-w-[1500px] space-y-6">
        <PageHeaderSkeleton />
  
        <TableSkeleton
          columns={6}
          rows={8}
        />
      </div>
    );
  }
  
  /* -------------------------------------------------------------------------- */
  /* File History                                                               */
  /* -------------------------------------------------------------------------- */
  
  export function FileHistorySkeleton() {
    return (
      <div className="mx-auto w-full max-w-[1500px] space-y-6">
        <PageHeaderSkeleton />
  
        <TableSkeleton
          columns={6}
          rows={8}
        />
      </div>
    );
  }
  
  /* -------------------------------------------------------------------------- */
  /* Upload                                                                     */
  /* -------------------------------------------------------------------------- */
  
  export function UploadSkeleton() {
    return (
      <div className="mx-auto w-full max-w-[1500px] space-y-6">
        <PageHeaderSkeleton />
  
        <section className="rounded-2xl border border-brand-border bg-white p-6 shadow-brand-sm">
          <Skeleton className="h-5 w-40" />
  
          <Skeleton className="mt-3 h-3 w-72 max-w-full" />
  
          <Skeleton className="mt-6 h-48 w-full rounded-2xl" />
  
          <div className="mt-5 flex justify-end">
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </section>
      </div>
    );
  }
  
  /* -------------------------------------------------------------------------- */
  /* Excel Viewer                                                               */
  /* -------------------------------------------------------------------------- */
  
  export function ExcelViewerSkeleton() {
    return (
      <div className="flex h-full min-h-[calc(100vh-120px)] w-full flex-col gap-4">
        {/* Toolbar */}
  
        <div className="flex shrink-0 flex-col gap-4 rounded-2xl border border-brand-border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
  
            <div className="min-w-0">
              <Skeleton className="h-4 w-56 max-w-full" />
  
              <Skeleton className="mt-2 h-3 w-36" />
            </div>
          </div>
  
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
  
        {/* Spreadsheet */}
  
        <section className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm">
          {/* Sheet tabs */}
  
          <div className="flex items-center gap-2 border-b border-brand-border bg-brand-surface p-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-8 w-24 rounded-lg"
              />
            ))}
          </div>
  
          {/* Table */}
  
          <div className="h-full overflow-hidden p-4">
            <TableSkeleton
              columns={8}
              rows={16}
            />
          </div>
        </section>
      </div>
    );
  }
  
  /* -------------------------------------------------------------------------- */
  /* Generic Page                                                               */
  /* -------------------------------------------------------------------------- */
  
  export function PageSkeleton() {
    return (
      <div className="mx-auto w-full max-w-[1500px] space-y-6">
        <PageHeaderSkeleton />
  
        <TableSkeleton
          columns={6}
          rows={8}
        />
      </div>
    );
  }