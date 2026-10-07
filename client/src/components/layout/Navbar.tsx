import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  LogOut,
  UserRound,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import type { RootState } from "../../app/store";
import { logout } from "../../features/auth/authSlice";
import { useLogoutMutation } from "../../features/auth/authApi";

export default function Navbar() {
  const user = useSelector(
    (state: RootState) => state.auth.user,
  );

  const dispatch = useDispatch();

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
        !profileRef.current.contains(
          event.target as Node,
        )
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } finally {
      dispatch(logout());
    }
  };

  return (
    <header className="sticky top-0 z-40 h-[72px] border-b border-brand-border bg-white/95 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-5 sm:px-7 lg:px-8">
        {/* Page heading */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-primary">
            Campaign Hub
          </p>

          <h1 className="mt-0.5 text-lg font-bold tracking-tight text-brand-ink">
            {user?.role === "super_admin"
              ? "Admin Panel"
              : "Dashboard"}
          </h1>
        </div>

        {/* Profile */}
        <div
          ref={profileRef}
          className="relative"
        >
          <button
            type="button"
            onClick={() =>
              setProfileOpen((open) => !open)
            }
            className={[
              "group flex items-center gap-3 rounded-xl p-1.5",
              "transition-all duration-200",
              profileOpen
                ? "bg-brand-surface"
                : "hover:bg-brand-surface",
            ].join(" ")}
            aria-expanded={profileOpen}
            aria-haspopup="menu"
          >
            {/* User info */}
            <div className="hidden text-right sm:block">
              <p className="max-w-[220px] truncate text-xs font-semibold text-brand-ink">
                {user?.email ?? "User"}
              </p>

              <p className="mt-0.5 text-[10px] capitalize text-brand-gray">
                {role}
              </p>
            </div>

            {/* Avatar */}
            <div
              className={[
                "flex h-10 w-10 items-center justify-center",
                "rounded-xl bg-gradient-to-br from-orange-400 to-orange-600",
                "text-sm font-bold text-white shadow-sm",
                "transition-transform duration-200",
                profileOpen ? "scale-95" : "",
              ].join(" ")}
            >
              {initials}
            </div>

            <ChevronDown
              className={[
                "hidden h-4 w-4 text-brand-gray-light transition-transform duration-200 sm:block",
                profileOpen ? "rotate-180" : "",
              ].join(" ")}
            />
          </button>

          {/* Profile dropdown */}
          {profileOpen && (
            <div className="absolute right-0 top-[calc(100%+10px)] w-[280px] overflow-hidden rounded-2xl border border-brand-border bg-white shadow-brand-lg">
              {/* Profile header */}
              <div className="border-b border-brand-border-light bg-brand-surface p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-sm font-bold text-white">
                    {initials}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-brand-ink">
                      {user?.email ?? "User"}
                    </p>

                    <p className="mt-1 text-[11px] capitalize text-brand-gray">
                      {role}
                    </p>
                  </div>
                </div>
              </div>

              {/* Account */}
              <div className="p-2">
                <div className="flex items-center gap-3 rounded-xl px-3 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary-soft text-brand-primary">
                    <UserRound className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-brand-ink">
                      Account
                    </p>

                    <p className="mt-0.5 text-[10px] text-brand-gray">
                      Signed in as {role}
                    </p>
                  </div>
                </div>

                <div className="my-1 h-px bg-brand-border-light" />

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 transition group-hover:bg-red-100">
                    <LogOut className="h-4 w-4" />
                  </div>

                  <div>
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