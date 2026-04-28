import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, CalendarCheck, ClipboardList, Bell, Wrench, ArrowRight, Clock } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import TicketCard from "../../components/tickets/TicketCard";
import StatusUpdateModal from "../../components/tickets/StatusUpdateModal";
import { useAuth } from "../../context/AuthContext";
import { getAuthUserProfile, getTechnicianTickets } from "../../services/ticketService";

export default function TechnicianDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openTicket, setOpenTicket] = useState(null);

  const refresh = async () => {
    setLoading(true);
    try {
      let techId = user?.id;
      if (!techId) {
        const profile = await getAuthUserProfile();
        techId = profile?.id;
      }
      
      if (!techId) return setTickets([]);
      
      const data = await getTechnicianTickets(techId);
      setTickets(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const openCount = useMemo(() => tickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length, [tickets]);
  const recent = useMemo(() => [...tickets].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5), [tickets]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  const firstName = (user?.name || "Technician").split(" ")[0];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Header />

        <div className="p-4 lg:p-6 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-gray-900 text-2xl font-semibold">Dashboard</h1>
              <p className="text-gray-500 text-sm mt-0.5">Facilities & Maintenance Overview</p>
            </div>
          </div>

          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard icon={ClipboardList} label="Assigned Tasks" value={loading ? "…" : openCount} hint="Action Required" tone="amber" />
            <KpiCard icon={Building2} label="Active Resources" value="—" hint="Module A Linked" tone="slate" />
            <KpiCard icon={CalendarCheck} label="My Bookings" value="—" hint="Module B Linked" tone="blue" />
            <KpiCard icon={Bell} label="Alerts" value="—" hint="System updates" tone="rose" />
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN */}
            <div className="xl:col-span-1 space-y-6">
              <section className="rounded-[24px] bg-gradient-to-br from-[#2F3A52] to-[#1F2937] p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/4 translate-x-1/4 pointer-events-none"></div>
                <div className="relative z-10">
                  <h2 className="text-xl font-semibold">{greeting}, {firstName}!</h2>
                  <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                    You have <strong className="text-white">{openCount} active tasks</strong> in your queue. Stay on top of maintenance to keep the campus running smoothly.
                  </p>
                  <button onClick={() => navigate("/staff/maintenance")} className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 py-2.5 text-sm font-semibold transition-all">
                    Open Task Board <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </section>

              <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 mb-4">Quick Links</h3>
                <div className="space-y-3">
                  <ActionCard icon={Wrench} title="Task Board" desc="View your assigned tickets" onClick={() => navigate("/staff/maintenance")} />
                  <ActionCard icon={Building2} title="Facilities" desc="Browse campus assets" onClick={() => navigate("/staff/facilities")} />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="xl:col-span-2 bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-slate-400" />
                  <h3 className="font-semibold text-slate-800">Recent Assignments</h3>
                </div>
                <button onClick={() => navigate("/staff/maintenance")} className="text-sm font-medium text-blue-600 hover:underline">
                  View All
                </button>
              </div>

              <div className="p-5 flex-1 bg-slate-50/30">
                {loading ? (
                  <div className="space-y-3">
                    {[0, 1, 2, 3].map((i) => <div key={i} className="h-20 rounded-[20px] bg-white border border-slate-100 animate-pulse" />)}
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
              </div>
            </div>

          </div>
        </div>
      </div>

      {openTicket && (
        <StatusUpdateModal ticket={openTicket} onClose={() => setOpenTicket(null)} onChanged={(updated) => { refresh(); setOpenTicket(updated ?? null); }} />
      )}
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, hint, tone }) {
  const tones = {
    slate: "bg-[#EEF2F7] text-[#2F3A52]", blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600", rose: "bg-rose-50 text-rose-600",
  };
  return (
    <div className="flex items-center gap-3 rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tones[tone] || tones.slate}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-slate-800 leading-tight">{value}</p>
        <p className="text-xs font-medium text-slate-500 mt-0.5 truncate">{label}</p>
      </div>
    </div>
  );
}

function ActionCard({ icon: Icon, title, desc, onClick }) {
  return (
    <button onClick={onClick} className="w-full group flex items-center gap-4 rounded-xl border border-transparent hover:border-slate-200 bg-slate-50 hover:bg-white p-3 text-left transition-all">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 group-hover:bg-[#2F3A52] group-hover:text-white transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
        <p className="text-[11px] text-slate-500">{desc}</p>
      </div>
      <ArrowRight className="w-4 h-4 ml-auto text-slate-300 group-hover:text-[#2F3A52] transition-colors" />
    </button>
  );
}

function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white border border-slate-100 shadow-sm">
        <ClipboardList className="w-6 h-6 text-slate-400" />
      </div>
      <p className="text-base font-semibold text-slate-800">No tasks assigned yet</p>
      <p className="mt-1 text-sm text-slate-500 max-w-xs">When administrators assign maintenance tasks to you, they will appear right here.</p>
    </div>
  );
}