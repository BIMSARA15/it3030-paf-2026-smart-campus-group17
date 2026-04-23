import React, { useState, useMemo } from 'react';
import {
  Plus, Search, X, Eye, Send, Edit2, Trash2,
  Wrench, AlertTriangle, CheckCircle, UserCheck,
  ChevronDown, MessageSquare, Image as ImageIcon,
} from 'lucide-react';

// Layout Components
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

// Contexts & Data
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { StatusBadge } from '../../components/StatusBadge';

// Helper function to replace date-fns
const timeAgo = (dateString) => {
  if (!dateString) return '';
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  if (seconds < 10) return "just now";
  return Math.floor(seconds) + " seconds ago";
};

// Dummy data for users 
const MOCK_USERS = [
  { id: '1', name: 'Admin User', role: 'ADMIN' },
  { id: '2', name: 'Tech Support', role: 'TECHNICIAN' },
];

const CATEGORIES = ['ELECTRICAL', 'PLUMBING', 'IT_EQUIPMENT', 'FURNITURE', 'HVAC', 'SAFETY', 'OTHER'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const catLabel = (c) => {
  if (!c) return '';
  if (c === 'IT_EQUIPMENT') return 'IT Equipment';
  if (c === 'HVAC') return 'HVAC';
  
  return c
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/* ─── Create Ticket Modal ────────────────────────────────────────────────── */
function CreateTicketModal({ resources, userId, onClose, onSubmit, theme }) {
  const [form, setForm] = useState({
    resourceId: resources && resources.length > 0 ? resources.id : '',
    category: 'IT_EQUIPMENT',
    description: '',
    priority: 'MEDIUM',
    contactInfo: '',
    images: [],
  });
  
  const [imgUrl, setImgUrl] = useState('');
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const addImage = () => {
    if (!imgUrl.trim() || form.images.length >= 3) return;
    set('images', [...form.images, imgUrl.trim()]);
    setImgUrl('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, reportedBy: userId });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z- flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-slate-800 font-semibold">Report a Maintenance Issue</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-slate-700 text-xs font-medium mb-1">Resource / Location *</label>
            <select required value={form.resourceId} onChange={(e) => set('resourceId', e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
              {resources?.map((r) => <option key={r.id} value={r.id}>{r.name} — {r.location || r.type}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 text-xs font-medium mb-1">Category *</label>
              <select required value={form.category} onChange={(e) => set('category', e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
                {CATEGORIES.map((c) => <option key={c} value={c}>{catLabel(c)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 text-xs font-medium mb-1">Priority *</label>
              <select required value={form.priority} onChange={(e) => set('priority', e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
                {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-slate-700 text-xs font-medium mb-1">Description *</label>
            <textarea required rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Describe the issue in detail…" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none" />
          </div>
          <div>
            <label className="block text-slate-700 text-xs font-medium mb-1">Contact Info *</label>
            <input required value={form.contactInfo} onChange={(e) => set('contactInfo', e.target.value)} placeholder="email@university.edu | Ext: 0000" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-slate-700 text-xs font-medium mb-1">Image Attachments (up to 3)</label>
            {form.images.map((img, i) => (
              <div key={i} className="flex items-center gap-2 mb-1.5">
                <img src={img} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
                <p className="text-slate-500 text-xs truncate flex-1">{img}</p>
                <button type="button" onClick={() => set('images', form.images.filter((_, j) => j !== i))} className="p-1 rounded hover:bg-red-50 text-red-500"><X size={12} /></button>
              </div>
            ))}
            {form.images.length < 3 && (
              <div className="flex gap-2">
                <input value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} placeholder="Paste image URL…" className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                <button type="button" onClick={addImage} className="px-3 py-2 bg-slate-100 rounded-lg text-slate-600 text-sm hover:bg-slate-200">Add</button>
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 text-sm hover:bg-slate-50">Cancel</button>
            <button type="submit" className={`flex-1 py-2.5 rounded-xl text-white text-sm transition-all border-t border-white/20 ${theme.gradientBtn}`}>
              Submit Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Ticket Detail Modal ────────────────────────────────────────────────── */
function TicketDetailModal({ ticket, onClose, resources, updateTicket, theme }) {
  const { user: currentUser } = useAuth(); 

  const resName = (id) => resources?.find((r) => r.id === id)?.name ?? '—';
  const userName = (id) => MOCK_USERS.find((u) => u.id === id)?.name ?? 'Unknown User';
  const isAdmin = currentUser?.role === 'ADMIN';
  const isTech = currentUser?.role === 'TECHNICIAN' || isAdmin;

  const [comment, setComment] = useState('');
  const [showStatusChange, setShowStatusChange] = useState(false);
  const [newStatus, setNewStatus] = useState(ticket.status);

  const statusFlow = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
  const canChangeStatus = isTech && !['CLOSED', 'REJECTED'].includes(ticket.status);

  const priorityBorder = {
    LOW: 'border-l-slate-300',
    MEDIUM: 'border-l-amber-400',
    HIGH: theme.priorityHighBorder,
    CRITICAL: 'border-l-red-600',
  };

  const handleStatusUpdate = () => {
    updateTicket(ticket.id, { status: newStatus });
    setShowStatusChange(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z- flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl max-h-[95vh] flex flex-col rounded-t-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <p className="text-slate-800 font-semibold text-sm">Ticket #{ticket.id.toUpperCase()}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <StatusBadge status={ticket.status} size="sm" />
              <StatusBadge status={ticket.priority} size="sm" />
              <span className="text-slate-400 text-xs">{catLabel(ticket.category)}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          <div className={`border-l-4 ${priorityBorder[ticket.priority]} pl-4 space-y-2`}>
            <p className="text-slate-800 text-sm">{ticket.description}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500">
              <span><span className="font-medium text-slate-600">Resource:</span> {resName(ticket.resourceId)}</span>
              <span><span className="font-medium text-slate-600">Reported by:</span> You</span>
              <span><span className="font-medium text-slate-600">Created:</span> {timeAgo(ticket.createdAt)}</span>
              <span className="col-span-2"><span className="font-medium text-slate-600">Contact:</span> {ticket.contactInfo}</span>
            </div>
          </div>

          {ticket.images.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 font-medium mb-2">ATTACHMENTS</p>
              <div className="flex gap-2">
                {ticket.images.map((img, i) => (
                  <img key={i} src={img} alt="" className="w-20 h-20 rounded-lg object-cover border border-slate-200" />
                ))}
              </div>
            </div>
          )}

          {canChangeStatus && (
            <button onClick={() => setShowStatusChange(!showStatusChange)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs hover:bg-slate-200 transition-colors">
              <ChevronDown size={13} /> Update Status
            </button>
          )}

          {showStatusChange && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
              <p className="text-slate-700 text-xs font-medium">Update Status</p>
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm outline-none bg-white">
                {statusFlow.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
              <div className="flex gap-2">
                <button onClick={() => setShowStatusChange(false)} className="flex-1 py-1.5 border border-slate-200 rounded-lg text-slate-600 text-xs">Cancel</button>
                <button onClick={handleStatusUpdate} className="flex-1 py-1.5 bg-slate-800 rounded-lg text-white text-xs">Update</button>
              </div>
            </div>
          )}

          <div>
            <p className="text-xs text-slate-500 font-medium mb-3 flex items-center gap-1.5">
              <MessageSquare size={12} /> COMMENTS (0)
            </p>
            <p className="text-slate-400 text-xs text-center py-4">No comments yet</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function Maintenance() {
  const { user: currentUser } = useAuth();
  const { resources } = useBooking();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Local state for tickets until backend is connected
  const [tickets, setTickets] = useState([]);

  const isAdmin = currentUser?.role === 'ADMIN';
  const isTech = currentUser?.role === 'TECHNICIAN';
  const isElevated = isAdmin || currentUser?.role === 'MANAGER';

  // THEME LOGIC
  const currentRole = (currentUser?.role || '').toUpperCase();
  const isLecturer = currentRole === 'LECTURER';

  const theme = {
    gradientBtn: isLecturer 
      ? 'bg-gradient-to-r from-[#8A3505] to-[#C54E08] hover:from-[#702A04] hover:to-[#A74106] shadow-[0_4px_12px_rgba(167,65,6,0.3)]' 
      : 'bg-gradient-to-r from-[#0F6657] to-[#17A38A] hover:from-[#0c5246] hover:to-[#128a74] shadow-[0_4px_12px_rgba(23,163,138,0.3)]',
    activeFilter: isLecturer
      ? 'bg-gradient-to-r from-[#8A3505] to-[#C54E08] text-white shadow-md border-t border-white/20'
      : 'bg-gradient-to-r from-[#0F6657] to-[#17A38A] text-white shadow-md border-t border-white/20',
    textAccent: isLecturer ? 'text-[#8A3505]' : 'text-[#0F6657]',
    bgAccent: isLecturer ? 'bg-[#8A3505]' : 'bg-[#0F6657]',
    lightBg: isLecturer ? 'bg-[#8A3505]/10' : 'bg-[#0F6657]/10',
    priorityHighBg: isLecturer ? 'bg-[#C54E08]' : 'bg-[#17A38A]',
    priorityHighBorder: isLecturer ? 'border-l-[#C54E08]' : 'border-l-[#17A38A]',
  };

  const [showCreate, setShowCreate] = useState(false);
  const [viewTicket, setViewTicket] = useState(null);
  const [tab, setTab] = useState(isTech ? 'assigned' : isElevated ? 'all' : 'mine');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [search, setSearch] = useState('');

  if (!currentUser) return null;

  const resName = (id) => resources?.find((r) => r.id === id)?.name ?? '—';

  const createTicket = (ticketData) => {
    const newTicket = {
      ...ticketData,
      id: `tkt-${Math.random().toString(36).substr(2, 5)}`,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      comments: []
    };
    setTickets([newTicket, ...tickets]);
  };

  const updateTicket = (id, updates) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, ...updates } : t));
    if (viewTicket?.id === id) {
      setViewTicket({ ...viewTicket, ...updates });
    }
  };

  const base = useMemo(() => {
    if (!tickets) return [];
    if (tab === 'assigned') return tickets.filter((t) => t.assignedTo === currentUser.id);
    if (tab === 'mine') return tickets.filter((t) => t.reportedBy === currentUser.id);
    return tickets;
  }, [tickets, tab, currentUser.id]);

  const visible = useMemo(() => base.filter((t) => {
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;
    if (filterCategory !== 'ALL' && t.category !== filterCategory) return false;
    if (search && !t.description.toLowerCase().includes(search.toLowerCase()) && !resName(t.resourceId).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [base, filterStatus, filterPriority, filterCategory, search]);

  const priorityDot = {
    LOW: 'bg-slate-400',
    MEDIUM: 'bg-amber-500',
    HIGH: theme.priorityHighBg,
    CRITICAL: 'bg-red-600',
  };

  const STATUS_LIST = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Header />
        
        <div className="p-4 lg:p-6 space-y-6">
          <div>
            <h1 className="text-gray-900 text-2xl font-semibold">Maintenance & Support</h1>
            <p className="text-gray-500 text-sm mt-0.5">Raise a new ticket or check the status of existing issues.</p>
          </div>

          <div className="max-w-6xl mx-auto space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[180px] relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tickets…" className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" />
              </div>
              <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:border-blue-500">
                <option value="ALL">All Priorities</option>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>)}
              </select>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:border-blue-500">
                <option value="ALL">All Categories</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{catLabel(c)}</option>)}
              </select>
              
              {/* Report Issue Button with Dynamic Gradient */}
              <button onClick={() => setShowCreate(true)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm transition-all border-t border-white/20 ${theme.gradientBtn}`}>
                <Plus size={15} /> Report Issue
              </button>
            </div>

            <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
              {(isTech ? ['assigned', 'mine'] : isElevated ? ['all', 'mine'] : ['mine']).map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${tab === t ? 'bg-white shadow-sm text-slate-800 font-medium' : 'text-slate-500 hover:text-slate-700'}`}>
                  {t === 'all' ? 'All Tickets' : t === 'mine' ? 'My Tickets' : 'Assigned to Me'}
                </button>
              ))}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {STATUS_LIST.map((s) => (
                <button 
                  key={s} 
                  onClick={() => setFilterStatus(s)} 
                  className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors border ${filterStatus === s ? theme.activeFilter : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                  {s === 'ALL' ? 'All' : catLabel(s)}
                  {' '}({(s === 'ALL' ? base : base.filter((t) => t.status === s)).length})
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {visible.length === 0 && (
                <div className="text-center py-20 text-slate-400 bg-white rounded-xl border border-slate-100">
                  <Wrench size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No tickets found</p>
                </div>
              )}
              {visible.map((t) => (
                <div key={t.id} className="bg-white rounded-xl border border-slate-100 p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="relative mt-0.5">
                      
                      {/* Ticket Wrench Icon background dynamic */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${theme.lightBg}`}>
                        <Wrench size={17} className={theme.textAccent} />
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${priorityDot[t.priority]}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="text-slate-500 text-xs font-mono">{t.id.toUpperCase()}</p>
                        <StatusBadge status={t.status} size="sm" />
                        <StatusBadge status={t.priority} size="sm" />
                        <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full">{catLabel(t.category)}</span>
                      </div>
                      <p className="text-slate-800 text-sm line-clamp-2">{t.description}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-slate-400 text-xs mt-1.5">
                        <span>{resName(t.resourceId)}</span>
                        <span>{timeAgo(t.createdAt)}</span>
                      </div>
                    </div>
                    <button onClick={() => setViewTicket(t)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors flex-shrink-0">
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modals with theme passed in */}
            {showCreate && (
              <CreateTicketModal resources={resources} userId={currentUser?.id} onClose={() => setShowCreate(false)} onSubmit={createTicket} theme={theme} />
            )}
            {viewTicket && (
              <TicketDetailModal ticket={tickets.find((t) => t.id === viewTicket.id) ?? viewTicket} onClose={() => setViewTicket(null)} resources={resources} updateTicket={updateTicket} theme={theme} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}