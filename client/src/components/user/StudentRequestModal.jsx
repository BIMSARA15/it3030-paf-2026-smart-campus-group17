import { useState } from 'react';
import {
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  MapPin,
  MessageSquare,
  Package,
  User,
  Users,
  X,
} from 'lucide-react';

export default function StudentRequestModal({
  isOpen,
  resource,
  currentUser,
  getUtilitiesForResource,
  onClose,
  onSubmit,
}) {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [attendees, setAttendees] = useState('');
  const [lecturer, setLecturer] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [requestedUtilityIds, setRequestedUtilityIds] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !resource) return null;

  const today = new Date().toISOString().split('T')[0];
  const availableUtilities = getUtilitiesForResource(resource.id);

  const inputClass = (field) =>
    `w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all ${
      errors[field]
        ? 'border-red-300 bg-red-50 focus:border-red-400'
        : 'border-gray-200 bg-gray-50 focus:border-[#17A38A] focus:bg-white focus:ring-4 focus:ring-[#17A38A]/15'
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

    if (!purpose.trim()) nextErrors.purpose = 'Please describe your request';
    else if (purpose.trim().length < 10) nextErrors.purpose = 'Purpose must be at least 10 characters';

    if (!lecturer.trim()) nextErrors.lecturer = 'Please provide the lecturer you are requesting';

    if (resource.capacity) {
      if (!attendees) nextErrors.attendees = 'Please provide the expected number of attendees';
      else if (parseInt(attendees, 10) > resource.capacity) nextErrors.attendees = `Exceeds capacity of ${resource.capacity}`;
      else if (parseInt(attendees, 10) < 1) nextErrors.attendees = 'Must have at least 1 attendee';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);

    const result = await onSubmit({
      resourceId: resource.id,
      resourceName: resource.name,
      studentId: currentUser?.id || currentUser?.email || 'student',
      studentName: currentUser?.name || 'Student',
      studentEmail: currentUser?.email || '',
      studentDept: currentUser?.department || 'Faculty of Computing',
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

    if (result?.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto p-4">
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 my-8 flex max-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.2)]">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Lecturer Access Request</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">Send Request to Lecturer</h2>
            <p className="mt-1 text-sm text-slate-500">Fill in the same details a lecturer would need to place this booking for you.</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid gap-5 p-6 lg:grid-cols-[1.35fr_0.85fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-sm font-medium text-amber-900">This resource is lecturer-only.</p>
              <p className="mt-1 text-xs text-amber-800">Your request will appear in the lecturer portal under `Std Requests`.</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-gray-700">
                <Calendar className="mr-1.5 inline h-3.5 w-3.5" />
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                min={today}
                value={date}
                onChange={(event) => {
                  setDate(event.target.value);
                  setErrors((current) => ({ ...current, date: '' }));
                }}
                className={inputClass('date')}
              />
              {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm text-gray-700">
                  <Clock className="mr-1.5 inline h-3.5 w-3.5" />
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(event) => {
                    setStartTime(event.target.value);
                    setErrors((current) => ({ ...current, startTime: '' }));
                  }}
                  className={inputClass('startTime')}
                />
                {errors.startTime && <p className="mt-1 text-xs text-red-500">{errors.startTime}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-gray-700">
                  <Clock className="mr-1.5 inline h-3.5 w-3.5" />
                  End Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(event) => {
                    setEndTime(event.target.value);
                    setErrors((current) => ({ ...current, endTime: '' }));
                  }}
                  className={inputClass('endTime')}
                />
                {errors.endTime && <p className="mt-1 text-xs text-red-500">{errors.endTime}</p>}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-gray-700">Purpose / Description <span className="text-red-500">*</span></label>
              <textarea
                rows={3}
                value={purpose}
                onChange={(event) => {
                  setPurpose(event.target.value);
                  setErrors((current) => ({ ...current, purpose: '' }));
                }}
                className={`${inputClass('purpose')} resize-none`}
                placeholder="Describe the class, presentation, or activity for this request..."
              />
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
                  onChange={(event) => {
                    setAttendees(event.target.value);
                    setErrors((current) => ({ ...current, attendees: '' }));
                  }}
                  className={inputClass('attendees')}
                  placeholder={`1 - ${resource.capacity}`}
                />
                {errors.attendees && <p className="mt-1 text-xs text-red-500">{errors.attendees}</p>}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm text-gray-700">
                <User className="mr-1.5 inline h-3.5 w-3.5" />
                Lecturer in Charge <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lecturer}
                onChange={(event) => {
                  setLecturer(event.target.value);
                  setErrors((current) => ({ ...current, lecturer: '' }));
                }}
                className={inputClass('lecturer')}
                placeholder="e.g., Dr. Kamal Perera"
              />
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
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-[#17A38A] focus:bg-white focus:ring-4 focus:ring-[#17A38A]/15"
                placeholder="Any setup notes or information for the lecturer..."
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
                            ? 'border-[#17A38A]/30 bg-[#17A38A]/5 text-[#0F6657]'
                            : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-[#17A38A]/20 hover:bg-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleRequestedUtility(utility.id)}
                          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#17A38A] focus:ring-[#17A38A]/30"
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
            <div className="rounded-2xl border border-gray-100 bg-slate-50 p-5">
              <h3 className="text-sm font-semibold text-slate-900">Resource Details</h3>
              <p className="mt-3 text-base font-medium text-gray-900">{resource.name}</p>
              <div className="mt-2 flex items-start gap-2 text-sm text-gray-500">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                <span>{resource.location}</span>
              </div>
              {resource.capacity && (
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span>Capacity: {resource.capacity}</span>
                </div>
              )}

              <div className="mt-4 border-t border-gray-200 pt-4">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Features</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {resource.features.map((feature) => (
                    <span key={feature} className="rounded-lg bg-white px-2 py-1 text-xs text-gray-600">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <div className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium text-emerald-800">What happens next?</p>
                  <p className="mt-1 text-xs text-emerald-700">
                    The lecturer will review your request, open it from `Std Requests`, and submit the actual booking on your behalf.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Requested By</p>
              <p className="mt-2 text-sm font-medium text-gray-900">{currentUser?.name || 'Student'}</p>
              <p className="text-xs text-gray-500">{currentUser?.email || ''}</p>
            </div>
          </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0F6657] to-[#17A38A] px-5 py-2.5 text-sm font-medium text-white shadow-[0_4px_12px_rgba(23,163,138,0.3)] transition-all hover:from-[#0c5246] hover:to-[#128a74] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {submitting ? 'Sending...' : 'Send Request'}
          </button>
        </div>
      </div>
    </div>
  );
}
