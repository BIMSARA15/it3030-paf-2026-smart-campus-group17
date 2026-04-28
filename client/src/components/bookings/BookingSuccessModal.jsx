import { X, CheckCircle, Info } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';

export default function BookingSuccessModal({
  isEditing,
  resultMessage,
  theme,
  onClose,
  onNewBooking,
  onViewBookings
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center z-10 border border-gray-100 animate-in zoom-in-95 duration-200">
        
        <button
          onClick={onClose}
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
          {isEditing ? 'Booking Details Updated Successfully.' : resultMessage}
        </p>
        
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 text-left">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-800 text-sm font-medium flex items-center gap-2">
                Your booking is now <StatusBadge status="PENDING" size="sm" />
              </p>
              <p className="text-amber-700 text-xs mt-1">
                An administrator will review your request and notify you of the outcome.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onNewBooking}
            className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            New Booking
          </button>
          
          <button
            onClick={onViewBookings}
            className={`flex-1 py-2.5 px-4 rounded-xl text-white text-sm font-medium border-t border-white/20 transition-all ${theme.gradientBtn}`}
          >
            My Bookings
          </button>
        </div>
      </div>
    </div>
  );
}