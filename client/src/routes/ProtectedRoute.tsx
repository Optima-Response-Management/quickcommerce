import { Navigate, Outlet, useLocation } from "react-router";
import { useSelector, useDispatch } from "react-redux";

import type { RootState } from "../app/store";
import { useMeQuery } from "../features/auth/authApi";
import { setCredentials, logout } from "../features/auth/authSlice";
import { useEffect } from "react";

export default function ProtectedRoute() {
  const location = useLocation();
  const dispatch = useDispatch();

  const user = useSelector(
    (state: RootState) => state.auth.user
  );

  // Call /auth/me on mount to restore session from cookie.
  // Skip if we already have user data in Redux (e.g. just logged in).
  const { data, isLoading, isError } = useMeQuery(undefined, {
    skip: !!user,
  });

  // When /auth/me returns successfully, hydrate the Redux store
  useEffect(() => {
    if (data?.user) {
      dispatch(setCredentials({ user: data.user,}));
    }
  }, [data, dispatch]);

  // When /auth/me fails (401), ensure we're logged out
  useEffect(() => {
    if (isError && !user) {
      dispatch(logout());
    }
  }, [isError, user, dispatch]);

  // Show nothing while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary" />
      </div>
    );
  }

  // Not authenticated
  if (!user && !data?.user) {
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