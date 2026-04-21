import { NavLink, Outlet } from "react-router-dom";
import { Bell, Building2, GraduationCap, LayoutDashboard, LogOut, Wrench, X } from "lucide-react";
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
    `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
      isActive
        ? "bg-white/90 text-slate-800 shadow-[0_10px_30px_rgba(15,23,42,0.12)]"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
    }`;

  const initials = (user?.name || "MT")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* ── Sidebar ── */}
      <aside className="w-72 bg-gradient-to-b from-[#27324A] via-[#303B53] to-[#1F2937] text-slate-100 flex flex-col p-4 shadow-[12px_0_40px_rgba(15,23,42,0.08)]">
        <div className="flex items-start justify-between px-2 py-2 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <h1 className="text-lg font-bold tracking-wide text-white">SMART CAMPUS</h1>
              <p className="text-[11px] text-slate-300">Technician Portal</p>
            </div>
          </div>
          <button
            type="button"
            className="mt-1 rounded-full p-1 text-slate-300 hover:bg-white/10 hover:text-white"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mx-1 mb-6 rounded-[24px] bg-white px-4 py-4 text-slate-800 shadow-[0_18px_40px_rgba(15,23,42,0.18)]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
            <div className="leading-tight min-w-0">
              <p className="text-sm font-bold truncate">{user?.name || "Dev Technician"}</p>
              <p className="text-[10px] font-semibold tracking-wide uppercase text-slate-500">
                {user?.role || "Technician"}
              </p>
            </div>
          </div>
        </div>

        <div className="px-2 mb-3">
          <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-slate-400">Navigation</p>
        </div>

        <nav className="space-y-2 flex-1">
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

        <div className="mt-4 pt-4">
          <button
            onClick={logout}
            className="w-full inline-flex items-center gap-2 rounded-2xl border border-rose-200/30 bg-white/95 px-4 py-3 text-sm font-semibold text-rose-500 hover:bg-rose-50"
          >
            <LogOut className="w-4 h-4" /> Logout
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
