import {
    Navigate,
    Outlet,
  } from "react-router";
  
  import { useSelector } from "react-redux";
  
  import type { RootState } from "../app/store";
  
  export default function SuperAdminRoute() {
    const user = useSelector(
      (state: RootState) => state.auth.user,
    );
  
    const checking = useSelector(
      (state: RootState) => state.auth.checking,
    );
  
    if (checking) {
      return null;
    }
  
    if (!user) {
      return (
        <Navigate
          to="/login"
          replace
        />
      );
    }
  
    if (user.role !== "super_admin") {
      return (
        <Navigate
          to="/unauthorized"
          replace
        />
      );
    }
  
    return <Outlet />;
  }