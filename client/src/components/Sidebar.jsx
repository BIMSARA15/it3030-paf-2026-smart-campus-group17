import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutGrid, CalendarPlus, BookOpen, Building2, 
  LogOut, GraduationCap, ChevronRight, X, Menu 
} from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutGrid },
    { name: 'New Booking', path: '/booking/new', icon: CalendarPlus },
    { name: 'My Bookings', path: '/bookings/my', icon: BookOpen },
    { name: 'Resources', path: '/resources', icon: Building2 },
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

  return (
    <div 
      className={`fixed inset-y-0 left-0 z-30 bg-white border-r border-gray-100 flex flex-col shadow-2xl transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      
      {/* --- GREEN HEADER SECTION --- */}
      <div className={`relative bg-[#0F6657] text-white transition-all duration-300 ${isOpen ? 'h-48 rounded-br-[2.5rem]' : 'h-32 rounded-br-2xl'} flex flex-col shrink-0 overflow-visible`}>
        
        {/* Subtle background circle effect from screenshot */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/4 translate-x-1/4 pointer-events-none"></div>

        {/* Top bar with Logo and Close/Hamburger */}
        <div className={`px-4 sm:px-6 pt-14 pb-4 flex items-center ${isOpen ? 'justify-between' : 'justify-center'} z-10`}>
          {isOpen ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div className="overflow-hidden">
                  <h1 className="font-bold text-lg leading-tight tracking-wider whitespace-nowrap text-white">SMART <span className="text-amber-400">CAMPUS</span></h1>
                  <p className="text-emerald-100 text-xs whitespace-nowrap opacity-90">Student Portal</p>
                </div>
              </div>
              {/* X Button moved independently to the absolute top right */}
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors z-20"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsOpen(true)}
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0 mt-2"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* OVERLAPPING PROFILE CARD - UPDATED WITH AVATAR AND DETAILS */}
        <div className={`absolute bottom-0 left-4 right-4 translate-y-1/2 z-20 ${!isOpen && 'flex justify-center translate-y-2/3 left-2 right-2'}`}>
          <div className={`bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-50 flex items-start gap-3 transition-all ${
            isOpen ? 'p-4' : 'p-2 items-center justify-center w-12 h-12 mx-auto rounded-2xl'
          }`}>
            
            <div className={`${isOpen ? 'w-10 h-10 mt-0.5' : 'w-8 h-8'} rounded-full bg-[#0F6657] flex items-center justify-center flex-shrink-0 font-bold ${isOpen ? 'text-sm' : 'text-xs'} text-white shadow-inner transition-all`}>
              {getInitials(user?.name || 'John Doe')}
            </div>
            
            {isOpen && (
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="font-bold text-sm text-gray-800 truncate">{user?.name || 'John Doe'}</p>
                <p className="text-gray-500 text-xs truncate mb-2">{user?.department || 'Faculty of Computing'}</p>
                <span className="inline-block px-2 py-0.5 bg-emerald-50 border border-[#0F6657]/20 rounded-md text-[10px] font-bold tracking-wider uppercase text-[#0F6657] whitespace-nowrap">
                  {user?.role === 'admin' ? 'Admin' : 'User'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* spacer to account for the overlapping profile card */}
      <div className={`shrink-0 ${isOpen ? 'h-24' : 'h-10'}`}></div>

      {isOpen && <p className="text-xs font-bold text-gray-400 tracking-wider mb-3 px-4 uppercase">Navigation</p>}
      
      {/* --- NAVIGATION LINKS --- */}
      <div className={`flex-1 overflow-y-auto ${isOpen ? 'px-3 mt-2' : 'px-2 mt-4'}`}>
        <nav className="space-y-1">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            const Icon = link.icon;
            
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center ${isOpen ? 'justify-start px-4' : 'justify-center px-0'} py-3.5 rounded-xl transition-all duration-200 group ${
                  active 
                    ? 'bg-[#0F6657]/15 text-[#0F6657] font-bold shadow-sm ring-1 ring-[#0F6657]/20' 
                    : 'text-gray-600 hover:bg-[#0F6657]/10 hover:text-[#0F6657] font-medium'
                }`}
              >
                <Icon className={`w-[22px] h-[22px] flex-shrink-0 ${active ? 'text-[#0F6657]' : 'text-gray-500 group-hover:text-[#0F6657]'} ${isOpen && 'mr-4'}`} />
                {isOpen && <span className="text-[15px] whitespace-nowrap">{link.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* --- SIGN OUT BUTTON (RED THEME) --- */}
      <div className={`p-4 mt-auto shrink-0 ${!isOpen && 'flex justify-center'}`}>
        {showLogoutConfirm ? (
          <div className="bg-white rounded-xl p-3 border border-red-100 shadow-lg shadow-red-900/5 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <p className="text-xs text-gray-600 mb-3 text-center leading-tight">Confirm sign out?</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleLogout}
                className="w-full py-2 px-2 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              >
                Yes, Sign Out
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-2 px-2 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => {
              setShowLogoutConfirm(true);
              if (!isOpen) setIsOpen(true); 
            }}
            className={`group flex items-center ${isOpen ? 'justify-start px-4' : 'justify-center'} w-full py-3.5 rounded-xl bg-red-50/80 hover:bg-red-100 text-red-600 font-semibold transition-all duration-200 border border-red-100/50`}
          >
            <LogOut className={`w-[22px] h-[22px] flex-shrink-0 text-red-500 group-hover:text-red-700 ${isOpen && 'mr-4'}`} />
            {isOpen && <span className="text-[15px] whitespace-nowrap">Logout</span>}
          </button>
        )}
      </div>
      
    </div>
  );
}