
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";

import type { RootState } from "../../app/store";

import { logout } from "../../features/auth/authSlice";
import {
  authApi,
  useLogoutMutation,
} from "../../features/auth/authApi";
import { dashboardApi } from "../../features/campaigns/dashboardApi";
import { uploadApi } from "../../features/campaigns/uploadApi";
import { uploadHistoryApi } from "../../features/campaigns/uploadHistoryApi";
import { usersApi } from "../../features/users/usersApi";

type NavbarProps = {
  onMenuClick: () => void;
  isMobileOpen: boolean;
};

export default function Navbar({
  onMenuClick,
  isMobileOpen,
}: NavbarProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(
    (state: RootState) => state.auth.user,
  );

  const [logoutApi, { isLoading: isLoggingOut }] =
    useLogoutMutation();

  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  const initials =
    user?.email?.slice(0, 1).toUpperCase() ?? "U";

  const role =
    user?.role?.replace("_", " ") ?? "Member";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      dispatch(logout());

      dispatch(authApi.util.resetApiState());
      dispatch(dashboardApi.util.resetApiState());
      dispatch(uploadApi.util.resetApiState());
      dispatch(uploadHistoryApi.util.resetApiState());
      dispatch(usersApi.util.resetApiState());

      setProfileOpen(false);
      navigate("/login", { replace: true });
    }
  };

  return (
    <header className="sticky top-0 z-40 h-16 w-full min-w-0 border-b border-brand-border bg-white/95 backdrop-blur-xl sm:h-[72px]">
      <div className="flex h-full min-w-0 items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}

        <button
          type="button"
          onClick={onMenuClick}
          aria-label={
            isMobileOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={isMobileOpen}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-brand-ink transition hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary lg:hidden"
        >
          {isMobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

        {/* Page heading */}

        <div className="min-w-0 flex-1">
          <p className="truncate text-[9px] font-bold uppercase tracking-[0.12em] text-brand-primary sm:text-[10px] sm:tracking-[0.18em]">
            Campaign Hub
          </p>

          <h1 className="mt-0.5 truncate text-base font-bold tracking-tight text-brand-ink sm:text-lg">
            {user?.role === "super_admin"
              ? "Admin Panel"
              : "Dashboard"}
          </h1>
        </div>

        {/* Profile menu */}

        <div ref={profileRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() =>
              setProfileOpen((open) => !open)
            }
            className={[
              "flex min-h-11 items-center gap-2 rounded-xl p-1.5",
              "transition-colors duration-200 sm:gap-3 sm:px-2",
              "focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-brand-primary focus-visible:ring-offset-2",
              profileOpen
                ? "bg-brand-surface"
                : "hover:bg-brand-surface",
            ].join(" ")}
            aria-label="Open profile menu"
            aria-expanded={profileOpen}
            aria-haspopup="menu"
          >
            {/* User information */}

            <div className="hidden min-w-0 max-w-[180px] text-right sm:block">
              <p className="truncate text-xs font-semibold text-brand-ink">
                {user?.email ?? "User"}
              </p>

              <p className="mt-0.5 truncate text-[10px] capitalize text-brand-gray">
                {role}
              </p>
            </div>

            {/* Avatar */}

            <div
              className={[
                "flex h-9 w-9 shrink-0 items-center justify-center",
                "rounded-xl bg-gradient-to-br from-orange-400 to-orange-600",
                "text-sm font-bold text-white shadow-sm sm:h-10 sm:w-10",
                "transition-transform duration-200",
                profileOpen ? "scale-95" : "",
              ].join(" ")}
              aria-hidden="true"
            >
              {initials}
            </div>

            <ChevronDown
              className={[
                "hidden h-4 w-4 shrink-0 text-brand-gray-light",
                "transition-transform duration-200 sm:block",
                profileOpen ? "rotate-180" : "",
              ].join(" ")}
              aria-hidden="true"
            />
          </button>

          {/* Profile dropdown */}

          {profileOpen && (
            <div
              role="menu"
              aria-label="Profile menu"
              className="absolute right-0 top-[calc(100%+8px)] w-[min(280px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-brand-border bg-white shadow-brand-lg"
            >
              {/* Profile header */}

              <div className="border-b border-brand-border-light bg-brand-surface p-3 sm:p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-sm font-bold text-white"
                    aria-hidden="true"
                  >
                    {initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-brand-ink">
                      {user?.email ?? "User"}
                    </p>

                    <p className="mt-1 truncate text-[11px] capitalize text-brand-gray">
                      {role}
                    </p>
                  </div>
                </div>
              </div>

              {/* Account */}

              <div className="p-2">
                <div className="flex items-center gap-3 rounded-xl px-3 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary-soft text-brand-primary">
                    <UserRound
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-brand-ink">
                      Account
                    </p>

                    <p className="mt-0.5 break-words text-[10px] text-brand-gray">
                      Signed in as {role}
                    </p>
                  </div>
                </div>

                <div className="my-1 h-px bg-brand-border-light" />

                {/* Logout */}

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500 transition group-hover:bg-red-100">
                    <LogOut
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-red-600">
                      {isLoggingOut
                        ? "Signing out..."
                        : "Sign out"}
                    </p>

                    <p className="mt-0.5 text-[10px] text-red-400">
                      End your current session
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
