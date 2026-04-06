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
  
  // New state to manage the confirmation dialog
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutGrid },
    { name: 'New Booking', path: '/booking/new', icon: CalendarPlus },
    { name: 'My Bookings', path: '/bookings/my', icon: BookOpen },
    { name: 'Resources', path: '/resources', icon: Building2 },
  ];

  const handleLogout = () => {
    setShowLogoutConfirm(false); // Reset state just in case
    if (logout) logout();
    navigate('/'); 
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div 
      className={`fixed inset-y-0 left-0 z-30 bg-[#0A1931] text-white flex flex-col shadow-2xl transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      
      {/* App Logo/Header & Hamburger/Close Button */}
      <div className={`p-6 flex items-center ${isOpen ? 'justify-between' : 'justify-center'}`}>
        {isOpen ? (
          <>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="overflow-hidden">
                <h1 className="font-semibold text-lg leading-tight tracking-wide whitespace-nowrap">Smart Campus</h1>
                <p className="text-blue-300 text-xs whitespace-nowrap">Booking System</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-[#8B9DC3] hover:text-white hover:bg-[#112445] transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </>
        ) : (
          /* Hamburger Menu visible only when closed */
          <button 
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-lg text-[#8B9DC3] hover:text-white hover:bg-[#112445] transition-colors flex-shrink-0"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* User Profile Card */}
      <div className={`px-4 mb-6 ${!isOpen && 'flex justify-center'}`}>
        <div className={`bg-[#112445] border border-[#1A325C] rounded-2xl flex items-start gap-3 transition-all ${
          isOpen ? 'p-4' : 'p-2 items-center justify-center'
        }`}>
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 font-bold text-sm shadow-inner">
            {getInitials(user?.name || 'John Doe')}
          </div>
          {isOpen && (
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="font-medium text-sm text-white truncate">{user?.name || 'John Doe'}</p>
              <p className="text-[#8B9DC3] text-xs truncate mb-2">{user?.department || 'Faculty of Computing'}</p>
              <span className="inline-block px-2 py-0.5 bg-[#1A325C] border border-[#234276] rounded-md text-xs text-blue-200 whitespace-nowrap">
                {user?.role === 'admin' ? 'Admin' : 'User'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <div className={`flex-1 overflow-y-auto ${isOpen ? 'px-4' : 'px-2'}`}>
        {isOpen && <p className="text-xs font-semibold text-[#5B73A0] tracking-wider mb-3 px-2">NAVIGATION</p>}
        <nav className="space-y-1">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            const Icon = link.icon;
            
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center ${isOpen ? 'justify-between px-3' : 'justify-center px-0'} py-3 rounded-xl transition-all duration-200 ${
                  active 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50' 
                    : 'text-[#8B9DC3] hover:bg-[#112445] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : 'text-[#5B73A0]'}`} />
                  {isOpen && <span className="font-medium text-sm whitespace-nowrap">{link.name}</span>}
                </div>
                {isOpen && active && <ChevronRight className="w-4 h-4 opacity-70 flex-shrink-0" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sign Out Footer */}
      <div className={`p-4 border-t border-[#1A325C] ${!isOpen && 'flex justify-center'}`}>
        {showLogoutConfirm ? (
          <div className="bg-[#112445] rounded-xl p-3 border border-[#1A325C] animate-in fade-in slide-in-from-bottom-2 duration-200">
            <p className="text-sm text-gray-300 mb-3 text-center leading-tight">Are you sure you want to sign out?</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleLogout}
                className="w-full py-1.5 px-2 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
              >
                Yes, Sign Out
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-1.5 px-2 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-[#1A325C] transition-colors"
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
            className={`group flex items-center ${isOpen ? 'gap-3 px-3 w-full text-left' : 'justify-center p-3'} text-[#8B9DC3] hover:text-rose-300 hover:bg-rose-950/40 rounded-xl transition-all duration-200`}
          >
            <LogOut className="w-5 h-5 text-[#5B73A0] group-hover:text-rose-400 transition-colors flex-shrink-0" />
            {isOpen && <span className="font-medium text-sm whitespace-nowrap">Sign Out</span>}
          </button>
        )}
      </div>
      
    </div>
  );
}