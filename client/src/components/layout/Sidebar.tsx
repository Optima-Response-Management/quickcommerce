import { NavLink } from "react-router";
import { LayoutDashboard, Upload, Table2, Users, LogOut } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import { canAccess, type Feature } from "../../features/users/access";
import type { RootState } from "../../app/store";

const navItems: { to: string; label: string; icon: typeof Upload; feature: Feature }[] = [
  { to: "/admin/upload", label: "Upload Data", icon: Upload, feature: "upload_data" },
  { to: "/admin/grid", label: "Data Grid", icon: Table2, feature: "data_grid" },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, feature: "dashboard" },
  { to: "/admin/users", label: "Users", icon: Users, feature: "manage_users" },
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
const links = navItems.filter((item) => canAccess(user, item.feature));
  return (
    <aside className="w-64 h-screen bg-brand-black flex flex-col sticky top-0">
      <div className="flex items-center gap-2.5 px-6 h-16 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center">
          <span className="text-brand-black font-bold text-sm">C</span>
        </div>
        <span className="text-white font-semibold text-sm">Campaign Hub</span>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? "bg-brand-primary text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Icon className="w-4.5 h-4.5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={() => dispatch(logout())}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
        >
          <LogOut className="w-4.5 h-4.5" />
          Log out
        </button>
      </div>
    </aside>
  );
}