import React from 'react';
import { Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // --- EXPANDED DYNAMIC THEME LOGIC ---
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

  return (
    <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-end px-4 lg:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-3 sm:gap-4 ml-4">
        <button className={`relative p-2 text-gray-400 rounded-full transition-all ${theme.bellHover}`}>
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>

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