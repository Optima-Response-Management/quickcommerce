
import { useSelector } from "react-redux";
import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router";

import type { RootState } from "../app/store";

export default function ProtectedRoute() {
  const location = useLocation();

  const user = useSelector(
    (state: RootState) => state.auth.user,
  );

  const checking = useSelector(
    (state: RootState) => state.auth.checking,
  );

  // Wait until AuthBootstrap finishes checking the session.
  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div
          className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-primary"
          role="status"
          aria-label="Checking authentication"
        />
      </div>
    );
  }

  // Never render protected pages without an authenticated user.
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}
