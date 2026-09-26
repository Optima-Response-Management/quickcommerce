import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function ProtectedLayout() {
  return (
    <div className="flex min-h-screen bg-brand-offwhite">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}