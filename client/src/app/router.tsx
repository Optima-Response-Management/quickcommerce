import { createBrowserRouter } from "react-router";
import LoginPage from "../features/auth/pages/LoginPage";
import ProtectedRoute from "../routes/ProtectedRoute";
import RoleRoute from "../routes/RoleRoute";
import ProtectedLayout from "../components/layout/ProtectedLayout";
import CustomerDashboardPage from "../features/campaigns/pages/CustomerDashboardPage";
import AdminDashboardPage from "../features/campaigns/pages/AdminDashboardPage";
import UploadPage from "../features/campaigns/pages/UploadPage";
// import DataGridPage from "../features/campaigns/pages/DataGridPage";
import DataGridPage from "../features/campaigns/components/CampaignDataGrid";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  // { path: "/unauthorized", element: <div className="p-10">Not authorized</div> },

  {
    element: <ProtectedRoute />, // must be logged in
    children: [
      {
        element: <ProtectedLayout />, // sidebar + topbar shell
        children: [
          // Customer-only
          {
            element: <RoleRoute allowedRoles={["customer"]} />,
            children: [{ path: "/dashboard", element: <CustomerDashboardPage /> }],
          },
          // Super admin-only
          {
            element: <RoleRoute allowedRoles={["super_admin"]} />,
            children: [
              { path: "/admin/dashboard", element: <AdminDashboardPage /> },
              { path: "/admin/upload", element: <UploadPage /> },
              { path: "/admin/grid", element: <DataGridPage /> },
            ],
          },
        ],
      },
    ],
  },

  { path: "/", element: <LoginPage /> },
]);