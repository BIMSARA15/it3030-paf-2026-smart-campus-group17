import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Plus, Search, Wrench, X } from 'lucide-react';

import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import ReportIssueModal from '../../components/tickets/ReportIssueModal';
import TicketCard from '../../components/tickets/TicketCard';
import TicketStatusBadge from '../../components/tickets/TicketStatusBadge';
import TicketPriorityBadge from '../../components/tickets/TicketPriorityBadge';
import CommentThread from '../../components/tickets/CommentThread';
import { findResourceLabel } from '../../data/resources';
import {
  getAuthUserProfile,
  getMyTickets,
  getAllTickets,
  getTicketById,
  addComment,
} from '../../services/ticketService';

const CATEGORIES = ['ELECTRICAL', 'PLUMBING', 'IT_EQUIPMENT', 'FURNITURE', 'HVAC', 'SAFETY', 'OTHER'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const catLabel = (c) => {
  if (!c) return '';
  if (c === 'IT_EQUIPMENT') return 'IT Equipment';
  if (c === 'HVAC') return 'HVAC';
  return c
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function TicketViewModal({ ticket, onClose, onTicketUpdated }) {
  const [current, setCurrent] = useState(ticket);

  useEffect(() => {
    setCurrent(ticket);
  }, [ticket?.id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const fresh = await getTicketById(ticket.id);
        if (!cancelled) setCurrent(fresh);
      } catch {
        /* keep list copy */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ticket?.id]);

  const code = current.ticketCode || (current.id ? `TKT-${String(current.id).slice(-3).toUpperCase()}` : 'TKT');

  const postComment = async (message) => {
    const updated = await addComment(current.id, message);
    setCurrent(updated);
    onTicketUpdated?.(updated);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-lg sm:rounded-2xl max-h-[95vh] flex flex-col rounded-t-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <p className="text-slate-800 font-semibold text-sm">{code}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <TicketStatusBadge status={current.status} />
              <TicketPriorityBadge priority={current.priority} />
              {current.category && (
                <span className="text-slate-400 text-xs">{catLabel(current.category)}</span>
              )}
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          <div className="rounded-xl border border-slate-100 p-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Title</p>
            <p className="text-sm font-semibold text-slate-800">{current.title || '—'}</p>
            <p className="text-sm text-slate-700 whitespace-pre-line">{current.description}</p>
            <div className="grid grid-cols-1 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-50">
              {current.resourceId && (
                <p>
                  <span className="font-medium text-slate-700">Location: </span>
                  {findResourceLabel(current.resourceId)}
                </p>
              )}
              <p>
                <span className="font-medium text-slate-700">Assigned to: </span>
                {current.assignedTechnicianName ||
                  (current.assignedTechnicianId
                    ? `Technician (${current.assignedTechnicianId})`
                    : 'Pending assignment')}
              </p>
              <p>
                <span className="font-medium text-slate-700">Created: </span>
                {fmt(current.createdAt)}
              </p>
              {current.contactInfo && (
                <p>
                  <span className="font-medium text-slate-700">Contact: </span>
                  {current.contactInfo}
                </p>
              )}
            </div>
          </div>

          {current.imageUrls?.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 font-medium mb-2">ATTACHMENTS</p>
              <div className="flex gap-2 flex-wrap">
                {current.imageUrls.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200"
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-slate-100 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Activity ({current.comments?.length || 0})
            </p>
            <CommentThread comments={current.comments || []} onSubmit={postComment} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Maintenance() {
  const { user: currentUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [sessionUserId, setSessionUserId] = useState(null);

  const isAdmin = currentUser?.role === 'ADMIN';

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

  const [showReport, setShowReport] = useState(false);
  const [viewTicket, setViewTicket] = useState(null);
  const [tab, setTab] = useState(isAdmin ? 'all' : 'mine');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const profile = await getAuthUserProfile();
      if (!cancelled) setSessionUserId(profile?.id ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [currentUser?.email]);

  const refreshTickets = useCallback(async () => {
    if (!sessionUserId) {
      setTickets([]);
      setListLoading(false);
      return;
    }
    setListLoading(true);
    try {
      if (tab === 'all' && isAdmin) {
        const data = await getAllTickets();
        setTickets(Array.isArray(data) ? data : []);
      } else {
        const data = await getMyTickets(sessionUserId);
        setTickets(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to load tickets', e);
      setTickets([]);
    } finally {
      setListLoading(false);
    }
  }, [sessionUserId, tab, isAdmin]);

  useEffect(() => {
    refreshTickets();
  }, [refreshTickets]);

  const mergeTicketIntoList = useCallback((updated) => {
    if (!updated?.id) return;
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)));
  }, []);

  if (!currentUser) return null;

  const resourceLabel = (id) => (id ? findResourceLabel(id) : '');

  const visible = useMemo(() => {
    return tickets.filter((t) => {
      if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
      if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;
      if (filterCategory !== 'ALL' && t.category !== filterCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        const desc = (t.description || '').toLowerCase();
        const title = (t.title || '').toLowerCase();
        const loc = resourceLabel(t.resourceId).toLowerCase();
        const code = (t.ticketCode || '').toLowerCase();
        if (!desc.includes(q) && !title.includes(q) && !loc.includes(q) && !code.includes(q)) return false;
      }
      return true;
    });
  }, [tickets, filterStatus, filterPriority, filterCategory, search]);

  const baseForCounts = tickets;

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
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tickets…"
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500"
                />
              </div>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:border-blue-500"
              >
                <option value="ALL">All Priorities</option>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0) + p.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:border-blue-500"
              >
                <option value="ALL">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {catLabel(c)}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setShowReport(true)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm transition-all border-t border-white/20 ${theme.gradientBtn}`}
              >
                <Plus size={15} /> Report Issue
              </button>
            </div>

            <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
              {(isAdmin ? ['all', 'mine'] : ['mine']).map((tname) => (
                <button
                  key={tname}
                  type="button"
                  onClick={() => setTab(tname)}
                  className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${
                    tab === tname ? 'bg-white shadow-sm text-slate-800 font-medium' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tname === 'all' ? 'All Tickets' : 'My Tickets'}
                </button>
              ))}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {STATUS_LIST.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors border ${
                    filterStatus === s
                      ? theme.activeFilter
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {s === 'ALL' ? 'All' : catLabel(s)}{' '}
                  ({(s === 'ALL' ? baseForCounts : baseForCounts.filter((t) => t.status === s)).length})
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {listLoading && (
                <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-slate-100">
                  Loading tickets…
                </div>
              )}
              {!listLoading && visible.length === 0 && (
                <div className="text-center py-20 text-slate-400 bg-white rounded-xl border border-slate-100">
                  <Wrench size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No tickets found</p>
                </div>
              )}
              {!listLoading &&
                visible.map((t) => (
                  <TicketCard key={t.id} ticket={t} onClick={() => setViewTicket(t)} />
                ))}
            </div>

            {showReport && (
              <ReportIssueModal
                onClose={() => setShowReport(false)}
                onCreated={() => {
                  refreshTickets();
                }}
              />
            )}
            {viewTicket && (
              <TicketViewModal
                ticket={viewTicket}
                onClose={() => setViewTicket(null)}
                onTicketUpdated={(updated) => {
                  mergeTicketIntoList(updated);
                  setViewTicket((v) => (v && v.id === updated.id ? { ...v, ...updated } : v));
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
