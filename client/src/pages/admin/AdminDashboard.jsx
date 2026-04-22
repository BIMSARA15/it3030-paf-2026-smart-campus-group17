//admin dashboard
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarPlus, UserPlus } from 'lucide-react'; // 👈 1. Import UserPlus
import { useBooking } from '../../context/BookingContext';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import AddTechnicianModal from '../../components/admin/AddTechnicianModal'; // 👈 2. Import your new modal

export default function AdminDashboard() {
  const { bookings } = useBooking();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  

  // Filter pending count for the subtitle display
  const pendingCount = bookings.filter(b => b.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Component */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Wrapper */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        
        {/* REUSABLE HEADER */}
        <Header />

        <div className="p-4 lg:p-6 space-y-6">
          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-gray-900 text-2xl font-semibold">
                Admin Dashboard
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {pendingCount} booking{pendingCount !== 1 ? 's' : ''} awaiting your review
              </p>
            </div>
            
            {/* 👈 4. Wrap your buttons in a flex container */}
            <div className="flex items-center gap-3">
            

              {/* EXISTING BUTTON: Navigate to All Bookings */}
              <button
                onClick={() => navigate('/bookings/all')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white hover:from-[#172554] hover:to-[#1D4ED8] shadow-[0_4px_12px_rgba(37,99,235,0.3)] border-t border-white/20 rounded-xl transition-all text-sm font-medium"
              >
                <CalendarPlus className="w-4 h-4" />
                All Bookings
              </button>
            </div>
          </div>

          {/* ALL OTHER CONTENT REMOVED - TO BE DEVELOPED BY TEAM MEMBER */}
          <div className="mt-12 text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
             <p className="text-gray-400">Admin dashboard content will go here.</p>
          </div>
        </div>
      </div>

      {/* 👈 5. Render the Modal when state is true */}
     

    </div>
  );
}