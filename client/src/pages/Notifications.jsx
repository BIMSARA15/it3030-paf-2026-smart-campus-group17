// src/pages/Notifications.jsx
import React, { useState, useEffect } from 'react';
import {
  Bell, CheckCheck, CheckCircle, XCircle, Wrench, MessageSquare, UserCheck, Trash2, X, Check, ListChecks
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { 
  getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, deleteMultipleNotifications 
} from '../services/api';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const typeConfig = {
  BOOKING_APPROVED:      { icon: CheckCircle,   label: 'Booking Approved',      bg: 'bg-emerald-100', ic: 'text-emerald-600' },
  BOOKING_REJECTED:      { icon: XCircle,       label: 'Booking Rejected',      bg: 'bg-red-100',     ic: 'text-red-600'     },
  BOOKING_CANCELLED:     { icon: XCircle,       label: 'Booking Cancelled',     bg: 'bg-slate-100',   ic: 'text-slate-500'   },
  TICKET_STATUS_CHANGED: { icon: Wrench,        label: 'Ticket Updated',        bg: 'bg-orange-100',  ic: 'text-orange-600'  },
  TICKET_ASSIGNED:       { icon: UserCheck,     label: 'Ticket Assigned',       bg: 'bg-blue-100',    ic: 'text-blue-600'    },
  NEW_COMMENT:           { icon: MessageSquare, label: 'New Comment',           bg: 'bg-purple-100',  ic: 'text-purple-600'  },
  SLA_WARNING:           { icon: Bell,          label: 'SLA Warning',           bg: 'bg-amber-100',   ic: 'text-amber-600'   },
  SLA_OVERDUE:           { icon: Bell,          label: 'SLA Overdue',           bg: 'bg-red-100',     ic: 'text-red-600'     },
  TICKET_RESOLVED:       { icon: CheckCircle,   label: 'Ticket Resolved',       bg: 'bg-emerald-100', ic: 'text-emerald-600' },
  DEFAULT:               { icon: Bell,          label: 'Notification',          bg: 'bg-slate-100',   ic: 'text-slate-600'   }
};

export default function Notifications() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('ALL');
  const [notifications, setNotifications] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // NEW: Selection State
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Modal State
  const [selectedNotif, setSelectedNotif] = useState(null);

  useEffect(() => {
    if (!user) return;
    const identifier = user.id || user.email;

    const fetchInitial = async () => {
      try {
        const data = await getUserNotifications();
        setNotifications(data);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };
    fetchInitial();

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      onConnect: () => {
        client.subscribe(`/topic/notifications/${identifier}`, (message) => {
          const newNotif = JSON.parse(message.body);
          setNotifications((prev) => [newNotif, ...prev]);
        });
      }
    });
    client.activate();
    return () => client.deactivate();
  }, [user]);

  if (!user) return null;

  // Actions
  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id)); // Remove from selection if deleted
    } catch (error) {
      console.error("Error deleting notification", error);
    }
  };

  // --- NEW: BULK DELETE & SELECTION ACTIONS ---
  const toggleSelection = (e, id) => {
    e.stopPropagation();
    setSelectedIds((prev) => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    try {
      await deleteMultipleNotifications(selectedIds);
      setNotifications((prev) => prev.filter((n) => !selectedIds.includes(n.id)));
      setSelectedIds([]);
    } catch (error) {
      console.error("Error bulk deleting notifications", error);
    }
  };

  const openNotificationModal = async (n) => {
    setSelectedNotif(n);
    if (!n.read) {
      await markNotificationAsRead(n.id);
      setNotifications((prev) => prev.map((item) => (item.id === n.id ? { ...item, read: true } : item)));
    }
  };

  // Data Filtering
  const unreadCount = notifications.filter((n) => !n.read).length;
  const visible = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.read;
    if (filter !== 'ALL') return n.type === filter;
    return true;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Handle "Select All" based on what is currently VISIBLE
  const toggleSelectAll = () => {
    if (selectedIds.length === visible.length && visible.length > 0) {
      setSelectedIds([]); // Deselect all
    } else {
      setSelectedIds(visible.map(n => n.id)); // Select all visible
    }
  };

  const FILTER_TABS = [
    { key: 'ALL', label: `All (${notifications.length})` },
    { key: 'UNREAD', label: `Unread (${unreadCount})` },
    { key: 'BOOKING_APPROVED', label: 'Bookings' },
    { key: 'TICKET_STATUS_CHANGED', label: 'Tickets' },
    { key: 'NEW_COMMENT', label: 'Comments' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Header />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-3xl mx-auto space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-1">Notifications</h1>
                <p className="text-slate-500 text-sm">{unreadCount > 0 ? `You have ${unreadCount} unread messages` : "You're all caught up!"}</p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-100 hover:text-blue-600 transition-colors shadow-sm"
                >
                  <CheckCheck size={16} /> Mark all as read
                </button>
              )}
            </div>

            {/* Filters Row + Selection Tools */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
              
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {FILTER_TABS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => {
                      setFilter(key);
                      setSelectedIds([]); // Clear selection when changing tabs
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all shadow-sm ${
                      filter === key ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* NEW: Bulk Action Controls */}
              {visible.length > 0 && (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={toggleSelectAll} 
                    className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors px-2"
                  >
                    <ListChecks size={18} />
                    {selectedIds.length === visible.length ? 'Deselect All' : 'Select All'}
                  </button>
                  
                  {selectedIds.length > 0 && (
                    <button 
                      onClick={handleBulkDelete}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 hover:border-red-200 text-sm font-semibold shadow-sm transition-all animate-in fade-in zoom-in-95 duration-200"
                    >
                      <Trash2 size={16} /> Delete ({selectedIds.length})
                    </button>
                  )}
                </div>
              )}
            </div>

            {visible.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <Bell size={50} className="mx-auto mb-4 text-slate-300" />
                <p className="text-lg font-bold text-slate-700">No notifications found</p>
                <p className="text-sm text-slate-500 mt-1">Check back later for updates.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {visible.map((n) => {
                  const cfg = typeConfig[n.type] || typeConfig.DEFAULT;
                  const Icon = cfg.icon;
                  const isSelected = selectedIds.includes(n.id);
                  
                  return (
                    <div
                      key={n.id}
                      onClick={() => openNotificationModal(n)}
                      className={`relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 cursor-pointer group hover:shadow-md hover:-translate-y-0.5
                        ${isSelected ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-300' : n.read ? 'bg-white border-slate-100' : 'bg-blue-50/40 border-blue-200 shadow-sm'}`}
                    >
                      {/* NEW: Custom Checkbox */}
                      <div 
                        onClick={(e) => toggleSelection(e, n.id)}
                        className={`w-5 h-5 rounded flex items-center justify-center border shadow-sm transition-all duration-200 ${
                          isSelected ? 'bg-blue-600 border-blue-600 text-white scale-110' : 'bg-white border-slate-300 text-transparent group-hover:border-blue-400'
                        }`}
                      >
                        <Check size={14} strokeWidth={3} />
                      </div>

                      {/* Unread dot */}
                      {!n.read && <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]" />}

                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${cfg.bg}`}>
                        <Icon size={20} className={cfg.ic} />
                      </div>

                      <div className="flex-1 min-w-0 pr-12">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-xs font-bold uppercase tracking-wider ${n.read ? 'text-slate-500' : 'text-blue-700'}`}>
                            {cfg.label}
                          </span>
                          <span className="text-slate-400 text-[10px] font-medium">• {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : 'Just now'}</span>
                        </div>
                        <p className={`text-sm line-clamp-1 ${n.read ? 'text-slate-600' : 'text-slate-900 font-medium'}`}>
                          {n.message}
                        </p>
                      </div>

                      <button
                        onClick={(e) => handleDelete(e, n.id)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete notification"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {selectedNotif && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full relative shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setSelectedNotif(null)} 
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${typeConfig[selectedNotif.type]?.bg || typeConfig.DEFAULT.bg}`}>
              {React.createElement(typeConfig[selectedNotif.type]?.icon || typeConfig.DEFAULT.icon, { 
                size: 28, 
                className: typeConfig[selectedNotif.type]?.ic || typeConfig.DEFAULT.ic 
              })}
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-2 pr-8 leading-tight">
              {selectedNotif.title}
            </h2>
            
            <p className="text-xs font-semibold text-slate-400 mb-6 uppercase tracking-wider">
              {new Date(selectedNotif.createdAt).toLocaleString('en-US', { 
                weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' 
              })}
            </p>
            
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-6">
              <p className="text-slate-700 text-[15px] whitespace-pre-wrap leading-relaxed">
                {selectedNotif.message}
              </p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={(e) => { handleDelete(e, selectedNotif.id); setSelectedNotif(null); }}
                className="flex-1 bg-white border border-red-200 text-red-600 py-3 rounded-xl hover:bg-red-50 transition-colors font-semibold shadow-sm flex justify-center items-center gap-2"
              >
                <Trash2 size={18} /> Delete
              </button>
              <button 
                onClick={() => setSelectedNotif(null)}
                className="flex-1 bg-slate-900 text-white py-3 rounded-xl hover:bg-slate-800 transition-colors font-semibold shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
