
import { useEffect, type ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { RootState } from "../../../app/store";
import { useMeQuery } from "../authApi";
import {
  logout,
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
    (state: RootState) => state.auth.checking,
  );

  const { data, isError } = useMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  // Restore the user when the server confirms the session.
  useEffect(() => {
    if (data?.user) {
      dispatch(setCredentials({ user: data.user }));
    }
  }, [data, dispatch]);

  // No valid session: keep the app logged out.
  useEffect(() => {
    if (isError) {
      dispatch(logout());
    }
  }, [isError, dispatch]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-brand-gray">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
