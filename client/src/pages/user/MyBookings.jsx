import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarPlus, Building2, FlaskConical, Wrench, MapPin,
  Calendar, Clock, Users, ChevronDown, XCircle, Info,
  Search, AlertCircle, CheckCircle, Eye, Pencil,
  Hash, FileText, Bell, ArrowLeft, Share2, X, QrCode, Download
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

const DEFAULT_RESOURCE_IMAGES = {
  lectureRoom: 'https://i.pinimg.com/736x/f8/98/46/f89846b24148276c9000e38c51c82ce5.jpg',
  lab: 'https://i.pinimg.com/736x/39/ee/cb/39eecbeca86920e153e277780f20feed.jpg',
  meetingRoom: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=800',
  equipment: 'https://i.pinimg.com/736x/64/e7/8f/64e78f4c21c54ff2b9765fa14b62267b.jpg',
};

const getResourceImage = (resource) => {
  if (!resource) return DEFAULT_RESOURCE_IMAGES.lectureRoom;
  if (resource.image) return resource.image;

  const originalType = (resource.resourceType || resource.type || '').toLowerCase();
  if (originalType.includes('meeting')) return DEFAULT_RESOURCE_IMAGES.meetingRoom;
  if (originalType.includes('lab')) return DEFAULT_RESOURCE_IMAGES.lab;
  if (originalType.includes('equipment') || originalType.includes('utility')) return DEFAULT_RESOURCE_IMAGES.equipment;

  return DEFAULT_RESOURCE_IMAGES.lectureRoom;
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
  // Pulled fetchUserBookings, bookings, AND utilities from Context
  const { currentUser, bookings, getResourceById, cancelBooking, fetchUserBookings, utilities } = useBooking();
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
    progressLine: isLecturer 
      ? 'bg-gradient-to-r from-[#8A3505] to-[#C54E08]' 
      : 'bg-gradient-to-r from-[#0F6657] to-[#17A38A]',
  };

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [qrModalId, setQrModalId] = useState(null); // QR code
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

  // NEW: Helper function to find the item in either Resources OR Utilities
  const getBookingItem = (id) => {
    // 1. Try to find it in normal resources (Rooms/Labs)
    let item = getResourceById(id);
    if (item) return item;

    // 2. If not found, try to find it in utilities (Equipments)
    const util = utilities?.find(u => u.id === id);
    if (util) {
      return {
        id: util.id,
        name: util.utilityName,
        type: 'equipment', // Tricks the UI into using the orange equipment styling
        location: util.location,
      };
    }
    return null;
  };

  const filtered = myBookings.filter(b => {
    const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const resource = getBookingItem(b.resourceId);
    const matchSearch = search === '' ||
      (resource?.name || '').toLowerCase().includes(search.toLowerCase()) ||
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

  const today = new Date().toISOString().split('T');

  // Target the specific booking to open in the Modal
  const expandedBooking = expandedId ? myBookings.find(b => b.id === expandedId) : null;
  const expandedResource = expandedBooking ? getBookingItem(expandedBooking.resourceId) : null;
  
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
      { label: "Approved", done: currentStatus === 'APPROVED', active: currentStatus === 'APPROVED' },
    ];
  };

  const handleCancelSubmit = async (id) => {
    if (!cancelReason.trim()) {
      setCancelError('Please tell us why you are cancelling.');
      return;
    }
    
    // Wait for the backend to process the cancellation
    await cancelBooking(id, cancelReason); 
    
    // Close the cancel form and clear inputs
    setCancellingId(null);
    setCancelReason('');
    setCancelError('');
    
    // Show our new Success Popup
    setShowSuccessModal(true);
  };

  const resetCancelState = () => {
    setCancellingId(null);
    setCancelReason('');
    setCancelError('');
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      // Fill with white background before drawing SVG
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `Booking-QR-${qrModalId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    // Convert SVG to data URL safely
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
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
              {/* <p className="text-gray-500 text-sm mt-0.5">{myBookings.length} total booking{myBookings.length !== 1 ? 's' : ''}</p> */}
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

          {/* Add this new block exactly here, under the filters */}
          <div className="text-sm text-gray-500 mt-2 mb-1">
            Showing {filtered.length} of {myBookings.length} bookings
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
                const resource = getBookingItem(booking.resourceId);
                const isPast = booking.date < today;
                const canCancel = booking.status === 'PENDING' || booking.status === 'APPROVED';

                return (
                  <div key={booking.id} className="relative bg-white rounded-xl border border-gray-100 overflow-hidden">
                    
                    {/* Status Badger */}
                    <div className="absolute top-4 right-5 scale-90 origin-top-right">
                      <StatusBadge status={booking.status} />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-start gap-4 p-5">
                      
                      {/* Resource type icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-3 ${
                        resource ? TYPE_COLORS[resource.type] : 'bg-gray-100 text-gray-400'
                      }`}>
                        {resource ? TYPE_ICONS[resource.type] : <Building2 className="w-4 h-4" />}
                      </div>

                      {/* Main info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        
                        {/* Text Content */}
                        <div className="pr-24">
                          <p className="text-gray-900 text-sm font-semibold truncate">{resource?.name || 'Unknown Resource'}</p>
                          <p className="text-gray-500 text-xs truncate mt-0.5">{booking.purpose}</p>
                        </div>

                        {/* Bottom Area */}
                        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 mt-4 border-t xl:border-t-0 pt-3 xl:pt-0 border-gray-100">
                          
                          {/* Left side meta tags */}
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1 text-gray-500 text-xs bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              {formatDate(booking.date)}
                            </div>
                            <div className="flex items-center gap-1 text-gray-500 text-xs bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              {booking.startTime} – {booking.endTime}
                            </div>
                            {booking.attendees && (
                              <div className="flex items-center gap-1 text-gray-500 text-xs bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                <Users className="w-3.5 h-3.5 text-gray-400" />
                                {booking.attendees} attendees
                              </div>
                            )}
                            {resource && (
                              <div className="flex items-center gap-1 text-gray-500 text-xs bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                <span className="truncate max-w-[120px]">{resource.location}</span>
                              </div>
                            )}
                          </div>

                          {/* Right side: Submitted Date & Action Buttons */}
                          <div className="flex items-center gap-2 flex-wrap w-full xl:w-auto xl:justify-end flex-shrink-0">

                            {/* Edit Button */}
                            {booking.status === 'PENDING' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/booking/edit/${booking.id}`); 
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-blue-200 text-blue-600 bg-white hover:bg-blue-50 shadow-sm flex-1 xl:flex-none justify-center"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                            )}

                            {/* QR Code Button (Only for APPROVED) */}
                            {booking.status === 'APPROVED' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); 
                                  setQrModalId(booking.id);
                                }}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border bg-white shadow-sm flex-1 xl:flex-none justify-center ${
                                  isLecturer 
                                    ? 'border-[#8A3505]/30 text-[#8A3505] hover:bg-[#8A3505]/10' 
                                    : 'border-[#0F6657]/30 text-[#0F6657] hover:bg-[#0F6657]/10'
                                }`}
                              >
                                <QrCode className="w-3.5 h-3.5" />
                                <span>QR Code</span>
                              </button>
                            )}

                            {/* Cancel Button */}
                            {canCancel && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCancellingId(booking.id); 
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-red-200 text-red-600 bg-white hover:bg-red-50 shadow-sm flex-1 xl:flex-none justify-center"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Cancel</span>
                              </button>
                            )}

                            {/* Details Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); 
                                setExpandedId(booking.id);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm flex-1 xl:flex-none justify-center"
                            >
                              <Eye className={`w-3.5 h-3.5 text-gray-400`} />
                              <span>Details</span>
                            </button>
                          </div>
                        </div>
                        <br />
                        {/* Submitted Text Moved Below */}
                        <span className="text-gray-400 text-[11px] font-medium w-full xl:w-auto text-left xl:text-right mt-1">
                          Submitted {formatCreated(booking.createdAt)}
                        </span>
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
                  src={getResourceImage(expandedResource)} 
                  alt={expandedResource?.name || 'Venue'} 
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
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-colors z-10 ${
                            step.done && step.label !== 'Rejected' && step.label !== 'Cancelled' ? `${theme.activeFilter} border border-transparent` :
                            step.label === 'Rejected' || step.label === 'Cancelled' ? "bg-red-500 border-2 border-red-500 text-white shadow-sm shadow-red-200" :
                            step.active ? "bg-amber-400 border-2 border-amber-400 text-white shadow-sm shadow-amber-200" :
                            "bg-white border-2 border-gray-200 text-gray-300"
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
                              ? theme.progressLine 
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
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${theme.lightBg} ${theme.textAccent} rounded-lg text-sm font-medium border border-black/5`}>
                          <CheckCircle className={`w-4 h-4 ${theme.textAccent}`} /> Checked In Successfully
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
                  
                  {/* Change the condition here from: */}
                  {/* {(expandedBooking.status === 'PENDING' || (expandedBooking.status === 'APPROVED' && expandedBooking.date >= today)) && ( */}

                  {/* To this: */}
                  {(expandedBooking.status === 'PENDING' || expandedBooking.status === 'APPROVED') && (
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

      {/* NEW QR Code Popup Modal */}
      {qrModalId && (() => {
        const qrBooking = myBookings.find(b => b.id === qrModalId);
        if (!qrBooking) return null;
        
        // Fetch resource details so we can display the location
        const qrResource = getBookingItem(qrBooking.resourceId);
        
        return (
          <div className="fixed inset-0 z- flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-[2rem] shadow-xl w-full max-w-2xl overflow-hidden flex flex-col relative max-h-[95vh]">
              
              {/* Header */}
              <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-50">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Check-in Pass</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Show this pass to the admin or facility manager</p>
                </div>
                <button 
                  onClick={() => setQrModalId(null)} 
                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="overflow-y-auto p-5 sm:p-6 pb-8 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  
                  {/* Left Side: QR Code Area */}
                  <div className="w-full md:w-auto flex flex-col items-center flex-shrink-0">
                    <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm mb-5">
                      <QRCodeSVG 
                        id="qr-code-svg"
                        value={`${window.location.origin}/admin/verify/${qrBooking.id}`} 
                        size={180} 
                        level="H"
                        includeMargin={true} 
                      />
                    </div>

                    {qrBooking.checkedIn ? (
                      <span className={`inline-flex items-center gap-1.5 px-4 py-2 ${theme.lightBg} ${theme.textAccent} rounded-xl text-sm font-medium w-full justify-center border border-black/5`}>
                        <CheckCircle className={`w-4 h-4 ${theme.textAccent}`} /> Checked In Successfully
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium w-full justify-center border border-gray-200">
                        <Clock className="w-4 h-4 text-gray-400" /> Awaiting Check-in
                      </span>
                    )}

                    <button
                      onClick={handleDownloadQR}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 mt-4 rounded-xl text-white text-sm font-medium transition-all ${theme.gradientBtn}`}
                    >
                      <Download className="w-4 h-4" /> Save as PNG
                    </button>
                  </div>

                  {/* Right Side: Details Area */}
                  <div className="w-full flex-1">
                    <h4 className="text-[11px] text-gray-400 uppercase tracking-wide font-bold mb-4">Booking Information</h4>
                    
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex flex-col gap-4">
                       
                       {/* ID and Resource */}
                       <div className="grid grid-cols-2 gap-4">
                         <div>
                           <p className="text-[11px] text-gray-400 uppercase tracking-wide font-bold mb-1">Booking ID</p>
                           <p className="text-sm font-semibold text-gray-900">ID-{qrBooking.id.slice(-5).toUpperCase()}</p>
                         </div>
                         <div>
                           <p className="text-[11px] text-gray-400 uppercase tracking-wide font-bold mb-1">Resource</p>
                           <p className="text-sm font-semibold text-gray-900">{qrResource?.name || 'Unknown Resource'}</p>
                         </div>
                       </div>

                       {/* Date and Time */}
                       <div className="grid grid-cols-2 gap-4">
                         <div>
                           <p className="text-[11px] text-gray-400 uppercase tracking-wide font-bold mb-1">Date</p>
                           <p className="text-sm font-medium text-gray-700">{formatDate(qrBooking.date)}</p>
                         </div>
                         <div>
                           <p className="text-[11px] text-gray-400 uppercase tracking-wide font-bold mb-1">Time</p>
                           <p className="text-sm font-medium text-gray-700">{qrBooking.startTime} – {qrBooking.endTime}</p>
                         </div>
                       </div>

                       {/* Location and Attendees */}
                       <div className="grid grid-cols-2 gap-4">
                         <div>
                           <p className="text-[11px] text-gray-400 uppercase tracking-wide font-bold mb-1">Location</p>
                           <p className="text-sm font-medium text-gray-700">{qrResource?.location || 'N/A'}</p>
                         </div>
                         {qrBooking.attendees && (
                           <div>
                             <p className="text-[11px] text-gray-400 uppercase tracking-wide font-bold mb-1">Attendees</p>
                             <p className="text-sm font-medium text-gray-700">{qrBooking.attendees} people</p>
                           </div>
                         )}
                       </div>
                       
                       {/* Purpose spans full width */}
                       <div>
                         <p className="text-[11px] text-gray-400 uppercase tracking-wide font-bold mb-1">Purpose</p>
                         <p className="text-sm font-medium text-gray-700">{qrBooking.purpose}</p>
                       </div>

                    </div>

                    <div className="mt-5 flex items-center gap-2 text-xs text-gray-400 font-medium">
                      <Bell className="w-3.5 h-3.5" /> Submitted on {formatCreated(qrBooking.createdAt)}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        );
      })()}
   {/* SUCCESS POPUP MODAL (Add this right here) */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 sm:p-8 text-center">
              
              {/* Dynamic Theme Icon - Matches Lecturer/Student colors */}
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-5 ${theme.lightBg} ${theme.textAccent}`}>
                <CheckCircle className="w-10 h-10" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">Cancellation Successful</h3>
              <p className="text-gray-500 text-sm mb-8 font-medium">
                Your booking has been cancelled and the resource has been freed up.
              </p>
              
              {/* Dynamic Theme Button - Matches Lecturer/Student colors */}
              <button
                onClick={() => setShowSuccessModal(false)}
                className={`w-full py-3 rounded-xl text-white text-sm font-semibold transition-all shadow-sm ${theme.gradientBtn}`}
              >
                Got it
              </button>
              
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
