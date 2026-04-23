import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarPlus, Building2, FlaskConical, Wrench, MapPin,
  Calendar, Clock, Users, ChevronDown, XCircle, Info,
  Search, AlertCircle, CheckCircle, Eye, Pencil,
  Hash, FileText, Bell, ArrowLeft, Share2, X
} from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { StatusBadge } from '../../components/StatusBadge';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { QRCodeSVG } from 'qrcode.react';

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

// Helper component for the Details Modal
function InfoCard({ icon, label, value, accent }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-start gap-3 hover:-translate-y-0.5 hover:shadow-md transition-all cursor-default">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${accent || "bg-indigo-50 text-indigo-500"}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-gray-400 mb-0.5 uppercase tracking-wide font-bold">{label}</p>
        <p className="text-sm text-gray-800 truncate font-semibold">{value}</p>
      </div>
    </div>
  );
}

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
      : 'focus:border-[#17A38A] focus:ring-[#17A38A]/10',
    textAccent: isLecturer ? 'text-[#8A3505]' : 'text-[#0F6657]',
    hoverText: isLecturer ? 'hover:text-[#8A3505]' : 'hover:text-[#0F6657]',
    borderAccent: isLecturer ? 'border-[#8A3505]' : 'border-[#0F6657]',
    bgAccent: isLecturer ? 'bg-[#8A3505]' : 'bg-[#0F6657]',
    lightBg: isLecturer ? 'bg-[#8A3505]/10' : 'bg-[#0F6657]/10',
  };

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');

  // Create a local state to hold JUST this user's bookings, so we can sort and filter without affecting global state
  const [myBookings, setMyBookings] = useState([]);

  // Fetch the data using the REST API when the page loads (or when bookings change)
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
  }, [currentUser, fetchUserBookings, bookings]); 

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

  // Target the specific booking to open in the Modal
  const expandedBooking = expandedId ? myBookings.find(b => b.id === expandedId) : null;
  const expandedResource = expandedBooking ? getResourceById(expandedBooking.resourceId) : null;
  
  // Progress Bar Logic Map
  const getSteps = (currentStatus) => {
    return [
      { label: "Submitted", done: true, active: false },
      { label: "Under Review", done: currentStatus !== 'PENDING', active: currentStatus === 'PENDING' },
      { 
        label: currentStatus === 'REJECTED' ? "Rejected" : currentStatus === 'CANCELLED' ? "Cancelled" : "Decision", 
        done: currentStatus === 'APPROVED' || currentStatus === 'REJECTED' || currentStatus === 'CANCELLED', 
        active: false 
      },
      { label: "Confirmed", done: currentStatus === 'APPROVED', active: currentStatus === 'APPROVED' },
    ];
  };

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
                const isPast = booking.date < today;
                const canCancel = booking.status === 'PENDING' || (booking.status === 'APPROVED' && !isPast);

                return (
                  <div key={booking.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <div
                      className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 cursor-pointer"
                      onClick={() => setExpandedId(booking.id)}
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
                              
                              {/* Edit Button that only shows if status is PENDING */}
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
                                    setCancellingId(booking.id); 
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
                                  setExpandedId(booking.id);
                                }}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border bg-white border-gray-200 text-gray-600 hover:bg-gray-50`}
                              >
                                <Eye className={`w-3.5 h-3.5 text-gray-400`} />
                                <span className="hidden sm:inline">View Details</span>
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
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cancellation Popup Modal */}
      {cancellingId && (
        <div className="fixed inset-0 z- flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
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

      {/* Booking Details Popup Modal */}
      {expandedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setExpandedId(null)} />
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

            {/* Top Header Bar */}
            <div className="flex items-center justify-between p-4 bg-white border-b border-gray-50">
              <button onClick={() => setExpandedId(null)} className={`flex items-center gap-1.5 text-sm ${theme.textAccent} hover:opacity-80 transition-opacity font-medium`}>
                <ArrowLeft className="w-4 h-4" /> Back to List
              </button>
              <div className="flex items-center gap-2">
                {/* Share button removed as requested */}
                <button onClick={() => setExpandedId(null)} className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            {/* Scrollbar is completely hidden until the user hovers/scrolls the modal area */}
            <div className="overflow-y-auto overflow-x-hidden pb-4 scroll-smooth [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300/80 active:[&::-webkit-scrollbar-thumb]:bg-gray-400 [scrollbar-width:thin] [scrollbar-color:transparent_transparent] hover:[scrollbar-color:#d1d5db_transparent]">
              {/* Hero Image Section */}
              <div className="relative h-48 overflow-hidden bg-slate-900">
                <img 
                  src="https://images.unsplash.com/photo-1771911650735-b471e85e8b17?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWN0dXJlJTIwaGFsbCUyMGF1ZGl0b3JpdW0lMjBtb2Rlcm4lMjBpbnRlcmlvcnxlbnwxfHx8fDE3NzY5MjY1Mzl8MA&ixlib=rb-4.1.0&q=80&w=1080" 
                  alt="Venue" 
                  className="w-full h-full object-cover opacity-70" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                <div className="absolute top-4 right-4">
                  <StatusBadge status={expandedBooking.status} />
                </div>

                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white text-xs border border-white/20 font-mono">
                  <Hash className="w-3 h-3" />
                  ID-{expandedBooking.id.slice(-5).toUpperCase()}
                </div>

                <div className="absolute bottom-4 left-5 right-5">
                  <h1 className="text-white text-2xl drop-shadow-sm font-semibold">{expandedResource?.name || 'Unknown Resource'}</h1>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Building2 className="w-4 h-4 text-white/70" />
                    <span className="text-white/80 text-sm">{expandedResource?.location || 'No location specified'}</span>
                  </div>
                </div>
              </div>

              {/* Quick Info Strip */}
              <div className="flex flex-wrap items-center gap-4 px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                  <Calendar className={`w-4 h-4 ${theme.textAccent}`} />
                  {formatDate(expandedBooking.date)}
                </div>
                <div className="hidden sm:block w-px h-4 bg-gray-300" />
                <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                  <Clock className={`w-4 h-4 ${theme.textAccent}`} />
                  {expandedBooking.startTime} – {expandedBooking.endTime}
                </div>
                <div className="hidden sm:block w-px h-4 bg-gray-300" />
                <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                  <Users className={`w-4 h-4 ${theme.textAccent}`} />
                  {expandedBooking.attendees || 0} attendees
                </div>
              </div>

              {/* Status Timeline Map */}
              <div className="px-6 py-6 border-b border-gray-50">
                <p className="text-[11px] text-gray-400 uppercase tracking-wide font-bold mb-5">Booking Progress</p>
                
                {/* Segmented Progress Tracker */}
                <div className="flex items-start">
                  {getSteps(expandedBooking.status).map((step, idx, arr) => (
                    <div key={idx} className={`flex ${idx === arr.length - 1 ? 'flex-none' : 'flex-1'}`}>
                      
                      {/* Status Node */}
                      <div className="flex flex-col items-center relative w-12">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs transition-colors z-10 ${
                            step.done && step.label !== 'Rejected' && step.label !== 'Cancelled' ? `${theme.bgAccent} ${theme.borderAccent} text-white shadow-sm` :
                            step.label === 'Rejected' || step.label === 'Cancelled' ? "bg-red-500 border-red-500 text-white shadow-sm shadow-red-200" :
                            step.active ? "bg-amber-400 border-amber-400 text-white shadow-sm shadow-amber-200" :
                            "bg-white border-gray-200 text-gray-300"
                        }`}>
                          {step.done || step.active ? <CheckCircle className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-gray-200" />}
                        </div>
                        {/* Status Label (Absolute so it doesn't break flex line alignment) */}
                        <span className={`text-[11px] font-bold mt-2 text-center whitespace-nowrap absolute top-9 ${step.done || step.active ? "text-gray-800" : "text-gray-400"}`}>
                          {step.label}
                        </span>
                      </div>
                      
                      {/* Attractive Connecting Line */}
                      {idx < arr.length - 1 && (
                        <div className="flex-1 mt-[14px] mx-1 relative h-1.5">
                          {/* Grey Background Track */}
                          <div className="absolute inset-0 bg-gray-100 rounded-full" />
                          {/* Theme Colored Fill */}
                          <div className={`absolute left-0 top-0 bottom-0 rounded-full transition-all duration-500 ${
                            step.done && step.label !== 'Rejected' && step.label !== 'Cancelled' 
                              ? theme.bgAccent 
                              : 'bg-transparent'
                          }`} style={{ width: step.done ? '100%' : '0%' }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {/* Spacer to accommodate the absolute labels */}
                <div className="h-6"></div>
              </div>

              {/* Feedback & Actions Area */}
              <div className="px-6 py-6 bg-gray-50/50">
                
                {/* Admin Feedback Section */}
                {(expandedBooking.rejectionReason || expandedBooking.adminNote) && (
                  <div className={`mb-5 p-4 rounded-2xl border ${
                    expandedBooking.status === 'REJECTED' ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {expandedBooking.status === 'REJECTED' ? <AlertCircle className="w-5 h-5 text-red-600" /> : <CheckCircle className="w-5 h-5 text-emerald-600" />}
                      </div>
                      <div>
                        <p className={`text-xs font-bold uppercase tracking-wider ${expandedBooking.status === 'REJECTED' ? 'text-red-800' : 'text-emerald-800'}`}>
                          {expandedBooking.status === 'REJECTED' ? 'Reason for Rejection' : 'Admin Note'}
                        </p>
                        <p className={`text-sm mt-1 font-medium ${expandedBooking.status === 'REJECTED' ? 'text-red-700' : 'text-emerald-700'}`}>
                          {expandedBooking.status === 'REJECTED' ? expandedBooking.rejectionReason : expandedBooking.adminNote}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* User Cancellation Reason */}
                {expandedBooking.status === 'CANCELLED' && expandedBooking.cancellationReason && (
                  <div className="mb-5 p-4 rounded-2xl border bg-white border-gray-200">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-700">Reason for Cancellation</p>
                        <p className="text-sm mt-1 text-gray-600 font-medium">{expandedBooking.cancellationReason}</p>
                      </div>
                    </div>
                  </div>
                )}

              {/* Specific Details Grid */}
              <div className="px-6 py-6 border-b border-gray-50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InfoCard icon={<Hash className="w-4 h-4" />} label="Booking ID" value={`ID-${expandedBooking.id.slice(-5).toUpperCase()}`} accent={`${theme.lightBg} ${theme.textAccent}`} />
                  <InfoCard icon={<Calendar className="w-4 h-4" />} label="Booking Date" value={formatDate(expandedBooking.date)} accent="bg-blue-50 text-blue-600" />
                  <InfoCard icon={<Clock className="w-4 h-4" />} label="Booking Time" value={`${expandedBooking.startTime} – ${expandedBooking.endTime}`} accent="bg-violet-50 text-violet-600" />
                  <InfoCard icon={<Users className="w-4 h-4" />} label="Attendees" value={`${expandedBooking.attendees || 0} people`} accent="bg-sky-50 text-sky-600" />
                  <InfoCard icon={<MapPin className="w-4 h-4" />} label="Location" value={expandedResource?.location || 'N/A'} accent="bg-emerald-50 text-emerald-600" />
                  <InfoCard icon={<FileText className="w-4 h-4" />} label="Special Requests" value={expandedBooking.specialRequests || 'None'} accent="bg-orange-50 text-orange-600" />
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 font-medium">
                  <Bell className="w-3.5 h-3.5" /> Submitted on {formatCreated(expandedBooking.createdAt)}
                </div>
              </div>

                {/* QR CODE */}
                {expandedBooking.status === 'APPROVED' && (
                  <div className="mb-5 p-5 bg-white border border-gray-100 rounded-2xl flex flex-col sm:flex-row items-center gap-6 shadow-sm">
                    <div className="p-3 rounded-xl border border-gray-100 bg-white shadow-sm">
                      <QRCodeSVG value={`${window.location.origin}/admin/verify/${expandedBooking.id}`} size={100} />
                    </div>
                    <div className="text-center sm:text-left">
                      <h4 className="font-semibold text-gray-900 mb-1">Check-in QR Code</h4>
                      <p className="text-sm text-gray-500 mb-3">Show this code to the admin or facility manager upon arrival.</p>
                      {expandedBooking.checkedIn ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-sm font-medium border border-emerald-200">
                          <CheckCircle className="w-4 h-4 text-emerald-600" /> Checked In Successfully
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium border border-gray-200">
                          <Clock className="w-4 h-4 text-gray-400" /> Awaiting Check-in
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {expandedBooking.status === 'PENDING' && (
                    <button
                      onClick={() => {
                        setExpandedId(null);
                        navigate(`/booking/edit/${expandedBooking.id}`);
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-medium transition-all ${theme.gradientBtn}`}
                    >
                      <Pencil className="w-4 h-4" /> Edit Request
                    </button>
                  )}
                  
                  {(expandedBooking.status === 'PENDING' || (expandedBooking.status === 'APPROVED' && expandedBooking.date >= today)) && (
                    <button
                      onClick={() => {
                        setExpandedId(null);
                        setCancellingId(expandedBooking.id);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200 text-red-600 bg-white text-sm font-medium shadow-sm hover:bg-red-50 transition-all"
                    >
                      <XCircle className="w-4 h-4" /> Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}