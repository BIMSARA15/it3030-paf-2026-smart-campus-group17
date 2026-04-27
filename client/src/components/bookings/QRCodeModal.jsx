import { X, CheckCircle, Clock, Download, Bell } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function QRCodeModal({ qrBooking, qrResource, theme, onClose, onDownload, formatDate, formatCreated }) {
  if (!qrBooking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-[2rem] shadow-xl w-full max-w-2xl overflow-hidden flex flex-col relative max-h-[95vh]">
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-50">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Check-in Pass</h3>
            <p className="text-sm text-gray-500 mt-0.5">Show this pass to the admin or facility manager</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 sm:p-6 pb-8 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-auto flex flex-col items-center flex-shrink-0">
              <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm mb-5">
                <QRCodeSVG id="qr-code-svg" value={`${window.location.origin}/admin/verify/${qrBooking.id}`} size={180} level="H" includeMargin={true} />
              </div>
              {qrBooking.checkedIn ? (
                <span className={`inline-flex items-center gap-1.5 px-4 py-2 ${theme.lightBg} ${theme.textAccent} rounded-xl text-sm font-medium w-full justify-center border border-black/5`}>
                  <CheckCircle className={`w-4 h-4 ${theme.textAccent}`} /> Checked In Successfully
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium w-full justify-center border border-gray-200">
                  <Clock className="w-4 h-4 text-gray-400" /> Awaiting Check-in
                </span>
              )}
              <button onClick={onDownload} className={`w-full flex items-center justify-center gap-2 py-2.5 mt-4 rounded-xl text-white text-sm font-medium transition-all ${theme.gradientBtn}`}>
                <Download className="w-4 h-4" /> Save as PNG
              </button>
            </div>

            <div className="w-full flex-1">
              <h4 className="text-[11px] text-gray-400 uppercase tracking-wide font-bold mb-4">Booking Information</h4>
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex flex-col gap-4">
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <p className="text-[11px] text-gray-400 uppercase tracking-wide font-bold mb-1">Booking ID</p>
                     <p className="text-sm font-semibold text-gray-900">ID-{qrBooking.id.slice(-5).toUpperCase()}</p>
                   </div>
                   <div>
                     <p className="text-[11px] text-gray-400 uppercase tracking-wide font-bold mb-1">Resource</p>
                     <p className="text-sm font-semibold text-gray-900">{qrResource?.name || 'Unknown Resource'}</p>
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <p className="text-[11px] text-gray-400 uppercase tracking-wide font-bold mb-1">Date</p>
                     <p className="text-sm font-medium text-gray-700">{formatDate(qrBooking.date)}</p>
                   </div>
                   <div>
                     <p className="text-[11px] text-gray-400 uppercase tracking-wide font-bold mb-1">Time</p>
                     <p className="text-sm font-medium text-gray-700">{qrBooking.startTime} – {qrBooking.endTime}</p>
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <p className="text-[11px] text-gray-400 uppercase tracking-wide font-bold mb-1">Location</p>
                     <p className="text-sm font-medium text-gray-700">{qrResource?.location || 'N/A'}</p>
                   </div>
                   {qrBooking.attendees && (
                     <div>
                       <p className="text-[11px] text-gray-400 uppercase tracking-wide font-bold mb-1">Attendees</p>
                       <p className="text-sm font-medium text-gray-700">{qrBooking.attendees} people</p>
                     </div>
                   )}
                 </div>
                 <div>
                   <p className="text-[11px] text-gray-400 uppercase tracking-wide font-bold mb-1">Purpose</p>
                   <p className="text-sm font-medium text-gray-700">{qrBooking.purpose}</p>
                 </div>
              </div>
              <div className="mt-5 flex items-center gap-2 text-xs text-gray-400 font-medium">
                <Bell className="w-3.5 h-3.5" /> Submitted on {formatCreated(qrBooking.createdAt)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}