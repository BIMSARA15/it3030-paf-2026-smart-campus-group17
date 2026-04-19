import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarPlus, Building2, FlaskConical, Wrench, MapPin,
  Calendar, Clock, Users, ChevronDown, XCircle, Info,
  Search, AlertCircle, CheckCircle
} from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { StatusBadge } from '../../components/StatusBadge';

// 1. Import Sidebar
import Sidebar from '../../components/Sidebar';

const TYPE_ICONS = {
  room: <Building2 className="w-4 h-4" />,
  lab: <FlaskConical className="w-4 h-4" />,
  equipment: <Wrench className="w-4 h-4" />,
};

const TYPE_COLORS = {
  room: 'bg-blue-100 text-blue-600',
  lab: 'bg-violet-100 text-violet-600',
  equipment: 'bg-orange-100 text-orange-600',
};

export default function MyBookings() {
  const { currentUser, bookings, getResourceById, cancelBooking } = useBooking();
  const navigate = useNavigate();
  
  // 2. Add Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');

  // Match bookings by email instead of ID
  const testUserEmail = currentUser?.email || 'it23345478@my.sliit.lk';

  const myBookings = bookings
    .filter(b => b.userEmail === testUserEmail)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filtered = myBookings.filter(b => {
    const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const resource = getResourceById(b.resourceId);
    const matchSearch = search === '' ||
      resource?.name.toLowerCase().includes(search.toLowerCase()) ||
      b.purpose.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    ALL: myBookings.length,
    PENDING: myBookings.filter(b => b.status === 'PENDING').length,
    APPROVED: myBookings.filter(b => b.status === 'APPROVED').length,
    REJECTED: myBookings.filter(b => b.status === 'REJECTED').length,
    CANCELLED: myBookings.filter(b => b.status === 'CANCELLED').length,
  };

  const formatDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  });

  const formatCreated = (iso) => new Date(iso).toLocaleDateString('en', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  const today = new Date().toISOString().split('T')[0];

  const handleCancelSubmit = (id) => {
    if (!cancelReason.trim()) {
      setCancelError('Please tell us why you are cancelling.');
      return;
    }
    cancelBooking(id, cancelReason); 
    setCancellingId(null);
    setCancelReason('');
    setCancelError('');
  };

  const resetCancelState = () => {
    setCancellingId(null);
    setCancelReason('');
    setCancelError('');
  };

  return (
    // 3. Add Layout Wrapper
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="p-4 lg:p-6 space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">My Bookings</h1>
              <p className="text-gray-500 text-sm mt-0.5">{myBookings.length} total booking{myBookings.length !== 1 ? 's' : ''}</p>
            </div>
            {/* UPDATED: Green Gradient Button */}
            <button
              onClick={() => navigate('/booking/new')}
              className="sm:ml-auto inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#0F6657] to-[#17A38A] text-white hover:from-[#0c5246] hover:to-[#128a74] shadow-[0_4px_12px_rgba(23,163,138,0.3)] border-t border-white/20 rounded-xl transition-all text-sm font-medium"
            >
              <CalendarPlus className="w-4 h-4" /> New Booking
            </button>
          </div>

          {/* Status filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2 flex-wrap">
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all ${
                    statusFilter === s
                      ? 'bg-gradient-to-r from-[#0F6657] to-[#17A38A] text-white shadow-md border-t border-white/20' // UPDATED: Active state gradient
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                    statusFilter === s ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {counts[s]}
                  </span>
                </button>
              ))}
            </div>
            <div className="relative sm:ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              {/* UPDATED: Search input focus ring */}
              <input
                type="text"
                placeholder="Search bookings..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-[#17A38A] focus:ring-2 focus:ring-[#17A38A]/10 transition-all w-full sm:w-56"
              />
            </div>
          </div>

          {/* Bookings list */}
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
              <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-gray-500">No bookings found</h3>
              <p className="text-gray-400 text-sm mt-1">
                {myBookings.length === 0 ? "You haven't made any bookings yet." : "Try adjusting your filters."}
              </p>
              {myBookings.length === 0 && (
                <button
                  onClick={() => navigate('/booking/new')}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0F6657] to-[#17A38A] text-white hover:from-[#0c5246] hover:to-[#128a74] shadow-[0_4px_12px_rgba(23,163,138,0.3)] border-t border-white/20 rounded-xl transition-all text-sm font-medium"
                >
                  <CalendarPlus className="w-4 h-4" /> Make Your First Booking
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(booking => {
                const resource = getResourceById(booking.resourceId);
                const isExpanded = expandedId === booking.id;
                const isPast = booking.date < today;
                const canCancel = booking.status === 'PENDING' || (booking.status === 'APPROVED' && !isPast);

                return (
                  <div key={booking.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <div
                      className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                    >
                      {/* Resource type icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        resource ? TYPE_COLORS[resource.type] : 'bg-gray-100 text-gray-400'
                      }`}>
                        {resource ? TYPE_ICONS[resource.type] : <Building2 className="w-4 h-4" />}
                      </div>

                      {/* Main info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-gray-900 text-sm font-medium">{resource?.name || 'Unknown Resource'}</p>
                            <p className="text-gray-400 text-xs truncate mt-0.5">{booking.purpose}</p>
                          </div>
                          <StatusBadge status={booking.status} size="sm" />
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <div className="flex items-center gap-1 text-gray-400 text-xs">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(booking.date)}
                          </div>
                          <div className="flex items-center gap-1 text-gray-400 text-xs">
                            <Clock className="w-3.5 h-3.5" />
                            {booking.startTime} – {booking.endTime}
                          </div>
                          {booking.attendees && (
                            <div className="flex items-center gap-1 text-gray-400 text-xs">
                              <Users className="w-3.5 h-3.5" />
                              {booking.attendees} attendees
                            </div>
                          )}
                          {resource && (
                            <div className="flex items-center gap-1 text-gray-400 text-xs">
                              <MapPin className="w-3.5 h-3.5" />
                              {resource.location}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-gray-300 text-xs hidden sm:block">Submitted {formatCreated(booking.createdAt)}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="border-t border-gray-50 px-5 py-4 bg-gray-50/50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-gray-400 text-xs mb-1.5">Booking ID</p>
                            <p className="text-gray-700 text-sm font-mono">{booking.id}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs mb-1.5">Submitted On</p>
                            <p className="text-gray-700 text-sm">{formatCreated(booking.createdAt)}</p>
                          </div>
                          {booking.lecturer && (
                            <div>
                              <p className="text-gray-400 text-xs mb-1.5">Lecturer in Charge</p>
                              <p className="text-gray-700 text-sm">{booking.lecturer}</p>
                            </div>
                          )}
                          {booking.specialRequests && (
                            <div>
                              <p className="text-gray-400 text-xs mb-1.5">Special Requests</p>
                              <p className="text-gray-700 text-sm">{booking.specialRequests}</p>
                            </div>
                          )}
                        </div>

                        {booking.status === 'PENDING' && (
                          <div className="mt-3 flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                            <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            <p className="text-amber-700 text-sm">Your request is awaiting admin review. You'll be notified once a decision is made.</p>
                          </div>
                        )}

                        {/* Admin Feedback Section */}
                        {(booking.rejectionReason || booking.adminNote) && (
                          <div className={`mt-3 p-3 rounded-xl border ${
                            booking.status === 'REJECTED' 
                              ? 'bg-red-50 border-red-100' 
                              : 'bg-emerald-50 border-emerald-100'
                          }`}>
                            <div className="flex items-start gap-2">
                              <div className="mt-0.5">
                                {booking.status === 'REJECTED' ? (
                                  <AlertCircle className="w-4 h-4 text-red-600" />
                                ) : (
                                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                                )}
                              </div>
                              <div>
                                <p className={`text-xs font-semibold uppercase tracking-wider ${
                                  booking.status === 'REJECTED' ? 'text-red-800' : 'text-emerald-800'
                                }`}>
                                  {booking.status === 'REJECTED' ? 'Reason for Rejection' : 'Admin Note'}
                                </p>
                                <p className={`text-sm mt-1 ${
                                  booking.status === 'REJECTED' ? 'text-red-700' : 'text-emerald-700'
                                }`}>
                                  {booking.status === 'REJECTED' ? booking.rejectionReason : booking.adminNote}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {booking.status === 'CANCELLED' && booking.cancellationReason && (
                          <div className="mt-3 p-3 rounded-xl border bg-gray-50 border-gray-200">
                            <div className="flex items-start gap-2">
                              <div className="mt-0.5">
                                <Info className="w-4 h-4 text-gray-500" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                                  Reason for Cancellation
                                </p>
                                <p className="text-sm mt-1 text-gray-600">
                                  {booking.cancellationReason}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {canCancel && (
                          <div className="mt-4 pt-4 border-t border-gray-200/50">
                            {cancellingId === booking.id ? (
                              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                                <p className="text-red-800 text-sm font-medium mb-3">Are you sure you want to cancel this booking?</p>
                                
                                <div className="mb-4">
                                  <label className="block text-red-800 text-xs mb-1.5">
                                    Reason for cancellation <span className="text-red-500">*</span>
                                  </label>
                                  <textarea
                                    rows={2}
                                    placeholder="Please tell us why you are cancelling..."
                                    value={cancelReason}
                                    onChange={(e) => {
                                      setCancelReason(e.target.value);
                                      if (cancelError) setCancelError('');
                                    }}
                                    className={`w-full px-3 py-2 text-sm rounded-lg border outline-none resize-none transition-colors ${
                                      cancelError 
                                        ? 'border-red-400 bg-red-50/50 focus:border-red-500 focus:bg-white' 
                                        : 'border-red-200 bg-white focus:border-red-400'
                                    }`}
                                  />
                                  {cancelError && <p className="text-red-600 text-xs mt-1.5">{cancelError}</p>}
                                </div>

                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleCancelSubmit(booking.id)}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                                  >
                                    <XCircle className="w-3.5 h-3.5" /> Confirm Cancellation
                                  </button>
                                  <button
                                    onClick={resetCancelState}
                                    className="px-4 py-2 border border-red-200 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors bg-white"
                                  >
                                    Keep Booking
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={e => { e.stopPropagation(); setCancellingId(booking.id); }}
                                className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 rounded-xl text-sm hover:bg-red-50 transition-colors bg-white"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Cancel Booking
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}