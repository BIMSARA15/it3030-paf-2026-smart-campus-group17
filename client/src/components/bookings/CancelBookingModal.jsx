import { AlertCircle, XCircle } from 'lucide-react';

export default function CancelBookingModal({ 
  cancelReason, 
  setCancelReason, 
  cancelError, 
  setCancelError, 
  onClose, 
  onSubmit, 
  cancellingId 
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-red-100 rounded-full text-red-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Cancel Booking</h3>
          </div>
          
          <p className="text-gray-600 text-sm mb-5">
            Are you sure you want to cancel this booking? This action cannot be undone.
          </p>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-1.5">
              Reason for cancellation <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Please tell us why you are cancelling..."
              value={cancelReason}
              onChange={(e) => {
                setCancelReason(e.target.value);
                if (cancelError) setCancelError('');
              }}
              className={`w-full px-4 py-3 text-sm rounded-xl border outline-none resize-none transition-all ${
                cancelError 
                  ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10' 
                  : 'border-gray-200 bg-gray-50 focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-500/10'
              }`}
            />
            {cancelError && <p className="text-red-500 text-xs mt-1.5 font-medium">{cancelError}</p>}
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-gray-600 font-medium text-sm hover:bg-gray-100 rounded-xl transition-colors"
            >
              Keep Booking
            </button>
            <button
              onClick={() => onSubmit(cancellingId)}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors shadow-sm shadow-red-600/20"
            >
              <XCircle className="w-4 h-4" /> Confirm Cancellation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}