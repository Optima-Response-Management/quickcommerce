import { NavLink } from "react-router";
import {
  BarChart3,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Table2,
  Upload,
  Users,
  Zap,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { logout } from "../../features/auth/authSlice";
import { useLogoutMutation } from "../../features/auth/authApi";
import {
  canAccess,
  type Feature,
} from "../../features/users/access";
import type { RootState } from "../../app/store";

const navItems: {
  to: string;
  label: string;
  description: string;
  icon: typeof Upload;
  feature: Feature;
}[] = [
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
    to: "/admin/users",
    label: "Users",
    description: "Manage access",
    icon: Users,
    feature: "manage_users",
  },
];

export default function Sidebar() {
  const dispatch = useDispatch();

  const user = useSelector(
    (state: RootState) => state.auth.user,
  );

  const [logoutApi, { isLoading: isLoggingOut }] =
    useLogoutMutation();

  const links = navItems.filter((item) =>
    canAccess(user, item.feature),
  );

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } finally {
      dispatch(logout());
    }
  };

  const initials =
    user?.email?.slice(0, 1).toUpperCase() ?? "U";

  return (
    <aside className="sticky top-0 hidden h-screen w-[280px] shrink-0 flex-col border-r border-white/[0.07] bg-[#171411] text-white lg:flex">
      {/* =====================================================
          BRAND
      ====================================================== */}

      <div className="relative h-[82px] shrink-0 overflow-hidden border-b border-white/[0.07] px-5">
        {/* Background glow */}
        <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="relative flex h-full items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-950/30">
            <Zap className="h-5 w-5 fill-white text-white" />
          </div>

          <div className="min-w-0">
            <p className="text-[15px] font-bold tracking-tight text-white">
              Campaign Hub
            </p>

            <div className="mt-1 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35">
                Intelligence
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          NAVIGATION
      ====================================================== */}

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-7">
        <div className="mb-3 px-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">
            Workspace
          </p>
        </div>

        <div className="space-y-2">
          {links.map(
            ({
              to,
              label,
              description,
              icon: Icon,
            }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  [
                    "group relative flex items-center gap-3",
                    "rounded-2xl px-3 py-3",
                    "transition-all duration-200",
                    isActive
                      ? "bg-white text-brand-ink shadow-lg shadow-black/10"
                      : "text-white/55 hover:bg-white/[0.06] hover:text-white",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active indicator */}
                    {isActive && (
                      <span className="absolute -left-3 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-r-full bg-orange-500" />
                    )}

                    {/* Icon */}
                    <div
                      className={[
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                        "transition-all duration-200",
                        isActive
                          ? "bg-orange-50 text-orange-600"
                          : "bg-white/[0.045] text-white/45 group-hover:bg-white/[0.08] group-hover:text-white",
                      ].join(" ")}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </div>

                    {/* Text */}
                    <div className="min-w-0 flex-1">
                      <p
                        className={[
                          "truncate text-sm font-semibold",
                          isActive
                            ? "text-brand-ink"
                            : "text-white/75 group-hover:text-white",
                        ].join(" ")}
                      >
                        {label}
                      </p>

                      <p
                        className={[
                          "mt-0.5 truncate text-[10px]",
                          isActive
                            ? "text-brand-gray"
                            : "text-white/25 group-hover:text-white/40",
                        ].join(" ")}
                      >
                        {description}
                      </p>
                    </div>

                    {/* Arrow */}
                    <ChevronRight
                      className={[
                        "h-4 w-4 shrink-0 transition-all duration-200",
                        isActive
                          ? "translate-x-0 text-orange-500"
                          : "-translate-x-1 text-white/0 group-hover:translate-x-0 group-hover:text-white/25",
                      ].join(" ")}
                    />
                  </>
                )}
              </NavLink>
            ),
          )}
        </div>
      </nav>

      {/* =====================================================
          USER / LOGOUT
      ====================================================== */}

      <div className="shrink-0 border-t border-white/[0.07] p-3">
        <div className="mb-2 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-xs font-bold text-white">
              {initials}
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">
                {user?.email ?? "User"}
              </p>

              <p className="mt-1 truncate text-[10px] capitalize text-white/30">
                {user?.role?.replace("_", " ") ?? "Member"}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-white/40 transition-all hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] transition group-hover:bg-red-500/10">
            <LogOut className="h-4 w-4" />
          </div>

          <span>
            {isLoggingOut
              ? "Signing out..."
              : "Sign out"}
          </span>
        </button>

        <div className="mt-4 flex items-center justify-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/15">
          <BarChart3 className="h-3 w-3" />
          Campaign Intelligence
        </div>
      </div>
    </aside>
  );
}