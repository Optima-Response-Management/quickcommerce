
import { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function ProtectedLayout() {
  const location = useLocation();

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const closeMobileSidebar = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  const toggleMobileSidebar = useCallback(() => {
    setIsMobileOpen((previous) => !previous);
  }, []);

  // Close the mobile drawer after navigating to another route.
  useEffect(() => {
    closeMobileSidebar();
  }, [location.pathname, closeMobileSidebar]);

  // Close the drawer when Escape is pressed.
  useEffect(() => {
    if (!isMobileOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobileSidebar();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMobileOpen, closeMobileSidebar]);

  // Prevent background scrolling while the mobile drawer is open.
  useEffect(() => {
    if (!isMobileOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileOpen]);

  return (
    <div className="min-h-screen bg-brand-offwhite">
      <div className="flex min-h-screen">
        {/* Original sidebar design */}
        <Sidebar
          isMobileOpen={isMobileOpen}
          onMobileClose={closeMobileSidebar}
        />

        {/* Mobile backdrop; this is not another hamburger button */}
        {isMobileOpen && (
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={closeMobileSidebar}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden"
          />
        )}

        {/* Main application area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Render the original Navbar only once */}
          <Navbar
            onMenuClick={toggleMobileSidebar}
            isMobileOpen={isMobileOpen}
          />

          <main
            key={location.pathname}
            className="page-enter min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-7"
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
