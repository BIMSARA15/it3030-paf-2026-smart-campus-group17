import { 
  ArrowLeft, X, Hash, Building2, Calendar, Clock, 
  Users, CheckCircle, AlertCircle, Info, MapPin, 
  FileText, Bell, Pencil, XCircle 
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { StatusBadge } from '../StatusBadge';
import InfoCard from './InfoCard';

export default function UserBookingDetailsModal({
  booking,
  resource,
  theme,
  resourceImage,
  onClose,
  onEdit,
  onCancel,
  formatDate,
  formatCreated,
  getSteps
}) {
  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Top Header Bar */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-50">
          <button onClick={onClose} className={`flex items-center gap-1.5 text-sm ${theme.textAccent} hover:opacity-80 transition-opacity font-medium`}>
            <ArrowLeft className="w-4 h-4" /> Back to List
          </button>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto overflow-x-hidden pb-4 scroll-smooth [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300/80 active:[&::-webkit-scrollbar-thumb]:bg-gray-400 [scrollbar-width:thin] [scrollbar-color:transparent_transparent] hover:[scrollbar-color:#d1d5db_transparent]">
          
          {/* Hero Image Section */}
          <div className="relative h-48 overflow-hidden bg-slate-900">
            <img 
              src={resourceImage} 
              alt={resource?.name || 'Venue'} 
              className="w-full h-full object-cover opacity-70" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

            <div className="absolute top-4 right-4">
              <StatusBadge status={booking.status} />
            </div>

            <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white text-xs border border-white/20 font-mono">
              <Hash className="w-3 h-3" />
              ID-{booking.id.slice(-5).toUpperCase()}
            </div>

            <div className="absolute bottom-4 left-5 right-5">
              <h1 className="text-white text-2xl drop-shadow-sm font-semibold">{resource?.name || 'Unknown Resource'}</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <Building2 className="w-4 h-4 text-white/70" />
                <span className="text-white/80 text-sm">{resource?.location || 'No location specified'}</span>
              </div>
            </div>
          </div>

          {/* Quick Info Strip */}
          <div className="flex flex-wrap items-center gap-4 px-6 py-4 border-b border-gray-50 bg-gray-50/50">
            <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
              <Calendar className={`w-4 h-4 ${theme.textAccent}`} />
              {formatDate(booking.date)}
            </div>
            <div className="hidden sm:block w-px h-4 bg-gray-300" />
            <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
              <Clock className={`w-4 h-4 ${theme.textAccent}`} />
              {booking.startTime} – {booking.endTime}
            </div>
            <div className="hidden sm:block w-px h-4 bg-gray-300" />
            <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
              <Users className={`w-4 h-4 ${theme.textAccent}`} />
              {booking.attendees || 0} attendees
            </div>
          </div>

          {/* Status Timeline Map */}
          <div className="px-6 py-6 border-b border-gray-50">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide font-bold mb-5">Booking Progress</p>
            <div className="flex items-start">
              {getSteps(booking.status).map((step, idx, arr) => (
                <div key={idx} className={`flex ${idx === arr.length - 1 ? 'flex-none' : 'flex-1'}`}>
                  <div className="flex flex-col items-center relative w-12">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-colors z-10 ${
                        step.done && step.label !== 'Rejected' && step.label !== 'Cancelled' ? `${theme.activeFilter} border border-transparent` :
                        step.label === 'Rejected' || step.label === 'Cancelled' ? "bg-red-500 border-2 border-red-500 text-white shadow-sm shadow-red-200" :
                        step.active ? "bg-amber-400 border-2 border-amber-400 text-white shadow-sm shadow-amber-200" :
                        "bg-white border-2 border-gray-200 text-gray-300"
                    }`}>
                      {step.done || step.active ? <CheckCircle className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-gray-200" />}
                    </div>
                    <span className={`text-[11px] font-bold mt-2 text-center whitespace-nowrap absolute top-9 ${step.done || step.active ? "text-gray-800" : "text-gray-400"}`}>
                      {step.label}
                    </span>
                  </div>
                  {idx < arr.length - 1 && (
                    <div className="flex-1 mt-[14px] mx-1 relative h-1.5">
                      <div className="absolute inset-0 bg-gray-100 rounded-full" />
                      <div className={`absolute left-0 top-0 bottom-0 rounded-full transition-all duration-500 ${
                        step.done && step.label !== 'Rejected' && step.label !== 'Cancelled' 
                          ? theme.progressLine 
                          : 'bg-transparent'
                      }`} style={{ width: step.done ? '100%' : '0%' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="h-6"></div>
          </div>

          {/* Feedback & Actions Area */}
          <div className="px-6 py-6 bg-gray-50/50">
            
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

            {/* Specific Details Grid */}
            <div className="px-6 py-6 border-b border-gray-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoCard icon={<Hash className="w-4 h-4" />} label="Booking ID" value={`ID-${booking.id.slice(-5).toUpperCase()}`} accent={`${theme.lightBg} ${theme.textAccent}`} />
                <InfoCard icon={<Calendar className="w-4 h-4" />} label="Booking Date" value={formatDate(booking.date)} accent="bg-blue-50 text-blue-600" />
                <InfoCard icon={<Clock className="w-4 h-4" />} label="Booking Time" value={`${booking.startTime} – ${booking.endTime}`} accent="bg-violet-50 text-violet-600" />
                <InfoCard icon={<Users className="w-4 h-4" />} label="Attendees" value={`${booking.attendees || 0} people`} accent="bg-sky-50 text-sky-600" />
                <InfoCard icon={<MapPin className="w-4 h-4" />} label="Location" value={resource?.location || 'N/A'} accent="bg-emerald-50 text-emerald-600" />
                <InfoCard icon={<FileText className="w-4 h-4" />} label="Special Requests" value={booking.specialRequests || 'None'} accent="bg-orange-50 text-orange-600" />
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 font-medium">
                <Bell className="w-3.5 h-3.5" /> Submitted on {formatCreated(booking.createdAt)}
              </div>
            </div>

            {/* QR CODE */}
            {booking.status === 'APPROVED' && (
              <div className="mb-5 p-5 bg-white border border-gray-100 rounded-2xl flex flex-col sm:flex-row items-center gap-6 shadow-sm mt-4">
                <div className="p-3 rounded-xl border border-gray-100 bg-white shadow-sm">
                  <QRCodeSVG value={`${window.location.origin}/admin/verify/${booking.id}`} size={100} />
                </div>
                <div className="text-center sm:text-left">
                  <h4 className="font-semibold text-gray-900 mb-1">Check-in QR Code</h4>
                  <p className="text-sm text-gray-500 mb-3">Show this code to the admin or facility manager upon arrival.</p>
                  {booking.checkedIn ? (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${theme.lightBg} ${theme.textAccent} rounded-lg text-sm font-medium border border-black/5`}>
                      <CheckCircle className={`w-4 h-4 ${theme.textAccent}`} /> Checked In Successfully
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium border border-gray-200">
                      <Clock className="w-4 h-4 text-gray-400" /> Awaiting Check-in
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              {booking.status === 'PENDING' && (
                <button
                  onClick={() => onEdit(booking.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-medium transition-all ${theme.gradientBtn}`}
                >
                  <Pencil className="w-4 h-4" /> Edit Request
                </button>
              )}
              
              {(booking.status === 'PENDING' || booking.status === 'APPROVED') && (
                <button
                  onClick={() => onCancel(booking.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200 text-red-600 bg-white text-sm font-medium shadow-sm hover:bg-red-50 transition-all"
                >
                  <XCircle className="w-4 h-4" /> Cancel Booking
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}