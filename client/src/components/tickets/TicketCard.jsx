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
  const imageUrls = Array.isArray(ticket.imageUrls) ? ticket.imageUrls.slice(0, 3) : [];

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-slate-200 p-4 flex items-start gap-4 hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
    >
      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
        <Wrench className="w-5 h-5 text-orange-500" />
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

        {ticket.title && (
          <h4 className="text-sm font-bold text-slate-800 line-clamp-1 mb-1">
            {ticket.title}
          </h4>
        )}

        <p className="text-sm text-slate-600 line-clamp-2 mb-2">
          {ticket.description || "No description provided."}
        </p>

        {imageUrls.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            {imageUrls.map((url, index) => (
              <img
                key={`${url}-${index}`}
                src={url}
                alt={`Ticket attachment ${index + 1}`}
                className="h-12 w-12 rounded-lg border border-slate-200 object-cover bg-slate-50"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            ))}
          </div>
        )}

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
              Assigned to:{" "}
              {ticket.assignedTechnicianName ||
                (ticket.assignedTechnicianId ? `Technician (${ticket.assignedTechnicianId})` : "—")}
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
        className="opacity-60 group-hover:opacity-100 text-slate-400 hover:text-slate-700 transition-colors"
        aria-label="View ticket"
      >
        <Eye className="w-4 h-4" />
      </button>
    </div>
  );
}
