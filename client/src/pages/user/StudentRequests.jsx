import { useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  MapPin,
  Search,
  User,
  Users,
  XCircle,
} from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { StatusBadge } from '../../components/StatusBadge';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import ReviewModal from '../../components/bookings/ReviewModal';

const getBookingItem = (booking, getResourceById, getUtilityById) => {
  const resource = getResourceById(booking.resourceId);
  if (resource) return resource;

  const utility = getUtilityById(booking.resourceId);
  if (utility) {
    return {
      id: utility.id,
      name: utility.utilityName || 'Unknown Equipment',
      location: utility.location || 'Unknown Location',
      type: 'equipment',
      access: 'anyone',
    };
  }

  return null;
};

export default function StudentRequests() {
  const {
    bookings,
    currentUser,
    getResourceById,
    getUtilityById,
    approveBookingByLecturer,
    rejectBookingByLecturer,
  } = useBooking();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING_LECTURER');
  const [modal, setModal] = useState(null);
  const [resultMessage, setResultMessage] = useState('');

  const lecturerBookings = useMemo(() => {
    return bookings
      .filter((booking) => booking.status === 'PENDING_LECTURER' || booking.reviewedBy === (currentUser?.name || ''))
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
  }, [bookings, currentUser]);

  const filteredBookings = lecturerBookings.filter((booking) => {
    const resource = getBookingItem(booking, getResourceById, getUtilityById);
    const matchStatus = statusFilter === 'ALL' || booking.status === statusFilter;
    const query = search.trim().toLowerCase();
    const matchSearch =
      query === '' ||
      booking.userName?.toLowerCase().includes(query) ||
      booking.userEmail?.toLowerCase().includes(query) ||
      booking.purpose?.toLowerCase().includes(query) ||
      resource?.name?.toLowerCase().includes(query) ||
      booking.lecturer?.toLowerCase().includes(query);

    return matchStatus && matchSearch;
  });

  const counts = {
    ALL: lecturerBookings.length,
    PENDING_LECTURER: lecturerBookings.filter((booking) => booking.status === 'PENDING_LECTURER').length,
    PENDING: lecturerBookings.filter((booking) => booking.status === 'PENDING').length,
    REJECTED: lecturerBookings.filter((booking) => booking.status === 'REJECTED').length,
  };

  const formatDate = (value) => new Date(`${value}T00:00:00`).toLocaleDateString('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const handleReview = async (action, reason) => {
    if (!modal?.bookingId) return;

    const response = action === 'approve'
      ? await approveBookingByLecturer(modal.bookingId, reason)
      : await rejectBookingByLecturer(modal.bookingId, reason);

    if (response?.success) {
      setResultMessage(
        action === 'approve'
          ? 'Lecturer approved the request. It has now moved to admin approval.'
          : 'Lecturer rejected the request.'
      );
    } else {
      setResultMessage(response?.message || 'Unable to update this request right now.');
    }

    setModal(null);
  };

  const modalBooking = modal ? bookings.find((booking) => booking.id === modal.bookingId) : null;
  const modalResource = modalBooking ? getBookingItem(modalBooking, getResourceById, getUtilityById) : null;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Header />

        <div className="space-y-5 p-4 lg:p-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Lecturer Reviews</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Review student bookings for lecturer-only resources
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by student, lecturer, or resource..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition-all focus:border-[#A74106] focus:ring-2 focus:ring-[#A74106]/10"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {['PENDING_LECTURER', 'PENDING', 'REJECTED', 'ALL'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-xl px-3 py-2 text-xs transition-all ${
                    statusFilter === status
                      ? 'bg-gradient-to-r from-[#8A3505] to-[#C54E08] text-white shadow-md'
                      : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {status === 'ALL' ? 'All' : status.replaceAll('_', ' ')}
                  <span className={`ml-2 rounded-full px-1.5 py-0.5 ${statusFilter === status ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                    {counts[status]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {resultMessage && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {resultMessage}
            </div>
          )}

          {filteredBookings.length === 0 ? (
            <div className="rounded-xl border border-gray-100 bg-white py-16 text-center">
              <Users className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="text-gray-500">No lecturer reviews found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBookings.map((booking) => {
                const resource = getBookingItem(booking, getResourceById, getUtilityById);
                const isPending = booking.status === 'PENDING_LECTURER';

                return (
                  <div
                    key={booking.id}
                    className="w-full rounded-xl border border-gray-100 bg-white p-5 text-left transition-all hover:border-[#A74106]/20 hover:shadow-sm"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">{booking.userName}</p>
                          <StatusBadge status={booking.status} size="sm" />
                        </div>

                        <p className="mt-1 text-xs text-gray-500">{booking.userEmail}</p>

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {resource?.name || booking.resourceName}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(booking.date)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {booking.startTime} - {booking.endTime}
                          </span>
                        </div>

                        <p className="mt-3 text-sm text-gray-700">{booking.purpose}</p>

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            Lecturer: {booking.lecturer || 'Not provided'}
                          </span>
                          {booking.attendees ? (
                            <span className="inline-flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {booking.attendees} attendees
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 self-start">
                        {isPending ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setModal({ bookingId: booking.id, action: 'approve' })}
                              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-700"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => setModal({ bookingId: booking.id, action: 'reject' })}
                              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-red-700"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400">
                            Updated <ChevronRight className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {modal && modalBooking && modalResource && (
        <ReviewModal
          bookingId={modal.bookingId}
          action={modal.action}
          userName={modalBooking.userName}
          resourceName={modalResource.name}
          onConfirm={(reason) => handleReview(modal.action, reason)}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
