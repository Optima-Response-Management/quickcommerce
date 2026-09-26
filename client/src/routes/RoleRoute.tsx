import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";

interface RoleRouteProps {
  allowedRoles: ("super_admin" | "customer")[];
}

export default function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const user = useSelector((state: RootState) => state.auth.user);

  if (!user || !allowedRoles.includes(user.role)) {
    // return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}