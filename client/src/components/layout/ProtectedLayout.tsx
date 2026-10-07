import { Outlet, useLocation } from "react-router";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function ProtectedLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-brand-offwhite">
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="min-w-0 flex-1">
          <Navbar />

          <main
            key={location.pathname}
            className="page-enter min-w-0 px-4 py-5 sm:px-6 lg:px-8 lg:py-7"
          >
            <div className="mx-auto w-full max-w-[1700px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}