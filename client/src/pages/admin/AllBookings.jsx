import { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, CheckCircle, XCircle, Calendar, Clock,
  Users, MapPin, ChevronDown, Building2, FlaskConical, Wrench,
  Eye, Trash2, SlidersHorizontal, X, AlertCircle, Info
} from 'lucide-react';
// Change these two lines
import { useBooking } from "../../context/BookingContext";
import { StatusBadge } from "../../components/StatusBadge";
import Sidebar from "../../components/Sidebar"; 
import Header from "../../components/Header";

const TYPE_COLORS = {
  room: 'bg-blue-100 text-blue-600',
  lab: 'bg-violet-100 text-violet-600',
  equipment: 'bg-orange-100 text-orange-600',
};

function ReviewModal({ bookingId, action, userName, resourceName, onConfirm, onClose }) {
  const [note, setNote] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (action === 'reject' && !reason.trim()) {
      setError('Please provide a rejection reason.');
      return;
    }
    onConfirm(action === 'reject' ? reason : note || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10">
        <div className={`p-5 border-b rounded-t-2xl ${action === 'approve' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action === 'approve' ? 'bg-emerald-100' : 'bg-red-100'}`}>
              {action === 'approve'
                ? <CheckCircle className="w-5 h-5 text-emerald-600" />
                : <XCircle className="w-5 h-5 text-red-600" />}
            </div>
            <div>
              <h3 className={action === 'approve' ? 'text-emerald-900' : 'text-red-900'}>
                {action === 'approve' ? 'Approve Booking' : 'Reject Booking'}
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
                Rejection Reason <span className="text-red-500">*</span>
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
            className={`flex-1 py-2.5 rounded-xl text-white text-sm font-medium transition-colors ${
              action === 'approve'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AllBookings() {
  const { bookings, getResourceById, approveBooking, rejectBooking, fetchBookings, purgeBooking } = useBooking();
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

  const filtered = bookings.filter(b => {
    const resource = getResourceById(b.resourceId);
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
      } else if (reason) {
        await rejectBooking(bookingId, reason);
        setResultModal({
          type: 'success', 
          title: 'Booking Rejected',
          bookingId: formattedId,
          // Updated to include the ID in the text
          message: `The Booking Request ${formattedId} has been Successfully Rejected.` 
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
  const modalResource = modalBooking ? getResourceById(modalBooking.resourceId) : null;

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
                        const resource = getResourceById(booking.resourceId);
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

                                      {/* 2. Show Delete Record ONLY when NOT PENDING (Approved, Rejected, Cancelled) */}
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
                                        <Eye className="w-3.5 h-3.5" /> View Details
                                      </button>
                                </div>
                                </td>
                            </tr>
                            
                            {isExpanded && (
                                <tr className="bg-white border-b border-gray-50">
                                <td colSpan={6} className="px-6 py-5 bg-slate-50/50 border-x-4 border-l-[#1E3A8A] border-r-transparent">
                                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5 pb-5 border-b border-gray-50">
                                        <div>
                                          <p className="text-gray-400 text-xs mb-0.5">Booking ID</p>
                                          {/* Slices the last 5 characters and adds the ID- prefix */}
                                          <p className="text-gray-700 text-sm font-mono">ID-{booking.id.slice(-5).toUpperCase()}</p>
                                        </div>
                                        <div>
                                          <p className="text-gray-400 text-xs mb-0.5">Email</p>
                                          <p className="text-gray-700 text-sm">{booking.userEmail}</p>
                                        </div>
                                        <div>
                                          <p className="text-gray-400 text-xs mb-0.5">Submitted</p>
                                          <p className="text-gray-700 text-sm">{formatCreated(booking.createdAt)}</p>
                                        </div>
                                        <div>
                                          <p className="text-gray-400 text-xs mb-0.5">Last Updated</p>
                                          <p className="text-gray-700 text-sm">{formatCreated(booking.updatedAt)}</p>
                                        </div>
                                      </div>
                                      
                                      {/* Second Row wrapped in a Grid for horizontal layout */}
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                        <div>
                                          <p className="text-gray-400 text-xs mb-0.5">Full Purpose</p>
                                          <p className="text-gray-700 text-sm">{booking.purpose}</p>
                                        </div>
                                        <div>
                                          {booking.lecturer && (
                                            <>
                                              <p className="text-gray-400 text-xs mb-0.5">Lecturer in Charge</p>
                                              <p className="text-gray-700 text-sm">{booking.lecturer}</p>
                                            </>
                                          )}
                                        </div>
                                        <div>
                                          {resource && (
                                            <>
                                              <p className="text-gray-400 text-xs mb-0.5">Resource Location</p>
                                              <div className="flex items-center gap-1 text-gray-700 text-sm">
                                                <MapPin className="w-3.5 h-3.5 text-gray-400" /> {resource.location}
                                              </div>
                                            </>
                                          )}
                                        </div>
                                        <div>
                                          {booking.specialRequests && (
                                            <>
                                              <p className="text-gray-400 text-xs mb-0.5">Special Requests</p>
                                              <p className="text-gray-700 text-sm">{booking.specialRequests}</p>
                                            </>
                                          )}
                                        </div>
                                      </div>

                                      {booking.status === 'REJECTED' && booking.rejectionReason && (
                                        <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                                            <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                            <div>
                                            <p className="text-red-700 text-xs">Rejection Reason</p>
                                            <p className="text-red-600 text-sm">{booking.rejectionReason}</p>
                                            </div>
                                        </div>
                                      )}

                                      {booking.adminNote && (
                                        <div className="mt-3 flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                                            <Eye className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                            <div>
                                            <p className="text-blue-700 text-xs">Admin Note</p>
                                            <p className="text-blue-600 text-sm">{booking.adminNote}</p>
                                            </div>
                                        </div>
                                      )}

                                      {booking.status === 'CANCELLED' && booking.cancellationReason && (
                                        <div className="mt-3 flex items-start gap-2 p-3 rounded-xl border bg-gray-50 border-gray-200">
                                            <Info className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                            <div>
                                            <p className="text-gray-700 text-xs">Cancellation Reason (User)</p>
                                            <p className="text-gray-600 text-sm">{booking.cancellationReason}</p>
                                            </div>
                                        </div>
                                      )}

                                      {booking.reviewedBy && (
                                        <p className="text-gray-400 text-xs mt-3">Reviewed by: {booking.reviewedBy}</p>
                                      )}

                                    </div> {/* <-- Closes the white card wrapper */}
                                </td>
                                </tr>
                            )}
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