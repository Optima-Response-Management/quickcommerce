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

import UploadHistoryPage from "../features/campaigns/pages/UploadHistoryPage";

import DataGridPage from "../features/campaigns/pages/DataGridPage";

import UsersPage from "../features/users/pages/UsersPage";

export const router =
  createBrowserRouter([
    /*
     * ========================================================
     * PUBLIC
     * ========================================================
     */

    {
      path: "/login",

      element:
        <LoginPage />,
    },

    {
      path: "/unauthorized",

      element: (
        <div className="p-10 text-brand-ink">
          You don't have access
          to this page.
        </div>
      ),
    },

    /*
     * ========================================================
     * PROTECTED
     * ========================================================
     */

    {
      element:
        <ProtectedRoute />,

      children: [
        {
          element:
            <ProtectedLayout />,

          children: [
            /*
             * DASHBOARD
             */

            {
              element:
                <RoleRoute
                  feature="dashboard"
                />,

              children: [
                {
                  path: "/dashboard",

                  element:
                    <DashboardPage />,
                },
              ],
            },

            /*
             * UPLOAD
             */

            {
              element:
                <RoleRoute
                  feature="upload_data"
                />,

              children: [
                {
                  path:
                    "/admin/upload",

                  element:
                    <UploadPage />,
                },
              ],
            },

            /*
             * FILE HISTORY
             */

            {
              element:
                <RoleRoute
                  feature="upload_data"
                />,

              children: [
                {
                  path:
                    "/admin/file-history",

                  element:
                    <UploadHistoryPage />,
                },
              ],
            },

            /*
             * DATA GRID
             */

            {
              element:
                <RoleRoute
                  feature="data_grid"
                />,

              children: [
                {
                  path:
                    "/admin/grid",

                  element:
                    <DataGridPage />,
                },
              ],
            },

            /*
             * USERS
             */

            {
              element:
                <RoleRoute
                  feature="manage_users"
                />,

              children: [
                {
                  path:
                    "/admin/users",

                  element:
                    <UsersPage />,
                },
              ],
            },
          ],
        },
      ],
    },

    /*
     * ROOT
     */

    {
      path: "/",

      element: (
        <Navigate
          to="/dashboard"
          replace
        />
      ),
    },

    /*
     * CATCH ALL
     */

    {
      path: "*",

      element: (
        <Navigate
          to="/dashboard"
          replace
        />
      ),
    },
  ]);