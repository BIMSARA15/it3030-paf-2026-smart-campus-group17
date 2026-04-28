import { useEffect, useMemo, useState } from "react";
import { Search, Wrench, ArrowUpDown } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import TicketCard from "../../components/tickets/TicketCard";
import StatusUpdateModal from "../../components/tickets/StatusUpdateModal";
import { useAuth } from "../../context/AuthContext";
import { getTechnicianTickets, getAuthUserProfile } from "../../services/ticketService";

const STATUS_TABS = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];
const PRIORITIES = ["ALL", "LOW", "MEDIUM", "HIGH", "CRITICAL"];
const CATEGORIES = ["ALL", "IT_EQUIPMENT", "FURNITURE", "HVAC", "ELECTRICAL", "SAFETY", "OTHER"];

export default function TechnicianMaintenance() {
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  
  // NEW: State for sorting
  const [sortOrder, setSortOrder] = useState("NEWEST");

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openTicket, setOpenTicket] = useState(null);
  const [toast, setToast] = useState(null);

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      let techId = user?.id;
      if (!techId) {
        const profile = await getAuthUserProfile();
        techId = profile?.id;
      }

      if (!techId) {
        setTickets([]);
        return;
      }

      // Technicians only see tickets assigned to them
      const data = await getTechnicianTickets(techId);
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
  }, [user?.id]);

  const counts = useMemo(() => {
    const c = { ALL: tickets.length };
    STATUS_TABS.slice(1).forEach((s) => {
      c[s] = tickets.filter((t) => t.status === s).length;
    });
    return c;
  }, [tickets]);

  // UPDATED: Now filters and then sorts the tickets based on the selected order
  const visible = useMemo(() => {
    let filtered = tickets.filter((t) => {
      if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
      if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false;
      if (categoryFilter !== "ALL" && t.category !== categoryFilter) return false;
      if (search) {
        const blob = `${t.title} ${t.description} ${t.ticketCode}`.toLowerCase();
        if (!blob.includes(search.toLowerCase())) return false;
      }
      return true;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortOrder === "NEWEST") {
        return new Date(b.createdAt) - new Date(a.createdAt); // Most recent first
      } else {
        return new Date(a.createdAt) - new Date(b.createdAt); // Oldest first
      }
    });

    return filtered;
  }, [tickets, statusFilter, priorityFilter, categoryFilter, search, sortOrder]);

  const flash = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Header />

        <div className="p-4 lg:p-6 space-y-5">
          <div>
            <h1 className="text-gray-900 text-2xl font-semibold">Maintenance Tasks</h1>
            <p className="text-gray-500 text-sm mt-0.5">Manage your assigned facility tickets</p>
          </div>

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

          {/* Search + filters + Sort (UPDATED LAYOUT GRID) */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto_auto] gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tickets by code, title or description..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2F3A52]"
              />
            </div>
            
            {/* NEW: Sort Dropdown */}
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="pl-9 pr-8 py-2 w-full lg:w-auto border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2F3A52] appearance-none"
              >
                <option value="NEWEST">Newest First</option>
                <option value="OLDEST">Oldest First</option>
              </select>
            </div>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2F3A52]"
            >
              {PRIORITIES.map((p) => <option key={p} value={p}>{p === "ALL" ? "All Priorities" : p}</option>)}
            </select>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2F3A52]"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c === "ALL" ? "All Categories" : c.replace("_", " ")}</option>)}
            </select>
          </div>

          {/* List */}
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-2xl bg-white border border-slate-100 animate-pulse" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="rounded-2xl bg-white border border-dashed border-slate-200 p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto mb-3 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700">No tickets found</p>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {visible.map((t) => (
                <TicketCard key={t.id} ticket={t} onClick={() => setOpenTicket(t)} />
              ))}
            </div>
          )}
        </div>
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
    </div>
  );
}