import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Building2, FlaskConical, Wrench, MapPin,
  Users, CalendarPlus, ChevronRight, CheckCircle, Tag, Package,
} from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';

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

export default function Resources() {
  const { resources, bookings, getUtilitiesForResource } = useBooking();
  const navigate = useNavigate();
  
  // 2. Add Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  const filtered = resources.filter(r => {
    const matchType = typeFilter === 'all' || r.type === typeFilter;
    const matchSearch = search === '' ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase()) ||
      r.features.some(f => f.toLowerCase().includes(search.toLowerCase()));
    return matchType && matchSearch;
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
    equipment: resources.filter(r => r.type === 'equipment').length,
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
                placeholder="Search resources, features..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-[#17A38A] focus:ring-2 focus:ring-[#17A38A]/10 transition-all"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'room', 'lab', 'equipment'].map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
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
              {filtered.map(resource => {
                const cfg = TYPE_CONFIG[resource.type];
                const stats = getResourceStats(resource.id);
                const isSelected = selectedId === resource.id;

                return (
                  <div
                    key={resource.id}
                    onClick={() => setSelectedId(isSelected ? null : resource.id)}
                    className={`bg-white rounded-xl border-2 p-5 cursor-pointer transition-all hover:shadow-md ${
                      isSelected 
                        ? 'border-[#17A38A] shadow-[0_8px_24px_rgba(23,163,138,0.12)] bg-[#17A38A]/5' // UPDATED: Selected state
                        : 'border-gray-100 hover:border-[#17A38A]/30'
                    }`}
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl ${cfg.bg} ${cfg.border} border flex items-center justify-center ${cfg.color}`}>
                        {cfg.icon}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${cfg.bg} ${cfg.color} capitalize`}>
                        {cfg.label}
                      </span>
                    </div>

                    {/* Name */}
                    {/* UPDATED: Title text color when selected */}
                    <h4 className={`text-gray-900 font-medium mb-1 transition-colors ${isSelected ? 'text-[#0F6657]' : ''}`}>
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
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <div className="text-xs text-gray-400">
                        {stats.upcoming > 0
                          ? <span className="text-amber-600">{stats.upcoming} upcoming booking{stats.upcoming !== 1 ? 's' : ''}</span>
                          : <span className="text-emerald-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Available</span>
                        }
                      </div>
                      {/* UPDATED: View text link color */}
                      <div className="flex items-center gap-1 text-[#17A38A] text-xs font-medium">
                        View <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
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
                    <button
                      onClick={() => navigate(`/booking/new?resource=${selectedResource.id}`)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#0F6657] to-[#17A38A] text-white hover:from-[#0c5246] hover:to-[#128a74] rounded-xl transition-all text-sm font-medium shadow-[0_4px_12px_rgba(23,163,138,0.3)] border-t border-white/20 active:scale-[0.98]"
                    >
                      <CalendarPlus className="w-4 h-4" /> Book This Resource
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
