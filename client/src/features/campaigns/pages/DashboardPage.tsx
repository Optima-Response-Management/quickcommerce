import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import AdminDashboardPage from "./AdminDashboardPage";
import CustomerDashboardPage from "./CustomerDashboardPage";

export default function DashboardPage() {
  const role = useSelector((state: RootState) => state.auth.user?.role);
  return role === "user" ? <CustomerDashboardPage /> : <AdminDashboardPage />;
}