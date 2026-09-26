import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";

export default function Navbar() {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <h1 className="text-lg font-semibold text-brand-black">
        {user?.role === "super_admin" ? "Admin Panel" : "Dashboard"}
      </h1>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-brand-black">{user?.email}</p>
          <p className="text-xs text-brand-gray capitalize">{user?.role.replace("_", " ")}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-brand-orange flex items-center justify-center text-white font-semibold text-sm">
          {user?.email?.[0]?.toUpperCase()}
        </div>
      </div>
    </header>
  );
}