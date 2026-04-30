// src/components/Sidebar.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext'; // <-- ADDED THIS
import { 
  LayoutGrid, CalendarPlus, BookOpen, Building2, Wrench, 
  LogOut, GraduationCap, X, Menu, SendHorizontal, Bell, UserCog
} from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // <-- CHANGED: Pull unreadCount directly from Context!
  const { unreadCount } = useNotifications(); 
  
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const getDashboardRoute = (role) => {
    const r = role?.toUpperCase() || '';
    if (r === 'ADMIN') return '/admin';
    if (r === 'TECHNICIAN') return '/staff';
    if (r === 'LECTURER') return '/lecturer';
    return '/student';
  };

  const dashboardPath = getDashboardRoute(user?.role);
  const isActive = (path) => location.pathname === path;

  const role = user?.role?.toUpperCase();
  const isLecturer = role === 'LECTURER';
  const isAdmin = role === 'ADMIN';
  const isTechnician = role === 'TECHNICIAN';

  const navLinks = isAdmin
    ? [
        { name: 'Dashboard', path: dashboardPath, icon: LayoutGrid },
        { name: 'All Bookings', path: '/admin/bookings', icon: BookOpen },
        { name: 'Resources', path: '/admin/resources', icon: Building2 },
        { name: 'Equipment', path: '/admin/utilities', icon: Wrench },
        { name: 'Technicians', path: '/admin/technicians',icon: UserCog },
        { name: 'Notifications', path: '/notifications', icon: Bell },
      ]
    : isTechnician
    ? [
       { name: 'Dashboard', path: '/staff', icon: LayoutGrid },
        { name: 'Facilities & Assets', path: '/staff/facilities', icon: Building2 },
        { name: 'Maintenance Tasks', path: '/staff/maintenance', icon: Wrench },
        { name: 'Notifications', path: '/notifications', icon: Bell },
      
      ]
    : [
        { name: 'Dashboard', path: dashboardPath, icon: LayoutGrid },
        ...(isLecturer ? [{ name: 'Student Requests', path: '/lecturer/requests', icon: SendHorizontal }] : []),
        { name: 'New Booking', path: '/booking/new', icon: CalendarPlus },
        { name: 'My Bookings', path: '/bookings/my', icon: BookOpen },
        { name: 'All Resources', path: '/resources', icon: Building2 },
        { name: 'Maintenance', path: '/maintenance', icon: Wrench },
        { name: 'Notifications', path: '/notifications', icon: Bell },
      ];

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    if (logout) logout();
    navigate('/'); 
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const theme = {
    headerBg: isAdmin ? 'bg-[#1E3A8A]' : isLecturer ? 'bg-[#A74106]' : isTechnician ? 'bg-gradient-to-br from-[#27324A] via-[#303B53] to-[#1F2937]' : 'bg-[#0F6657]',
    roleTag: isAdmin ? 'bg-blue-50 border-[#1E3A8A]/20 text-[#1E3A8A]' : isLecturer ? 'bg-orange-50 border-[#A74106]/20 text-[#A74106]' : isTechnician ? 'bg-slate-100 border-[#27324A]/20 text-[#27324A]' : 'bg-emerald-50 border-[#0F6657]/20 text-[#0F6657]',
    linkActive: isAdmin ? 'bg-[#1E3A8A]/10 text-[#1E3A8A] font-semibold' : isLecturer ? 'bg-[#A74106]/10 text-[#A74106] font-semibold' : isTechnician ? 'bg-[#27324A]/10 text-[#27324A] font-semibold' : 'bg-[#0F6657]/10 text-[#0F6657] font-semibold',
    linkHover: isAdmin ? 'hover:bg-[#1E3A8A]/10 hover:text-[#1E3A8A]' : isLecturer ? 'hover:bg-[#A74106]/10 hover:text-[#A74106]' : isTechnician ? 'hover:bg-[#27324A]/10 hover:text-[#27324A]' : 'hover:bg-[#0F6657]/10 hover:text-[#0F6657]',
    iconActive: isAdmin ? 'text-[#1E3A8A]' : isLecturer ? 'text-[#A74106]' : isTechnician ? 'text-[#27324A]' : 'text-[#0F6657]',
    iconHover: isAdmin ? 'group-hover:text-[#1E3A8A]' : isLecturer ? 'group-hover:text-[#A74106]' : isTechnician ? 'group-hover:text-[#27324A]' : 'group-hover:text-[#0F6657]',
    tooltipBg: isAdmin ? 'bg-[#1E3A8A]' : isLecturer ? 'bg-[#A74106]' : isTechnician ? 'bg-[#27324A]' : 'bg-[#0F6657]',
    tooltipArrow: isAdmin ? 'border-r-[#1E3A8A]' : isLecturer ? 'border-r-[#A74106]' : isTechnician ? 'border-r-[#27324A]' : 'border-r-[#0F6657]',
    tooltipShadow: isAdmin ? 'shadow-[0_4px_12px_rgba(30,58,138,0.2)]' : isLecturer ? 'shadow-[0_4px_12px_rgba(167,65,6,0.2)]' : isTechnician ? 'shadow-[0_4px_12px_rgba(39,50,74,0.2)]' : 'shadow-[0_4px_12px_rgba(15,102,87,0.2)]',
  };

  return (
    <>
      <div 
        className={`fixed inset-y-0 left-0 z-30 bg-white border-r border-gray-100 flex flex-col shadow-2xl transition-all duration-300 ease-in-out ${
          isOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className={`relative ${theme.headerBg} text-white transition-all duration-300 ${isOpen ? 'h-48 rounded-br-[2.5rem]' : 'h-32 rounded-br-2xl'} flex flex-col shrink-0 overflow-visible`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/4 translate-x-1/4 pointer-events-none"></div>
          <div className={`px-4 sm:px-6 pt-14 pb-4 flex items-center ${isOpen ? 'justify-between' : 'justify-center'} z-10`}>
            {isOpen ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div className="overflow-hidden">
                    <h1 className="font-bold text-lg leading-tight tracking-wider whitespace-nowrap text-white">UNI<span className="text-amber-400">BOOK</span></h1>
                    <p className="text-white/80 text-xs whitespace-nowrap">
                      {isAdmin ? 'Admin Portal' : isLecturer ? 'Lecturer Portal' : isTechnician ? 'Technician Portal' : 'Student Portal'}
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="absolute top-3 right-3 p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors z-20">
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button onClick={() => setIsOpen(true)} className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0 -mt-4">
                <Menu className="w-6 h-6" />
              </button>
            )}
          </div>

          <div className={`absolute bottom-0 left-4 right-4 translate-y-1/2 z-20 ${!isOpen && 'flex justify-center translate-y-2/3 left-2 right-2'}`}>
            <div className={`bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-50 flex items-start gap-3 transition-all ${isOpen ? 'p-4' : 'p-2 items-center justify-center w-12 h-12 mx-auto rounded-2xl'}`}>
              <div className={`${isOpen ? 'w-10 h-10 mt-0.5' : 'w-8 h-8'} rounded-full ${theme.headerBg} flex items-center justify-center flex-shrink-0 font-bold ${isOpen ? 'text-sm' : 'text-xs'} text-white shadow-inner transition-all`}>
                {getInitials(user?.name || 'John Doe')}
              </div>
              {isOpen && (
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="font-bold text-sm text-gray-800 truncate">{user?.name || 'John Doe'}</p>
                  {!isAdmin && !isTechnician && (
                    <p className="text-gray-500 text-xs truncate mb-2">{user?.department || 'Faculty of Computing'}</p>
                  )}
                  <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase whitespace-nowrap ${theme.roleTag} ${(isAdmin || isTechnician) && 'mt-1'}`}>
                    {user?.role || 'User'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`shrink-0 ${isOpen ? 'h-24' : 'h-10'}`}></div>

        {isOpen && <p className="text-xs font-bold text-gray-400 tracking-wider mb-3 px-4 uppercase">Navigation</p>}
        
        <div className={`flex-1 overflow-visible ${isOpen ? 'px-3 mt-2' : 'px-2 mt-4'}`}>
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative flex items-center ${isOpen ? 'justify-start px-4' : 'justify-center px-0'} py-3.5 rounded-xl transition-all duration-200 group ${active ? theme.linkActive : `text-gray-600 font-medium ${theme.linkHover}`}`}
                >
                  <Icon className={`w-[22px] h-[22px] flex-shrink-0 ${active ? theme.iconActive : `text-gray-500 ${theme.iconHover}`} ${isOpen && 'mr-4'}`} />
                  {isOpen && <span className="text-[15px] whitespace-nowrap flex-1">{link.name}</span>}
                  
                  {isOpen && link.name === 'Notifications' && unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-auto shadow-sm">
                      {unreadCount}
                    </span>
                  )}

                  {!isOpen && (
                    <div className={`absolute left-full ml-4 px-2.5 py-1.5 ${theme.tooltipBg} text-white text-[13px] font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-x-[-10px] group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap z-[100] ${theme.tooltipShadow} flex items-center`}>
                      {link.name}
                      {link.name === 'Notifications' && unreadCount > 0 && ` (${unreadCount})`}
                      <div className={`absolute top-1/2 -left-1 -translate-y-1/2 border-[5px] border-transparent ${theme.tooltipArrow}`}></div>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className={`p-4 mt-auto shrink-0 ${!isOpen && 'flex justify-center'}`}>
          <button onClick={() => setShowLogoutConfirm(true)} className={`relative group flex items-center ${isOpen ? 'justify-start px-4' : 'justify-center'} w-full py-3.5 rounded-xl bg-red-50/80 hover:bg-red-100 text-red-600 font-semibold transition-all duration-200 border border-red-100/50`}>
            <LogOut className={`w-[22px] h-[22px] flex-shrink-0 text-red-500 group-hover:text-red-700 ${isOpen && 'mr-4'}`} />
            {isOpen && <span className="text-[15px] whitespace-nowrap">Logout</span>}
            {!isOpen && (
              <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-red-600 text-white text-[13px] font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-x-[-10px] group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap z-[100] shadow-[0_4px_12px_rgba(220,38,38,0.2)] flex items-center">
                Logout<div className="absolute top-1/2 -left-1 -translate-y-1/2 border-[5px] border-transparent border-r-red-600"></div>
              </div>
            )}
          </button>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center z-10 border border-red-100 animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowLogoutConfirm(false)} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 mt-2">
              <LogOut className="w-8 h-8 text-red-600 ml-1" />
            </div>
            <h2 className="text-gray-900 text-xl font-semibold mb-2">Confirm Sign Out</h2>
            <p className="text-gray-500 text-sm mb-6">Are you sure you want to sign out of your account?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors">Cancel</button>
              <button onClick={handleLogout} className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white hover:bg-red-700 text-sm font-medium shadow-[0_4px_12px_rgba(220,38,38,0.3)] transition-all">Yes, Sign Out</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}