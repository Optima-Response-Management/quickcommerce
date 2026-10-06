import { NavLink } from "react-router";
import { LayoutDashboard, Upload, Table2, Users, LogOut } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import { useLogoutMutation } from "../../features/auth/authApi";
import { canAccess, type Feature } from "../../features/users/access";
import type { RootState } from "../../app/store";

const navItems: { to: string; label: string; icon: typeof Upload; feature: Feature }[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, feature: "dashboard" },
  { to: "/admin/grid", label: "Data Grid", icon: Table2, feature: "data_grid" },
  { to: "/admin/upload", label: "Upload Data", icon: Upload, feature: "upload_data" },
  { to: "/admin/users", label: "Users", icon: Users, feature: "manage_users" },
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [logoutApi] = useLogoutMutation();
  const links = navItems.filter((item) => canAccess(user, item.feature));

  // The server must clear the httpOnly cookie, otherwise a refresh logs you back in
  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } finally {
      dispatch(logout());
    }
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-brand-border flex flex-col sticky top-0">
      <div className="flex items-center gap-2.5 px-6 h-16 border-b border-brand-border">
        <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center">
          <span className="text-white font-bold text-sm">C</span>
        </div>
        <span className="text-brand-ink font-semibold text-sm">Campaign Hub</span>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-primary text-white shadow-sm shadow-orange-500/20"
                  : "text-brand-gray hover:bg-brand-orange-tint hover:text-brand-primary-dark"
              }`
            }
          >
            <Icon className="w-4.5 h-4.5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-brand-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-brand-gray hover:bg-brand-orange-tint hover:text-brand-primary-dark transition-colors"
        >
          <LogOut className="w-4.5 h-4.5" />
          Log out
        </button>
      </div>
    </aside>
  );
}