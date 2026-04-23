import React, { useState, useEffect, useRef } from 'react';
import { Bell, ChevronDown, CheckCircle, X } from 'lucide-react'; 
import { useAuth } from '../context/AuthContext';
import { getUserNotifications, markNotificationAsRead } from '../services/api';
// NEW IMPORTS FOR WEBSOCKETS
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export default function Header() {
  const { user } = useAuth();
  
  // --- NOTIFICATION STATE ---
  const [notifications, setNotifications] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null); 
  
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

  // --- FETCH NOTIFICATIONS & WEBSOCKET EFFECT ---
  useEffect(() => {
    const identifier = user?.id || user?.email; 
    
    if (!identifier) return;

    // 1. Fetch existing notifications on load
    const fetchInitialNotifications = async () => {
      try {
        const data = await getUserNotifications(); 
        setNotifications(data);
      } catch (error) {
        console.error("Failed to fetch initial notifications:", error);
      }
    };
    
    fetchInitialNotifications();

    // 2. Connect to the Spring Boot WebSocket for REAL-TIME updates
    const client = new Client({
      // We use SockJS as a fallback to ensure cross-browser compatibility
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      onConnect: () => {
        console.log('Connected to Real-Time Notifications!');
        
       // 👇 NEW: Listen to the explicit custom topic path!
        client.subscribe(`/topic/notifications/${identifier}`, (message) => {
          const newNotification = JSON.parse(message.body);
          setNotifications(prev => [newNotification, ...prev]); 
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      }
    });

    client.activate();

    // Cleanup connection when user logs out or closes the component
    return () => {
      client.deactivate();
    };
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

  // Opens the modal and closes the dropdown menu
  const handleNotificationClick = async (notification) => {
    setSelectedNotif(notification); 
    setIsDropdownOpen(false); 
    
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
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

      {/* THE POPUP MODAL */}
      {selectedNotif && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] px-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button 
              onClick={() => setSelectedNotif(null)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold text-slate-800 mb-1 pr-8">{selectedNotif.title}</h2>
            <p className="text-xs font-medium text-gray-500 mb-4">
              {new Date(selectedNotif.createdAt).toLocaleString('en-US', { 
                weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' 
              })}
            </p>
            
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 max-h-60 overflow-y-auto">
              <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
                {selectedNotif.message}
              </p>
            </div>
            
            {/* Optional: Add a button to navigate to the exact booking/ticket if you add URLs to notifications in the DB later */}
            {selectedNotif.targetUrl && (
              <a 
                href={selectedNotif.targetUrl} 
                className="mt-5 block text-center bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
              >
                View Details
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}