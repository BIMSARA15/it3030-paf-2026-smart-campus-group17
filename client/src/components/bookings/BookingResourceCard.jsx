import { MapPin, Users, Calendar, User, Wrench } from 'lucide-react';

export default function BookingResourceCard({ 
  resource, 
  theme, 
  typeColors, 
  typeIcons, 
  upcomingCount, 
  onClick 
}) {
  const normalizedAccess = (resource.access || '').toLowerCase();
  const isLecturerOnly = normalizedAccess.includes('lecturer');
  const accessLabel = normalizedAccess.includes('anyone') || normalizedAccess.includes('open') || normalizedAccess.includes('all')
    ? 'Open Access'
    : isLecturerOnly
    ? 'Lecturer Only'
    : normalizedAccess.includes('student')
    ? 'Student Only'
    : `${resource.access} Access`;

  return (
    <button
      onClick={onClick}
      className={`text-left p-4 rounded-xl border-2 border-gray-100 transition-all flex flex-col group ${theme.cardHover}`}
    >
      <div className="flex items-start justify-between gap-2 mb-3 w-full">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${typeColors[(resource.type || '').toLowerCase()] || 'bg-gray-100 text-gray-600'}`}>
          {typeIcons[(resource.type || '').toLowerCase()] || <Wrench className="w-4 h-4" />}
        </div>
        
        <div className="flex flex-col items-end gap-1.5">
          <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${typeColors[(resource.type || '').toLowerCase()] || 'bg-gray-100 text-gray-600'}`}>
            {resource.type}
          </span>
          
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
            isLecturerOnly
              ? 'bg-[#C54E08]/10 text-[#8A3505] border-[#C54E08]/20' 
              : 'bg-gray-50 text-gray-500 border-gray-200'
          }`}>
            <User className="w-3 h-3" />
            <span className="capitalize">
              {accessLabel}
            </span>
          </div>
        </div>
      </div>
      
      <h4 className={`text-gray-900 mb-1 transition-colors ${theme.textHover}`}>{resource.name}</h4>
      
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

      <div className="mt-auto pt-3 border-t border-gray-50 flex flex-col gap-3 w-full">
        <div className="flex flex-wrap gap-1 w-full">
          {resource.features.slice(0, 3).map(f => (
            <span key={f} className="text-[11px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-md">{f}</span>
          ))}
          {resource.features.length > 3 && (
            <span className="text-[11px] px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded-md">+{resource.features.length - 3}</span>
          )}
        </div>

        <div className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg border ${
          upcomingCount > 0 ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'
        }`}>
          <div className={`flex items-center gap-1.5 text-xs font-medium ${
            upcomingCount > 0 ? 'text-amber-700' : 'text-emerald-700'
          }`}>
            <Calendar className="w-3.5 h-3.5" />
            {upcomingCount > 0 ? `${upcomingCount} Upcoming Booking${upcomingCount > 1 ? 's' : ''}` : 'Currently Available'}
          </div>
        </div>
      </div>
    </button>
  );
}
