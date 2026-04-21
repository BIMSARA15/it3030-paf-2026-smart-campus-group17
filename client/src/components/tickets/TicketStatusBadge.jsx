// Color-coded pill matching the Figma maintenance views.
// Spec colors: OPEN red, IN_PROGRESS amber, RESOLVED green, CLOSED slate, REJECTED zinc.
const STYLES = {
  OPEN:        { label: "Open",        cls: "bg-rose-50    text-rose-700    border-rose-200" },
  IN_PROGRESS: { label: "In Progress", cls: "bg-amber-50   text-amber-800   border-amber-200" },
  RESOLVED:    { label: "Resolved",    cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  CLOSED:      { label: "Closed",      cls: "bg-slate-100  text-slate-700   border-slate-200" },
  REJECTED:    { label: "Rejected",    cls: "bg-zinc-100   text-zinc-700    border-zinc-200" },
};

export default function TicketStatusBadge({ status, className = "" }) {
  const s = STYLES[status] || STYLES.OPEN;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.cls} ${className}`}
    >
      {s.label}
    </span>
  );
}
