
import { useEffect } from "react";
import { NavLink } from "react-router";
import {
  BarChart3,
  ChevronRight,
  FileClock,
  LayoutDashboard,
  LogOut,
  Table2,
  Upload,
  Users,
  X,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";

import { logout } from "../../features/auth/authSlice";
import { useLogoutMutation } from "../../features/auth/authApi";

import {
  canAccess,
  type Feature,
} from "../../features/users/access";

import type { RootState } from "../../app/store";

type NavItem = {
  to: string;
  label: string;
  description: string;
  icon: typeof Upload;
  feature: Feature;
};

type SidebarProps = {
  isMobileOpen: boolean;
  onMobileClose: () => void;
};

const navItems: NavItem[] = [
  {
    to: "/dashboard",
    label: "Dashboard",
    description: "Campaign overview",
    icon: LayoutDashboard,
    feature: "dashboard",
  },
  {
    to: "/admin/grid",
    label: "Data Grid",
    description: "Campaign records",
    icon: Table2,
    feature: "data_grid",
  },
  {
    to: "/admin/upload",
    label: "Upload Data",
    description: "Import campaign files",
    icon: Upload,
    feature: "upload_data",
  },
  {
    to: "/admin/file-history",
    label: "File History",
    description: "View uploaded files",
    icon: FileClock,
    feature: "view_upload_history",
  },
  {
    to: "/admin/users",
    label: "Users",
    description: "Manage access",
    icon: Users,
    feature: "manage_users",
  },
];

export default function Sidebar({
  isMobileOpen,
  onMobileClose,
}: SidebarProps) {
  const dispatch = useDispatch();

  const user = useSelector(
    (state: RootState) => state.auth.user,
  );

  const [logoutApi, { isLoading: isLoggingOut }] =
    useLogoutMutation();

  const links = navItems.filter((item) => {
    // File History is available only to Super Admins.
    if (item.to === "/admin/file-history") {
      return user?.role === "super_admin";
    }

    return canAccess(user, item.feature);
  });

  const initials =
    user?.email?.slice(0, 1).toUpperCase() ?? "U";

  const role =
    user?.role?.replace("_", " ") ?? "Member";

  useEffect(() => {
    if (!isMobileOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onMobileClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMobileOpen, onMobileClose]);

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      dispatch(logout());
      onMobileClose();
    }
  };

  return (
    <aside
      aria-label="Main navigation"
      aria-hidden={!isMobileOpen && undefined}
      className={[
        "fixed inset-y-0 left-0 z-50",
        "flex h-screen h-dvh w-[280px] max-w-[85vw]",
        "shrink-0 flex-col overflow-hidden",
        "border-r border-brand-border",
        "bg-brand-white text-brand-ink",
        "transition-transform duration-300 ease-in-out",
        "lg:sticky lg:top-0 lg:z-40",
        "lg:h-screen lg:max-w-none lg:translate-x-0",
        isMobileOpen
          ? "translate-x-0"
          : "-translate-x-full",
      ].join(" ")}
    >
      {/* Brand header */}

      <div className="relative flex h-[72px] shrink-0 items-center justify-between overflow-hidden border-b border-brand-border bg-brand-white px-5 sm:h-[82px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-brand-primary-soft blur-3xl"
        />

        <div className="relative flex min-w-0 flex-1 items-center">
          <img
            src="/logo.svg"
            alt="Campaign Hub"
            className="h-auto w-[180px] max-w-full object-contain"
          />
        </div>

        {/* Close button on mobile/tablet */}

        <button
          type="button"
          onClick={onMobileClose}
          aria-label="Close navigation menu"
          className="relative ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-brand-gray transition hover:bg-brand-surface hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}

      <nav className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-3 py-5 sm:py-7">
        <div className="mb-3 px-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gray-light">
            Workspace
          </p>
        </div>

        <div className="space-y-2">
          {links.map(
            ({ to, label, description, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  [
                    "group relative flex min-w-0 items-center gap-3",
                    "rounded-2xl border px-3 py-3",
                    "transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-brand-primary",
                    isActive
                      ? "border-brand-primary-muted bg-brand-primary-soft text-brand-ink shadow-brand-sm"
                      : "border-transparent text-brand-gray hover:border-brand-border hover:bg-brand-surface hover:text-brand-ink",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active indicator */}

                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute -left-3 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-r-full bg-brand-primary"
                      />
                    )}

                    {/* Navigation icon */}

                    <div
                      className={[
                        "flex h-10 w-10 shrink-0 items-center justify-center",
                        "rounded-xl transition-all duration-200",
                        isActive
                          ? "bg-brand-primary text-white shadow-brand-sm"
                          : "bg-brand-surface text-brand-gray group-hover:bg-brand-primary-muted group-hover:text-brand-primary-dark",
                      ].join(" ")}
                    >
                      <Icon
                        className="h-[18px] w-[18px]"
                        aria-hidden="true"
                      />
                    </div>

                    {/* Navigation text */}

                    <div className="min-w-0 flex-1">
                      <p
                        className={[
                          "truncate text-sm font-semibold",
                          isActive
                            ? "text-brand-ink"
                            : "text-brand-ink/75 group-hover:text-brand-ink",
                        ].join(" ")}
                      >
                        {label}
                      </p>

                      <p
                        className={[
                          "mt-0.5 truncate text-[10px]",
                          isActive
                            ? "text-brand-gray"
                            : "text-brand-gray-light group-hover:text-brand-gray",
                        ].join(" ")}
                      >
                        {description}
                      </p>
                    </div>

                    {/* Navigation arrow */}

                    <ChevronRight
                      className={[
                        "h-4 w-4 shrink-0 transition-all duration-200",
                        isActive
                          ? "translate-x-0 text-brand-primary"
                          : "-translate-x-1 text-transparent group-hover:translate-x-0 group-hover:text-brand-gray-light",
                      ].join(" ")}
                      aria-hidden="true"
                    />
                  </>
                )}
              </NavLink>
            ),
          )}

          {/* Empty permissions state */}

          {links.length === 0 && (
            <div className="rounded-2xl border border-brand-border bg-brand-surface px-4 py-5 text-center">
              <p className="text-xs font-semibold text-brand-gray">
                No navigation available
              </p>

              <p className="mt-1 text-[10px] leading-5 text-brand-gray-light">
                Your account does not have any workspace permissions.
              </p>
            </div>
          )}
        </div>
      </nav>

      {/* User information and logout */}

      <div className="shrink-0 border-t border-brand-border bg-brand-white p-3">
        <div className="mb-2 rounded-2xl border border-brand-border bg-brand-surface p-3">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-xs font-bold text-white shadow-brand-sm"
              aria-hidden="true"
            >
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-brand-ink">
                {user?.email ?? "User"}
              </p>

              <p className="mt-1 truncate text-[10px] capitalize text-brand-gray">
                {role}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="group flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-brand-gray transition-all hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-surface transition group-hover:bg-red-100">
            <LogOut
              className="h-4 w-4"
              aria-hidden="true"
            />
          </div>

          <span>
            {isLoggingOut ? "Signing out..." : "Sign out"}
          </span>
        </button>

        {/* Footer */}

        <div className="mt-4 flex items-center justify-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-brand-gray-light">
          <BarChart3
            className="h-3 w-3"
            aria-hidden="true"
          />

          Campaign Intelligence
        </div>
      </div>
    </aside>
  );
}
