import { lazy } from "react";

export const DashboardPage = lazy(
  () => import("../features/campaigns/pages/DashboardPage"),
);

export const UploadPage = lazy(
  () => import("../features/campaigns/pages/UploadPage"),
);

export const UploadHistoryPage = lazy(
  () => import("../features/campaigns/pages/UploadHistoryPage"),
);

export const ExcelViewerPage = lazy(
  () => import("../features/campaigns/pages/ExcelViewerPage"),
);

export const DataGridPage = lazy(
  () => import("../features/campaigns/pages/DataGridPage"),
);

export const UsersPage = lazy(
  () => import("../features/users/pages/UsersPage"),
);