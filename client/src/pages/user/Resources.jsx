import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Building2, FlaskConical, Wrench, MapPin,
  Users, CalendarPlus, ChevronRight, CheckCircle, Tag, Package, ShieldAlert, Send, X,
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
    color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100',
  },
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
  
  // 2. Add Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [accessMessage, setAccessMessage] = useState('');
  const [requestingResource, setRequestingResource] = useState(null);
  const [requestSentPopup, setRequestSentPopup] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const filtered = resources.filter(r => {
    const matchType = typeFilter === 'all' || r.type === typeFilter;
    const matchSearch = search === '' ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase()) ||
      r.features.some(f => f.toLowerCase().includes(search.toLowerCase()));
    return matchType && matchSearch;
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

  const selectedResource = selectedId ? resources.find(r => r.id === selectedId) : null;

  const counts = {
    all: resources.length,
    room: resources.filter(r => r.type === 'room').length,
    lab: resources.filter(r => r.type === 'lab').length,
    equipment: utilities.length,
  };

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
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              {/* UPDATED: Search input focus ring */}
              <input
                type="text"
                placeholder={typeFilter === 'equipment' ? 'Search equipment, code, location...' : 'Search resources, features...'}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-[#17A38A] focus:ring-2 focus:ring-[#17A38A]/10 transition-all"
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
                      ? 'bg-gradient-to-r from-[#0F6657] to-[#17A38A] text-white shadow-md border-t border-white/20' // UPDATED: Green gradient for active filter
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t !== 'all' && TYPE_CONFIG[t].icon}
                  <span className="capitalize">{t === 'all' ? 'All Resources' : `${t.charAt(0).toUpperCase() + t.slice(1)}s`}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${typeFilter === t ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                    {counts[t]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Resource grid */}
            <div className={`${selectedResource ? 'lg:col-span-2' : 'lg:col-span-3'} grid grid-cols-1 sm:grid-cols-2 ${selectedResource ? '' : 'xl:grid-cols-3'} gap-3 content-start`}>
              {typeFilter === 'equipment' ? (
                utilitiesLoading ? (
                  <div className="sm:col-span-2 xl:col-span-3 text-center py-16 bg-white rounded-xl border border-gray-100">
                    <Package className="w-10 h-10 text-orange-300 mx-auto mb-3 animate-pulse" />
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
                      className="mt-4 px-4 py-2 rounded-xl bg-orange-50 text-orange-700 border border-orange-100 text-sm font-medium hover:bg-orange-100 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                ) : filteredUtilities.length === 0 ? (
                  <div className="sm:col-span-2 xl:col-span-3 text-center py-16 bg-white rounded-xl border border-gray-100">
                    <Wrench className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      {utilities.length === 0 ? 'No equipment has been added by admin yet' : 'No equipment matches your search'}
                    </p>
                  </div>
                ) : (
                  filteredUtilities.map((utility) => (
                    <div
                      key={utility.id}
                      className="rounded-xl border-2 border-gray-100 bg-white p-5 transition-all hover:border-orange-200 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
                          <Package className="w-5 h-5" />
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-600">
                          {utility.category}
                        </span>
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

                      <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-3">
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
                    </div>
                  ))
                )
              ) : filtered.map(resource => {
                const cfg = TYPE_CONFIG[resource.type];
                const stats = getResourceStats(resource.id);
                const isSelected = selectedId === resource.id;
                const isLecturerOnly = (resource.access || '').toLowerCase() === 'lecturer';
                const isBlockedForStudent = isStudentView && isLecturerOnly;
                const requestAlreadySent = isBlockedForStudent && hasExistingRequest(resource.id);

                return (
                  <div
                    key={resource.id}
                    onClick={() => {
                      setSelectedId(isSelected ? null : resource.id);
                      setAccessMessage('');
                    }}
                    className={`rounded-xl border-2 p-5 cursor-pointer transition-all hover:shadow-md ${
                      isSelected 
                        ? isBlockedForStudent
                          ? 'border-amber-300 shadow-[0_8px_24px_rgba(245,158,11,0.14)] bg-amber-50/80'
                          : 'border-[#17A38A] shadow-[0_8px_24px_rgba(23,163,138,0.12)] bg-[#17A38A]/5'
                        : isBlockedForStudent
                          ? 'bg-amber-50/70 border-amber-200 hover:border-amber-300'
                          : 'bg-white border-gray-100 hover:border-[#17A38A]/30'
                    }`}
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl ${cfg.bg} ${cfg.border} border flex items-center justify-center ${cfg.color}`}>
                        {cfg.icon}
                      </div>
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
                    </div>

                    {/* Name */}
                    {/* UPDATED: Title text color when selected */}
                    <h4 className={`font-medium mb-1 transition-colors ${
                      isBlockedForStudent
                        ? 'text-amber-900'
                        : `text-gray-900 ${isSelected ? 'text-[#0F6657]' : ''}`
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
                      <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-3">
                        <Users className="w-3.5 h-3.5" />
                        Capacity: {resource.capacity} persons
                      </div>
                    )}

                    {/* Features */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {resource.features.slice(0, 3).map(f => (
                        <span key={f} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-md">{f}</span>
                      ))}
                      {resource.features.length > 3 && (
                        <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded-md">
                          +{resource.features.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Stats row */}
                    <div className={`flex items-center justify-between pt-3 ${isBlockedForStudent ? 'border-t border-amber-100' : 'border-t border-gray-50'}`}>
                      <div className="text-xs text-gray-400">
                        {isBlockedForStudent
                          ? requestAlreadySent
                            ? <span className="text-amber-700 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Request already sent</span>
                            : <span className="text-amber-700 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Lecturer access required</span>
                          : stats.upcoming > 0
                          ? <span className="text-amber-600">{stats.upcoming} upcoming booking{stats.upcoming !== 1 ? 's' : ''}</span>
                          : <span className="text-emerald-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Available</span>
                        }
                      </div>
                      <div className={`flex items-center gap-1 text-xs font-medium ${isBlockedForStudent ? 'text-amber-700' : 'text-[#17A38A]'}`}>
                        View <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                );
              })}

              {typeFilter !== 'equipment' && filtered.length === 0 && (
                <div className="sm:col-span-2 xl:col-span-3 text-center py-16 bg-white rounded-xl border border-gray-100">
                  <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No resources match your search</p>
                </div>
              )}
            </div>

            {/* Resource detail panel */}
            {typeFilter !== 'equipment' && selectedResource && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden sticky top-4">
                  <div className="h-36 bg-gradient-to-br from-slate-700 to-slate-900 relative overflow-hidden">
                    <img
                      src={selectedResource.image || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800'}
                      alt={selectedResource.name}
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 flex items-end p-4">
                      <div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${TYPE_CONFIG[selectedResource.type].bg} ${TYPE_CONFIG[selectedResource.type].color} capitalize mb-2 inline-block`}>
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
                                : 'Students can send a request to a lecturer, and the lecturer can then place the booking from `Std Requests`.'}
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

                    {/* Capacity */}
                    {selectedResource.capacity && (
                      <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                        <Users className="w-4 h-4 text-gray-400" />
                        Capacity: {selectedResource.capacity} persons
                      </div>
                    )}

                    {/* Description with fallback */}
                    <p className="text-gray-500 text-sm mb-4">
                      {selectedResource.description || 'No detailed description available for this resource.'}
                    </p>

                    {/* Features */}
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

                    {getUtilitiesForResource(selectedResource.id).length > 0 && (
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
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all text-sm font-medium border-t active:scale-[0.98] ${
                        isStudentView && (selectedResource.access || '').toLowerCase() === 'lecturer' && hasExistingRequest(selectedResource.id)
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200 cursor-not-allowed shadow-none'
                          : isStudentView && (selectedResource.access || '').toLowerCase() === 'lecturer'
                          ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-[0_4px_12px_rgba(245,158,11,0.28)] border-white/20'
                          : 'bg-gradient-to-r from-[#0F6657] to-[#17A38A] text-white hover:from-[#0c5246] hover:to-[#128a74] shadow-[0_4px_12px_rgba(23,163,138,0.3)] border-white/20'
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
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#0F6657] to-[#17A38A] px-5 py-2.5 text-sm font-medium text-white shadow-[0_4px_12px_rgba(23,163,138,0.3)] transition-all hover:from-[#0c5246] hover:to-[#128a74]"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
