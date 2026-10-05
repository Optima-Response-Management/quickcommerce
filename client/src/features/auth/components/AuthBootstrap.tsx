import { useEffect, type ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMeQuery } from "../authApi";
import { setCredentials, sessionChecked } from "../authSlice";
import type { RootState } from "../../../app/store";

export default function AuthBootstrap({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const checking = useSelector((s: RootState) => s.auth.checking);
  const { data, isError } = useMeQuery();

  useEffect(() => {
    if (data?.user) dispatch(setCredentials({ user: data.user }));
  }, [data, dispatch]);

  useEffect(() => {
    if (isError) dispatch(sessionChecked());
  }, [isError, dispatch]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-brand-gray">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}