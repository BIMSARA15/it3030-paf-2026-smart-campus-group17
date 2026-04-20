import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, CalendarCheck, ClipboardList, Bell, Plus, Wrench, ArrowRight } from "lucide-react";
import TechnicianTopBar from "../../components/layout/TechnicianTopBar";
import TicketCard from "../../components/tickets/TicketCard";
import StatusUpdateModal from "../../components/tickets/StatusUpdateModal";
import ReportIssueModal from "../../components/tickets/ReportIssueModal";
import { useAuth } from "../../context/AuthContext";
import { getTechnicianTickets } from "../../services/ticketService";

/**
 * Technician home — mirrors the Figma "Good evening, Mike" layout with
 * KPI cards, quick actions and the latest assigned tickets.
 *
 * The Active Resources / My Bookings KPIs are stubbed at 0 with a TODO
 * since they belong to Modules A and B.
 */
export default function TechnicianDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openTicket, setOpenTicket] = useState(null);
  const [showReport, setShowReport] = useState(false);

  const refresh = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await getTechnicianTickets(user.id);
      setTickets(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const openCount = useMemo(
    () => tickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length,
    [tickets]
  );

  const recent = useMemo(
    () => [...tickets].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4),
    [tickets]
  );

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  const firstName = (user?.name || "Mike").split(" ")[0];

  return (
    <>
      <TechnicianTopBar title="Dashboard" subtitle="Facilities Management" notifCount={1} />

      <div className="p-6 space-y-6">
        {user?.isPreview && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Preview mode is active. This dashboard is using local demo ticket data because backend authentication is currently blocked.
          </div>
        )}

        {/* Hero */}
        <section className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-bold">
              {greeting}, {firstName}!
            </h1>
            <p className="text-sm text-blue-100 mt-1">
              You have {openCount} open maintenance ticket{openCount === 1 ? "" : "s"} that need attention today.
            </p>
          </div>
          <button
            onClick={() => navigate("/staff/maintenance")}
            className="px-4 py-2.5 bg-white text-blue-700 text-sm font-semibold rounded-xl shadow-sm hover:bg-blue-50 inline-flex items-center gap-2"
          >
            View Tickets <ArrowRight className="w-4 h-4" />
          </button>
        </section>

        {/* KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard icon={Building2}     label="Active Resources"      value="—" hint="Module A" tone="blue" />
          <KpiCard icon={CalendarCheck} label="My Bookings"           value="—" hint="Module B" tone="emerald" />
          <KpiCard icon={ClipboardList} label="Assigned Tickets"      value={loading ? "…" : openCount} hint="Open + In Progress" tone="orange" />
          <KpiCard icon={Bell}          label="Unread Notifications"  value="—" hint="Coming soon" tone="rose" />
        </section>

        {/* Quick actions */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ActionCard
            icon={Plus}
            title="Report a New Issue"
            description="Log a fault for any campus resource."
            onClick={() => setShowReport(true)}
          />
          <ActionCard
            icon={Wrench}
            title="Manage Maintenance"
            description="View and update assigned tickets."
            onClick={() => navigate("/staff/maintenance")}
          />
        </section>

        {/* Recent tickets */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-700">Recent Maintenance Tickets</h3>
            <button
              onClick={() => navigate("/staff/maintenance")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              View all →
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-20 rounded-2xl bg-white border border-slate-100 animate-pulse" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {recent.map((t) => (
                <TicketCard key={t.id} ticket={t} onClick={() => setOpenTicket(t)} />
              ))}
            </div>
          )}
        </section>
      </div>

      {openTicket && (
        <StatusUpdateModal
          ticket={openTicket}
          onClose={() => setOpenTicket(null)}
          onChanged={() => {
            refresh();
            setOpenTicket(null);
          }}
        />
      )}
      {showReport && (
        <ReportIssueModal
          onClose={() => setShowReport(false)}
          onCreated={() => refresh()}
        />
      )}
    </>
  );
}

function KpiCard({ icon: Icon, label, value, hint, tone }) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
    rose: "bg-rose-50 text-rose-600",
  };
  return (
    <div className="rounded-2xl bg-white border border-slate-100 p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tones[tone] || tones.blue}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-xl font-bold text-slate-800 leading-tight">{value}</p>
        <p className="text-[11px] text-slate-400">{hint}</p>
      </div>
    </div>
  );
}

function ActionCard({ icon: Icon, title, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left rounded-2xl bg-white border border-slate-100 p-5 hover:shadow-md hover:border-slate-200 transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600">
          <Icon className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-800">{title}</h4>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
    </button>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl bg-white border border-dashed border-slate-200 p-10 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto mb-3 flex items-center justify-center">
        <Wrench className="w-5 h-5 text-slate-400" />
      </div>
      <p className="text-sm font-semibold text-slate-700">No tickets assigned yet</p>
      <p className="text-xs text-slate-500 mt-1">When admins assign you tickets they'll appear here.</p>
    </div>
  );
}
