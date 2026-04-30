// src/components/Header.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, CheckCircle } from 'lucide-react'; 
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext'; // <-- ADDED THIS
import { markNotificationAsRead } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // <-- CHANGED: Now pulling from Context instead of local state
  const { notifications, setNotifications, unreadCount } = useNotifications(); 
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const role = user?.role?.toUpperCase();
  const isLecturer = role === 'LECTURER';
  const isAdmin = role === 'ADMIN';
  const isTechnician = role === 'TECHNICIAN';

  const theme = {
    bellHover: isAdmin ? 'hover:text-[#1E3A8A] hover:bg-[#1E3A8A]/5' : isLecturer ? 'hover:text-[#A74106] hover:bg-[#A74106]/5' : isTechnician ? 'hover:text-[#27324A] hover:bg-[#27324A]/5' : 'hover:text-[#0F6657] hover:bg-[#0F6657]/5',
    avatarGradient: isAdmin ? 'from-[#1E3A8A] to-[#2563EB]' : isLecturer ? 'from-[#8A3505] to-[#C54E08]' : isTechnician ? 'from-[#27324A] to-[#303B53]' : 'from-[#0F6657] to-[#17A38A]',
    roleText: isAdmin ? 'text-[#2563EB]' : isLecturer ? 'text-[#C54E08]' : isTechnician ? 'text-[#27324A]' : 'text-[#17A38A]',
  };

  const getNotificationColors = (title, message) => {
    const text = (title + " " + message).toUpperCase();
    if (text.includes('REJECT')) return 'bg-rose-50 border-rose-100 text-rose-800'; 
    if (text.includes('APPROVE') || text.includes('ACCEPT')) return 'bg-emerald-50 border-emerald-100 text-emerald-800'; 
    if (text.includes('CLOSE') || text.includes('RESOLVE')) return 'bg-slate-100 border-slate-200 text-slate-600'; 
    if (text.includes('REPLY') || text.includes('COMMENT')) return 'bg-sky-50 border-sky-100 text-sky-800'; 
    return 'bg-amber-50 border-amber-100 text-amber-800'; 
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error("Failed to mark read", error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-end px-4 lg:px-6 sticky top-0 z-50">
      <div className="flex items-center gap-3 sm:gap-4 ml-4">
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`relative p-2 text-gray-400 rounded-full transition-all ${theme.bellHover}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-[0_10px_40px_rgba(15,23,42,0.1)] border border-gray-100 overflow-hidden z-50 origin-top-right animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                <h3 className="font-semibold text-gray-800">Notifications</h3>
                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} New
                    </span>
                  )}
                  <button onClick={() => { setIsDropdownOpen(false); navigate('/notifications'); }} className="text-xs font-medium text-blue-600 hover:underline">
                    View All
                  </button>
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-5 py-8 text-center text-gray-400 text-sm">No notifications yet.</div>
                ) : (
                  <div className="divide-y divide-gray-50 p-2 space-y-1">
                    {notifications.slice(0, 5).map((notif) => {
                      const colorClass = getNotificationColors(notif.title, notif.message);
                      
                      return (
                        <div 
                          key={notif.id} 
                          onClick={() => {
                            if (!notif.read) handleMarkAsRead(notif.id);
                            setIsDropdownOpen(false);
                            navigate('/notifications');
                          }}
                          className={`p-4 rounded-xl transition-all border cursor-pointer ${!notif.read ? colorClass : 'bg-white border-transparent hover:bg-gray-50 hover:shadow-sm opacity-75 hover:opacity-100'}`}
                        >
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${!notif.read ? 'font-bold' : 'font-semibold text-gray-700'}`}>{notif.title}</p>
                              <p className={`text-xs mt-1 whitespace-pre-wrap leading-relaxed ${!notif.read ? 'opacity-90' : 'text-gray-500'}`}>{notif.message}</p>
                              <p className="text-[10px] opacity-60 mt-2 font-bold uppercase tracking-wide">
                                {new Date(notif.createdAt).toLocaleString()}
                              </p>
                            </div>
                            {!notif.read && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notif.id);
                                }} 
                                className="p-1.5 opacity-50 hover:opacity-100 hover:bg-white/50 rounded-lg transition-all flex-shrink-0" 
                                title="Mark as read"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>

        <button className="flex items-center gap-2 hover:bg-gray-50 p-1 pr-2 rounded-xl transition-colors border border-transparent hover:border-gray-100">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-xs font-bold text-white shadow-sm border border-white/20 ${theme.avatarGradient}`}>
            {getInitials(user?.name)}
          </div>
          <div className="hidden md:block text-left ml-1">
            <p className="text-sm font-bold text-gray-800 leading-tight">{user?.name || 'User'}</p>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${theme.roleText}`}>
              {user?.role || 'Role'}
            </p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 ml-1 hidden md:block" />
        </button>
      </div>
    </header>
  );
}