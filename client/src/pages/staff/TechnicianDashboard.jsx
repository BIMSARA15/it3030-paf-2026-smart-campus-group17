import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, CalendarCheck, ClipboardList, Bell, Plus, Wrench, ArrowRight } from "lucide-react";
import TechnicianTopBar from "../../components/layout/TechnicianTopBar";
import TicketCard from "../../components/tickets/TicketCard";
import StatusUpdateModal from "../../components/tickets/StatusUpdateModal";
import ReportIssueModal from "../../components/tickets/ReportIssueModal";
import { useAuth } from "../../context/AuthContext";
import { getTechnicianTickets } from "../../services/ticketService";

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
          <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Preview mode is active. This dashboard is using local demo ticket data because backend authentication is currently blocked.
          </div>
        )}

        <section className="rounded-[30px] bg-gradient-to-r from-[#2F3A52] via-[#35435F] to-[#3C4C6C] px-6 py-6 text-white shadow-[0_20px_50px_rgba(47,58,82,0.18)]">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-semibold">
                {greeting}, {firstName}!
              </h1>
              <p className="mt-1 text-sm text-slate-200">
                You have {openCount} open maintenance ticket{openCount === 1 ? "" : "s"} that need attention today.
              </p>
            </div>
            <button
              onClick={() => navigate("/staff/maintenance")}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-[#2F3A52] shadow-sm transition hover:bg-slate-100"
            >
              View Tickets <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard icon={Building2} label="Active Resources" value="—" hint="Module A" tone="slate" />
          <KpiCard icon={CalendarCheck} label="My Bookings" value="—" hint="Module B" tone="blue" />
          <KpiCard icon={ClipboardList} label="Assigned Tickets" value={loading ? "…" : openCount} hint="Open + In Progress" tone="amber" />
          <KpiCard icon={Bell} label="Unread Notifications" value="—" hint="Coming soon" tone="rose" />
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Recent Maintenance Tickets</h3>
            <button
              onClick={() => navigate("/staff/maintenance")}
              className="text-xs font-semibold text-[#2F3A52] hover:text-[#1F2937]"
            >
              View all →
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-20 rounded-[24px] border border-slate-200 bg-white animate-pulse" />
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
    slate: "bg-[#EEF2F7] text-[#2F3A52]",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
  };

  return (
    <div className="flex items-center gap-3 rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tones[tone] || tones.slate}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
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
      className="group rounded-[24px] border border-slate-200 bg-white p-5 text-left shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition-all hover:border-slate-300 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF2F7] text-[#2F3A52] transition group-hover:bg-[#2F3A52] group-hover:text-white">
          <Icon className="w-5 h-5" />
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
    <div className="rounded-[28px] border border-dashed border-slate-200 bg-white p-10 text-center shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF2F7]">
        <Wrench className="w-5 h-5 text-[#2F3A52]" />
      </div>
      <p className="text-sm font-semibold text-slate-700">No tickets assigned yet</p>
      <p className="mt-1 text-xs text-slate-500">When admins assign you tickets they'll appear here.</p>
    </div>
  );
}
