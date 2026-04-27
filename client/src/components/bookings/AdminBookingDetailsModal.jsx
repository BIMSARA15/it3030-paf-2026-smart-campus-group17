import { 
  ArrowLeft, X, Hash, MapPin, AlertCircle, CheckCircle, 
  Info, Calendar, Clock, Users, Building2, FileText, Bell 
} from 'lucide-react';
import { StatusBadge } from '../StatusBadge';
import InfoCard from './InfoCard';

export default function AdminBookingDetailsModal({
  booking,
  resource,
  adminTheme,
  onClose,
  formatDate,
  formatCreated
}) {
  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute -top-10 -bottom-10 -left-10 -right-10 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative z-10 bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-50">
          <button onClick={onClose} className={`flex items-center gap-1.5 text-sm ${adminTheme.textAccent} hover:opacity-80 transition-opacity font-medium`}>
            <ArrowLeft className="w-4 h-4" /> Back to List
          </button>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto overflow-x-hidden pb-4 scroll-smooth [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300/80 [&::-webkit-scrollbar-thumb]:rounded-full">
          
          {/* Hero Header Section */}
          <div className="bg-white p-6 sm:p-8 flex flex-col border-b border-gray-100">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 text-gray-500 text-xs border border-gray-200 font-mono font-medium">
                <Hash className="w-3.5 h-3.5" />
                ID-{booking.id.slice(-5).toUpperCase()}
              </div>
              <StatusBadge status={booking.status} />
            </div>

            <div>
              <h1 className="text-gray-900 text-2xl sm:text-3xl font-bold mb-2">
                {resource?.name || 'Unknown Resource'}
              </h1>
              <div className="flex items-center gap-1.5 text-gray-500">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {resource?.location || 'No location specified'}
                </span>
              </div>
            </div>
          </div>

          {/* Feedback & Actions Area */}
          <div className="px-6 py-6 bg-gray-50/50 border-b border-gray-50">
            
            {/* Admin Feedback Section */}
            {(booking.rejectionReason || booking.adminNote) && (
              <div className={`mb-5 p-4 rounded-2xl border ${
                booking.status === 'REJECTED' ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {booking.status === 'REJECTED' ? <AlertCircle className="w-5 h-5 text-red-600" /> : <CheckCircle className="w-5 h-5 text-emerald-600" />}
                  </div>
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-wider ${booking.status === 'REJECTED' ? 'text-red-800' : 'text-emerald-800'}`}>
                      {booking.status === 'REJECTED' ? 'Reason for Rejection' : 'Admin Note'}
                    </p>
                    <p className={`text-sm mt-1 font-medium ${booking.status === 'REJECTED' ? 'text-red-700' : 'text-emerald-700'}`}>
                      {booking.status === 'REJECTED' ? booking.rejectionReason : booking.adminNote}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* User Cancellation Reason */}
            {booking.status === 'CANCELLED' && booking.cancellationReason && (
              <div className="mb-5 p-4 rounded-2xl border bg-white border-gray-200">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-700">Reason for Cancellation</p>
                    <p className="text-sm mt-1 text-gray-600 font-medium">{booking.cancellationReason}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Specific Details List for Admin */}
            <div className="flex flex-col gap-3">
              
              {/* Custom Requester Profile Card */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3.5 hover:-translate-y-0.5 hover:shadow-sm transition-all">
                <div className="w-11 h-11 rounded-full bg-[#1E3A8A] flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-white text-sm font-bold tracking-wider">
                    {(booking.userName || 'User').split(' ').map(n => n).join('').slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-[11px] text-gray-400 mb-0.5 uppercase tracking-wide font-bold">Requester</p>
                  <p className="text-gray-900 font-bold text-sm">{booking.userName || 'Unknown User'}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{booking.userEmail}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoCard icon={<Calendar className="w-4 h-4" />} label="Requested Date" value={formatDate(booking.date)} accent="bg-blue-50 text-blue-600" />
                <InfoCard icon={<Clock className="w-4 h-4" />} label="Requested Time" value={`${booking.startTime} – ${booking.endTime}`} accent="bg-purple-50 text-purple-600" />
                <InfoCard icon={<MapPin className="w-4 h-4" />} label="Resource Location" value={resource?.location || `${booking.block || ''} ${booking.level || ''}`.trim() || 'No location specified'} accent="bg-emerald-50 text-emerald-600" />
                
                {resource?.type === 'equipment' ? (
                  <InfoCard icon={<Hash className="w-4 h-4" />} label="Quantity" value={`${booking.quantity || 1}`} accent="bg-orange-50 text-orange-600" />
                ) : (
                  <InfoCard icon={<Users className="w-4 h-4" />} label="Attendees" value={`${booking.attendees || 0} attendees`} accent="bg-orange-50 text-orange-600" />
                )}
              </div>

              <InfoCard icon={<FileText className="w-4 h-4" />} label="Purpose" value={booking.purpose} accent="bg-slate-50 text-slate-600" />

              {booking.lecturer && (
                 <InfoCard icon={<Building2 className="w-4 h-4" />} label="Lecturer in Charge" value={booking.lecturer} accent="bg-violet-50 text-violet-600" />
              )}
              {booking.specialRequests && (
                 <InfoCard icon={<FileText className="w-4 h-4" />} label="Special Requests" value={booking.specialRequests} accent="bg-rose-50 text-rose-600" />
              )}
            </div>
            
            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400 font-medium border-t border-gray-100 pt-4">
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5"><Bell className="w-3.5 h-3.5" /> Submitted: {formatCreated(booking.createdAt)}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Updated: {formatCreated(booking.updatedAt)}</span>
              </div>
              {booking.reviewedBy && (
                <span>Reviewed by: {booking.reviewedBy}</span>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}