import {
  createBrowserRouter,
  Navigate,
} from "react-router";

import LoginPage from "../features/auth/pages/LoginPage";

import ProtectedRoute from "../routes/ProtectedRoute";
import RoleRoute from "../routes/RoleRoute";

import ProtectedLayout from "../components/layout/ProtectedLayout";

import DashboardPage from "../features/campaigns/pages/DashboardPage";
import UploadPage from "../features/campaigns/pages/UploadPage";
import DataGridPage from "../features/campaigns/pages/DataGridPage";
import UsersPage from "../features/users/pages/UsersPage";

export const router = createBrowserRouter([
  // =========================
  // Public Routes
  // =========================

  {
    path: "/login",
    element: <LoginPage />,
  },

  {
    path: "/unauthorized",
    element: (
      <div className="p-10 text-brand-ink">
        You don't have access to this page.
      </div>
    ),
  },

  // =========================
  // Protected Routes
  // =========================

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <ProtectedLayout />,
        children: [
          // Dashboard
          {
            element: <RoleRoute feature="dashboard" />,
            children: [
              {
                path: "/dashboard",
                element: <DashboardPage />,
              },
            ],
          },

          // Upload
          {
            element: <RoleRoute feature="upload_data" />,
            children: [
              {
                path: "/admin/upload",
                element: <UploadPage />,
              },
            ],
          },

          // Data Grid
          {
            element: <RoleRoute feature="data_grid" />,
            children: [
              {
                path: "/admin/grid",
                element: <DataGridPage />,
              },
            ],
          },

          // Users
          {
            element: <RoleRoute feature="manage_users" />,
            children: [
              {
                path: "/admin/users",
                element: <UsersPage />,
              },
            ],
          },
        ],
      },
    ],
  },

  // =========================
  // Root
  // =========================

  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },

  // =========================
  // Catch-all
  // =========================

  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);