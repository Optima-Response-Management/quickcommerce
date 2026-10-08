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

type NavItem = {
  to: string;
  label: string;
  description: string;
  icon: typeof Upload;
  feature: Feature;
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

  const [
    logoutApi,
    {
      isLoading: isLoggingOut,
    },
  ] = useLogoutMutation();

  // ----------------------------------------------------------
  // ACCESSIBLE NAVIGATION
  // ----------------------------------------------------------

  const links = navItems.filter((item) =>
    canAccess(
      user,
      item.feature,
    ),
  );

  // ----------------------------------------------------------
  // LOGOUT
  // ----------------------------------------------------------

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } finally {
      dispatch(logout());
    }
  };

  // ----------------------------------------------------------
  // USER INITIAL
  // ----------------------------------------------------------

  const initials =
    user?.email
      ?.slice(0, 1)
      .toUpperCase() ?? "U";

  return (
    <aside
      className="
        sticky
        top-0
        z-40
        hidden
        h-screen
        w-[280px]
        shrink-0
        flex-col
        overflow-hidden
        border-r
        border-brand-border
        bg-brand-white
        text-brand-ink
        lg:flex
      "
    >
      {/* ===================================================== */}
      {/* BRAND */}
      {/* ===================================================== */}

      <div
        className="
          relative
          h-[82px]
          shrink-0
          overflow-hidden
          border-b
          border-brand-border
          bg-brand-white
          px-5
        "
      >
        {/* Orange glow */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -right-10
            -top-16
            h-40
            w-40
            rounded-full
            bg-brand-primary-soft
            blur-3xl
          "
        />

        {/* Brand content */}

        <div
          className="
            relative
            flex
            h-full
            items-center
            gap-3
          "
        >
          {/* Logo */}

          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-brand-primary
              shadow-brand-sm
            "
          >
            <Zap
              className="
                h-5
                w-5
                fill-white
                text-white
              "
              aria-hidden="true"
            />
          </div>

          {/* Brand */}

          <div className="min-w-0">
            <p
              className="
                text-[15px]
                font-bold
                tracking-tight
                text-brand-ink
              "
            >
              Campaign Hub
            </p>

            <div
              className="
                mt-1
                flex
                items-center
                gap-1.5
              "
            >
              <span
                className="
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-emerald-500
                "
              />

              <p
                className="
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-brand-gray-light
                "
              >
                Intelligence
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================== */}
      {/* NAVIGATION */}
      {/* ===================================================== */}

      <nav
        className="
          min-h-0
          flex-1
          overflow-y-auto
          px-3
          py-7
        "
      >
        <div className="mb-3 px-3">
          <p
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.2em]
              text-brand-gray-light
            "
          >
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
                    "group",
                    "relative",
                    "flex",
                    "items-center",
                    "gap-3",
                    "rounded-2xl",
                    "px-3",
                    "py-3",
                    "transition-all",
                    "duration-200",
                    "border",
                    "border-transparent",

                    isActive
                      ? [
                          "bg-brand-primary-soft",
                          "border-brand-primary-muted",
                          "text-brand-ink",
                          "shadow-brand-sm",
                        ].join(" ")
                      : [
                          "text-brand-gray",
                          "hover:border-brand-border",
                          "hover:bg-brand-surface",
                          "hover:text-brand-ink",
                        ].join(" "),
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active indicator */}

                    {isActive && (
                      <span
                        className="
                          absolute
                          -left-3
                          top-1/2
                          h-8
                          w-[3px]
                          -translate-y-1/2
                          rounded-r-full
                          bg-brand-primary
                        "
                      />
                    )}

                    {/* Icon */}

                    <div
                      className={[
                        "flex",
                        "h-10",
                        "w-10",
                        "shrink-0",
                        "items-center",
                        "justify-center",
                        "rounded-xl",
                        "transition-all",
                        "duration-200",

                        isActive
                          ? [
                              "bg-brand-primary",
                              "text-white",
                              "shadow-brand-sm",
                            ].join(" ")
                          : [
                              "bg-brand-surface",
                              "text-brand-gray",
                              "group-hover:bg-brand-primary-muted",
                              "group-hover:text-brand-primary-dark",
                            ].join(" "),
                      ].join(" ")}
                    >
                      <Icon
                        className="
                          h-[18px]
                          w-[18px]
                        "
                        aria-hidden="true"
                      />
                    </div>

                    {/* Text */}

                    <div className="min-w-0 flex-1">
                      <p
                        className={[
                          "truncate",
                          "text-sm",
                          "font-semibold",

                          isActive
                            ? "text-brand-ink"
                            : "text-brand-ink/75 group-hover:text-brand-ink",
                        ].join(" ")}
                      >
                        {label}
                      </p>

                      <p
                        className={[
                          "mt-0.5",
                          "truncate",
                          "text-[10px]",

                          isActive
                            ? "text-brand-gray"
                            : "text-brand-gray-light group-hover:text-brand-gray",
                        ].join(" ")}
                      >
                        {description}
                      </p>
                    </div>

                    {/* Arrow */}

                    <ChevronRight
                      className={[
                        "h-4",
                        "w-4",
                        "shrink-0",
                        "transition-all",
                        "duration-200",

                        isActive
                          ? "translate-x-0 text-brand-primary"
                          : [
                              "-translate-x-1",
                              "text-transparent",
                              "group-hover:translate-x-0",
                              "group-hover:text-brand-gray-light",
                            ].join(" "),
                      ].join(" ")}
                      aria-hidden="true"
                    />
                  </>
                )}
              </NavLink>
            ),
          )}

          {/* ------------------------------------------------- */}
          {/* EMPTY ACCESS FALLBACK */}
          {/* ------------------------------------------------- */}

          {links.length === 0 && (
            <div
              className="
                rounded-2xl
                border
                border-brand-border
                bg-brand-surface
                px-4
                py-5
                text-center
              "
            >
              <p
                className="
                  text-xs
                  font-semibold
                  text-brand-gray
                "
              >
                No navigation available
              </p>

              <p
                className="
                  mt-1
                  text-[10px]
                  leading-5
                  text-brand-gray-light
                "
              >
                Your account does not have
                any workspace permissions.
              </p>
            </div>
          )}
        </div>
      </nav>

      {/* ===================================================== */}
      {/* USER / LOGOUT */}
      {/* ===================================================== */}

      <div
        className="
          shrink-0
          border-t
          border-brand-border
          bg-brand-white
          p-3
        "
      >
        {/* User card */}

        <div
          className="
            mb-2
            rounded-2xl
            border
            border-brand-border
            bg-brand-surface
            p-3
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            {/* Avatar */}

            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-brand-primary
                text-xs
                font-bold
                text-white
                shadow-brand-sm
              "
            >
              {initials}
            </div>

            {/* User info */}

            <div className="min-w-0">
              <p
                className="
                  truncate
                  text-xs
                  font-semibold
                  text-brand-ink
                "
              >
                {user?.email ?? "User"}
              </p>

              <p
                className="
                  mt-1
                  truncate
                  text-[10px]
                  capitalize
                  text-brand-gray
                "
              >
                {user?.role?.replace(
                  "_",
                  " ",
                ) ?? "Member"}
              </p>
            </div>
          </div>
        </div>

        {/* Logout */}

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="
            group
            flex
            w-full
            items-center
            gap-3
            rounded-xl
            px-3
            py-3
            text-sm
            font-medium
            text-brand-gray
            transition-all
            hover:bg-red-50
            hover:text-red-600
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              bg-brand-surface
              transition
              group-hover:bg-red-50
            "
          >
            <LogOut
              className="
                h-4
                w-4
              "
              aria-hidden="true"
            />
          </div>

          <span>
            {isLoggingOut
              ? "Signing out..."
              : "Sign out"}
          </span>
        </button>

        {/* Footer */}

        <div
          className="
            mt-4
            flex
            items-center
            justify-center
            gap-2
            text-[9px]
            font-semibold
            uppercase
            tracking-[0.18em]
            text-brand-gray-light
          "
        >
          <BarChart3
            className="
              h-3
              w-3
            "
            aria-hidden="true"
          />

          Campaign Intelligence
        </div>
      </div>
    </aside>
  );
}