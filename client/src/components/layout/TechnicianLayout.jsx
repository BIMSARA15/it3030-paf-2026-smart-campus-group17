import { NavLink, Outlet } from "react-router-dom";
import { Bell, Building2, GraduationCap, LayoutDashboard, LogOut, Wrench } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

/**
 * Sidebar shell for the Technician (Staff) area, matching the
 * "Northridge University Portal" Figma layout.
 *
 * Pages render inside <Outlet/>.
 */
export default function TechnicianLayout() {
  const { user, logout } = useAuth();

  const navItem = ({ isActive }) =>
    `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
      isActive
        ? "bg-blue-600 text-white shadow-sm"
        : "text-slate-300 hover:bg-slate-800 hover:text-white"
    }`;

  const initials = (user?.name || "MT")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* ── Sidebar ── */}
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col p-4">
        <div className="flex items-center gap-2.5 px-2 py-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div className="leading-tight">
            <h1 className="text-sm font-bold">Northridge</h1>
            <p className="text-[11px] text-slate-400">University Portal</p>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          <NavLink to="/staff" end className={navItem}>
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </NavLink>
          <NavLink to="/staff/facilities" className={navItem}>
            <Building2 className="w-4 h-4" /> Facilities &amp; Assets
          </NavLink>
          <NavLink to="/staff/maintenance" className={navItem}>
            <Wrench className="w-4 h-4" /> Maintenance
          </NavLink>
          <NavLink to="/staff/notifications" className={navItem}>
            <Bell className="w-4 h-4" /> Notifications
            <span className="ml-auto inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
              1
            </span>
          </NavLink>
        </nav>

        <div className="mt-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2.5 px-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
            <div className="leading-tight min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name || "Technician"}</p>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold tracking-wider">
                {user?.role || "TECHNICIAN"}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full inline-flex items-center gap-2 px-2 py-2 text-sm text-slate-400 hover:text-white"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
