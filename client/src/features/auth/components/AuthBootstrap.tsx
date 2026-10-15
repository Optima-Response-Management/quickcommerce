
import { useEffect, type ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { RootState } from "../../../app/store";
import { useMeQuery } from "../authApi";
import {
  logout,
  sessionChecked,
  setCredentials,
} from "../authSlice";

interface AuthBootstrapProps {
  children: ReactNode;
}

export default function AuthBootstrap({
  children,
}: AuthBootstrapProps) {
  const dispatch = useDispatch();

  const checking = useSelector(
    (state: RootState) => state.auth.checking
  );

  const { data, error, isError, isLoading } = useMeQuery(
    undefined,
    {
      refetchOnMountOrArgChange: true,
    }
  );

  useEffect(() => {
    if (data?.user) {
      dispatch(setCredentials({ user: data.user }));
    }
  }, [data, dispatch]);

  useEffect(() => {
    if (!isError) return;

    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error
        ? error.status
        : undefined;

    if (status === 401) {
      dispatch(logout());
      return;
    }

    // A server/network error is not necessarily an expired session.
    // Finish bootstrapping without forcibly clearing any existing user.
    dispatch(sessionChecked());
  }, [isError, error, dispatch]);

  useEffect(() => {
    if (!isLoading && !data && !isError) {
      dispatch(sessionChecked());
    }
  }, [isLoading, data, isError, dispatch]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-brand-gray">
        Checking your session...
      </div>
    );
  }

  return <>{children}</>;
}
