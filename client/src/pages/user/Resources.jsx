import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Building2, FlaskConical, Wrench, MapPin,
  Users, CalendarPlus, ChevronRight, CheckCircle, Tag, Package, ShieldAlert, Send, X, SlidersHorizontal,
} from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import StudentRequestModal from '../../components/user/StudentRequestModal';

const TYPE_CONFIG = {
  room: {
    label: 'Room', icon: <Building2 className="w-5 h-5" />,
    color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100',
  },
  lab: {
    label: 'Lab', icon: <FlaskConical className="w-5 h-5" />,
    color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100',
  },
  equipment: {
    label: 'Equipment', icon: <Wrench className="w-5 h-5" />,
    color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100',
  },
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

const getAccessLabel = (access = '') => {
  const normalized = access.toLowerCase();
  if (normalized === 'lecturer') return 'Lecturer Only';
  if (normalized === 'student') return 'Student Only';
  return 'Open Access';
};

export default function Resources() {
  const {
    resources,
    utilities,
    utilitiesLoading,
    utilitiesError,
    fetchUtilities,
    bookings,
    studentRequests,
    currentUser,
    getUtilitiesForResource,
    createStudentRequest,
  } = useBooking();
  const navigate = useNavigate();
  const currentRole = (currentUser?.role || '').toUpperCase();
  const isStudentView = currentRole === 'STUDENT' || currentRole === 'USER';
  const isLecturer = currentRole === 'LECTURER';

  // THEME OBJECT FOR CONSISTENT STYLING BASED ON ROLE
  const theme = {
    gradientBtn: isLecturer 
      ? 'bg-gradient-to-r from-[#8A3505] to-[#C54E08] hover:from-[#702A04] hover:to-[#A74106] shadow-[0_4px_12px_rgba(167,65,6,0.3)]' 
      : 'bg-gradient-to-r from-[#0F6657] to-[#17A38A] hover:from-[#0c5246] hover:to-[#128a74] shadow-[0_4px_12px_rgba(23,163,138,0.3)]',
    activeFilter: isLecturer
      ? 'bg-gradient-to-r from-[#8A3505] to-[#C54E08] text-white shadow-md border-t border-white/20'
      : 'bg-gradient-to-r from-[#0F6657] to-[#17A38A] text-white shadow-md border-t border-white/20',
    textLink: isLecturer ? 'text-[#C54E08]' : 'text-[#17A38A]',
    textHover: isLecturer ? 'group-hover:text-[#8A3505]' : 'group-hover:text-[#0F6657]',
    cardHover: isLecturer 
      ? 'hover:border-[#C54E08]/30'
      : 'hover:border-[#17A38A]/30',
    cardSelected: isLecturer
      ? 'border-[#C54E08] shadow-[0_8px_24px_rgba(167,65,6,0.12)] bg-[#C54E08]/5'
      : 'border-[#17A38A] shadow-[0_8px_24px_rgba(23,163,138,0.12)] bg-[#17A38A]/5',
    focusRing: isLecturer
      ? 'focus:border-[#C54E08] focus:ring-[#C54E08]/10'
      : 'focus:border-[#17A38A] focus:ring-[#17A38A]/10'
  };
  const equipmentAccent = isLecturer
    ? {
        color: 'text-[#A74106]',
        bg: 'bg-[#A74106]/10',
        border: 'border-[#A74106]/20',
      }
    : {
        color: 'text-[#0F6657]',
        bg: 'bg-[#17A38A]/10',
        border: 'border-[#17A38A]/20',
      };
  const typeConfig = {
    ...TYPE_CONFIG,
    equipment: {
      ...TYPE_CONFIG.equipment,
      ...equipmentAccent,
    },
  };

  // 2. Add Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [accessMessage, setAccessMessage] = useState('');
  const [requestingResource, setRequestingResource] = useState(null);
  const [requestSentPopup, setRequestSentPopup] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [blockFilter, setBlockFilter] = useState('All');
  const [minCapacityFilter, setMinCapacityFilter] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const filtered = resources.filter(r => {
    const matchType = typeFilter === 'all' || r.type === typeFilter;
    const matchSearch = search === '' ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase()) ||
      r.features.some(f => f.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchBlock =
      blockFilter === 'All' ||
      r.block === blockFilter ||
      r.block === `Block ${blockFilter}`;
    const minCapacity = Number(minCapacityFilter);
    const matchCapacity =
      minCapacityFilter.trim() === '' ||
      (!Number.isNaN(minCapacity) && Number(r.capacity) >= minCapacity);

    return matchType && matchSearch && matchStatus && matchBlock && matchCapacity;
  });

  const filteredUtilities = utilities.filter((utility) => {
    const query = search.trim().toLowerCase();
    return query === '' ||
      utility.utilityName.toLowerCase().includes(query) ||
      utility.utilityCode.toLowerCase().includes(query) ||
      utility.category.toLowerCase().includes(query) ||
      utility.location.toLowerCase().includes(query) ||
      utility.description.toLowerCase().includes(query);
  });

  const getResourceStats = (resourceId) => {
    const rb = bookings.filter(b => b.resourceId === resourceId);
    const upcoming = rb.filter(b => b.status === 'APPROVED' && b.date >= today).length;
    const total = rb.filter(b => b.status === 'APPROVED').length;
    return { upcoming, total };
  };

  const selectedResource = selectedId ? (
    resources.find(r => r.id === selectedId) || 
    (() => {
      const u = utilities.find(u => u.id === selectedId);
      if (!u) return null;
      return {
        id: u.id,
        name: u.utilityName,
        location: u.location,
        type: 'equipment',
        capacity: null, 
        quantity: u.quantity,
        features: [],
        access: 'anyone',
        status: u.status,
        description: u.description,
        category: u.category,
        utilityCode: u.utilityCode
      };
    })()
  ) : null;

  const counts = {
    all: resources.length + utilities.length,
    room: resources.filter(r => r.type === 'room').length,
    lab: resources.filter(r => r.type === 'lab').length,
    equipment: utilities.length,
  };

  const statusOptions = ['All', 'Available', 'Not Available', 'Out Of Service'];
  const blockOptions = ['All', 'A', 'B', 'C'];

  const hasExistingRequest = (resourceId) => studentRequests.some((request) => {
    const sameResource = request.resourceId === resourceId;
    const sameStudent = (request.studentEmail || '') === (currentUser?.email || '');
    const isActive = request.status === 'PENDING' || request.status === 'BOOKING_CREATED';
    return sameResource && sameStudent && isActive;
  });

  const handleStudentRequest = async (requestData) => {
    const result = await createStudentRequest(requestData);
    if (result.success) {
      setAccessMessage('');
      setRequestSentPopup(true);
      setRequestingResource(null);
    }
    return result;
  };

  return (
    // 3. Add Layout Wrapper
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Header />
        <div className="p-4 lg:p-6 space-y-5">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Resources</h1>
            <p className="text-gray-500 text-sm mt-0.5">{resources.length} bookable resources available</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={typeFilter === 'equipment' ? 'Search equipment, code, location...' : 'Search resources, features...'}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-[#17A38A] focus:ring-2 focus:ring-[#17A38A]/10 transition-all ${theme.focusRing}"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {['all', 'room', 'lab', 'equipment'].map(t => (
                <button
                  key={t}
                  onClick={() => {
                    setTypeFilter(t);
                    setSelectedId(null);
                    setAccessMessage('');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all ${
                    typeFilter === t
                      ? theme.activeFilter
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t !== 'all' && typeConfig[t].icon}
                  <span className="capitalize">{t === 'all' ? 'All Resources' : `${t.charAt(0).toUpperCase() + t.slice(1)}s`}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${typeFilter === t ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                    {counts[t]}
                  </span>
                </button>
              ))}
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <SlidersHorizontal className={`h-4 w-4 ${theme.textLink}`} />
                  Filter Resources
                </div>
                <p className="text-xs text-slate-400">
                  Showing {typeFilter === 'equipment' ? filteredUtilities.length : filtered.length} item{(typeFilter === 'equipment' ? filteredUtilities.length : filtered.length) !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-500">Status</span>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    disabled={typeFilter === 'equipment'}
                    className={`w-full rounded-xl border border-gray-200 bg-slate-50 px-3.5 py-2.5 text-sm text-gray-700 outline-none transition-all focus:bg-white focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${theme.focusRing}`}
                  >
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option === 'All' ? 'All Statuses' : option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-500">Block</span>
                  <select
                    value={blockFilter}
                    onChange={(event) => setBlockFilter(event.target.value)}
                    disabled={typeFilter === 'equipment'}
                    className={`w-full rounded-xl border border-gray-200 bg-slate-50 px-3.5 py-2.5 text-sm text-gray-700 outline-none transition-all focus:bg-white focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${theme.focusRing}`}
                  >
                    {blockOptions.map((option) => (
                      <option key={option} value={option}>
                        {option === 'All' ? 'All Blocks' : `Block ${option}`}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-500">Capacity</span>
                  <input
                    type="number"
                    min="1"
                    value={minCapacityFilter}
                    onChange={(event) => setMinCapacityFilter(event.target.value)}
                    disabled={typeFilter === 'equipment'}
                    placeholder="Minimum"
                    className={`w-full rounded-xl border border-gray-200 bg-slate-50 px-3.5 py-2.5 text-sm text-gray-700 outline-none transition-all focus:bg-white focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${theme.focusRing}`}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Resource grid */}
            <div className={`${selectedResource ? 'lg:col-span-2' : 'lg:col-span-3'} grid grid-cols-1 sm:grid-cols-2 ${selectedResource ? '' : 'xl:grid-cols-3'} gap-3 content-start`}>
              
              {/* 1. Render Rooms & Labs FIRST if filter is NOT Equipment (so 'all', 'room', or 'lab') */}
              {typeFilter !== 'equipment' && filtered.map(resource => {
                const cfg = typeConfig[resource.type];
                const stats = getResourceStats(resource.id);
                const isSelected = selectedId === resource.id;
                const isLecturerOnly = (resource.access || '').toLowerCase() === 'lecturer';
                const isBlockedForStudent = isStudentView && isLecturerOnly;
                const requestAlreadySent = isBlockedForStudent && hasExistingRequest(resource.id);
                
                // NEW: Determine if the resource is out of service
                const isOutOfService = (resource.status || '').toLowerCase() === 'out of service';

                return (
                  <div
                    key={resource.id}
                    onClick={() => {
                      if (isOutOfService) return; // NEW: Prevent clicking if out of service
                      setSelectedId(isSelected ? null : resource.id);
                      setAccessMessage('');
                    }}
                    // NEW: Added relative positioning and disabled styling
                    className={`rounded-xl border-2 p-5 relative transition-all cursor-pointer hover:shadow-md ${
                      isOutOfService
                        ? 'opacity-60 grayscale cursor-not-allowed bg-gray-100 border-gray-200'
                        : isSelected 
                          ? isBlockedForStudent
                            ? 'border-amber-300 shadow-[0_8px_24px_rgba(245,158,11,0.14)] bg-amber-50/80'
                            : theme.cardSelected
                          : isBlockedForStudent
                            ? 'bg-amber-50/70 border-amber-200 hover:border-amber-300'
                            : `bg-white border-gray-100 ${theme.cardHover}`
                    }`} 
                  >
                    {/* NEW: Render Out of Service Badge */}
                    {isOutOfService && (
                      <div className="absolute top-4 right-4 bg-red-100 text-red-600 border border-red-200 text-[10px] font-bold px-2 py-1 rounded-md z-10">
                        Out of Service
                      </div>
                    )}

                    {/* Top row */}
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl ${cfg.bg} ${cfg.border} border flex items-center justify-center ${cfg.color}`}>
                        {cfg.icon}
                      </div>
                      
                      {/* Hide standard badges if Out of Service to prevent overlap */}
                      {!isOutOfService && (
                        <div className="flex flex-col items-end gap-1.5">
                          <span className={`text-xs px-2 py-1 rounded-full ${cfg.bg} ${cfg.color} capitalize`}>
                            {cfg.label}
                          </span>
                          <span className={`text-[11px] px-2 py-1 rounded-full font-medium ${
                            isBlockedForStudent
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {getAccessLabel(resource.access)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Name */}
                    <h4 className={`font-medium mb-1 transition-colors ${
                      isOutOfService 
                        ? 'text-gray-500' 
                        : isBlockedForStudent
                          ? 'text-amber-900'
                          : `text-gray-900 ${isSelected ? theme.textLink : theme.textHover}`
                    }`}>
                      {resource.name}
                    </h4>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-2">
                      <MapPin className="w-3.5 h-3.5" />
                      {resource.location}
                    </div>

                    {/* Capacity */}
                    {resource.capacity && (
                      <div className={`flex items-center gap-1.5 text-xs mb-3 ${isOutOfService ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Users className="w-3.5 h-3.5" />
                        Capacity: {resource.capacity} persons
                      </div>
                    )}

                    {/* Features */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {resource.features.slice(0, 3).map(f => (
                        <span key={f} className={`text-xs px-1.5 py-0.5 rounded-md ${isOutOfService ? 'bg-gray-200 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>{f}</span>
                      ))}
                      {resource.features.length > 3 && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-md ${isOutOfService ? 'bg-gray-200 text-gray-400' : 'bg-gray-100 text-gray-400'}`}>
                          +{resource.features.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Stats row */}
                    <div className={`flex items-center justify-between pt-3 ${isBlockedForStudent && !isOutOfService ? 'border-t border-amber-100' : 'border-t border-gray-50'}`}>
                      <div className="text-xs font-medium">
                        {/* UPDATED: Added Out of Service display to the footer */}
                        {isOutOfService
                          ? <span className="text-red-500 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Currently Unavailable</span>
                          : isBlockedForStudent
                          ? requestAlreadySent
                            ? <span className="text-amber-700 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Request already sent</span>
                            : <span className="text-amber-700 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Lecturer access required</span>
                          : stats.upcoming > 0
                          ? <span className="text-amber-600">{stats.upcoming} upcoming booking{stats.upcoming !== 1 ? 's' : ''}</span>
                          : <span className="text-emerald-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Available</span>
                        }
                      </div>
                      
                      {/* Hide the 'View' button entirely if out of service */}
                      {!isOutOfService && (
                        <div className={`flex items-center gap-1 text-xs font-medium ${isBlockedForStudent ? 'text-amber-700' : 'text-[#17A38A]'}`}>
                          View <ChevronRight className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* 2. Render Equipment (Utilities) SECOND if filter is 'all' or 'equipment' */}
              {(typeFilter === 'equipment' || typeFilter === 'all') && (
                utilitiesLoading ? (
                  <div className="sm:col-span-2 xl:col-span-3 text-center py-16 bg-white rounded-xl border border-gray-100">
                    <Package className={`w-10 h-10 mx-auto mb-3 animate-pulse ${equipmentAccent.color}`} />
                    <p className="text-gray-500">Loading equipment...</p>
                  </div>
                ) : utilitiesError && utilities.length === 0 ? (
                  <div className="sm:col-span-2 xl:col-span-3 text-center py-16 bg-white rounded-xl border border-red-100">
                    <ShieldAlert className="w-10 h-10 text-red-300 mx-auto mb-3" />
                    <p className="text-gray-700 font-medium">Unable to load equipment</p>
                    <p className="text-gray-500 text-sm mt-1">Please make sure the backend is running and try again.</p>
                    <button
                      type="button"
                      onClick={fetchUtilities}
                      className={`mt-4 px-4 py-2 rounded-xl border text-sm font-medium transition-colors hover:brightness-95 ${equipmentAccent.bg} ${equipmentAccent.color} ${equipmentAccent.border}`}
                    >
                      Retry
                    </button>
                  </div>
                ) : typeFilter === 'equipment' && filteredUtilities.length === 0 ? (
                  <div className="sm:col-span-2 xl:col-span-3 text-center py-16 bg-white rounded-xl border border-gray-100">
                    <Wrench className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      {utilities.length === 0 ? 'No equipment has been added by admin yet' : 'No equipment matches your search'}
                    </p>
                  </div>
                ) : (
                  filteredUtilities.map((utility) => {
                    const isSelected = selectedId === utility.id;
                    const isOutOfStock = utility.quantity <= 0; 

                    return (
                    <button
                      key={utility.id}
                      disabled={isOutOfStock} 
                      onClick={() => {
                        if (isOutOfStock) return; 
                        setSelectedId(isSelected ? null : utility.id);
                        setAccessMessage('');
                      }}
                      className={`text-left w-full rounded-xl border-2 p-5 relative transition-all ${
                        isOutOfStock
                          ? 'opacity-60 grayscale cursor-not-allowed bg-gray-100 border-gray-200'
                          : isSelected 
                            ? theme.cardSelected
                            : `bg-white border-gray-100 ${theme.cardHover}`
                      }`}
                    >
                      {isOutOfStock && (
                        <div className="absolute top-4 right-4 bg-red-100 text-red-600 border border-red-200 text-[10px] font-bold px-2 py-1 rounded-md z-10">
                          Out of Stock
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${equipmentAccent.bg} ${equipmentAccent.border} ${equipmentAccent.color}`}>
                          <Package className="w-5 h-5" />
                        </div>
                        {!isOutOfStock && (
                          <span className={`text-xs px-2 py-1 rounded-full lowercase capitalize ${equipmentAccent.bg} ${equipmentAccent.color}`}>
                            {utility.category}
                          </span>
                        )}
                      </div>

                      <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">
                        {utility.utilityCode}
                      </span>

                      <h4 className="font-medium mb-1 text-gray-900">
                        {utility.utilityName}
                      </h4>

                      <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-2">
                        <MapPin className="w-3.5 h-3.5" />
                        {utility.location}
                      </div>

                      <div className={`flex items-center gap-1.5 text-xs mb-3 ${isOutOfStock ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                        <Package className="w-3.5 h-3.5" />
                        Quantity: {utility.quantity}
                      </div>

                      {utility.description && (
                        <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                          {utility.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                        <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                          {utility.status}
                        </span>
                        <span className="text-emerald-600 flex items-center gap-1 text-xs">
                          <CheckCircle className="w-3 h-3" /> Admin Added
                        </span>
                      </div>
                    </button>
                    );
                  })
                )
              )}

              {/* Combined Empty States for Rooms/Labs/All */}
              {typeFilter !== 'equipment' && filtered.length === 0 && (typeFilter !== 'all' || filteredUtilities.length === 0) && (
                <div className="sm:col-span-2 xl:col-span-3 text-center py-16 bg-white rounded-xl border border-gray-100">
                  <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No resources match your search</p>
                </div>
              )}
            </div>

            {/* Resource detail panel */}
            {selectedResource && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden sticky top-4">
                  <div className="h-36 bg-gradient-to-br from-slate-700 to-slate-900 relative overflow-hidden">
                    <img
                      src={getResourceImage(selectedResource)}
                      alt={selectedResource.name}
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 flex items-end p-4">
                      <div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${typeConfig[selectedResource.type].bg} ${typeConfig[selectedResource.type].color} capitalize mb-2 inline-block`}>
                          {selectedResource.type}
                        </span>
                        <h3 className="text-white text-lg font-semibold">{selectedResource.name}</h3>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    {isStudentView && (selectedResource.access || '').toLowerCase() === 'lecturer' && (
                      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                        <div className="flex items-start gap-2">
                          <ShieldAlert className="mt-0.5 w-4 h-4 text-amber-600 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-amber-900">Lecturer-only resource</p>
                            <p className="text-xs text-amber-800 mt-1">
                              {hasExistingRequest(selectedResource.id)
                                ? 'A request has already been sent for this resource. Please wait for the lecturer to review it.'
                                : 'Students can send a request to a lecturer, and the lecturer can then place the booking for the student.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Location */}
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {selectedResource.location}
                    </div>

                    {/* Capacity / Quantity */}
                    {selectedResource.capacity && (
                      <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                        <Users className="w-4 h-4 text-gray-400" />
                        Capacity: {selectedResource.capacity} persons
                      </div>
                    )}
                    {selectedResource.quantity && (
                      <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                        <Package className="w-4 h-4 text-gray-400" />
                        Quantity: {selectedResource.quantity} available
                      </div>
                    )}

                    {/* Description with fallback */}
                    <p className="text-gray-500 text-sm mb-4">
                      {selectedResource.description || 'No detailed description available for this item.'}
                    </p>

                    {/* Features (Hide for Equipments) */}
                    {selectedResource.type !== 'equipment' && (
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

                    {/* Available Utilities (Hide for Equipments) */}
                    {selectedResource.type !== 'equipment' && getUtilitiesForResource(selectedResource.id).length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Package className="w-3.5 h-3.5 text-gray-400" />
                          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Available Utilities</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {getUtilitiesForResource(selectedResource.id).map((utility) => (
                            <span key={utility.id} className="text-xs px-2 py-1 bg-blue-50 border border-blue-100 text-[#2563EB] rounded-lg">
                              {utility.utilityName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Upcoming bookings */}
                    <div className="border-t border-gray-100 pt-4 mb-4">
                      <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Upcoming Reserved Slots</p>
                      {(() => {
                        const today = new Date().toISOString().split('T')[0];
                        const rb = bookings
                          .filter(b => b.resourceId === selectedResource.id && b.status === 'APPROVED' && b.date >= today)
                          .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
                          .slice(0, 4);
                        if (rb.length === 0) return (
                          <div className="flex items-center gap-2 p-2.5 bg-emerald-50 rounded-lg">
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                            <p className="text-emerald-700 text-xs">No upcoming reservations</p>
                          </div>
                        );
                        return (
                          <div className="space-y-1.5">
                            {rb.map(b => (
                              <div key={b.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                                <div>
                                  <p className="text-gray-700 text-xs font-medium">
                                    {new Date(b.date + 'T00:00:00').toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                                  </p>
                                  <p className="text-gray-500 text-xs">{b.startTime} – {b.endTime}</p>
                                </div>
                                <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">Reserved</span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>

                    {/* UPDATED: Book button with Green Gradient */}
                    {accessMessage && (
                      <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        {accessMessage}
                      </div>
                    )}

                    <button
                      onClick={() => {
                        const isLecturerOnly = (selectedResource.access || '').toLowerCase() === 'lecturer';
                        const requestAlreadySent = hasExistingRequest(selectedResource.id);
                        if (isStudentView && isLecturerOnly) {
                          if (requestAlreadySent) {
                            setAccessMessage('You have already sent a request for this resource.');
                            return;
                          }
                          setAccessMessage('');
                          setRequestingResource(selectedResource);
                          return;
                        }

                        setAccessMessage('');
                        navigate(`/booking/new?resource=${selectedResource.id}`);
                      }}
                      disabled={isStudentView && (selectedResource.access || '').toLowerCase() === 'lecturer' && hasExistingRequest(selectedResource.id)}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all text-sm font-medium border-t active:scale-[0.98] border-white/20 ${
                        isStudentView && (selectedResource.access || '').toLowerCase() === 'lecturer' && hasExistingRequest(selectedResource.id)
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200 cursor-not-allowed shadow-none'
                          : isStudentView && (selectedResource.access || '').toLowerCase() === 'lecturer'
                          ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-[0_4px_12px_rgba(245,158,11,0.28)]'
                          : `${theme.gradientBtn} text-white`
                      }`}
                    >
                      {isStudentView && (selectedResource.access || '').toLowerCase() === 'lecturer' && hasExistingRequest(selectedResource.id)
                        ? <><CheckCircle className="w-4 h-4" /> Request Sent</>
                        : isStudentView && (selectedResource.access || '').toLowerCase() === 'lecturer'
                        ? <><Send className="w-4 h-4" /> Send Request to Lecturer</>
                        : <><CalendarPlus className="w-4 h-4" /> Book This Resource</>
                      }
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <StudentRequestModal
        key={requestingResource?.id || 'student-request'}
        isOpen={Boolean(requestingResource)}
        resource={requestingResource}
        currentUser={currentUser}
        getUtilitiesForResource={getUtilitiesForResource}
        onClose={() => setRequestingResource(null)}
        onSubmit={handleStudentRequest}
      />

      {requestSentPopup && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setRequestSentPopup(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-[28px] border border-white/60 bg-white p-8 text-center shadow-[0_30px_80px_rgba(15,23,42,0.2)]">
            <button
              type="button"
              onClick={() => setRequestSentPopup(false)}
              className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-slate-900">Request Sent</h3>
            <p className="mt-2 text-sm text-slate-500">
              Your request has been sent to the lecturer successfully.
            </p>
            <button
              type="button"
              onClick={() => setRequestSentPopup(false)}
              className={`mt-6 inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-all ${theme.gradientBtn}`}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
