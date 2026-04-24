import { useState, useEffect } from "react";
import { X, MapPin, User, Calendar, Wrench, Image as ImageIcon } from "lucide-react";
import TicketStatusBadge from "./TicketStatusBadge";
import TicketPriorityBadge from "./TicketPriorityBadge";
import CommentThread from "./CommentThread";
import { addComment, updateTicketStatus } from "../../services/ticketService";
import { findResourceLabel } from "../../data/resources";

// Allowed forward transitions — matches TicketService.ALLOWED_TRANSITIONS on the backend.
const NEXT = {
  OPEN:        ["IN_PROGRESS", "REJECTED"],
  IN_PROGRESS: ["RESOLVED", "REJECTED"],
  RESOLVED:    ["CLOSED"],
  REJECTED:    [],
  CLOSED:      [],
};

function fmt(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

/**
 * Right-side slide-over presenting full ticket details + the technician
 * actions: change status (with note), add a comment, view the audit timeline.
 *
 * Props:
 *   ticket    : Ticket
 *   onClose   : () => void
 *   onChanged : (updatedTicket, kind: "status" | "comment") => void
 *   onError   : (message) => void
 */
export default function StatusUpdateModal({ ticket, onClose, onChanged, onError }) {
  // Local copy so the modal can show the up-to-date state immediately
  // after each action without waiting for the parent's refetch.
  const [current, setCurrent] = useState(ticket);

  const initialChoices = NEXT[ticket.status] || [];
  const [status, setStatus] = useState(initialChoices[0] || ticket.status);
  const [note, setNote] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    setCurrent(ticket);
    const nextChoices = NEXT[ticket.status] || [];
    setStatus(nextChoices[0] || ticket.status);
    setNote("");
  }, [ticket?.id]);

  const choices = NEXT[current.status] || [];

  const submitStatus = async (e) => {
    e.preventDefault();
    if (!status || status === current.status) return;
    setSavingStatus(true);
    try {
      const updated = await updateTicketStatus(current.id, status, note || undefined);
      setCurrent(updated);
      setNote("");
      onChanged?.(updated, "status");
    } catch (err) {
      onError?.(err.response?.data?.message || "Failed to update status");
    } finally {
      setSavingStatus(false);
    }
  };

  const submitComment = async (message) => {
    try {
      const updated = await addComment(current.id, message);
      setCurrent(updated);
      onChanged?.(updated, "comment");
    } catch (err) {
      onError?.(err.response?.data?.message || "Failed to add comment");
    }
  };

  const code = current.ticketCode || `TKT-${(current.id || "").slice(-3).toUpperCase()}`;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex" onClick={onClose}>
      <div className="ml-auto bg-slate-50 w-full max-w-2xl h-full overflow-y-auto shadow-2xl"
           onClick={(e) => e.stopPropagation()}>
        {/* ── Header ── */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-500 tracking-wider">{code}</span>
              <TicketStatusBadge status={current.status} />
              <TicketPriorityBadge priority={current.priority} />
              {current.category && (
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500">
                  {String(current.category).replace("_", " ")}
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-slate-800 leading-tight">{current.title}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* ── Meta strip ── */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <Meta icon={MapPin}  label="Location"  value={current.resourceId ? findResourceLabel(current.resourceId) : "—"} />
            <Meta icon={User}    label="Reporter"  value={current.reporterName || "—"} />
            <Meta icon={Wrench}  label="Assigned"  value={current.assignedTechnicianName || "Unassigned"} />
            <Meta icon={Calendar} label="Created"   value={fmt(current.createdAt)} />
          </div>

          {/* ── Description ── */}
          <Section title="Description">
            <p className="text-sm text-slate-700 whitespace-pre-line">{current.description}</p>
            {current.contactInfo && (
              <p className="text-xs text-slate-500 mt-2">Contact: {current.contactInfo}</p>
            )}
          </Section>

          {/* ── Image gallery ── */}
          {current.imageUrls?.length > 0 && (
            <Section title={`Attachments (${current.imageUrls.length})`}>
              <div className="grid grid-cols-3 gap-2">
                {current.imageUrls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer"
                     className="aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100 relative group">
                    <img
                      src={url}
                      alt={`attachment ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300 -z-10">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  </a>
                ))}
              </div>
            </Section>
          )}

          {/* ── Status update ── */}
          <Section title="Update Status">
            <form onSubmit={submitStatus} className="space-y-3">
              {choices.length === 0 ? (
                <p className="text-sm text-slate-500 italic">
                  This ticket is at a terminal state — no further transitions allowed.
                </p>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">New Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    >
                      {choices.map((s) => (
                        <option key={s} value={s}>{s.replace("_", " ")}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Resolution / Progress Note (optional)
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                      placeholder="Describe what was done or next steps..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={savingStatus}
                      className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-50"
                    >
                      {savingStatus ? "Updating..." : "Update Status"}
                    </button>
                  </div>
                </>
              )}
            </form>
            {current.resolutionNote && (
              <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <p className="text-xs font-semibold text-emerald-700 mb-1">Latest resolution note</p>
                <p className="text-sm text-emerald-800 whitespace-pre-line">{current.resolutionNote}</p>
              </div>
            )}
          </Section>

          {/* ── Activity / comments ── */}
          <Section title={`Activity (${current.comments?.length || 0})`}>
            <CommentThread comments={current.comments || []} onSubmit={submitComment} />
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 p-4">
      <h4 className="text-xs font-bold tracking-wider uppercase text-slate-500 mb-3">{title}</h4>
      {children}
    </div>
  );
}

function Meta({ icon: Icon, label, value }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-3 flex items-start gap-2.5">
      <Icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-700 truncate">{value}</p>
      </div>
    </div>
  );
}
