import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";

import type { RootState } from "../app/store";
import { canAccess, type Feature } from "../features/users/access";

interface RoleRouteProps {
  feature: Feature;
}

export default function RoleRoute({ feature }: RoleRouteProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const checking = useSelector((state: RootState) => state.auth.checking);

  // Wait for /auth/me to finish before deciding anything
  if (checking) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!canAccess(user, feature)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}