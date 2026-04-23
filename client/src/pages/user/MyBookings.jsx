import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarPlus, Building2, FlaskConical, Wrench, MapPin,
  Calendar, Clock, Users, ChevronDown, XCircle, Info,
  Search, AlertCircle, CheckCircle, Eye, Pencil
} from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { StatusBadge } from '../../components/StatusBadge';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { QRCodeSVG } from 'qrcode.react'; // Corrected Import to fix React crash!

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
  // Pulled fetchUserBookings and bookings from Context
  const { currentUser, bookings, getResourceById, cancelBooking, fetchUserBookings } = useBooking();
  const navigate = useNavigate();

  // THEME: Determine if user is lecturer for styling purposes
  const currentRole = (currentUser?.role || '').toUpperCase();
  const isLecturer = currentRole === 'LECTURER';

  const theme = {
    gradientBtn: isLecturer 
      ? 'bg-gradient-to-r from-[#8A3505] to-[#C54E08] hover:from-[#702A04] hover:to-[#A74106] shadow-[0_4px_12px_rgba(167,65,6,0.3)]' 
      : 'bg-gradient-to-r from-[#0F6657] to-[#17A38A] hover:from-[#0c5246] hover:to-[#128a74] shadow-[0_4px_12px_rgba(23,163,138,0.3)]',
    activeFilter: isLecturer
      ? 'bg-gradient-to-r from-[#8A3505] to-[#C54E08] text-white shadow-md border-t border-white/20'
      : 'bg-gradient-to-r from-[#0F6657] to-[#17A38A] text-white shadow-md border-t border-white/20',
    focusRing: isLecturer
      ? 'focus:border-[#C54E08] focus:ring-[#C54E08]/10'
      : 'focus:border-[#17A38A] focus:ring-[#17A38A]/10'
  };

  // Add Sidebar State and other UI states
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');

  // 1. Create a local state to hold JUST this user's bookings
  const [myBookings, setMyBookings] = useState([]);

  // 2. Fetch the data using the REST API when the page loads (or when bookings change)
  useEffect(() => {
    const loadData = async () => {
      const emailToSearch = currentUser?.email || 'it23345478@my.sliit.lk'; 
      
      const userSpecificBookings = await fetchUserBookings(emailToSearch);
      
      const sorted = userSpecificBookings.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setMyBookings(sorted);
    };

    loadData();
  }, [currentUser, fetchUserBookings, bookings]); // Added 'bookings' so it updates automatically when you cancel!

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

  const formatCreated = (iso) => new Date(iso).toLocaleString('en', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true
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
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Header />
        <div className="p-4 lg:p-6 space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">My Bookings</h1>
              <p className="text-gray-500 text-sm mt-0.5">{myBookings.length} total booking{myBookings.length !== 1 ? 's' : ''}</p>
            </div>
            {/* Dynamic Gradient Button */}
            <button
              onClick={() => navigate('/booking/new')}
              className={`sm:ml-auto inline-flex items-center gap-2 px-4 py-2.5 text-white border-t border-white/20 rounded-xl transition-all text-sm font-medium ${theme.gradientBtn}`}
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
                    ? theme.activeFilter
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
              <input
                type="text"
                placeholder="Search bookings..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={`pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:ring-2 transition-all w-full sm:w-56 ${theme.focusRing}`}
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
                  className={`mt-4 inline-flex items-center gap-2 px-4 py-2 text-white border-t border-white/20 rounded-xl transition-all text-sm font-medium ${theme.gradientBtn}`}
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
                        <div className="flex items-start justify-between gap-4">

                          {/* Left side: Name and purpose */}
                          <div>
                            <p className="text-gray-900 text-sm font-medium">{resource?.name || 'Unknown Resource'}</p>
                            <p className="text-gray-400 text-xs truncate mt-0.5">{booking.purpose}</p>
                          </div>

                          {/* Right side: Status, Button, and Submitted text grouped together */}
<div className="flex flex-col items-end gap-2 flex-shrink-0">
  <div className="flex items-center gap-3">
    <div className="scale-90 origin-right">
      <StatusBadge status={booking.status} />
    </div>
    
    {/* NEW: Edit Button - Only shows if status is PENDING */}
    {booking.status === 'PENDING' && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/booking/edit/${booking.id}`); 
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-blue-200 text-blue-600 bg-white hover:bg-blue-50 shadow-sm"
      >
        <Pencil className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Edit</span>
      </button>
    )}

    {/* Cancel Button */}
    {canCancel && (
      <button
        onClick={(e) => {
                                        e.stopPropagation();
                                        setCancellingId(booking.id); // Only triggers the popup now
                                      }}
                                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-red-200 text-red-600 bg-white hover:bg-red-50 shadow-sm"
                                    >
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Cancel Booking</span>
                                  </button>
                                )}
                                
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation(); 
                                    setExpandedId(isExpanded ? null : booking.id);
                                  }}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                                  isExpanded 
                                    ? (isLecturer 
                                        ? 'bg-[#8A3505]/10 border-[#8A3505]/30 text-[#8A3505]' 
                                        : 'bg-[#0F6657]/10 border-[#0F6657]/30 text-[#0F6657]')
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                              >
                                <Eye className={`w-3.5 h-3.5 ${isExpanded ? (isLecturer ? 'text-[#8A3505]' : 'text-[#0F6657]') : 'text-gray-400'}`} />
                                <span className="hidden sm:inline">{isExpanded ? 'Hide Details' : 'View Details'}</span>
                              </button>
                            </div>
                            <span className="text-gray-400 text-[11px] hidden sm:block">
                              Submitted {formatCreated(booking.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Bottom Row */}
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
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className={`border-t border-gray-50 bg-slate-50/50 border-l-4 border-r-transparent p-4 sm:p-5 ${isLecturer ? 'border-l-[#8A3505]' : 'border-l-[#0F6657]'}`}>
                        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                          
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5 pb-5 border-b border-gray-50">
                              <div>
                                <p className="text-gray-400 text-xs mb-1.5">Booking ID</p>
                                <p className="text-gray-700 text-sm font-mono">ID-{booking.id.slice(-5).toUpperCase()}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-xs mb-1.5">Submitted On</p>
                                <p className="text-gray-700 text-sm">{formatCreated(booking.createdAt)}</p>
                              </div>
                              
                              <div>
                                <p className="text-gray-400 text-xs mb-1.5">Booking Date</p>
                                <p className="text-gray-700 text-sm">{formatDate(booking.date)}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-xs mb-1.5">Booking Time</p>
                                <p className="text-gray-700 text-sm">{booking.startTime} – {booking.endTime}</p>
                              </div>
                              
                              <div>
                                {booking.attendees && (
                                  <>
                                    <p className="text-gray-400 text-xs mb-1.5">Attendees</p>
                                    <p className="text-gray-700 text-sm">{booking.attendees}</p>
                                  </>
                                )}
                              </div>
                              <div>
                                {resource?.location && (
                                  <>
                                    <p className="text-gray-400 text-xs mb-1.5">Location</p>
                                    <p className="text-gray-700 text-sm">{resource.location}</p>
                                  </>
                                )}
                              </div>
                              
                              <div>
                                {booking.specialRequests && (
                                  <>
                                    <p className="text-gray-400 text-xs mb-1.5">Special Requests</p>
                                    <p className="text-gray-700 text-sm">{booking.specialRequests}</p>
                                  </>
                                )}
                              </div>
                            </div>

                          {booking.status === 'PENDING' && (
                            <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl">
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

                          {/* QR CODE CHECK-IN SECTION WITH CORRECTED SVG IMPORT */}
                          {booking.status === 'APPROVED' && (
                            <div className={`mt-4 p-5 border rounded-xl flex flex-col sm:flex-row items-center gap-6 transition-colors ${
                              isLecturer ? 'bg-[#8A3505]/5 border-[#8A3505]/20' : 'bg-[#0F6657]/5 border-[#0F6657]/20'
                            }`}>
                              <div className="bg-white p-3 rounded-lg shadow-sm">
                                {/* The QR Code points to the Admin Verification Page */}
                                <QRCodeSVG 
                                  value={`${window.location.origin}/admin/verify/${booking.id}`}
                                  size={120} 
                                />
                              </div>
                              <div className="text-center sm:text-left">
                                <h4 className={`font-semibold mb-1 ${
                                  isLecturer ? 'text-[#8A3505]' : 'text-[#0F6657]'
                                }`}>Check-in QR Code</h4>
                                
                                <p className={`text-sm mb-3 ${
                                  isLecturer ? 'text-[#8A3505]/80' : 'text-[#0F6657]/80'
                                }`}>
                                  Show this code to the admin or facility manager when you arrive at the location.
                                </p>
                                
                                {booking.checkedIn ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-sm font-medium border border-emerald-200">
                                    <CheckCircle className="w-4 h-4 text-emerald-600" /> Checked In Successfully
                                  </span>
                                ) : (
                                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium ${
                                    isLecturer ? 'bg-[#8A3505]/10 text-[#8A3505]' : 'bg-[#0F6657]/10 text-[#0F6657]'
                                  }`}>
                                    Awaiting Check-in
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {/* Cancellation Popup Modal */}
      {cancellingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-red-100 rounded-full text-red-600">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Cancel Booking</h3>
              </div>
              
              <p className="text-gray-600 text-sm mb-5">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-1.5">
                  Reason for cancellation <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Please tell us why you are cancelling..."
                  value={cancelReason}
                  onChange={(e) => {
                    setCancelReason(e.target.value);
                    if (cancelError) setCancelError('');
                  }}
                  className={`w-full px-4 py-3 text-sm rounded-xl border outline-none resize-none transition-all ${
                    cancelError 
                      ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10' 
                      : 'border-gray-200 bg-gray-50 focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-500/10'
                  }`}
                />
                {cancelError && <p className="text-red-500 text-xs mt-1.5 font-medium">{cancelError}</p>}
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
                <button
                  onClick={resetCancelState}
                  className="px-4 py-2.5 text-gray-600 font-medium text-sm hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Keep Booking
                </button>
                <button
                  onClick={() => handleCancelSubmit(cancellingId)}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors shadow-sm shadow-red-600/20"
                >
                  <XCircle className="w-4 h-4" /> Confirm Cancellation
                </button>
              </div>
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
}