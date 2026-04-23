import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarCheck, Clock, XCircle, Ban, CalendarPlus,
  Building2, ArrowRight, TrendingUp, Users, ChevronRight,Wrench
} from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { StatusBadge } from '../../components/StatusBadge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Sidebar from '../../components/Sidebar'; // Import Sidebar
import Header from '../../components/Header'; // Import header
import AIChat from '../../components/AIChat';

export default function StudentDashboard() {
  const { currentUser, bookings, resources, getResourceById, fetchUserBookings } = useBooking();
  const navigate = useNavigate();

  // Add Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isAdmin = currentUser?.role === 'admin';
  
  // Create a local state to hold the live dashboard bookings
  const [myBookings, setMyBookings] = useState([]);

  // React to changes: fetch fresh data when the component loads or when bookings updates
  useEffect(() => {
    const loadData = async () => {
      if (isAdmin) {
        // Admins see all bookings directly from the synced context
        setMyBookings(bookings);
      } else {
        // Students fetch their live specific bookings using their email
        const emailToSearch = currentUser?.email || 'it23345478@my.sliit.lk'; 
        const userSpecificBookings = await fetchUserBookings(emailToSearch);
        
        // Sort them so the newest updates appear correctly
        const sorted = userSpecificBookings.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setMyBookings(sorted);
      }
    };

    loadData();
  }, [currentUser, fetchUserBookings, bookings, isAdmin]);
  
  const stats = {
    total: myBookings.length,
    pending: myBookings.filter(b => b.status === 'PENDING').length,
    approved: myBookings.filter(b => b.status === 'APPROVED').length,
    rejected: myBookings.filter(b => b.status === 'REJECTED').length,
    cancelled: myBookings.filter(b => b.status === 'CANCELLED').length,
  };

  const today = new Date().toISOString().split('T')[0];
  
  // Use spread operator [...] before sort() to prevent mutating the state array
  const upcoming = [...myBookings]
    .filter(b => b.status === 'APPROVED' && b.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
    .slice(0, 5);

  // Safe sorting for createdAt (in case older bookings don't have it)
  const recent = [...myBookings]
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 6);

  // Chart data for last 7 days bookings
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en', { weekday: 'short' });
    const dayBookings = myBookings.filter(b => b.createdAt && b.createdAt.startsWith(dateStr));
    return {
      name: label,
      Approved: dayBookings.filter(b => b.status === 'APPROVED').length,
      Pending: dayBookings.filter(b => b.status === 'PENDING').length,
      Rejected: dayBookings.filter(b => b.status === 'REJECTED').length,
    };
  });

  const formatDate = (d) => {
    if (!d) return '';
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const statCards = [
    { label: isAdmin ? 'Total Bookings' : 'My Bookings', value: stats.total, icon: CalendarCheck, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    { label: 'Approved', value: stats.approved, icon: CalendarCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Component */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Wrapper with Dynamic Margin */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Header />
        <div className="p-4 lg:p-6 space-y-6">
          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-gray-900 text-2xl font-semibold">
                {isAdmin ? 'Admin Dashboard' : `Welcome, ${currentUser?.name?.split(' ')[0] || 'User'}`}
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {isAdmin
                  ? `${stats.pending} booking${stats.pending !== 1 ? 's' : ''} awaiting your review`
                  : `${stats.approved} confirmed · ${stats.pending} pending review`}
              </p>
            </div>
            {/* New Booking Button with Gradient */}
            <button
              onClick={() => navigate('/booking/new')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#0F6657] to-[#17A38A] text-white hover:from-[#0c5246] hover:to-[#128a74] shadow-[0_4px_12px_rgba(23,163,138,0.3)] border-t border-white/20 rounded-xl transition-all text-sm font-medium"
            >
              <CalendarPlus className="w-4 h-4" />
              New Booking
            </button>
          </div>

         {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {statCards.map((card) => {
              const IconComponent = card.icon; // Assign it here to satisfy ESLint
              
              return (
                <div key={card.label} className={`bg-white rounded-xl border ${card.border} p-4 flex flex-col gap-3`}>
                  <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                    {/* Render the extracted component */}
                    <IconComponent className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl text-gray-900" style={{ fontWeight: 700 }}>{card.value}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{card.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
            {/* Chart */}
            <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-gray-900 font-medium">Booking Activity</h3>
                  <p className="text-gray-400 text-xs mt-0.5">Last 7 days</p>
                </div>
                <TrendingUp className="w-4 h-4 text-gray-300" />
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} barSize={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                    cursor={{ fill: '#f9fafb' }}
                  />
                  <Bar dataKey="Approved" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Rejected" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick actions / stats */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-gray-900 mb-4 font-medium">Quick Actions</h3>
              <div className="space-y-2">
                
                {/* --- Quick Action Make a Booking (Green Theme) --- */}
                <button
                  onClick={() => navigate('/booking/new')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-emerald-50 hover:bg-[#17A38A]/10 transition-colors group text-left border border-transparent hover:border-[#17A38A]/20"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0F6657] to-[#17A38A] flex items-center justify-center flex-shrink-0 shadow-sm border-t border-white/20">
                    <CalendarPlus className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[#0F6657] text-sm font-medium">Make a Booking</p>
                    <p className="text-[#17A38A] text-xs">Reserve a resource</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#17A38A] group-hover:translate-x-0.5 transition-transform" />
                </button>
                
                <button
                  onClick={() => navigate('/resources')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 text-sm font-medium">Browse Resources</p>
                    <p className="text-gray-400 text-xs">{resources?.length || 0} available resources</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
                {/* --- NEW: Raise a Ticket Action (Light Orange Theme) --- */}
                  <button
                    onClick={() => navigate('/maintenance')}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-orange-50/80 hover:bg-orange-500/10 transition-colors group text-left border border-transparent hover:border-orange-500/20"
                  >
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <Wrench className="w-4 h-4 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 text-sm font-medium">Raise a Ticket</p>
                      <p className="text-gray-500 text-xs">Report a maintenance issue</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-orange-500 group-hover:translate-x-0.5 transition-transform" />
                  </button>
          
                {isAdmin && (
                  <button
                    onClick={() => navigate('/bookings/all')}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors group text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-amber-900 text-sm font-medium">Review Pending</p>
                      <p className="text-amber-600 text-xs">{stats.pending} awaiting approval</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}
              </div>

              {isAdmin && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-500 text-xs font-medium">System Overview</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-xs">Total Resources</span>
                      <span className="text-gray-900 text-xs font-medium">{resources?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-xs">Rooms</span>
                      <span className="text-gray-900 text-xs font-medium">{resources?.filter(r => r.type === 'room').length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-xs">Labs</span>
                      <span className="text-gray-900 text-xs font-medium">{resources?.filter(r => r.type === 'lab').length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-xs">Equipment</span>
                      <span className="text-gray-900 text-xs font-medium">{resources?.filter(r => r.type === 'equipment').length || 0}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming bookings */}
          {upcoming.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <h3 className="text-gray-900 font-medium">Upcoming Approved Bookings</h3>
                <button
                  onClick={() => navigate(isAdmin ? '/bookings/all' : '/bookings/my')}
                  className="flex items-center gap-1 text-[#17A38A] text-xs hover:underline"
                >
                  View all <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {upcoming.map(booking => {
                  const resource = getResourceById(booking.resourceId);
                  return (
                    <div key={booking.id} className="flex items-center gap-4 px-5 py-3.5">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                        <CalendarCheck className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 text-sm font-medium truncate">{resource?.name || 'Unknown Resource'}</p>
                        <p className="text-gray-400 text-xs truncate">{booking.purpose}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-gray-700 text-xs font-medium">{formatDate(booking.date)}</p>
                        <p className="text-gray-400 text-xs">{booking.startTime} – {booking.endTime}</p>
                      </div>
                      <StatusBadge status={booking.status} size="sm" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent bookings table */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h3 className="text-gray-900 font-medium">Recent Requests</h3>
              <button
                onClick={() => navigate(isAdmin ? '/bookings/all' : '/bookings/my')}
                className="flex items-center gap-1 text-[#17A38A] text-xs hover:underline"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Resource</th>
                    {isAdmin && <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Requester</th>}
                    <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Date & Time</th>
                    <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Purpose</th>
                    <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recent.map(booking => {
                    const resource = getResourceById(booking.resourceId);
                    return (
                      <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3">
                          <p className="text-gray-900 text-sm font-medium">{resource?.name || 'Unknown Resource'}</p>
                          <p className="text-gray-400 text-xs capitalize">{resource?.type || 'N/A'}</p>
                        </td>
                        {isAdmin && (
                          <td className="px-5 py-3">
                            <p className="text-gray-900 text-sm">{booking.userName}</p>
                            <p className="text-gray-400 text-xs">{booking.userDept}</p>
                          </td>
                        )}
                        <td className="px-5 py-3">
                          <p className="text-gray-700 text-sm">{formatDate(booking.date)}</p>
                          <p className="text-gray-400 text-xs">{booking.startTime} – {booking.endTime}</p>
                        </td>
                        <td className="px-5 py-3">
                          <p className="text-gray-700 text-sm max-w-[200px] truncate">{booking.purpose}</p>
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge status={booking.status} size="sm" />
                        </td>
                      </tr>
                    );
                  })}
                  {recent.length === 0 && (
                    <tr>
                      <td colSpan={isAdmin ? 5 : 4} className="px-5 py-8 text-center text-gray-500 text-sm">
                        No recent bookings found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* --- ADD THE AI CHAT WIDGET HERE --- */}
      <AIChat />
    </div>
  );
}