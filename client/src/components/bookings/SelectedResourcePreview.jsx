import { MapPin, Users, Package, Tag, CheckCircle } from 'lucide-react';

export default function SelectedResourcePreview({
  selectedResource,
  resourceImage,
  typeColors,
  typeIcons,
  bookings,
  today,
  formatTo24Hour
}) {
  if (!selectedResource) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden sticky top-4 shadow-sm">
      {/* Hero Image Header */}
      <div className="h-36 bg-gradient-to-br from-slate-700 to-slate-900 relative overflow-hidden">
        <img
          src={resourceImage}
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

        {/* Quantity (For Equipment/Utilities) */}
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
  );
}