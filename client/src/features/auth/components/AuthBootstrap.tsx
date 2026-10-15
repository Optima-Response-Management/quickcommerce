import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { useMeQuery } from "../authApi";
import {
  setCredentials,
  logout,
  sessionChecked,
} from "../authSlice";

export default function AuthBootstrap() {
  const dispatch = useDispatch();

  const {
    data,
    error,
    isLoading,
    isFetching,
  } = useMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (data?.user) {
      dispatch(setCredentials({ user: data.user }));
      return;
    }

    if (error) {
      dispatch(logout());
      dispatch(sessionChecked());
    }
  }, [data, error, dispatch]);

  if (isLoading || isFetching) {
    return null;
  }

  return null;
}
