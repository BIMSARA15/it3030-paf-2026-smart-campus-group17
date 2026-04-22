import React, { useState, useEffect, useRef } from 'react';
import { Bell, ChevronDown, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserNotifications, markNotificationAsRead } from '../services/api';

export default function Header() {
  const { user } = useAuth();
  
  // --- NOTIFICATION STATE ---
  const [notifications, setNotifications] = useState([]);
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
    bellHover: isAdmin 
      ? 'hover:text-[#1E3A8A] hover:bg-[#1E3A8A]/5' 
      : isLecturer 
        ? 'hover:text-[#A74106] hover:bg-[#A74106]/5' 
        : isTechnician 
          ? 'hover:text-[#2D3748] hover:bg-[#2D3748]/5' 
          : 'hover:text-[#0F6657] hover:bg-[#0F6657]/5',
    avatarGradient: isAdmin 
      ? 'from-[#1E3A8A] to-[#2563EB]' 
      : isLecturer 
        ? 'from-[#8A3505] to-[#C54E08]' 
        : isTechnician 
          ? 'from-[#2D3748] to-[#4A5568]' 
          : 'from-[#0F6657] to-[#17A38A]',
    roleText: isAdmin 
      ? 'text-[#2563EB]' 
      : isLecturer 
        ? 'text-[#C54E08]' 
        : isTechnician 
          ? 'text-[#4A5568]' 
          : 'text-[#17A38A]',
  };

  // --- FETCH NOTIFICATIONS EFFECT ---
  useEffect(() => {
    // Check for id OR email to ensure it runs
    const identifier = user?.id || user?.email; 
    
    if (identifier) {
      const fetchNotifications = async () => {
        // Use the identifier we found
        const data = await getUserNotifications(identifier); 
        setNotifications(data);
      };
      
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      console.log("No user identifier found, skipping notifications fetch");
    }
  }, [user]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
      // Update local state to mark it as read instantly
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
    }
  };

  // Calculate unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-end px-4 lg:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-3 sm:gap-4 ml-4">
        
        {/* NOTIFICATION BELL & DROPDOWN */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`relative p-2 text-gray-400 rounded-full transition-all ${theme.bellHover}`}
          >
            <Bell className="w-5 h-5" />
            
            {/* ONLY SHOW RED DOT IF UNREAD > 0 */}
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>

          {/* DROPDOWN MENU */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                    {unreadCount} new
                  </span>
                )}
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 text-sm">
                    <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    No notifications yet
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {notifications.map(notification => (
                      <div 
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 ${!notification.read ? 'bg-blue-50/30' : ''}`}
                      >
                        <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${!notification.read ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                        <div>
                          <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-2">
                            {new Date(notification.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>

        {/* USER PROFILE BUBBLE */}
        <button className="flex items-center gap-2 hover:bg-gray-50 p-1 pr-2 rounded-xl transition-colors border border-transparent hover:border-gray-100">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-xs font-bold text-white shadow-sm border border-white/20 ${theme.avatarGradient}`}>
            {getInitials(user?.name || 'John Doe')}
          </div>
          <div className="hidden md:block text-left ml-1">
            <p className="text-sm font-bold text-gray-800 leading-tight">{user?.name || 'John Doe'}</p>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${theme.roleText}`}>
              {user?.role || 'User'}
            </p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 ml-1 hidden md:block" />
        </button>
      </div>
    </header>
  );
}