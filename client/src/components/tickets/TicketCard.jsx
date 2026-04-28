import { Wrench, Eye, MessageSquare, MapPin, Clock, UserCheck } from "lucide-react";
import TicketStatusBadge from "./TicketStatusBadge";
import TicketPriorityBadge from "./TicketPriorityBadge";
import { findResourceLabel } from "../../data/resources";

// Lightweight relative-time helper so we don't pull in a date lib.
function timeAgo(iso) {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  const d = Math.floor(diff / 86400);
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

/**
 * Summary card matching the Figma "Maintenance" list rows.
 * Used by the technician dashboard, my-tickets and admin views.
 */
export default function TicketCard({ ticket, onClick }) {
  const resourceLabel = ticket.resourceId ? findResourceLabel(ticket.resourceId).split(" — ")[0] : null;
  const code = ticket.ticketCode || (ticket.id ? `TKT-${ticket.id.slice(-3).toUpperCase()}` : "TKT");

  // Dynamic styling based on priority
  const priorityStyles = {
    CRITICAL: { border: "border-l-rose-500", bg: "bg-rose-50", icon: "text-rose-600" },
    HIGH:     { border: "border-l-orange-500", bg: "bg-orange-50", icon: "text-orange-500" },
    MEDIUM:   { border: "border-l-blue-500", bg: "bg-blue-50", icon: "text-blue-500" },
    LOW:      { border: "border-l-emerald-500", bg: "bg-emerald-50", icon: "text-emerald-500" },
    DEFAULT:  { border: "border-l-slate-300", bg: "bg-slate-50", icon: "text-slate-500" }
  };

  const pStyle = priorityStyles[ticket.priority?.toUpperCase()] || priorityStyles.DEFAULT;

  return (
    <div
      onClick={onClick}
      // Added border-l-4 and dynamic color to the container
      className={`group bg-white rounded-2xl border border-y-slate-200 border-r-slate-200 border-l-4 ${pStyle.border} p-4 flex items-start gap-4 hover:shadow-md hover:border-r-slate-300 hover:border-y-slate-300 transition-all cursor-pointer`}
    >
      {/* Icon dynamically tinted to match priority */}
      <div className={`w-10 h-10 rounded-xl ${pStyle.bg} flex items-center justify-center shrink-0 transition-colors`}>
        <Wrench className={`w-5 h-5 ${pStyle.icon}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <span className="text-xs font-semibold text-slate-500 tracking-wider">{code}</span>
          <TicketStatusBadge status={ticket.status} />
          <TicketPriorityBadge priority={ticket.priority} />
          {ticket.category && (
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500">
              {String(ticket.category).replace("_", " ")}
            </span>
          )}
        </div>

        <p className="text-sm text-slate-800 line-clamp-2 mb-2 font-medium">
          {ticket.title || ticket.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
          {resourceLabel && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {resourceLabel}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3" /> {timeAgo(ticket.createdAt)}
          </span>
          {(ticket.assignedTechnicianName || ticket.assignedTechnicianId) && (
            <span className="inline-flex items-center gap-1 font-medium text-slate-600">
              <UserCheck className="w-3 h-3 shrink-0" />
              Assigned:{" "}
              {ticket.assignedTechnicianName ||
                (ticket.assignedTechnicianId ? `Tech (${ticket.assignedTechnicianId.slice(0,4)})` : "—")}
            </span>
          )}
          {ticket.comments?.length > 0 && (
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> {ticket.comments.length}
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        className="opacity-40 group-hover:opacity-100 text-slate-400 hover:text-[#2F3A52] transition-colors"
        aria-label="View ticket"
      >
        <Eye className="w-5 h-5" />
      </button>
    </div>
  );
}