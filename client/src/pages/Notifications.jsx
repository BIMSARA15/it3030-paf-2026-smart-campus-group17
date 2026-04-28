// src/pages/Notifications.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, CheckCheck, CheckCircle, XCircle, Wrench, MessageSquare, 
  UserCheck, Trash2, X, Check, ListChecks, Clock, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { 
  getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, 
  deleteNotification, deleteMultipleNotifications 
} from '../services/api';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

// Dynamically determine the icon/badge style based on the backend plain-text message
const getNotifStyle = (n) => {
  const text = (n?.title + " " + n?.message).toUpperCase();
  
  if (text.includes("APPROVED")) return { icon: CheckCircle, label: 'Approved', bg: 'bg-emerald-100', ic: 'text-emerald-600', tab: 'BOOKING' };
  if (text.includes("REJECTED")) return { icon: XCircle, label: 'Rejected', bg: 'bg-red-100', ic: 'text-red-600', tab: 'BOOKING' };
  if (text.includes("CANCELLED") || text.includes("CANCELED")) return { icon: XCircle, label: 'Cancelled', bg: 'bg-slate-100', ic: 'text-slate-500', tab: 'BOOKING' };
  if (text.includes("PENDING") || text.includes("NEW BOOKING")) return { icon: Clock, label: 'Pending Review', bg: 'bg-amber-100', ic: 'text-amber-600', tab: 'BOOKING' };
  if (text.includes("TICKET") || text.includes("TECHNICIAN")) return { icon: Wrench, label: 'Support Ticket', bg: 'bg-blue-100', ic: 'text-blue-600', tab: 'TICKET' };
  
  return { icon: Bell, label: 'Notification', bg: 'bg-slate-100', ic: 'text-slate-600', tab: 'OTHER' };
};

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('ALL');
  const [notifications, setNotifications] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedNotif, setSelectedNotif] = useState(null);

  // INDUSTRY STANDARD: Memoized Theme Configuration based on User Role
  const theme = useMemo(() => {
    const role = (user?.role || '').toUpperCase();
    
    if (role === 'ADMIN') return {
      text: 'text-[#1E3A8A]',
      hoverText: 'hover:text-[#2563EB]',
      border: 'border-[#1E3A8A]',
      ring: 'ring-[#2563EB]/40',
      gradient: 'bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] hover:from-[#172554] hover:to-[#1D4ED8]',
      shadow: 'shadow-[0_4px_12px_rgba(37,99,235,0.3)]'
    };
    
    if (role === 'LECTURER') return {
      text: 'text-[#A74106]',
      hoverText: 'hover:text-[#C54E08]',
      border: 'border-[#A74106]',
      ring: 'ring-[#A74106]/40',
      gradient: 'bg-gradient-to-r from-[#8A3505] to-[#C54E08] hover:from-[#702A04] hover:to-[#A74106]',
      shadow: 'shadow-[0_4px_12px_rgba(167,65,6,0.3)]'
    };
    
    // Default: Student & Technician
    return {
      text: 'text-[#0F6657]',
      hoverText: 'hover:text-[#17A38A]',
      border: 'border-[#0F6657]',
      ring: 'ring-[#17A38A]/40',
      gradient: 'bg-gradient-to-r from-[#0F6657] to-[#17A38A] hover:from-[#0c5246] hover:to-[#128a74]',
      shadow: 'shadow-[0_4px_12px_rgba(23,163,138,0.3)]'
    };
  }, [user?.role]);

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

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
    } catch (error) {
      console.error("Error deleting notification", error);
    }
  };

  const toggleSelection = (e, id) => {
    e.stopPropagation();
    setSelectedIds((prev) => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    try {
      await deleteMultipleNotifications(selectedIds);
      setNotifications((prev) => prev.filter((n) => !selectedIds.includes(n.id)));
      setSelectedIds([]);
      window.dispatchEvent(new Event('notificationsUpdated'));
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

  const handleViewAction = () => {
    const text = (selectedNotif?.title + " " + selectedNotif?.message).toUpperCase();
    const bookingMatch = selectedNotif?.message?.match(/Booking ID:\s*([a-zA-Z0-9-]+)/i);
    const extractedId = bookingMatch ? bookingMatch[1] : null;

    setSelectedNotif(null); 

    const isAuthAdmin = user?.role?.toUpperCase() === 'ADMIN';
    const isTech = user?.role?.toUpperCase() === 'TECHNICIAN';

    if (text.includes('TICKET')) {
       navigate(isTech ? '/staff/maintenance' : '/maintenance');
    } else {
       navigate(isAuthAdmin ? '/admin/bookings' : '/bookings/my', { state: { highlightId: extractedId } });
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const visible = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.read;
    if (filter !== 'ALL') return getNotifStyle(n).tab === filter;
    return true;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const toggleSelectAll = () => {
    if (selectedIds.length === visible.length && visible.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(visible.map(n => n.id));
    }
  };

  const FILTER_TABS = [
    { key: 'ALL', label: `All (${notifications.length})` },
    { key: 'UNREAD', label: `Unread (${unreadCount})` },
    { key: 'BOOKING', label: 'Bookings' },
    { key: 'TICKET', label: 'Tickets' }
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
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-100 transition-colors shadow-sm ${theme.hoverText}`}
                >
                  <CheckCheck size={16} /> Mark all as read
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {FILTER_TABS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => {
                      setFilter(key);
                      setSelectedIds([]);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all shadow-sm ${
                      filter === key 
                        ? `${theme.gradient} text-white border-transparent` 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {visible.length > 0 && (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={toggleSelectAll} 
                    className={`flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors px-2 ${theme.hoverText}`}
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
                  const cfg = getNotifStyle(n);
                  const Icon = cfg.icon;
                  const isSelected = selectedIds.includes(n.id);
                  
                  return (
                    <div
                      key={n.id}
                      onClick={() => openNotificationModal(n)}
                      className={`relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 cursor-pointer group hover:shadow-md hover:-translate-y-0.5
                        ${isSelected ? `bg-slate-50 border-transparent ${theme.ring} ring-1` : n.read ? 'bg-white border-slate-100' : 'bg-slate-50/50 border-slate-200 shadow-sm'}`}
                    >
                      {/* Dynamic Checkbox */}
                      <div 
                        onClick={(e) => toggleSelection(e, n.id)}
                        className={`w-5 h-5 rounded flex items-center justify-center border shadow-sm transition-all duration-200 ${
                          isSelected ? `${theme.gradient} border-transparent text-white scale-110` : `bg-white border-slate-300 text-transparent group-hover:${theme.border}`
                        }`}
                      >
                        <Check size={14} strokeWidth={3} />
                      </div>

                      {/* Dynamic Unread Dot */}
                      {!n.read && <span className={`absolute top-4 right-4 w-2 h-2 rounded-full ${theme.gradient} ${theme.shadow}`} />}

                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${cfg.bg}`}>
                        <Icon size={20} className={cfg.ic} />
                      </div>

                      <div className="flex-1 min-w-0 pr-12">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-xs font-bold uppercase tracking-wider ${n.read ? 'text-slate-500' : theme.text}`}>
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

      {selectedNotif && (() => {
        const cfg = getNotifStyle(selectedNotif);
        return (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full relative shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-in zoom-in-95 duration-200">
              
              <button 
                onClick={(e) => { handleDelete(e, selectedNotif.id); setSelectedNotif(null); }}
                className="absolute top-5 right-12 text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors"
                title="Delete Notification"
              >
                <Trash2 className="w-5 h-5" />
              </button>

              <button 
                onClick={() => setSelectedNotif(null)} 
                className="absolute top-5 right-4 text-slate-400 hover:text-slate-800 hover:bg-slate-100 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${cfg.bg}`}>
                {React.createElement(cfg.icon, { size: 28, className: cfg.ic })}
              </div>

              <h2 className="text-2xl font-bold text-slate-800 mb-2 pr-12 leading-tight">
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
                {/* Dynamic Theme Action Button */}
                <button 
                  onClick={handleViewAction}
                  className={`flex-1 text-white py-3 rounded-xl transition-all font-semibold flex justify-center items-center gap-2 ${theme.gradient} ${theme.shadow}`}
                >
                  View Status Details <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}