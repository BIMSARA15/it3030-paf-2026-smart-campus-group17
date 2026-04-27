import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import {
  Search, Building2, FlaskConical, Wrench, MapPin, Users,
  Calendar, Clock, AlertCircle, CheckCircle, ChevronRight,
  ChevronLeft, Info, Loader2, User, MessageSquare, X, Package, Tag 
} from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { StatusBadge } from '../../components/StatusBadge';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
//import AIChat from '../components/AIChat';

const TYPE_ICONS = {
  room: <Building2 className="w-4 h-4" />,
  lab: <FlaskConical className="w-4 h-4" />,
  equipment: <Wrench className="w-4 h-4" />,
};

const TYPE_COLORS = {
  room: 'bg-blue-100 text-blue-600',
  lab: 'bg-violet-100 text-violet-600',
  equipment: 'bg-slate-100 text-slate-600',
};

const DEFAULT_RESOURCE_IMAGES = {
  lectureRoom: 'https://i.pinimg.com/736x/f8/98/46/f89846b24148276c9000e38c51c82ce5.jpg',
  lab: 'https://i.pinimg.com/736x/39/ee/cb/39eecbeca86920e153e277780f20feed.jpg',
  meetingRoom: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=800',
  equipment: 'https://i.pinimg.com/736x/64/e7/8f/64e78f4c21c54ff2b9765fa14b62267b.jpg',
};

const getResourceImage = (resource) => {
  if (resource.image) return resource.image;
  const originalType = (resource.resourceType || resource.type || '').toLowerCase();
  if (originalType.includes('meeting')) return DEFAULT_RESOURCE_IMAGES.meetingRoom;
  if (originalType.includes('lab')) return DEFAULT_RESOURCE_IMAGES.lab;
  if (originalType.includes('equipment') || originalType.includes('utility')) return DEFAULT_RESOURCE_IMAGES.equipment;
  return DEFAULT_RESOURCE_IMAGES.lectureRoom;
};

const normalizeUtilityStatus = (status = '') => status.trim().toLowerCase();
const shouldShowUtility = (utility) => normalizeUtilityStatus(utility?.status) !== 'maintenance';
const isUtilityInUse = (utility) => normalizeUtilityStatus(utility?.status) === 'in use';

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

