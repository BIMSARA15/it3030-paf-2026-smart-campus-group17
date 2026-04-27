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
import ReviewModal from '../../components/bookings/ReviewModal';
import { DeleteWarningModal } from '../../components/bookings/NotificationModals';
import InfoCard from '../../components/bookings/InfoCard';
import AdminBookingDetailsModal from '../../components/bookings/AdminBookingDetailsModal';
import ResultModal from '../../components/bookings/ResultModal';

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
          type: 'success', // Keeps the Green Checkmark theme
          title: 'Booking Approved',
          bookingId: formattedId,
          message: 'The resource reservation has been confirmed and the requester has been notified.' 
        });
      } else if (action === 'reject' && reason) {
        await rejectBooking(bookingId, reason);
        setResultModal({
          type: 'error', // <--- Switches the popup to the Red 'X' theme!
          title: 'Booking Rejected',
          bookingId: formattedId,
          message: 'The booking request has been rejected. The user will be notified of the reason.' 
        });
      } else if (action === 'cancel' && reason) {
        await cancelBooking(bookingId, reason);
        setResultModal({
          type: 'error', // <--- Switches the popup to the Red 'X' theme!
          title: 'Booking Cancelled',
          bookingId: formattedId,
          message: 'The approved booking has been cancelled and the resource has been freed up.' 
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
            <ResultModal resultModal={resultModal} onClose={() => setResultModal(null)} />

            <DeleteWarningModal
            deleteModalId={deleteModalId}
            onClose={() => setDeleteModalId(null)}
            onConfirm={async (idToDelete) => {
              setDeleteModalId(null); 
              await purgeBooking(idToDelete);
              setResultModal({
                type: 'success',
                title: 'Record Deleted',
                message: `Booking record ID-${idToDelete.slice(-5).toUpperCase()} has been permanently removed.`
              });
            }}
          />

            {/* Admin Details Modal */}
            {expandedBooking && ( 
              <AdminBookingDetailsModal
                booking={expandedBooking}
                resource={expandedResource}
                adminTheme={adminTheme}
                onClose={() => setExpandedId(null)}
                formatDate={formatDate}
                formatCreated={formatCreated}
              />
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
                                            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 text-slate-700 bg-white rounded-lg text-xs font-medium hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-sm"
                                          >
                                            <XCircle className="w-3.5 h-3.5" /> Cancel
                                          </button>
                                        )}

                                        {/* Show Delete Record ONLY when NOT PENDING */}
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

                                      {/* ALWAYS show the View Details button at the very end */}
                                      <button
                                        onClick={(e) => { e.stopPropagation(); setExpandedId(expandedId === booking.id ? null : booking.id); }}
                                        className="flex items-center justify-center p-2 border border-gray-200 text-[#1E3A8A] bg-white rounded-lg hover:bg-blue-50 transition-colors"
                                        title="View Details"
                                      >
                                        <Eye className="w-4 h-4" />
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