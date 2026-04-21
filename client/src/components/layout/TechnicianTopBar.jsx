import { Bell, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

/**
 * Reusable top header for technician pages.
 */
export default function TechnicianTopBar({
  title,
  subtitle,
  notifCount = 0,
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
}) {
  const { user } = useAuth();
  const initials = (user?.name || "MT")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="border-b border-slate-100 bg-white px-6 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-[30px] font-semibold leading-tight text-slate-800">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          <button className="relative rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <Bell className="w-5 h-5" />
            {notifCount > 0 && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-rose-400" />}
          </button>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-[11px] font-bold">
              {initials}
            </div>
            <div className="leading-tight text-right">
              <p className="text-sm font-bold uppercase text-slate-800">{user?.name || "Dev Technician"}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                {user?.role || "Technician"}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>

      {actionLabel && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#2F3A52] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(47,58,82,0.28)] hover:bg-[#27324A]"
          >
            {ActionIcon ? <ActionIcon className="w-4 h-4" /> : null}
            {actionLabel}
          </button>
        </div>
      )}
    </header>
  );
}
