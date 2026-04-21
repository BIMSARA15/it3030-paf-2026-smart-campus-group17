import { useState } from 'react';
import {
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
  MessageSquare,
  Package,
  Search,
  User,
  Users,
  X,
} from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { StatusBadge } from '../../components/StatusBadge';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';

function ReviewRequestModal({
  request,
  currentUser,
  bookings,
  getResourceById,
  getUtilitiesForResource,
  fulfillStudentRequest,
  updateStudentRequest,
  onClose,
}) {
  const resource = getResourceById(request.resourceId);
  const [date, setDate] = useState(request.date || '');
  const [startTime, setStartTime] = useState(request.startTime || '');
  const [endTime, setEndTime] = useState(request.endTime || '');
  const [purpose, setPurpose] = useState(request.purpose || '');
  const [attendees, setAttendees] = useState(request.attendees ? String(request.attendees) : '');
  const [lecturer, setLecturer] = useState(request.lecturer || currentUser?.name || '');
  const [specialRequests, setSpecialRequests] = useState(request.specialRequests || '');
  const [requestedUtilityIds, setRequestedUtilityIds] = useState(
    Array.isArray(request.requestedUtilityIds) ? request.requestedUtilityIds : []
  );
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [inlineMessage, setInlineMessage] = useState('');

  if (!request || !resource) return null;

  const today = new Date().toISOString().split('T')[0];
  const availableUtilities = getUtilitiesForResource(resource.id);

  const conflict = date && startTime && endTime && startTime < endTime
    ? bookings.find((booking) =>
        booking.resourceId === resource.id &&
        booking.date === date &&
        (booking.status === 'APPROVED' || booking.status === 'PENDING') &&
        (
          (startTime >= booking.startTime && startTime < booking.endTime) ||
          (endTime > booking.startTime && endTime <= booking.endTime) ||
          (startTime <= booking.startTime && endTime >= booking.endTime)
        )
      )
    : null;

  const inputClass = (field) =>
    `w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all ${
      errors[field]
        ? 'border-red-300 bg-red-50 focus:border-red-400'
        : 'border-gray-200 bg-gray-50 focus:border-[#A74106] focus:bg-white focus:ring-4 focus:ring-[#A74106]/15'
    }`;

  const toggleRequestedUtility = (utilityId) => {
    setRequestedUtilityIds((current) =>
      current.includes(utilityId)
        ? current.filter((item) => item !== utilityId)
        : [...current, utilityId]
    );
  };

  const validate = () => {
    const nextErrors = {};

    if (!date) nextErrors.date = 'Please select a date';
    else if (date < today) nextErrors.date = 'Date cannot be in the past';
    if (!startTime) nextErrors.startTime = 'Please select start time';
    if (!endTime) nextErrors.endTime = 'Please select end time';
    if (startTime && endTime && startTime >= endTime) {
      nextErrors.endTime = 'End time must be after start time';
    }
    if (!purpose.trim()) nextErrors.purpose = 'Please describe the purpose';
    if (!lecturer.trim()) nextErrors.lecturer = 'Please provide the lecturer in charge';

    if (resource.capacity) {
      if (!attendees) nextErrors.attendees = 'Please provide attendees';
      else if (parseInt(attendees, 10) > resource.capacity) nextErrors.attendees = `Exceeds capacity of ${resource.capacity}`;
      else if (parseInt(attendees, 10) < 1) nextErrors.attendees = 'Must have at least 1 attendee';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCreateBooking = async () => {
    if (!validate() || conflict) return;

    setSubmitting(true);
    const result = await fulfillStudentRequest(request.id, {
      resourceId: request.resourceId,
      userId: request.studentId,
      userName: request.studentName,
      userEmail: request.studentEmail,
      userDept: request.studentDept,
      date,
      startTime,
      endTime,
      purpose: purpose.trim(),
      attendees: attendees ? parseInt(attendees, 10) : undefined,
      lecturer: lecturer.trim(),
      specialRequests: specialRequests.trim(),
      requestedUtilityIds,
    });
    setSubmitting(false);

    if (result.success) {
      onClose();
    } else {
      setInlineMessage(result.message || 'Unable to create booking right now.');
    }
  };

  const handleDecline = () => {
    updateStudentRequest(request.id, {
      status: 'DECLINED',
      fulfilledBy: currentUser?.name || 'Lecturer',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.2)]">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A74106]">Std Request</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">Review Student Request</h2>
            <p className="mt-1 text-sm text-slate-500">You can adjust the details below, then create the booking on behalf of the student.</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-5 p-6 lg:grid-cols-[1.35fr_0.85fr]">
          <div className="space-y-4">
            {conflict && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm font-medium text-red-800">Scheduling conflict detected</p>
                <p className="mt-1 text-xs text-red-700">
                  This resource already has a booking from {conflict.startTime} to {conflict.endTime} on {conflict.date}.
                </p>
              </div>
            )}

            {inlineMessage && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {inlineMessage}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm text-gray-700">
                <Calendar className="mr-1.5 inline h-3.5 w-3.5" />
                Date <span className="text-red-500">*</span>
              </label>
              <input type="date" min={today} value={date} onChange={(event) => setDate(event.target.value)} className={inputClass('date')} />
              {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm text-gray-700">
                  <Clock className="mr-1.5 inline h-3.5 w-3.5" />
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} className={inputClass('startTime')} />
                {errors.startTime && <p className="mt-1 text-xs text-red-500">{errors.startTime}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-gray-700">
                  <Clock className="mr-1.5 inline h-3.5 w-3.5" />
                  End Time <span className="text-red-500">*</span>
                </label>
                <input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} className={inputClass('endTime')} />
                {errors.endTime && <p className="mt-1 text-xs text-red-500">{errors.endTime}</p>}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-gray-700">Purpose / Description <span className="text-red-500">*</span></label>
              <textarea rows={3} value={purpose} onChange={(event) => setPurpose(event.target.value)} className={`${inputClass('purpose')} resize-none`} />
              {errors.purpose && <p className="mt-1 text-xs text-red-500">{errors.purpose}</p>}
            </div>

            {resource.capacity && (
              <div>
                <label className="mb-1.5 block text-sm text-gray-700">
                  <Users className="mr-1.5 inline h-3.5 w-3.5" />
                  Expected Attendees <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={resource.capacity}
                  value={attendees}
                  onChange={(event) => setAttendees(event.target.value)}
                  className={inputClass('attendees')}
                />
                {errors.attendees && <p className="mt-1 text-xs text-red-500">{errors.attendees}</p>}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm text-gray-700">
                <User className="mr-1.5 inline h-3.5 w-3.5" />
                Lecturer in Charge <span className="text-red-500">*</span>
              </label>
              <input type="text" value={lecturer} onChange={(event) => setLecturer(event.target.value)} className={inputClass('lecturer')} />
              {errors.lecturer && <p className="mt-1 text-xs text-red-500">{errors.lecturer}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-gray-700">
                <MessageSquare className="mr-1.5 inline h-3.5 w-3.5" />
                Special Requests
              </label>
              <textarea
                rows={2}
                value={specialRequests}
                onChange={(event) => setSpecialRequests(event.target.value)}
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-[#A74106] focus:bg-white focus:ring-4 focus:ring-[#A74106]/15"
              />
            </div>

            {availableUtilities.length > 0 && (
              <div>
                <label className="mb-1.5 block text-sm text-gray-700">
                  <Package className="mr-1.5 inline h-3.5 w-3.5" />
                  Requested Utilities
                </label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {availableUtilities.map((utility) => {
                    const checked = requestedUtilityIds.includes(utility.id);
                    return (
                      <label
                        key={utility.id}
                        className={`flex items-start gap-2 rounded-xl border px-3 py-3 text-sm transition-all ${
                          checked
                            ? 'border-[#A74106]/20 bg-[#A74106]/5 text-[#8A3505]'
                            : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-[#A74106]/20 hover:bg-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleRequestedUtility(utility.id)}
                          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#A74106] focus:ring-[#A74106]/30"
                        />
                        <span>
                          <span className="block font-medium">{utility.utilityName}</span>
                          <span className="block text-xs text-gray-400">{utility.utilityCode} · {utility.category}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <h3 className="text-sm font-semibold text-slate-900">Student Details</h3>
              <p className="mt-3 text-base font-medium text-gray-900">{request.studentName}</p>
              <p className="text-xs text-gray-500">{request.studentEmail}</p>
              <p className="mt-1 text-xs text-gray-500">{request.studentDept}</p>

              <div className="mt-4 border-t border-gray-200 pt-4">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Requested Resource</p>
                <p className="mt-2 text-sm font-medium text-gray-900">{resource.name}</p>
                <div className="mt-2 flex items-start gap-2 text-sm text-gray-500">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                  <span>{resource.location}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
              <div className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Lecturer action</p>
                  <p className="mt-1 text-xs text-amber-700">
                    Creating the booking here sends the normal booking request into the system, and the student will see it in `My Bookings`.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Request Status</p>
              <div className="mt-3">
                <StatusBadge status={request.status} size="sm" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-5 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={handleDecline}
            className="inline-flex items-center justify-center rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            Decline Request
          </button>

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleCreateBooking}
              disabled={submitting || Boolean(conflict)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8A3505] to-[#C54E08] px-5 py-2.5 text-sm font-medium text-white shadow-[0_4px_12px_rgba(167,65,6,0.3)] transition-all hover:from-[#702A04] hover:to-[#A74106] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {submitting ? 'Creating Booking...' : 'Create Booking'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudentRequests() {
  const {
    studentRequests,
    bookings,
    currentUser,
    getResourceById,
    getUtilitiesForResource,
    fulfillStudentRequest,
    updateStudentRequest,
  } = useBooking();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRequest, setSelectedRequest] = useState(null);

  const sortedRequests = [...studentRequests].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );

  const filteredRequests = sortedRequests.filter((request) => {
    const matchStatus = statusFilter === 'ALL' || request.status === statusFilter;
    const matchSearch = search === '' ||
      request.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      request.studentEmail?.toLowerCase().includes(search.toLowerCase()) ||
      request.resourceName?.toLowerCase().includes(search.toLowerCase()) ||
      request.lecturer?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    ALL: sortedRequests.length,
    PENDING: sortedRequests.filter((request) => request.status === 'PENDING').length,
    BOOKING_CREATED: sortedRequests.filter((request) => request.status === 'BOOKING_CREATED').length,
    DECLINED: sortedRequests.filter((request) => request.status === 'DECLINED').length,
  };

  const formatDate = (value) => new Date(`${value}T00:00:00`).toLocaleDateString('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Header />

        <div className="space-y-5 p-4 lg:p-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Std Requests</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Lecturer-only resource requests sent by students for your review.
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
              {['ALL', 'PENDING', 'BOOKING_CREATED', 'DECLINED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-xl px-3 py-2 text-xs transition-all ${
                    statusFilter === status
                      ? 'bg-gradient-to-r from-[#8A3505] to-[#C54E08] text-white shadow-md'
                      : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {status === 'ALL' ? 'All' : status.replace('_', ' ')}
                  <span className={`ml-2 rounded-full px-1.5 py-0.5 ${statusFilter === status ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                    {counts[status]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="rounded-xl border border-gray-100 bg-white py-16 text-center">
              <Users className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="text-gray-500">No student requests found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((request) => {
                const resource = getResourceById(request.resourceId);

                return (
                  <button
                    key={request.id}
                    type="button"
                    onClick={() => request.status === 'PENDING' && setSelectedRequest(request)}
                    className="w-full rounded-xl border border-gray-100 bg-white p-5 text-left transition-all hover:border-[#A74106]/20 hover:shadow-sm"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">{request.studentName}</p>
                          <StatusBadge status={request.status} size="sm" />
                        </div>

                        <p className="mt-1 text-xs text-gray-500">{request.studentEmail}</p>

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {resource?.name || request.resourceName}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(request.date)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {request.startTime} - {request.endTime}
                          </span>
                        </div>

                        <p className="mt-3 text-sm text-gray-700">{request.purpose}</p>

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          <span>Requested Lecturer: {request.lecturer}</span>
                          {request.attendees ? <span>Attendees: {request.attendees}</span> : null}
                          {request.specialRequests ? <span>Special Notes Added</span> : null}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start">
                        {request.status === 'PENDING' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-[#A74106]">
                            Review Request <ChevronRight className="h-3.5 w-3.5" />
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">
                            {request.status === 'BOOKING_CREATED'
                              ? `Handled by ${request.fulfilledBy || 'Lecturer'}`
                              : 'Closed request'}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedRequest && (
        <ReviewRequestModal
          key={selectedRequest.id}
          request={selectedRequest}
          currentUser={currentUser}
          bookings={bookings}
          getResourceById={getResourceById}
          getUtilitiesForResource={getUtilitiesForResource}
          fulfillStudentRequest={fulfillStudentRequest}
          updateStudentRequest={updateStudentRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
}
