import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
import { canAccess, type Feature } from "../features/users/access";

export default function RoleRoute({ feature }: { feature: Feature }) {
  const user = useSelector((state: RootState) => state.auth.user);

  if (!canAccess(user, feature)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}