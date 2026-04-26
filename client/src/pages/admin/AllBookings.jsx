import { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, CheckCircle, XCircle, Calendar, Clock,
  Users, MapPin, ChevronDown, Building2, FlaskConical, Wrench,
  Eye, Trash2, SlidersHorizontal, X, AlertCircle, Info, Loader2,
  Hash, FileText, Bell, ArrowLeft
} from 'lucide-react';
import { useBooking } from "../../context/BookingContext";
import { StatusBadge } from "../../components/StatusBadge";
import Sidebar from "../../components/Sidebar"; 
import Header from "../../components/Header";

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

function InfoCard({ icon, label, value, accent }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-start gap-3 hover:-translate-y-0.5 hover:shadow-md transition-all cursor-default">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${accent || "bg-indigo-50 text-indigo-500"}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-gray-400 mb-0.5 uppercase tracking-wide font-bold">{label}</p>
        {/* Removed truncate so full text is visible, added pre-wrap for line breaks */}
        <p className="text-sm text-gray-800 font-semibold whitespace-pre-wrap break-words">{value}</p>
      </div>
    </div>
  );
}

function ReviewModal({ bookingId, action, userName, resourceName, onConfirm, onClose }) {
  const [note, setNote] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Track loading state

  // CHANGED: Made function async to wait for the backend
  const handleSubmit = async () => {
    if ((action === 'reject' || action === 'cancel') && !reason.trim()) {
      setError(`Please provide a ${action === 'cancel' ? 'cancellation' : 'rejection'} reason.`);
      return;
    }
    setIsSubmitting(true); 
    
    // FIX: Send 'reason' for BOTH reject and cancel. Only send 'note' for approve.
    await onConfirm(action === 'approve' ? note || undefined : reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10">
        <div className={`p-5 border-b rounded-t-2xl ${
          action === 'approve' ? 'bg-emerald-50 border-emerald-100' : 
          action === 'cancel' ? 'bg-amber-50 border-amber-100' : 
          'bg-red-50 border-red-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              action === 'approve' ? 'bg-emerald-100' : 
              action === 'cancel' ? 'bg-amber-100' : 'bg-red-100'
            }`}>
              {action === 'approve' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : 
               action === 'cancel' ? <XCircle className="w-5 h-5 text-amber-600" /> :
               <XCircle className="w-5 h-5 text-red-600" />}
            </div>
            <div>
              <h3 className={
                action === 'approve' ? 'text-emerald-900' : 
                action === 'cancel' ? 'text-amber-900' : 'text-red-900'
              }>
                {action === 'approve' ? 'Approve Booking' : 
                 action === 'cancel' ? 'Cancel Approved Booking' : 'Reject Booking'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {userName} · {resourceName}
              </p>
            </div>
            <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5">
          {action === 'approve' ? (
            <div>
              <label className="block text-gray-700 text-sm mb-1.5">Admin Note (Optional)</label>
              <textarea
                rows={3}
                placeholder="Add any notes or conditions for this approval..."
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-emerald-400 focus:bg-white transition-colors resize-none"
              />
              <div className="mt-3 flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-emerald-700 text-sm">Approving this booking will confirm the resource reservation. The requester will be notified.</p>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-gray-700 text-sm mb-1.5">
                {action === 'cancel' ? 'Cancellation Reason' : 'Rejection Reason'} <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Please provide a clear reason for rejecting this booking request..."
                value={reason}
                onChange={e => { setReason(e.target.value); setError(''); }}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors resize-none ${
                  error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-red-400 focus:bg-white'
                }`}
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-amber-700 text-sm">The rejection reason will be visible to the requester. Please be clear and professional.</p>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 pb-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-medium transition-all ${
              isSubmitting ? 'opacity-70 cursor-not-allowed ' : ''
            }${
              action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 
              action === 'cancel' ? 'bg-amber-600 hover:bg-amber-700' : 
              'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
            ) : action === 'approve' ? (
              'Confirm Approval'
            ) : action === 'cancel' ? (
              'Confirm Cancellation'
            ) : (
              'Confirm Rejection'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AllBookings() {
  // Change line ~126 to include cancelBooking:
  const { bookings, getResourceById, getUtilityById, approveBooking, rejectBooking, cancelBooking, fetchBookings, purgeBooking, utilities } = useBooking();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [modal, setModal] = useState(null);
  const [resultModal, setResultModal] = useState(null);
  const [deleteModalId, setDeleteModalId] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  
  // ADDED SIDEBAR STATE
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // This forces the page to get fresh data from the DB every time it opens
  useEffect(() => {
    if (fetchBookings) {
      fetchBookings();
    }
  }, []);

  // Helper function to find the item in either Resources OR Utilities
  const getBookingItem = (id) => {
    let item = getResourceById(id);
    if (item) return item;

    const util = getUtilityById(id);
    if (util) {
      return {
        id: util.id,
        name: util.utilityName || util.name || 'Unknown Equipment',
        type: 'equipment',
        location: util.location || 'Unknown Location',
      };
    }
    return null;
  };

  const filtered = bookings.filter(b => {
    const resource = getBookingItem(b.resourceId);
    const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchType = typeFilter === 'ALL' || resource?.type === typeFilter;
    const matchSearch = search === '' ||
      b.userName.toLowerCase().includes(search.toLowerCase()) ||
      (resource?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      b.purpose.toLowerCase().includes(search.toLowerCase()) ||
      (b.userDept || '').toLowerCase().includes(search.toLowerCase());
    const matchFrom = !dateFrom || b.date >= dateFrom;
    const matchTo = !dateTo || b.date <= dateTo;
    return matchStatus && matchType && matchSearch && matchFrom && matchTo;
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return a.date.localeCompare(b.date);
  });

  const counts = {
    ALL: bookings.length,
    PENDING: bookings.filter(b => b.status === 'PENDING').length,
    APPROVED: bookings.filter(b => b.status === 'APPROVED').length,
    REJECTED: bookings.filter(b => b.status === 'REJECTED').length,
    CANCELLED: bookings.filter(b => b.status === 'CANCELLED').length,
  };

  const handleReview = async (bookingId, action, reason) => {
    // Format the ID to match your table UI (e.g., ID-1A2B3)
    const formattedId = `ID-${bookingId.slice(-5).toUpperCase()}`;

    try {
      if (action === 'approve') {
        await approveBooking(bookingId, reason);
        setResultModal({
          type: 'success',
          title: 'Booking Approved!',
          bookingId: formattedId,
          // Updated to include the ID in the text
          message: `The Booking Request ${formattedId} has been Successfully Approved.` 
        });
      } else if (action === 'reject' && reason) {
        await rejectBooking(bookingId, reason);
        setResultModal({
          type: 'success', 
          title: 'Booking Rejected',
          bookingId: formattedId,
          // Updated to include the ID in the text
          message: `The Booking Request ${formattedId} has been Successfully Rejected.` 
        });
      }else if (action === 'cancel' && reason) {
        await cancelBooking(bookingId, reason);
        setResultModal({
          type: 'success', 
          title: 'Booking Cancelled',
          bookingId: formattedId,
          message: `The Booking Request ${formattedId} has been Successfully Cancelled.` 
        });
      }
    } catch (error) {
      setResultModal({
        type: 'error',
        title: 'Update Failed',
        bookingId: formattedId,
        message: 'The booking status could not be changed. Please try again later.'
      });
    }
    setModal(null);
  };

  const formatDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
  const formatCreated = (iso) => new Date(iso).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
  const today = new Date().toISOString().split('T')[0];

  const activeFilterCount = [statusFilter !== 'ALL', typeFilter !== 'ALL', dateFrom, dateTo].filter(Boolean).length;

  const modalBooking = modal ? bookings.find(b => b.id === modal.bookingId) : null;
  const modalResource = modalBooking ? getBookingItem(modalBooking.resourceId) : null;

  const expandedBooking = expandedId ? bookings.find(b => b.id === expandedId) : null;
  const expandedResource = expandedBooking ? getBookingItem(expandedBooking.resourceId) : null;

  const adminTheme = {
    textAccent: 'text-[#1E3A8A]',
    activeFilter: 'bg-[#1E3A8A] text-white shadow-md',
    lightBg: 'bg-[#1E3A8A]/10',
    progressLine: 'bg-[#1E3A8A]'
  };

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

  return (
    // WRAPPED IN LAYOUT
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'} overflow-hidden`}>
        <Header />
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
            <div className="p-4 lg:p-6 space-y-5">
            {modal && modalBooking && modalResource && (
                <ReviewModal
                bookingId={modal.bookingId}
                action={modal.action}
                userName={modalBooking.userName}
                resourceName={modalResource.name}
                onConfirm={(reason) => handleReview(modal.bookingId, modal.action, reason)}
                onClose={() => setModal(null)}
                />
            )}

            {/* Result Popup Modal */}
            {resultModal && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setResultModal(null)}></div>
                <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center z-10 border border-gray-100 animate-in zoom-in-95 duration-200">
                  <button
                    onClick={() => setResultModal(null)}
                    className="absolute top-4 right-4 p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 mt-2 ${
                    resultModal.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'
                  }`}>
                    {resultModal.type === 'success' ? (
                      <CheckCircle className="w-8 h-8 text-emerald-600" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-600" />
                    )}
                  </div>
                  
                  <h2 className="text-gray-900 text-xl font-semibold mb-1">{resultModal.title}</h2>
                  
                  {/* Displays the formatted Booking ID in a neat little badge */}
                  {resultModal.bookingId && (
                    <div className="mb-3">
                      <span className={`inline-block px-2.5 py-1 text-xs font-mono rounded-lg border shadow-sm ${
                        resultModal.title.includes('Rejected')
                          ? 'bg-red-50 text-red-600 border-red-200' 
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>
                        {resultModal.bookingId}
                      </span>
                    </div>
                  )}

                  <p className="text-gray-500 text-sm mb-6">{resultModal.message}</p>

                  <button
                    onClick={() => setResultModal(null)}
                    className={`w-full py-2.5 px-4 rounded-xl text-white text-sm font-medium shadow-sm transition-all ${
                      resultModal.type === 'success' 
                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-[0_4px_12px_rgba(5,150,105,0.2)]' 
                        : 'bg-red-600 hover:bg-red-700 shadow-[0_4px_12px_rgba(220,38,38,0.2)]'
                    }`}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* NEW: Custom Delete Confirmation Modal */}
            {deleteModalId && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteModalId(null)}></div>
                <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center z-10 border border-gray-100 animate-in zoom-in-95 duration-200">
                  
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 mt-2 bg-red-100">
                    <Trash2 className="w-8 h-8 text-red-600" />
                  </div>
                  
                  <h2 className="text-gray-900 text-xl font-semibold mb-2">Delete Record?</h2>
                  <p className="text-gray-500 text-sm mb-6">
                    <span className="block mb-1.5">
                      Are you sure you want to permanently delete booking record <strong className="text-gray-800 font-mono">ID-{deleteModalId.slice(-5).toUpperCase()}?</strong>
                    </span>
                    <span className="block text-gray-400">
                      This action cannot be undone.
                    </span>
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setDeleteModalId(null)}
                      className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        // Save the ID temporarily before we clear the state
                        const idToDelete = deleteModalId; 
                        
                        // Close the warning modal instantly
                        setDeleteModalId(null); 
                        
                        // Wait for the database to finish deleting
                        await purgeBooking(idToDelete);
                        
                        // Trigger your existing success modal!
                        setResultModal({
                          type: 'success',
                          title: 'Record Deleted',
                          message: `Booking record ID-${idToDelete.slice(-5).toUpperCase()} has been permanently removed from the system.`
                        });
                      }}
                      className="flex-1 py-2.5 px-4 rounded-xl text-white text-sm font-medium bg-red-600 hover:bg-red-700 shadow-[0_4px_12px_rgba(220,38,38,0.2)] transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* <-- ADD THIS NEW DETAILS MODAL HERE --> */}
            {expandedBooking && ( 
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                
                {/* SAFE FIX: We use negative positioning to stretch the blur 40px off the screen in all directions */}
                <div className="absolute -top-10 -bottom-10 -left-10 -right-10 bg-black/50 backdrop-blur-sm" onClick={() => setExpandedId(null)} />
                
                <div className="relative z-10 bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                  {/* Top Header Bar */}
                  <div className="flex items-center justify-between p-4 bg-white border-b border-gray-50">
                    <button onClick={() => setExpandedId(null)} className={`flex items-center gap-1.5 text-sm ${adminTheme.textAccent} hover:opacity-80 transition-opacity font-medium`}>
                      <ArrowLeft className="w-4 h-4" /> Back to List
                    </button>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setExpandedId(null)} className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Scrollable Content */}
                  <div className="overflow-y-auto overflow-x-hidden pb-4 scroll-smooth [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300/80">
                    
                    {/* Hero Header Section */}
                    <div className="bg-white p-6 sm:p-8 flex flex-col border-b border-gray-100">
                      
                      {/* Top Row: ID Badge and Status Badge */}
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 text-gray-500 text-xs border border-gray-200 font-mono font-medium">
                          <Hash className="w-3.5 h-3.5" />
                          ID-{expandedBooking.id.slice(-5).toUpperCase()}
                        </div>
                        <StatusBadge status={expandedBooking.status} />
                      </div>

                      {/* Bottom Row: Resource Name and Location */}
                      <div>
                        <h1 className="text-gray-900 text-2xl sm:text-3xl font-bold mb-2">
                          {expandedResource?.name || 'Unknown Resource'}
                        </h1>
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {expandedResource?.location || 'No location specified'}
                          </span>
                        </div>
                      </div>
                      
                    </div>

                    {/* Feedback & Actions Area */}
                    <div className="px-6 py-6 bg-gray-50/50 border-b border-gray-50">
                      
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

                      {/* Specific Details List for Admin */}
                      <div className="flex flex-col gap-3">
                        
                        {/* Custom Requester Profile Card */}
                        <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3.5 hover:-translate-y-0.5 hover:shadow-sm transition-all">
                          <div className="w-11 h-11 rounded-full bg-[#1E3A8A] flex items-center justify-center flex-shrink-0 shadow-sm">
                            <span className="text-white text-sm font-bold tracking-wider">
                              {(expandedBooking.userName || 'User').split(' ').map(n => n).join('').slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex flex-col justify-center">
                            <p className="text-[11px] text-gray-400 mb-0.5 uppercase tracking-wide font-bold">Requester</p>
                            <p className="text-gray-900 font-bold text-sm">{expandedBooking.userName || 'Unknown User'}</p>
                            <p className="text-gray-500 text-xs mt-0.5">{expandedBooking.userEmail}</p>
                          </div>
                        </div>
                        
                        {/* 2-Column Grid for Date, Time, Location, and Attendance */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <InfoCard 
                            icon={<Calendar className="w-4 h-4" />} 
                            label="Requested Date"  
                            value={formatDate(expandedBooking.date)} 
                            accent="bg-blue-50 text-blue-600" 
                          />
                          <InfoCard 
                            icon={<Clock className="w-4 h-4" />} 
                            label="Requested Time" 
                            value={`${expandedBooking.startTime} – ${expandedBooking.endTime}`} 
                            accent="bg-purple-50 text-purple-600" 
                          />
                          <InfoCard 
                          icon={<MapPin className="w-4 h-4" />} 
                          label="Resource Location" 
                          value={expandedResource?.location || `${expandedBooking.block || ''} ${expandedBooking.level || ''}`.trim() || 'No location specified'} 
                          accent="bg-emerald-50 text-emerald-600" 
                        />
                          
                          {/* Show Quantity for Equipment, Attendees for Rooms/Labs */}
                          {expandedResource?.type === 'equipment' ? (
                            <InfoCard 
                              icon={<Hash className="w-4 h-4" />} 
                              label="Quantity" 
                              value={`${expandedBooking.quantity || 1}`} 
                              accent="bg-orange-50 text-orange-600" 
                            />
                          ) : (
                            <InfoCard 
                              icon={<Users className="w-4 h-4" />} 
                              label="Attendees" 
                              value={`${expandedBooking.attendees || 0} attendees`} 
                              accent="bg-orange-50 text-orange-600" 
                            />
                          )}
                        </div>

                        {/* Purpose Card - Added right below Requester */}
                        <InfoCard 
                          icon={<FileText className="w-4 h-4" />} 
                          label="Purpose" 
                          value={expandedBooking.purpose} 
                          accent="bg-slate-50 text-slate-600" 
                        />

                        {/* Optional Extras (Full Width) */}
                        {expandedBooking.lecturer && (
                           <InfoCard icon={<Building2 className="w-4 h-4" />} label="Lecturer in Charge" value={expandedBooking.lecturer} accent="bg-violet-50 text-violet-600" />
                        )}
                        {expandedBooking.specialRequests && (
                           <InfoCard icon={<FileText className="w-4 h-4" />} label="Special Requests" value={expandedBooking.specialRequests} accent="bg-rose-50 text-rose-600" />
                        )}
                        
                      </div>
                      
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400 font-medium border-t border-gray-100 pt-4">
                        <div className="flex gap-4">
                          <span className="flex items-center gap-1.5"><Bell className="w-3.5 h-3.5" /> Submitted: {formatCreated(expandedBooking.createdAt)}</span>
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Updated: {formatCreated(expandedBooking.updatedAt)}</span>
                        </div>
                        {expandedBooking.reviewedBy && (
                          <span>Reviewed by: {expandedBooking.reviewedBy}</span>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}
            {/* <-- END NEW DETAILS MODAL --> */}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div>
                <h1 className="text-gray-900 text-2xl font-semibold">All Bookings</h1>
                <p className="text-gray-500 text-sm mt-0.5">Manage and oversee all campus resource requests.</p>
                </div>
                <div className="sm:ml-auto flex gap-2">
                {counts.PENDING > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
                    <Clock className="w-4 h-4" />
                    {counts.PENDING} pending review
                    </div>
                )}
                </div>
            </div>

            {/* Filters bar */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                    type="text"
                    placeholder="Search by name, resource, purpose..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-blue-400 focus:bg-white transition-colors"
                    />
                </div>

                {/* Sort */}
                <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-blue-400 text-gray-700"
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="date">By Booking Date</option>
                </select>

                {/* Filter toggle */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                    showFilters || activeFilterCount > 0
                        ? 'border-blue-300 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                    {activeFilterCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                        {activeFilterCount}
                    </span>
                    )}
                </button>
                </div>

                {/* Status tabs */}
                <div className="flex gap-2 flex-wrap">
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map(s => (
                    <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-colors ${
                        statusFilter === s
                        ? 'bg-[#1E3A8A] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    >
                    {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                        statusFilter === s ? 'bg-white/20' : 'bg-blue-100 text-blue-700 font-medium' // <--- UPDATED COLORS
                    }`}>
                        {counts[s]}
                    </span>
                    </button>
                ))}
                </div>

                {/* Record count moved here */}
                <p className="text-gray-500 text-xs font-medium pl-1">Showing {filtered.length} of {bookings.length} bookings</p>

                {/* Advanced filters */}
                {showFilters && (
                <div className="pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                    <label className="text-xs text-gray-500 mb-1 block">Resource Type</label>
                    <select
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-blue-400 text-gray-700"
                    >
                        <option value="ALL">All Types</option>
                        <option value="room">Rooms</option>
                        <option value="lab">Labs</option>
                        <option value="equipment">Equipment</option>
                    </select>
                    </div>
                    <div>
                    <label className="text-xs text-gray-500 mb-1 block">Date From</label>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={e => setDateFrom(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-blue-400"
                    />
                    </div>
                    <div>
                    <label className="text-xs text-gray-500 mb-1 block">Date To</label>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={e => setDateTo(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-blue-400"
                    />
                    </div>
                    {activeFilterCount > 0 && (
                    <button
                        onClick={() => { setTypeFilter('ALL'); setDateFrom(''); setDateTo(''); }}
                        className="flex items-center gap-1.5 text-red-600 text-sm hover:underline sm:col-span-3"
                    >
                        <X className="w-3.5 h-3.5" /> Clear filters
                    </button>
                    )}
                </div>
                )}
            </div>

            {/* Bookings list */}
            {filtered.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
                <Filter className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <h3 className="text-gray-500">No bookings found</h3>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left text-xs text-gray-400 px-4 py-3">Resource</th>
                        <th className="text-left text-xs text-gray-400 px-4 py-3">Requester</th>
                        <th className="text-left text-xs text-gray-400 px-4 py-3">Booking Date</th>
                        <th className="text-left text-xs text-gray-400 px-4 py-3">Purpose</th>
                        <th className="text-left text-xs text-gray-400 px-4 py-3">Status</th>
                        <th className="text-left text-xs text-gray-400 px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filtered.map(booking => {
                        const resource = getBookingItem(booking.resourceId);
                        const isExpanded = expandedId === booking.id;

                        return (
                            <Fragment key={booking.id}>
                            <tr
                                className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${
                                booking.status === 'PENDING' ? 'bg-amber-50/30' : ''
                                }`}
                                onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                            >
                                <td className="px-4 py-3.5">
                                <div className="flex items-center gap-2.5">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs ${
                                    resource ? TYPE_COLORS[resource.type] : 'bg-gray-100 text-gray-400'
                                    }`}>
                                    {resource?.type === 'room' ? <Building2 className="w-3.5 h-3.5" /> :
                                    resource?.type === 'lab' ? <FlaskConical className="w-3.5 h-3.5" /> :
                                    <Wrench className="w-3.5 h-3.5" />}
                                    </div>
                                    <div>
                                    <p className="text-gray-900 text-sm whitespace-nowrap">{resource?.name || '–'}</p>
                                    <p className="text-gray-400 text-xs capitalize">{resource?.type}</p>
                                    </div>
                                </div>
                                </td>
                                <td className="px-4 py-3.5">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-[#1E3A8A] flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-xs">{(booking.userName || 'User').split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                                    </div>
                                    <div>
                                    <p className="text-gray-900 text-sm whitespace-nowrap">{booking.userName}</p>
                                    <p className="text-gray-400 text-xs whitespace-nowrap">{booking.userDept}</p>
                                    </div>
                                </div>
                                </td>
                                <td className="px-4 py-3.5">
                                <div className="flex items-center gap-1.5 text-gray-700 text-sm whitespace-nowrap">
                                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                    {new Date(booking.date + 'T00:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-0.5">
                                    <Clock className="w-3 h-3" />
                                    {booking.startTime} – {booking.endTime}
                                </div>
                                </td>
                                <td className="px-4 py-3.5">
                                <p className="text-gray-700 text-sm max-w-[200px] truncate">{booking.purpose}</p>
                                {booking.attendees && (
                                    <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5">
                                    <Users className="w-3 h-3" /> {booking.attendees} attendees
                                    </div>
                                )}
                                </td>
                                <td className="px-4 py-3.5">
                                <StatusBadge status={booking.status} size="sm" />
                                </td>
                                <td className="px-4 py-3.5">
                                <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                                    {/* 1. Show Approve and Reject ONLY when PENDING */}
                                        {booking.status === 'PENDING' && (
                                          <>
                                            <button
                                              onClick={(e) => { 
                                                e.stopPropagation(); 
                                                setModal({ bookingId: booking.id, action: 'approve' }); // <-- Restored! Opens modal
                                              }}
                                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors"
                                            >
                                              <CheckCircle className="w-3.5 h-3.5" /> Approve
                                            </button>

                                            <button
                                              onClick={(e) => { 
                                                e.stopPropagation(); 
                                                setModal({ bookingId: booking.id, action: 'reject' }); // <-- Restored! Opens modal
                                              }}
                                              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
                                            >
                                              <XCircle className="w-3.5 h-3.5" /> Reject
                                            </button>
                                          </>
                                        )}
                                        {/* NEW: Show Cancel button ONLY when APPROVED */}
                                        {booking.status === 'APPROVED' && (
                                          <button
                                            onClick={(e) => { 
                                              e.stopPropagation(); 
                                              setModal({ bookingId: booking.id, action: 'cancel' }); 
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600 transition-colors shadow-sm"
                                          >
                                            <XCircle className="w-3.5 h-3.5" /> Cancel
                                          </button>
                                        )}

                                        {/* 2. Show Delete Record ONLY when NOT PENDING */}
                                        {booking.status !== 'PENDING' && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setDeleteModalId(booking.id); // <--- Simply opens the custom modal!
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 bg-white rounded-lg text-xs font-medium hover:bg-red-50 hover:border-red-600 transition-colors"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" /> Delete Record
                                          </button>
                                        )}

                                      {/* 3. ALWAYS show the View Details button at the very end */}
                                      <button
                                        onClick={(e) => { e.stopPropagation(); setExpandedId(expandedId === booking.id ? null : booking.id); }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 bg-white rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                                      >
                                        <Eye className="w-3.5 h-3.5" /> Details
                                      </button>
                                </div>
                                </td>
                            </tr>
                            </Fragment>
                        );
                        })}
                    </tbody>
                    </table>
                </div>
                </div>
            )}
            </div>
        </div>
      </div>
    </div>
  );
}