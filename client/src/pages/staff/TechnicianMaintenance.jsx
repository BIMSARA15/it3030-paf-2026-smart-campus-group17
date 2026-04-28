import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Wrench } from "lucide-react";
import TechnicianTopBar from "../../components/layout/TechnicianTopBar";
import TicketCard from "../../components/tickets/TicketCard";
import StatusUpdateModal from "../../components/tickets/StatusUpdateModal";
import ReportIssueModal from "../../components/tickets/ReportIssueModal";
import { useAuth } from "../../context/AuthContext";
import { getAuthUserProfile, getTechnicianTickets, getMyTickets } from "../../services/ticketService";

const STATUS_TABS = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];
const PRIORITIES = ["ALL", "LOW", "MEDIUM", "HIGH", "CRITICAL"];
const CATEGORIES = ["ALL", "IT_EQUIPMENT", "FURNITURE", "HVAC", "ELECTRICAL", "SAFETY", "OTHER"];
const SORT_OPTIONS = [
  { value: "NEWEST", label: "Newest First" },
  { value: "OLDEST", label: "Oldest First" },
  { value: "PRIORITY", label: "Priority: High to Low" },
];
const PRIORITY_RANK = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

/**
 * Maintenance workspace for technicians:
 *  - "Assigned to Me" tab: tickets where assignedTechnicianId == me.
 *  - "My Tickets" tab: tickets I personally reported.
 *  - Status filter pills (with counts), search box, priority + category dropdowns.
 *  - "+ Report Issue" opens the ReportIssueModal.
 *  - Clicking a card opens the StatusUpdateModal (also handles comments).
 */
export default function TechnicianMaintenance() {
  const { user } = useAuth();

  const [tab, setTab] = useState("ASSIGNED");        // ASSIGNED | REPORTED
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [sort, setSort] = useState("NEWEST");
  const [search, setSearch] = useState("");

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openTicket, setOpenTicket] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [toast, setToast] = useState(null);

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      let profile = null;
      try {
        profile = await getAuthUserProfile();
      } catch (profileError) {
        if (!user?.id) throw profileError;
      }

      const technicianId = profile?.id || user?.id;
      if (!technicianId) {
        setTickets([]);
        setError("Unable to identify the logged-in technician.");
        return;
      }

      const data = tab === "ASSIGNED"
        ? await getTechnicianTickets(technicianId)
        : await getMyTickets(technicianId);
      setTickets(data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, tab]);

  const counts = useMemo(() => {
    const c = { ALL: tickets.length };
    STATUS_TABS.slice(1).forEach((s) => {
      c[s] = tickets.filter((t) => t.status === s).length;
    });
    return c;
  }, [tickets]);

  const visible = useMemo(() => {
    const filtered = tickets.filter((t) => {
      if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
      if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false;
      if (categoryFilter !== "ALL" && t.category !== categoryFilter) return false;
      if (search) {
        const blob = `${t.title} ${t.description} ${t.ticketCode} ${t.category} ${t.priority} ${t.status} ${t.assignedTechnicianName}`.toLowerCase();
        if (!blob.includes(search.toLowerCase())) return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "OLDEST") {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      if (sort === "PRIORITY") {
        const priorityDiff = (PRIORITY_RANK[b.priority] || 0) - (PRIORITY_RANK[a.priority] || 0);
        if (priorityDiff !== 0) return priorityDiff;
      }
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [tickets, statusFilter, priorityFilter, categoryFilter, search, sort]);

  const flash = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <>
      <TechnicianTopBar title="Maintenance" subtitle="Facilities Management" notifCount={1} />

      <div className="p-6 space-y-5">
        {user?.isPreview && (
          <div className="p-3 rounded-xl text-sm bg-amber-50 border border-amber-200 text-amber-800">
            Preview mode is active. Ticket actions on this screen are saved only in your browser for local UI testing.
          </div>
        )}

        {toast && (
          <div className={`p-3 rounded-xl text-sm ${
            toast.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
              : "bg-rose-50 border border-rose-200 text-rose-700"
          }`}>
            {toast.msg}
          </div>
        )}
        {error && (
          <div className="p-3 rounded-xl text-sm bg-rose-50 border border-rose-200 text-rose-700">
            {error}
          </div>
        )}

        {/* Tabs + Report button */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="inline-flex bg-slate-100 p-1 rounded-xl">
            <TabBtn active={tab === "ASSIGNED"} onClick={() => setTab("ASSIGNED")}>Assigned to Me</TabBtn>
            <TabBtn active={tab === "REPORTED"} onClick={() => setTab("REPORTED")}>My Tickets</TabBtn>
          </div>
          <button
            onClick={() => setShowReport(true)}
            className="px-4 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 inline-flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Report Issue
          </button>
        </div>

        {/* Status pill row with counts */}
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                statusFilter === s
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              {s.replace("_", " ")} <span className="opacity-70">({counts[s] ?? 0})</span>
            </button>
          ))}
        </div>

        {/* Search + filters */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets by code, title or description..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            {PRIORITIES.map((p) => <option key={p} value={p}>{p === "ALL" ? "All Priorities" : p}</option>)}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c === "ALL" ? "All Categories" : c.replace("_", " ")}</option>)}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>

        {/* List */}
        {loading ? (
          <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center">
            <div className="mx-auto mb-3 h-10 w-10 rounded-full border-4 border-slate-100 border-t-orange-400 animate-spin" />
            <p className="text-sm font-semibold text-slate-700">
              {tab === "ASSIGNED" ? "Loading assigned tickets..." : "Loading tickets..."}
            </p>
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl bg-white border border-dashed border-slate-200 p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto mb-3 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              {tickets.length === 0 && tab === "ASSIGNED" ? "No tickets assigned to you yet." : "No tickets found"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {tickets.length === 0 && tab === "ASSIGNED"
                ? "When admins assign you tickets they'll appear here."
                : "Try a different filter or report a new issue."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((t) => (
              <TicketCard key={t.id} ticket={t} onClick={() => setOpenTicket(t)} />
            ))}
          </div>
        )}
      </div>

      {openTicket && (
        <StatusUpdateModal
          ticket={openTicket}
          onClose={() => setOpenTicket(null)}
          onChanged={(updated, kind) => {
            refresh();
            setOpenTicket(updated || null);
            flash(kind === "comment" ? "Comment added." : "Status updated.");
          }}
          onError={(msg) => flash(msg, "error")}
        />
      )}
      {showReport && (
        <ReportIssueModal
          onClose={() => setShowReport(false)}
          onCreated={() => {
            refresh();
            flash("Ticket submitted.");
          }}
        />
      )}
    </>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
        active ? "bg-white shadow text-slate-800" : "text-slate-500 hover:text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}
