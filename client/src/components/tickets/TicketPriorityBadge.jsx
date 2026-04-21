// Spec colors: LOW slate, MEDIUM amber, HIGH orange, CRITICAL red.
const STYLES = {
  LOW:      "bg-slate-100  text-slate-700  border-slate-200",
  MEDIUM:   "bg-amber-50   text-amber-800  border-amber-200",
  HIGH:     "bg-orange-50  text-orange-700 border-orange-200",
  CRITICAL: "bg-rose-50    text-rose-700   border-rose-200",
};

export default function TicketPriorityBadge({ priority, className = "" }) {
  const cls = STYLES[priority] || STYLES.MEDIUM;
  const label = priority ? priority.charAt(0) + priority.slice(1).toLowerCase() : "—";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls} ${className}`}>
      {label}
    </span>
  );
}
