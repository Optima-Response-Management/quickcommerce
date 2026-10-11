import { createHashRouter, Link, Navigate } from "react-router";

import LoginPage from "../features/auth/pages/LoginPage";

import ProtectedRoute from "../routes/ProtectedRoute";
import RoleRoute from "../routes/RoleRoute";

import ProtectedLayout from "../components/layout/ProtectedLayout";
import LazyPage from "../components/layout/LazyPage";

import {
  DashboardSkeleton,
  DataGridSkeleton,
  ExcelViewerSkeleton,
  FileHistorySkeleton,
  UploadSkeleton,
  UsersSkeleton,
} from "../components/ui/Skeleton";

import {
  DashboardPage,
  UploadPage,
  UploadHistoryPage,
  ExcelViewerPage,
  DataGridPage,
  UsersPage,
} from "./lazyPages";

export const router = createHashRouter([
  /* ------------------------------------------------------------------------ */
  /* Login                                                                    */
  /* ------------------------------------------------------------------------ */

  {
    path: "/login",
    element: <LoginPage />,
  },

  /* ------------------------------------------------------------------------ */
  /* Unauthorized                                                             */
  /* ------------------------------------------------------------------------ */

  {
    path: "/unauthorized",
    element: (
      <div className="flex min-h-screen items-center justify-center bg-brand-surface p-10">
        <div className="w-full max-w-md rounded-2xl border border-brand-border bg-white p-8 text-center shadow-brand-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100">
            <span className="text-xl font-bold text-orange-600">
              !
            </span>
          </div>

          <h1 className="mt-5 text-lg font-bold text-brand-ink">
            Access denied
          </h1>

          <p className="mt-2 text-sm leading-6 text-brand-gray">
            You don't have access to this page.
          </p>

          <Link
            to="/dashboard"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-orange-500 px-5 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    ),
  },

  /* ------------------------------------------------------------------------ */
  /* Protected Application                                                    */
  /* ------------------------------------------------------------------------ */

  {
    element: <ProtectedRoute />,

    children: [
      {
        element: <ProtectedLayout />,

        children: [
          /* ------------------------------------------------------------------ */
          /* Dashboard                                                          */
          /* ------------------------------------------------------------------ */

          {
            element: <RoleRoute feature="dashboard" />,

            children: [
              {
                path: "/dashboard",

                element: (
                  <LazyPage fallback={<DashboardSkeleton />}>
                    <DashboardPage />
                  </LazyPage>
                ),
              },
            ],
          },

          /* ------------------------------------------------------------------ */
          /* Upload Data                                                        */
          /* ------------------------------------------------------------------ */

          {
            element: <RoleRoute feature="upload_data" />,

            children: [
              {
                path: "/admin/upload",

                element: (
                  <LazyPage fallback={<UploadSkeleton />}>
                    <UploadPage />
                  </LazyPage>
                ),
              },
            ],
          },

          /* ------------------------------------------------------------------ */
          /* File History                                                       */
          /* ------------------------------------------------------------------ */

          {
            element: <RoleRoute feature="upload_data" />,

            children: [
              {
                path: "/admin/file-history",

                element: (
                  <LazyPage fallback={<FileHistorySkeleton />}>
                    <UploadHistoryPage />
                  </LazyPage>
                ),
              },

              {
                path: "/admin/file-history/:id",

                element: (
                  <LazyPage fallback={<ExcelViewerSkeleton />}>
                    <ExcelViewerPage />
                  </LazyPage>
                ),
              },
            ],
          },

          /* ------------------------------------------------------------------ */
          /* Data Grid                                                          */
          /* ------------------------------------------------------------------ */

          {
            element: <RoleRoute feature="data_grid" />,

            children: [
              {
                path: "/admin/grid",

                element: (
                  <LazyPage fallback={<DataGridSkeleton />}>
                    <DataGridPage />
                  </LazyPage>
                ),
              },
            ],
          },

          /* ------------------------------------------------------------------ */
          /* Users                                                              */
          /* ------------------------------------------------------------------ */

          {
            element: <RoleRoute feature="manage_users" />,

            children: [
              {
                path: "/admin/users",

                element: (
                  <LazyPage fallback={<UsersSkeleton />}>
                    <UsersPage />
                  </LazyPage>
                ),
              },
            ],
          },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------------ */
  /* Root                                                                     */
  /* ------------------------------------------------------------------------ */

  {
    path: "/",

    element: <Navigate to="/login" replace />,
  },

  /* ------------------------------------------------------------------------ */
  /* Unknown Routes                                                           */
  /* ------------------------------------------------------------------------ */

  {
    path: "*",

    element: <Navigate to="/login" replace />,
  },
]);