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
import CancelBookingModal from '../../components/bookings/CancelBookingModal';
import QRCodeModal from '../../components/bookings/QRCodeModal';
import { SuccessModal } from '../../components/bookings/NotificationModals';
import UserBookingDetailsModal from '../../components/bookings/UserBookingDetailsModal';
import { useLocation } from 'react-router-dom';

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
  const location = useLocation();

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

  // Fetch the data using the REST API when the page loads or when bookings change
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
  // NEW: Listen for Notification Redirects and Auto-Open the Modal
  useEffect(() => {
    if (location.state?.highlightId && myBookings.length > 0) {
      const targetId = location.state.highlightId;
      
      // Verify the booking actually exists in their list
      if (myBookings.some(b => b.id === targetId)) {
        // Defer the state update to the next tick to avoid React cascading render warnings
        setTimeout(() => {
          setExpandedId(targetId);
        }, 0);
        
        // Clear the router state safely using React Router so it doesn't re-open on refresh
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, location.pathname, myBookings, navigate]);

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
    PENDING_LECTURER: myBookings.filter(b => b.status === 'PENDING_LECTURER').length,
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

  //const today = new Date().toISOString().split('T');

  // Target the specific booking to open in the Modal
  const expandedBooking = expandedId ? myBookings.find(b => b.id === expandedId) : null;
  const expandedResource = expandedBooking ? getBookingItem(expandedBooking.resourceId) : null;
  
  // Progress Bar Logic Map
  const getSteps = (currentStatus) => {
    if (currentStatus === 'PENDING_LECTURER') {
      return [
        { label: "Submitted", done: true, active: false },
        { label: "Lecturer Review", done: false, active: true },
        { label: "Admin Review", done: false, active: false },
        { label: "Approved", done: false, active: false },
      ];
    }

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
              {['ALL', 'PENDING_LECTURER', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all ${
                    statusFilter === s
                    ? theme.activeFilter
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {s === 'ALL' ? 'All' : s.replaceAll('_', ' ')}
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
                //const isPast = booking.date < today;
                const canCancel = booking.status === 'PENDING' || booking.status === 'PENDING_LECTURER' || booking.status === 'APPROVED';

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
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border bg-white shadow-sm flex-1 xl:flex-none justify-center ${
                                  isLecturer 
                                    ? 'border-[#8A3505]/30 text-[#8A3505] hover:bg-[#8A3505]/10' 
                                    : 'border-[#0F6657]/30 text-[#0F6657] hover:bg-[#0F6657]/10'
                                }`}
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
        <CancelBookingModal 
          cancellingId={cancellingId}
          cancelReason={cancelReason}
          setCancelReason={setCancelReason}
          cancelError={cancelError}
          setCancelError={setCancelError}
          onClose={resetCancelState}
          onSubmit={handleCancelSubmit}
        />
      )}

      {/* Booking Details Popup Modal */}
      {expandedBooking && (
        <UserBookingDetailsModal
          booking={expandedBooking}
          resource={expandedResource}
          theme={theme}
          resourceImage={getResourceImage(expandedResource)}
          onClose={() => setExpandedId(null)}
          onEdit={(id) => {
            setExpandedId(null);
            navigate(`/booking/edit/${id}`);
          }}
          onCancel={(id) => {
            setExpandedId(null);
            setCancellingId(id);
          }}
          formatDate={formatDate}
          formatCreated={formatCreated}
          getSteps={getSteps}
        />
      )}

      {/*QR Code Popup Modal */}
      {qrModalId && (
        <QRCodeModal
          booking={myBookings.find(b => b.id === qrModalId)}
          theme={theme}
          onClose={() => setQrModalId(null)}
        />
      )}

   {showSuccessModal && (
        <SuccessModal
          theme={theme}
          onClose={() => setShowSuccessModal(false)}
          title="Cancellation Successful"
          message="Your booking has been cancelled and the resource has been freed up."
        />
      )}

    </div>
  );
}
