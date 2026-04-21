import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, Building2, FlaskConical, Wrench, MapPin, Users,
  Calendar, Clock, AlertCircle, CheckCircle, ChevronRight,
  ChevronLeft, Info, Loader2, User, MessageSquare, X, Package 
} from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { StatusBadge } from '../../components/StatusBadge';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';

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

// Helper to convert 12h format back to 24h for math calculations behind the scenes
const formatTo24Hour = (timeStr) => {
  if (!timeStr) return '';
  if (!timeStr.includes('M')) return timeStr; 
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');
  if (hours === '12') hours = '00';
  if (modifier === 'PM') hours = (parseInt(hours, 10) + 12).toString();
  return `${hours.padStart(2, '0')}:${minutes}`;
};

// The Custom Popover Time Picker matching your screenshot
const CustomTimePicker = ({ value, onChange, disabled, error }) => {
  const [isOpen, setIsOpen] = useState(false);

  const displayValue = value || "Select time";
  const currentHour = value ? value.split(':')[0] : '12';
  const currentMin = value ? value.split(':')[1].split(' ')[0] : '00';
  const currentAmPm = value ? value.split(' ')[1] : 'AM';

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  const ampm = ['AM', 'PM'];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.time-picker-dropdown')) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (type, val) => {
    let h = currentHour;
    let m = currentMin;
    let ap = currentAmPm;
    if (type === 'h') h = val;
    if (type === 'm') m = val;
    if (type === 'ap') ap = val;
    onChange(`${h}:${m} ${ap}`);
  };

  return (
    <div className="relative time-picker-dropdown w-full">
      <style>{`.hide-scroll::-webkit-scrollbar { display: none; } .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all cursor-pointer flex items-center justify-between ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 hover:bg-white'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className={value ? 'text-gray-900 font-medium' : 'text-gray-400'}>{displayValue}</span>
        <Clock className="w-4 h-4 text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-2 bg-white border border-gray-100 shadow-xl rounded-xl flex overflow-hidden w-full h-48 ring-1 ring-black/5">
          <div className="flex-1 overflow-y-auto hide-scroll border-r border-gray-50 py-2">
            {hours.map(h => (
              <div 
                key={h} 
                onClick={() => handleSelect('h', h)}
                className={`px-3 py-2 text-sm text-center cursor-pointer transition-colors ${currentHour === h ? 'bg-[#17A38A]/10 text-[#0F6657] font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {h}
              </div>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto hide-scroll border-r border-gray-50 py-2">
            {minutes.map(m => (
              <div 
                key={m} 
                onClick={() => handleSelect('m', m)}
                className={`px-3 py-2 text-sm text-center cursor-pointer transition-colors ${currentMin === m ? 'bg-[#17A38A]/10 text-[#0F6657] font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {m}
              </div>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto hide-scroll py-2">
            {ampm.map(ap => (
              <div 
                key={ap} 
                onClick={() => handleSelect('ap', ap)}
                className={`px-3 py-2 text-sm text-center cursor-pointer transition-colors ${currentAmPm === ap ? 'bg-[#17A38A]/10 text-[#0F6657] font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {ap}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function NewBooking() {
  const {
    resources,
    bookings,
    currentUser,
    createBooking,
    getResourceById,
    getUtilitiesForResource,
    fetchResources,
    resourcesLoading,
    resourcesError,
  } = useBooking();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentRole = (currentUser?.role || '').toUpperCase();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [step, setStep] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedResource, setSelectedResource] = useState(null);
  
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [attendees, setAttendees] = useState('');
  const [lecturer, setLecturer] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [requestedUtilityIds, setRequestedUtilityIds] = useState([]);

  const [conflict, setConflict] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [accessNotice, setAccessNotice] = useState('');
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    const rid = searchParams.get('resource');
    if (rid) {
      const r = getResourceById(rid);
      const isLecturerOnly = (r?.access || '').toLowerCase() === 'lecturer';
      const isBlockedForStudent = (currentRole === 'STUDENT' || currentRole === 'USER') && isLecturerOnly;

      if (isBlockedForStudent) {
        setSelectedResource(null);
        setStep(1);
        setAccessNotice('Only accessible by a lecturer, please contact a lecturer.');
        return;
      }

      if (r) {
        setSelectedResource(r);
        setStep(2);
        setAccessNotice('');
      }
    }
  }, [searchParams, resources, currentRole]);

  useEffect(() => {
    // Convert to 24h for mathematical comparison
    const start24 = formatTo24Hour(startTime);
    const end24 = formatTo24Hour(endTime);

    if (selectedResource && date && start24 && end24 && start24 < end24) {
      const overlappingBooking = bookings.find(b => {
        if (b.resourceId !== selectedResource.id || b.date !== date) return false;
        if (b.status !== 'APPROVED' && b.status !== 'PENDING') return false;
        
        const bStart = formatTo24Hour(b.startTime);
        const bEnd = formatTo24Hour(b.endTime);

        return (
          (start24 >= bStart && start24 < bEnd) ||
          (end24 > bStart && end24 <= bEnd) ||
          (start24 <= bStart && end24 >= bEnd)
        );
      });
      setConflict(overlappingBooking || null);
    } else {
      setConflict(null);
    }
  }, [selectedResource, date, startTime, endTime, bookings]);

  const today = new Date().toISOString().split('T')[0];

  const filtered = resources.filter(r => {
    const access = (r.access || '').toLowerCase();
    const status = (r.status || '').toLowerCase();
    const matchesAccess =
      currentRole === 'ADMIN' || currentRole === 'LECTURER'
        ? true
        : access === 'student' || access === 'anyone';
    const matchesStatus = status !== 'out of service';
    const matchType = typeFilter === 'all' || r.type === typeFilter;
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase());
    return matchesAccess && matchesStatus && matchType && matchSearch;
  });

  const validate = () => {
    const e = {};
    if (!date) e.date = 'Please select a date';
    else if (date < today) e.date = 'Date cannot be in the past';
    if (!startTime) e.startTime = 'Please select start time';
    if (!endTime) e.endTime = 'Please select end time';
    if (startTime && endTime && formatTo24Hour(startTime) >= formatTo24Hour(endTime)) {
      e.endTime = 'End time must be after start time';
    }
    if (!purpose.trim()) e.purpose = 'Please describe the purpose';
    else if (purpose.trim().length < 10) e.purpose = 'Purpose must be at least 10 characters';
    
    if (!lecturer.trim()) e.lecturer = 'Please provide the name of the Lecturer in Charge';

    if (selectedResource?.capacity) {
      if (!attendees) {
        e.attendees = 'Please provide the expected number of attendees';
      } else if (parseInt(attendees) > selectedResource.capacity) {
        e.attendees = `Exceeds capacity of ${selectedResource.capacity}`;
      } else if (parseInt(attendees) < 1) {
        e.attendees = 'Must have at least 1 attendee';
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const toggleRequestedUtility = (utilityId) => {
    setRequestedUtilityIds((current) =>
      current.includes(utilityId)
        ? current.filter((item) => item !== utilityId)
        : [...current, utilityId]
    );
  };

  const handleSubmit = async () => {
    if (!validate() || !selectedResource) return;
    if ((selectedResource.status || '').toLowerCase() === 'out of service') return;
    if ((currentRole === 'STUDENT' || currentRole === 'USER') && (selectedResource.access || '').toLowerCase() === 'lecturer') {
      setAccessNotice('Only accessible by a lecturer, please contact a lecturer.');
      return;
    }
    if (conflict) return;
    setSubmitting(true);
    
    const res = await createBooking({
      resourceId: selectedResource.id,
      userId: currentUser?.id || 'IT23345478',
      userName: currentUser?.name || 'Chathurya',
      userEmail: currentUser?.email || 'it23345478@my.sliit.lk',
      userDept: currentUser?.department || 'Faculty of Computing',
      date, startTime, endTime,
      purpose: purpose.trim(),
      attendees: attendees ? parseInt(attendees) : undefined,
      lecturer: lecturer.trim(),
      specialRequests: specialRequests.trim(),
      requestedUtilityIds,
    });

    setResult(res);
    setSubmitting(false);
    
    if (res.success) {
      setShowSuccessModal(true);
      setStep(3); 
    } else {
      // FIX: Add error handling so it doesn't fail silently
      setErrors({ submit: res.message || 'Failed to submit booking. Please try again.' });
    }
  };

  const inputClass = (field) =>
    `w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all ${
      errors[field]
        ? 'border-red-300 bg-red-50 focus:border-red-400'
        : 'border-gray-200 bg-gray-50 focus:border-[#17A38A] focus:bg-white focus:ring-4 focus:ring-[#17A38A]/15'
    }`;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Header />
        <div className="p-4 lg:p-6 text-left relative">
          
          {showSuccessModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center z-10 border border-gray-100">
                
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="absolute top-4 right-4 p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4 mt-2">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-gray-900 text-xl font-semibold mb-2">Booking Submitted!</h2>
                <p className="text-gray-500 text-sm mb-6">{result?.message}</p>

                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 text-left">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-amber-800 text-sm font-medium flex items-center gap-2">
                        Your booking is now <StatusBadge status="PENDING" size="sm" />
                      </p>
                      <p className="text-amber-700 text-xs mt-1">An administrator will review your request and notify you of the outcome.</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowSuccessModal(false);
                      setStep(1);
                      setSelectedResource(null);
                      setDate(''); setStartTime(''); setEndTime('');
                      setPurpose(''); setAttendees(''); setLecturer('');
                      setSpecialRequests(''); setRequestedUtilityIds([]); setResult(null);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
                  >
                    New Booking
                  </button>
                  
                  <button
                    onClick={() => navigate('/bookings/my')}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0F6657] to-[#17A38A] text-white hover:from-[#0c5246] hover:to-[#128a74] text-sm font-medium shadow-[0_4px_12px_rgba(23,163,138,0.3)] border-t border-white/20 transition-all"
                  >
                    My Bookings
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">New Booking Request</h1>
            <p className="text-gray-500 text-sm mt-1">Reserve a Lecture Hall, Lab, or Equipment</p>
          </div>

          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 sm:pb-0">
            {['Select Resource', 'Booking Details', 'Request Submitted'].map((label, i) => {
              const stepNum = i + 1;
              const active = step === stepNum;
              const done = step > stepNum;
              return (
                <div key={label} className="flex items-center gap-2 whitespace-nowrap">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all ${
                    done ? 'bg-emerald-100 text-emerald-700' :
                    active ? 'bg-gradient-to-r from-[#0F6657] to-[#17A38A] text-white shadow-md border-t border-white/20' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-xs border border-current">
                      {done ? '✓' : stepNum}
                    </span>
                    {label}
                  </div>
                  {i < 2 && <ChevronRight className="w-3.5 h-3.5 text-gray-300" />}
                </div>
              );
            })}
          </div>

          {accessNotice && (
            <div className="mb-6 max-w-2xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {accessNotice}
            </div>
          )}

          {step === 1 && (
            <div className="bg-white rounded-xl border border-gray-100">
              <div className="p-5 border-b border-gray-50">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search resources..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-[#17A38A] focus:bg-white focus:ring-2 focus:ring-[#17A38A]/10 transition-all"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {['all', 'Lecture Hall', 'lab', 'equipment'].map(t => (
                      <button
                        key={t}
                        onClick={() => setTypeFilter(t)}
                        className={`px-3 py-2 rounded-xl text-xs capitalize transition-all ${
                          typeFilter === t
                            ? 'bg-gradient-to-r from-[#0F6657] to-[#17A38A] text-white shadow-md border-t border-white/20'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {t === 'all' ? 'All Types' : t + 's'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {resourcesLoading ? (
                  <div className="col-span-full flex items-center justify-center gap-2 py-12 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <p className="text-sm">Loading resources...</p>
                  </div>
                ) : resourcesError ? (
                  <div className="col-span-full text-center py-12 text-red-400">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Unable to load resources right now</p>
                  </div>
                ) : filtered.map(resource => (
                    <button
                      key={resource.id}
                      onClick={() => { setSelectedResource(resource); setStep(2); }}
                      className="text-left p-4 rounded-xl border-2 border-gray-100 hover:border-[#17A38A]/50 hover:bg-[#17A38A]/5 hover:shadow-[0_8px_24px_rgba(23,163,138,0.12)] transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${TYPE_COLORS[resource.type]}`}>
                          {TYPE_ICONS[resource.type]}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${TYPE_COLORS[resource.type]}`}>
                          {resource.type}
                        </span>
                      </div>
                      <h4 className="text-gray-900 mb-1 group-hover:text-[#0F6657] transition-colors">{resource.name}</h4>
                      <div className="flex items-center gap-1 text-gray-400 text-xs mb-2">
                        <MapPin className="w-3 h-3" />
                        {resource.location}
                      </div>
                      {resource.capacity && (
                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                          <Users className="w-3 h-3" />
                          Capacity: {resource.capacity} persons
                        </div>
                      )}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {resource.features.slice(0, 3).map(f => (
                          <span key={f} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-md">{f}</span>
                        ))}
                        {resource.features.length > 3 && (
                          <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded-md">+{resource.features.length - 3}</span>
                        )}
                      </div>
                    </button>
                  ))}
                {!resourcesLoading && !resourcesError && filtered.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-400">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No resources match your search</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {step >= 2 && selectedResource && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-50">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${TYPE_COLORS[selectedResource.type]}`}>
                      {TYPE_ICONS[selectedResource.type]}
                    </div>
                    <div>
                      <h3 className="text-gray-900">{selectedResource.name}</h3>
                      <p className="text-gray-400 text-xs">{selectedResource.location}</p>
                    </div>
                    {step === 2 && (
                      <button
                        onClick={() => setStep(1)}
                        className="ml-auto text-[#17A38A] text-xs hover:underline flex items-center gap-1"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Change
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 text-sm mb-1.5">
                        <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        min={today}
                        value={date}
                        disabled={step === 3}
                        onChange={e => { setDate(e.target.value); setErrors(p => ({ ...p, date: '' })); }}
                        className={inputClass('date')}
                      />
                      {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-700 text-sm mb-1.5">
                          <Clock className="w-3.5 h-3.5 inline mr-1.5" />
                          Start Time <span className="text-red-500">*</span>
                        </label>
                        <CustomTimePicker
                          value={startTime}
                          disabled={step === 3}
                          error={errors.startTime}
                          onChange={val => { setStartTime(val); setErrors(p => ({ ...p, startTime: '' })); }}
                        />
                        {errors.startTime && <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>}
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm mb-1.5">
                          <Clock className="w-3.5 h-3.5 inline mr-1.5" />
                          End Time <span className="text-red-500">*</span>
                        </label>
                        <CustomTimePicker
                          value={endTime}
                          disabled={step === 3}
                          error={errors.endTime}
                          onChange={val => { setEndTime(val); setErrors(p => ({ ...p, endTime: '' })); }}
                        />
                        {errors.endTime && <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>}
                      </div>
                    </div>

                    {conflict && step !== 3 && (
                      <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl">
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-red-800 text-sm">Scheduling Conflict Detected</p>
                          <p className="text-red-600 text-xs mt-0.5">
                            This resource is already booked by <span className="font-medium">{conflict.userName}</span> from{' '}
                            <span className="font-medium">{conflict.startTime} to {conflict.endTime}</span> on this date.
                            Please choose a different time slot.
                          </p>
                        </div>
                      </div>
                    )}

                    {!conflict && date && startTime && endTime && startTime < endTime && step !== 3 && (
                      <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <p className="text-emerald-700 text-sm">Time slot is available</p>
                      </div>
                    )}

                    <div>
                      <label className="block text-gray-700 text-sm mb-1.5">
                        Purpose / Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        disabled={step === 3}
                        placeholder="Describe the purpose of this booking (e.g., Final Year Project Presentation for CS4081)..."
                        value={purpose}
                        onChange={e => { setPurpose(e.target.value); setErrors(p => ({ ...p, purpose: '' })); }}
                        className={`${inputClass('purpose')} resize-none`}
                      />
                      {errors.purpose && <p className="text-red-500 text-xs mt-1">{errors.purpose}</p>}
                      <p className="text-gray-400 text-xs mt-1">{purpose.length} characters</p>
                    </div>

                    {selectedResource.capacity && (
                      <div>
                        <label className="block text-gray-700 text-sm mb-1.5">
                          <Users className="w-3.5 h-3.5 inline mr-1.5" />
                          Expected Attendees <span className="text-red-500">*</span>
                          <span className="text-gray-400 text-xs ml-1">(max {selectedResource.capacity})</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={selectedResource.capacity}
                          disabled={step === 3}
                          placeholder={`1 – ${selectedResource.capacity}`}
                          value={attendees}
                          onChange={e => { setAttendees(e.target.value); setErrors(p => ({ ...p, attendees: '' })); }}
                          className={inputClass('attendees')}
                        />
                        {errors.attendees && <p className="text-red-500 text-xs mt-1">{errors.attendees}</p>}
                      </div>
                    )}

                    <div>
                      <label className="block text-gray-700 text-sm mb-1.5">
                        <User className="w-3.5 h-3.5 inline mr-1.5" />
                        Lecturer in Charge <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        disabled={step === 3}
                        placeholder="e.g., Dr. Kamal Perera"
                        value={lecturer}
                        onChange={e => { setLecturer(e.target.value); setErrors(p => ({ ...p, lecturer: '' })); }}
                        className={inputClass('lecturer')}
                      />
                      {errors.lecturer && <p className="text-red-500 text-xs mt-1">{errors.lecturer}</p>}
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm mb-1.5">
                        <MessageSquare className="w-3.5 h-3.5 inline mr-1.5" />
                        Special Requests <span className="text-gray-400 text-xs ml-1">(Optional)</span>
                      </label>
                      <textarea
                        rows={2}
                        disabled={step === 3}
                        placeholder="Any specific setup requirements (e.g., extra chairs, projector adapter)..."
                        value={specialRequests}
                        onChange={e => setSpecialRequests(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-[#17A38A] focus:bg-white focus:ring-2 focus:ring-[#17A38A]/10 transition-all resize-none"
                      />
                    </div>

                    {getUtilitiesForResource(selectedResource.id).length > 0 && (
                      <div>
                        <label className="block text-gray-700 text-sm mb-1.5">
                          <Package className="w-3.5 h-3.5 inline mr-1.5" />
                          Requested Utilities
                        </label>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {getUtilitiesForResource(selectedResource.id).map((utility) => {
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
                                  <span className="block text-xs text-gray-400">
                                    {utility.utilityCode} · {utility.category}
                                  </span>
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {/* FIX: Display submit error to the user if the backend connection fails */}
                  {errors.submit && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <p className="text-red-700 text-sm">{errors.submit}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    {step === 2 && (
                      <button
                        onClick={() => setStep(1)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" /> Back
                      </button>
                    )}
                    <button
                      onClick={handleSubmit}
                      disabled={submitting || !!conflict || step === 3}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl text-sm transition-all ${
                        submitting || conflict || step === 3
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-[#0F6657] to-[#17A38A] text-white hover:from-[#0c5246] hover:to-[#128a74] shadow-[0_6px_20px_rgba(23,163,138,0.4)] border-t border-white/30 active:scale-[0.98]'
                      }`}
                    >
                      {submitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                      ) : step === 3 ? (
                        <>Submitted Successfully <CheckCircle className="w-4 h-4" /></>
                      ) : (
                        <>Submit Booking Request <ChevronRight className="w-4 h-4" /></>
                      )}
                    </button>
                  </div>
                  
                  {step === 3 && (
                    <button
                      onClick={() => {
                        setStep(1);
                        setSelectedResource(null);
                        setDate(''); setStartTime(''); setEndTime('');
                        setPurpose(''); setAttendees(''); setLecturer('');
                        setSpecialRequests(''); setRequestedUtilityIds([]); setResult(null);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0F6657] to-[#17A38A] text-white hover:from-[#0c5246] hover:to-[#128a74] shadow-[0_6px_20px_rgba(23,163,138,0.4)] border-t border-white/30 text-sm font-medium transition-all active:scale-[0.98] mt-1"
                    >
                      Make Another Booking
                    </button>
                  )}
                </div>

              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h3 className="text-gray-900 mb-3">Resource Details</h3>
                  {selectedResource.capacity && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      Capacity: {selectedResource.capacity} persons
                    </div>
                  )}
                  <div className="flex items-start gap-2 text-gray-600 text-sm mb-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    {selectedResource.location}
                  </div>
                  <div className="border-t border-gray-50 pt-3">
                    <p className="text-gray-400 text-xs mb-2">Features</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedResource.features.map(f => (
                        <span key={f} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-lg">{f}</span>
                      ))}
                    </div>
                  </div>

                  {requestedUtilityIds.length > 0 && (
                    <div className="border-t border-gray-50 pt-3 mt-3">
                      <p className="text-gray-400 text-xs mb-2">Requested Utilities</p>
                      <div className="flex flex-wrap gap-1.5">
                        {requestedUtilityIds.map((utilityId) => {
                          const utility = getUtilitiesForResource(selectedResource.id).find((item) => item.id === utilityId);
                          if (!utility) return null;

                          return (
                            <span key={utilityId} className="text-xs px-2 py-0.5 bg-blue-50 text-[#2563EB] rounded-lg border border-blue-100">
                              {utility.utilityName}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h3 className="text-gray-900 mb-3">Upcoming Reserved Slots</h3>
                  {(() => {
                    const todayStr = today;
                    const existing = bookings
                      .filter(b => b.resourceId === selectedResource.id && (b.status === 'APPROVED' || b.status === 'PENDING') && b.date >= todayStr)
                      .sort((a, b) => a.date.localeCompare(b.date) || formatTo24Hour(a.startTime).localeCompare(formatTo24Hour(b.startTime)))
                      .slice(0, 5);
                    
                    if (existing.length === 0) {
                      return <p className="text-gray-400 text-sm text-center py-4">No upcoming reservations</p>;
                    }
                    return (
                      <div className="space-y-2">
                        {existing.map(b => (
                          <div key={b.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                            <div>
                              <p className="text-gray-700 text-xs">{new Date(b.date + 'T00:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric' })}</p>
                              <p className="text-gray-500 text-xs">{b.startTime} – {b.endTime}</p>
                            </div>
                            <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">Booked</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