// The Custom Popover Time Picker
const CustomTimePicker = ({ value, onChange, disabled, error, theme }) => {
  const [isOpen, setIsOpen] = useState(false);

  const displayValue = value || "Select time";
  const currentHour = value ? value.split(':')[0] : '12';
  const currentMin = value ? value.split(':')[1]?.split(' ')[0] : '00';
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
                key={`hour-${h}`} 
                onClick={() => handleSelect('h', h)}
                className={`px-3 py-2 text-sm text-center cursor-pointer transition-colors ${currentHour === h ? (theme?.activeTime || 'bg-[#17A38A]/10 text-[#0F6657] font-bold') : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {h}
              </div>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto hide-scroll border-r border-gray-50 py-2">
            {minutes.map(m => (
              <div 
                key={`min-${m}`} 
                onClick={() => handleSelect('m', m)}
                className={`px-3 py-2 text-sm text-center cursor-pointer transition-colors ${currentMin === m ? (theme?.activeTime || 'bg-[#17A38A]/10 text-[#0F6657] font-bold') : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {m}
              </div>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto hide-scroll py-2">
            {ampm.map(ap => (
              <div 
                key={`ap-${ap}`} 
                onClick={() => handleSelect('ap', ap)}
                className={`px-3 py-2 text-sm text-center cursor-pointer transition-colors ${currentAmPm === ap ? (theme?.activeTime || 'bg-[#17A38A]/10 text-[#0F6657] font-bold') : 'text-gray-600 hover:bg-gray-50'}`}
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
    utilities,           
    utilitiesLoading,    
    utilitiesError,      
    fetchUtilities,
    bookings,
    currentUser,
    createBooking,
    updateBooking,
    getResourceById,
    getUtilitiesForResource,
    fetchResources,
    resourcesLoading,
    resourcesError,
  } = useBooking();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id } = useParams(); // <-- get the ID from the URL
  const isEditing = !!id; // <-- Boolean flag to check if we are in edit mode
  const currentRole = (currentUser?.role || '').toUpperCase();

  const isLecturer = currentRole === 'LECTURER'; 

  // THEME OBJECT FOR CONSISTENT STYLING BASED ON ROLE
  const theme = {
    gradientBtn: isLecturer 
      ? 'bg-gradient-to-r from-[#8A3505] to-[#C54E08] hover:from-[#702A04] hover:to-[#A74106] shadow-[0_4px_12px_rgba(167,65,6,0.3)]' 
      : 'bg-gradient-to-r from-[#0F6657] to-[#17A38A] hover:from-[#0c5246] hover:to-[#128a74] shadow-[0_4px_12px_rgba(23,163,138,0.3)]',
    gradientBtnLg: isLecturer
      ? 'bg-gradient-to-r from-[#8A3505] to-[#C54E08] hover:from-[#702A04] hover:to-[#A74106] shadow-[0_6px_20px_rgba(167,65,6,0.4)]' 
      : 'bg-gradient-to-r from-[#0F6657] to-[#17A38A] hover:from-[#0c5246] hover:to-[#128a74] shadow-[0_6px_20px_rgba(23,163,138,0.4)]',
    activeStep: isLecturer
      ? 'bg-gradient-to-r from-[#8A3505] to-[#C54E08] text-white shadow-md border-t border-white/20'
      : 'bg-gradient-to-r from-[#0F6657] to-[#17A38A] text-white shadow-md border-t border-white/20',
    focusRing: isLecturer
      ? 'focus:border-[#C54E08] focus:ring-[#C54E08]/10'
      : 'focus:border-[#17A38A] focus:ring-[#17A38A]/10',
    focusRingLg: isLecturer
      ? 'focus:border-[#C54E08] focus:ring-[#C54E08]/15'
      : 'focus:border-[#17A38A] focus:ring-[#17A38A]/15',
    activeTime: isLecturer
      ? 'bg-[#A74106]/10 text-[#8A3505] font-bold'
      : 'bg-[#17A38A]/10 text-[#0F6657] font-bold',
    textLink: isLecturer ? 'text-[#C54E08]' : 'text-[#17A38A]',
    textHover: isLecturer ? 'group-hover:text-[#8A3505]' : 'group-hover:text-[#0F6657]',
    cardHover: isLecturer 
      ? 'hover:border-[#C54E08]/50 hover:bg-[#C54E08]/5 hover:shadow-[0_8px_24px_rgba(167,65,6,0.12)]'
      : 'hover:border-[#17A38A]/50 hover:bg-[#17A38A]/5 hover:shadow-[0_8px_24px_rgba(23,163,138,0.12)]',
    checkboxActiveBg: isLecturer ? 'border-[#C54E08]/30 bg-[#C54E08]/5 text-[#8A3505]' : 'border-[#17A38A]/30 bg-[#17A38A]/5 text-[#0F6657]',
    checkboxHover: isLecturer ? 'hover:border-[#C54E08]/20' : 'hover:border-[#17A38A]/20',
    checkboxRing: isLecturer ? 'text-[#C54E08] focus:ring-[#C54E08]/30' : 'text-[#17A38A] focus:ring-[#17A38A]/30'
    
  };
  const typeColors = {
    ...TYPE_COLORS,
    equipment: isLecturer ? 'bg-[#A74106]/10 text-[#A74106]' : 'bg-[#17A38A]/10 text-[#0F6657]',
  };

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
  const [requestedQuantity, setRequestedQuantity] = useState('');
  const [lecturer, setLecturer] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  //const [conflict, setConflict] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [accessNotice, setAccessNotice] = useState('');
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false); 

  useEffect(() => {
    fetchResources();
    fetchUtilities();
  }, []);

  // Pre-fill data if we are editing an existing booking
  useEffect(() => {
    // Added !hasInitialized so it only pre-fills ONCE and doesn't overwrite your typing
    if (isEditing && bookings.length > 0 && (resources.length > 0 || utilities.length > 0) && !hasInitialized) {
      const bookingToEdit = bookings.find(b => String(b.id) === String(id));
      
      if (bookingToEdit) {
        // Try normal resource
        let r = getResourceById(bookingToEdit.resourceId);
        
        // Try utilities if not found
        if (!r && utilities && utilities.length > 0) {
          const u = utilities.find(util => util.id === bookingToEdit.resourceId);
          if (u) {
            r = {
              id: u.id,
              name: u.utilityName,
              location: u.location,
              type: 'equipment',
              capacity: null,
              quantity: u.quantity,
              features: [],
              access: 'anyone',
              status: u.status,
              description: u.description
            };
          }
        }

        if (r) setSelectedResource(r);
        
        setDate(bookingToEdit.date || '');
        setStartTime(bookingToEdit.startTime || '');
        setEndTime(bookingToEdit.endTime || '');
        setPurpose(bookingToEdit.purpose || '');
        setAttendees(bookingToEdit.attendees ? bookingToEdit.attendees.toString() : '');
        setRequestedQuantity(bookingToEdit.quantity ? bookingToEdit.quantity.toString() : '');
        setLecturer(bookingToEdit.lecturer || '');
        setSpecialRequests(bookingToEdit.specialRequests || '');
        
        setStep(2); // Automatically skip to the form step
        setHasInitialized(true); // Lock it so it never overwrites again!
      }
    }
  }, [id, isEditing, bookings, resources, utilities, getResourceById, hasInitialized]);

  useEffect(() => {
    const rid = searchParams.get('resource');
    if (rid) {
      // Try to find it as a standard resource (Room/Lab)
      let r = getResourceById(rid);
      
      // NEW: If not found, try to find it in utilities (Equipments) and map it!
      if (!r && utilities && utilities.length > 0) {
        const u = utilities.find(util => util.id === rid);
        if (u) {
          r = {
            id: u.id,
            name: u.utilityName,
            location: u.location,
            type: 'equipment',
            capacity: null, // Hides attendees field
            features: [],
            access: 'anyone',
            status: u.status,
            description: u.description
          };
        }
      }

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
  }, [searchParams, resources, utilities, currentRole]); // Added utilities to dependency array
 // Conflict
  const conflict = useMemo(() => {
    const start24 = formatTo24Hour(startTime);
    const end24 = formatTo24Hour(endTime);

    if (selectedResource && date && start24 && end24 && start24 < end24) {
      const overlappingBooking = bookings.find(b => {
        if (isEditing && b.id === id) return false;

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
      return overlappingBooking || null;
    }
    return null;
  }, [selectedResource, date, startTime, endTime, bookings, isEditing, id]);

  const today = new Date().toISOString().split('T')[0];

  const filtered = resources.filter(r => {
    const access = (r.access || '').toLowerCase();
    const status = (r.status || '').toLowerCase();
    const rType = (r.type || '').toLowerCase(); // Normalizes "room", "lab"

    const matchesAccess =
      currentRole === 'ADMIN' || currentRole === 'LECTURER'
        ? true
        : access === 'student' || access === 'anyone' || access === 'all';
    
    const matchesStatus = status !== 'out of service';
    
    // FIX: Use strict equals (===) instead of includes() so "Lecture Hall" doesn't trigger "all"
    const matchType = 
      typeFilter === 'all' || 
      rType === typeFilter.toLowerCase() || 
      (typeFilter === 'Lecture Hall' && rType === 'room') ||
      (typeFilter === 'room' && rType === 'room') ||
      (typeFilter === 'lab' && rType === 'lab');
    
    const matchSearch = (r.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.location || '').toLowerCase().includes(search.toLowerCase());
      
    return matchesAccess && matchesStatus && matchType && matchSearch;
  });

  // Filter logic specifically for the Equipments (Utilities)
  const filteredUtilities = utilities.filter((utility) => {
    if (!shouldShowUtility(utility)) return false;

    const query = search.trim().toLowerCase();
    return query === '' ||
      (utility.utilityName || '').toLowerCase().includes(query) ||
      (utility.utilityCode || '').toLowerCase().includes(query) ||
      (utility.category || '').toLowerCase().includes(query) ||
      (utility.location || '').toLowerCase().includes(query);
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
    
    if (!isLecturer && !lecturer.trim()) e.lecturer = 'Please provide the name of the Lecturer in Charge'; // Only for students, lecturer in charge is mandatory

    if (selectedResource?.capacity) {
      if (!attendees) {
        e.attendees = 'Please provide the expected number of attendees';
      } else if (parseInt(attendees) > selectedResource.capacity) {
        e.attendees = `Exceeds capacity of ${selectedResource.capacity}`;
      } else if (parseInt(attendees) < 1) {
        e.attendees = 'Must have at least 1 attendee';
      }
    }

    // Validation for Equipment Quantity
    if (selectedResource?.type === 'equipment') {
      if (!requestedQuantity) {
        e.requestedQuantity = 'Please provide the quantity';
      } else if (parseInt(requestedQuantity) > selectedResource.quantity) {
        e.requestedQuantity = `Only ${selectedResource.quantity} available`;
      } else if (parseInt(requestedQuantity) < 1) {
        e.requestedQuantity = 'Must request at least 1';
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
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
    
    const payload = {
      resourceId: selectedResource.id,
      userId: currentUser?.id || 'IT23345478',
      userName: currentUser?.name || 'Chathurya',
      userEmail: currentUser?.email || 'it23345478@my.sliit.lk',
      userDept: currentUser?.department || 'Faculty of Computing',
      date, 
      startTime,
      endTime,
      purpose: purpose.trim(),
      attendees: attendees ? parseInt(attendees) : undefined,
      quantity: requestedQuantity && selectedResource.type === 'equipment' ? parseInt(requestedQuantity) : undefined,
      lecturer: isLecturer ? (currentUser?.name || 'Self') : lecturer.trim(),
      specialRequests: specialRequests.trim(),
      //requestedUtilityIds,
    };

    // NEW: Choose between updateBooking and createBooking
    const res = isEditing && updateBooking 
      ? await updateBooking(id, payload) 
      : await createBooking(payload);

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
        : `border-gray-200 bg-gray-50 focus:bg-white focus:ring-4 ${theme.focusRingLg}`
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
                <h2 className="text-gray-900 text-xl font-semibold mb-2">
                  {isEditing ? 'Booking Updated!' : 'Booking Submitted!'}
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  {isEditing ? 'Booking Details Updated Successfully.' : result?.message}
                </p>
                
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
                      setSpecialRequests('');
                      setResult(null);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
                  >
                    New Booking
                  </button>
                  
                  <button
                    onClick={() => navigate('/bookings/my')}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-white text-sm font-medium border-t border-white/20 transition-all ${theme.gradientBtn}`}
                  >
                    My Bookings
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              {isEditing ? 'Edit Booking Request' : 'New Booking Request'}
            </h1>
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
                    active ? theme.activeStep : 'bg-gray-100 text-gray-400'
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
                      className={`w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:bg-white focus:ring-2 transition-all ${theme.focusRing}`}
                      />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {['all', 'Lecture Hall', 'lab', 'equipment'].map(t => (
                      <button
                        key={t}
                        onClick={() => setTypeFilter(t)}
                        className={`px-3 py-2 rounded-xl text-xs capitalize transition-all ${
                          typeFilter === t
                            ? theme.activeStep
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
                {resourcesLoading || utilitiesLoading ? (
                  <div className="col-span-full flex items-center justify-center gap-2 py-12 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <p className="text-sm">Loading data...</p>
                  </div>
                ) : resourcesError || utilitiesError ? (
                  <div className="col-span-full text-center py-12 text-red-400">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Unable to load data right now</p>
                  </div>
                ) : (
                  <>
                    {/* --- RENDER ROOMS AND LABS (RESOURCES) --- */}
                    {typeFilter !== 'equipment' && filtered.map(resource => {
                      const upcomingCount = bookings.filter(b => 
                        b.resourceId === resource.id && 
                        (b.status === 'APPROVED' || b.status === 'PENDING') && 
                        b.date >= today
                      ).length;

                      return (
                        <button
                          key={`res-${resource.id}`}
                          onClick={() => { setSelectedResource(resource); setStep(2); }}
                          className={`text-left p-4 rounded-xl border-2 border-gray-100 transition-all flex flex-col group ${theme.cardHover}`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-3 w-full">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${typeColors[(resource.type || '').toLowerCase()] || 'bg-gray-100 text-gray-600'}`}>
                              {TYPE_ICONS[(resource.type || '').toLowerCase()] || <Wrench className="w-4 h-4" />}
                            </div>
                            
                            {/* MOVED: Type Badge and Access Level stacked together on the right */}
                            <div className="flex flex-col items-end gap-1.5">
                              <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${typeColors[(resource.type || '').toLowerCase()] || 'bg-gray-100 text-gray-600'}`}>
                                {resource.type}
                              </span>
                              
                              {/* NEW: Styled Pill Badge for Access Level */}
                              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                                (resource.access || '').toLowerCase() === 'lecturer' 
                                  ? 'bg-red-50 text-red-600 border-red-100' 
                                  : 'bg-gray-50 text-gray-500 border-gray-200'
                              }`}>
                                <User className="w-3 h-3" />
                                <span className="capitalize">
                                  {(resource.access || 'anyone').toLowerCase() === 'anyone' ? 'Open Access' : `${resource.access} Access`}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <h4 className={`text-gray-900 mb-1 transition-colors ${theme.textHover}`}>{resource.name}</h4>
                          
                          {/* LOCATION - Now alone under the name */}
                          <div className="flex items-center gap-1 text-gray-500 text-xs mb-1.5">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            {resource.location}
                          </div>
                          
                          {resource.capacity && (
                            <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
                              <Users className="w-3.5 h-3.5 text-gray-400" />
                              Capacity: {resource.capacity} persons
                            </div>
                          )}

                          {/* Pushed to bottom with mt-auto */}
                          <div className="mt-auto pt-3 border-t border-gray-50 flex flex-col gap-3 w-full">
                            
                            {/* Features */}
                            <div className="flex flex-wrap gap-1 w-full">
                              {resource.features.slice(0, 3).map(f => (
                                <span key={f} className="text-[11px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-md">{f}</span>
                              ))}
                              {resource.features.length > 3 && (
                                <span className="text-[11px] px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded-md">+{resource.features.length - 3}</span>
                              )}
                            </div>

                            {/* AVAILABILITY - Distinct footer block at the very bottom */}
                            <div className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg border ${
                              upcomingCount > 0 
                                ? 'bg-amber-50 border-amber-100' 
                                : 'bg-emerald-50 border-emerald-100'
                            }`}>
                              <div className={`flex items-center gap-1.5 text-xs font-medium ${
                                upcomingCount > 0 ? 'text-amber-700' : 'text-emerald-700'
                              }`}>
                                <Calendar className="w-3.5 h-3.5" />
                                {upcomingCount > 0 
                                  ? `${upcomingCount} Upcoming Booking${upcomingCount > 1 ? 's' : ''}`
                                  : 'Currently Available'}
                              </div>
                            </div>
                            
                          </div>
                        </button>
                      );
                    })}

                    {/* --- RENDER EQUIPMENTS (UTILITIES) --- */}
                    {(typeFilter === 'all' || typeFilter === 'equipment') && filteredUtilities.map(utility => {
                      const isOutOfStock = utility.quantity <= 0;
                      const isInUse = isUtilityInUse(utility);
                      const isDisabled = isOutOfStock || isInUse;

                      return (
                        <button
                          key={`util-${utility.id}`}
                          disabled={isDisabled}
                          onClick={() => { 
                            if (isDisabled) return; // Fail-safe to prevent selection
                            
                            setSelectedResource({
                              id: utility.id,
                              name: utility.utilityName,
                              location: utility.location,
                              type: 'equipment',
                              capacity: null,
                              quantity: utility.quantity, 
                              features: [],
                              access: 'anyone',
                              status: utility.status,
                              description: utility.description
                            }); 
                            setStep(2); 
                          }}
                          // NEW: Apply gray styles and remove hover effects if out of stock
                          className={`text-left p-4 rounded-xl border-2 relative transition-all ${
                            isDisabled 
                              ? 'opacity-60 grayscale cursor-not-allowed bg-gray-100 border-gray-200' 
                              : `border-gray-100 group ${theme.cardHover}`
                          }`}
                        >
                          {/* NEW: Render Out of Stock Badge */}
                          {isDisabled && (
                            <div className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-md z-10 border ${
                              isInUse
                                ? 'bg-amber-100 text-amber-700 border-amber-200'
                                : 'bg-red-100 text-red-600 border-red-200'
                            }`}>
                              {isInUse ? 'In Use' : 'Out of Stock'}
                            </div>
                          )}

                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeColors.equipment}`}>
                              {TYPE_ICONS['equipment']}
                            </div>
                            
                            {/* Hide standard category badge if out of stock so it doesn't crowd the top corner */}
                            {!isDisabled && (
                              <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${typeColors.equipment}`}>
                                {utility.category || 'Equipment'}
                              </span>
                            )}
                          </div>
                          <h4 className={`text-gray-900 mb-1 transition-colors ${!isDisabled ? theme.textHover : ''}`}>
                            {utility.utilityName}
                          </h4>
                          <div className="flex items-center gap-1 text-gray-400 text-xs mb-2">
                            <MapPin className="w-3 h-3" />
                            {utility.location}
                          </div>
                          
                          {/* Highlight the quantity in red if it's zero */}
                          <div className={`flex items-center gap-1 text-xs ${isOutOfStock ? 'text-red-500 font-medium' : isInUse ? 'text-amber-600 font-medium' : 'text-gray-400'}`}>
                            <Package className="w-3 h-3" />
                            Quantity: {utility.quantity}
                          </div>
                          
                          <div className="mt-2">
                            <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-md uppercase tracking-wide">
                              {utility.utilityCode}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </>
                )}

                {/* No Data Fallback Messages */}
                {!resourcesLoading && !utilitiesLoading && 
                 (typeFilter === 'equipment' ? filteredUtilities.length === 0 : 
                 typeFilter === 'all' ? filtered.length === 0 && filteredUtilities.length === 0 : 
                 filtered.length === 0) && (
                  <div className="col-span-full text-center py-12 text-gray-400">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No items match your search</p>
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
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${typeColors[selectedResource.type]}`}>
                      {TYPE_ICONS[selectedResource.type]}
                    </div>
                    <div>
                      <h3 className="text-gray-900">{selectedResource.name}</h3>
                      <p className="text-gray-400 text-xs">{selectedResource.location}</p>
                    </div>
                    
                    {/* Top Right Corner Action Button */}
                    {isEditing ? (
                      <button
                        onClick={() => navigate('/bookings/my')}
                        className={`ml-auto text-[13px] font-medium hover:opacity-75 transition-opacity flex items-center gap-1 ${
                          isLecturer ? 'text-[#8A3505]' : 'text-[#0F6657]'
                        }`}
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Back to My Bookings
                      </button>
                    ) : step === 2 && (
                      <button
                        onClick={() => setStep(1)}
                        className={`ml-auto text-[13px] font-medium hover:opacity-75 transition-opacity flex items-center gap-1 ${
                          isLecturer ? 'text-[#8A3505]' : 'text-[#0F6657]'
                        }`}
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Back to Change the Resource
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
                          theme={theme}
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
                          theme={theme}
                          onChange={val => { setEndTime(val); setErrors(p => ({ ...p, endTime: '' })); }}
                        />
                        {errors.endTime && <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>}
                      </div>
                    </div>

                    {conflict && !submitting && step !== 3 && ( 
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

                    {!conflict && !submitting && date && startTime && endTime && startTime < endTime && step !== 3 && ( 
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

                    {/* NEW: Equipment Quantity Field */}
                    {selectedResource?.type === 'equipment' && selectedResource?.quantity !== undefined && (
                      <div>
                        <label className="block text-gray-700 text-sm mb-1.5">
                          <Package className="w-3.5 h-3.5 inline mr-1.5" />
                          Quantity <span className="text-red-500">*</span>
                          <span className="text-gray-400 text-xs ml-1">(only {selectedResource.quantity} left)</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={selectedResource.quantity}
                          disabled={step === 3}
                          placeholder={`1 – ${selectedResource.quantity}`}
                          value={requestedQuantity}
                          onChange={e => { setRequestedQuantity(e.target.value); setErrors(p => ({ ...p, requestedQuantity: '' })); }}
                          className={inputClass('requestedQuantity')}
                        />
                        {errors.requestedQuantity && <p className="text-red-500 text-xs mt-1">{errors.requestedQuantity}</p>}
                      </div>
                    )}

                    {/* Only shows if NOT a lecturer */}
                    {!isLecturer && (
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
                    )}

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
                        className={`w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:bg-white focus:ring-2 transition-all resize-none ${theme.focusRing}`}
                      />
                    </div>

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
                          : `text-white border-t border-white/30 active:scale-[0.98] ${theme.gradientBtnLg}`
                      }`}
                    >
                      {submitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> {isEditing ? 'Updating...' : 'Submitting...'}</>
                      ) : step === 3 ? (
                        <>{isEditing ? 'Updated Successfully' : 'Submitted Successfully'} <CheckCircle className="w-4 h-4" /></>
                      ) : (
                        <>{isEditing ? 'Update Booking Request' : 'Submit Booking Request'} <ChevronRight className="w-4 h-4" /></>
                      )}
                    </button>
                  </div>
                  
                  {step === 3 && (
                    <button
                      onClick={() => {
                        setStep(1);
                        setSelectedResource(null);
                        setDate(''); setStartTime(''); setEndTime('');
                      setPurpose(''); setAttendees(''); setRequestedQuantity(''); setLecturer('');
                        setSpecialRequests(''); setRequestedUtilityIds([]); setResult(null);
                      }}
                      className={`w-full py-2.5 px-4 rounded-xl text-white text-sm font-medium transition-all active:scale-[0.98] mt-1 border-t border-white/30 ${theme.gradientBtnLg}`}
                    >
                      Make Another Booking
                    </button>
                  )}
                </div>

              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden sticky top-4 shadow-sm">
                  
                  {/* Hero Image Header */}
                  <div className="h-36 bg-gradient-to-br from-slate-700 to-slate-900 relative overflow-hidden">
                    <img
                      src={getResourceImage(selectedResource)}
                      alt={selectedResource.name}
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 flex items-end p-4">
                      <div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${typeColors[(selectedResource.type || '').toLowerCase()] || 'bg-gray-100 text-gray-600'} capitalize mb-2 inline-block`}>
                          {selectedResource.type}
                        </span>
                        <h3 className="text-white text-lg font-semibold">{selectedResource.name}</h3>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    {/* Location */}
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {selectedResource.location}
                    </div>

                    {/* Capacity */}
                    {selectedResource.capacity && (
                      <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                        <Users className="w-4 h-4 text-gray-400" />
                        Capacity: {selectedResource.capacity} persons
                      </div>
                    )}

                    {/* Quantity (For Equipment) */}
                    {selectedResource.quantity !== undefined && (
                      <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                        <Package className="w-4 h-4 text-gray-400" />
                        Quantity: {selectedResource.quantity} Available
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-gray-500 text-sm mb-4">
                      {selectedResource.description || 'No detailed description available for this item.'}
                    </p>

                    {/* Features (Hide for Equipments) */}
                    {selectedResource.type !== 'equipment' && selectedResource.features && selectedResource.features.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Tag className="w-3.5 h-3.5 text-gray-400" />
                          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Features & Amenities</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedResource.features.map(f => (
                            <span key={f} className="flex items-center gap-1 text-xs px-2 py-1 bg-gray-50 border border-gray-100 text-gray-600 rounded-lg">
                              <CheckCircle className="w-3 h-3 text-emerald-500" /> {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Upcoming bookings */}
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Upcoming Reserved Slots</p>
                      {(() => {
                        const todayStr = today;
                        const existing = bookings
                          .filter(b => b.resourceId === selectedResource.id && (b.status === 'APPROVED' || b.status === 'PENDING') && b.date >= todayStr)
                          .sort((a, b) => a.date.localeCompare(b.date) || formatTo24Hour(a.startTime).localeCompare(formatTo24Hour(b.startTime)))
                          .slice(0, 4);
                        
                        if (existing.length === 0) {
                          return (
                            <div className="flex items-center gap-2 p-2.5 bg-emerald-50 rounded-lg">
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                              <p className="text-emerald-700 text-xs">No upcoming reservations</p>
                            </div>
                          );
                        }
                        return (
                          <div className="space-y-1.5">
                            {existing.map(b => (
                              <div key={b.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                                <div>
                                  <p className="text-gray-700 text-xs font-medium">
                                    {new Date(b.date + 'T00:00:00').toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                                  </p>
                                  <p className="text-gray-500 text-xs">{b.startTime} – {b.endTime}</p>
                                </div>
                                <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">Booked</span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}