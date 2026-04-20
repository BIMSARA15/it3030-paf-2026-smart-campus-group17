import { Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

/**
 * Reusable top header for technician pages, e.g.
 *   <TechnicianTopBar title="Dashboard" subtitle="Facilities Management" notifCount={1} />
 */
export default function TechnicianTopBar({ title, subtitle, notifCount = 0 }) {
  const { user } = useAuth();
  const initials = (user?.name || "MT")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6">
      <div>
        <h2 className="text-base font-bold text-slate-800">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-full hover:bg-slate-100">
          <Bell className="w-5 h-5 text-slate-600" />
          {notifCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
              {notifCount}
            </span>
          )}
        </button>
        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
          {initials}
        </div>
      </div>
    </header>
  );
}
