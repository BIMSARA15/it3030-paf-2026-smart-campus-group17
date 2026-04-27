import { useState } from 'react';
import { CheckCircle, XCircle, X, AlertCircle, Loader2 } from 'lucide-react';

export default function ReviewModal({ bookingId, action, userName, resourceName, onConfirm, onClose }) {
  const [note, setNote] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if ((action === 'reject' || action === 'cancel') && !reason.trim()) {
      setError(`Please provide a ${action === 'cancel' ? 'cancellation' : 'rejection'} reason.`);
      return;
    }
    setIsSubmitting(true); 
    await onConfirm(action === 'approve' ? note || undefined : reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10">
        <div className={`p-5 border-b rounded-t-2xl ${
          action === 'approve' ? 'bg-emerald-50 border-emerald-100' : 
          action === 'cancel' ? 'bg-rose-50 border-rose-100' : 
          'bg-red-50 border-red-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              action === 'approve' ? 'bg-emerald-100' : 
              action === 'cancel' ? 'bg-rose-100' : 'bg-red-100'
            }`}>
              {action === 'approve' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : 
               action === 'cancel' ? <XCircle className="w-5 h-5 text-rose-600" /> :
               <XCircle className="w-5 h-5 text-red-600" />}
            </div>
            <div>
              <h3 className={
                action === 'approve' ? 'text-emerald-900' : 
                action === 'cancel' ? 'text-rose-900' : 'text-red-900'
              }>
                {action === 'approve' ? 'Approve Booking' : 
                 action === 'cancel' ? 'Cancel Approved Booking' : 'Reject Booking'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {userName} · {resourceName}
              </p>
            </div>
            <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5">
          {action === 'approve' ? (
            <div>
              <label className="block text-gray-700 text-sm mb-1.5">Admin Note (Optional)</label>
              <textarea
                rows={3}
                placeholder="Add any notes or conditions for this approval..."
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-emerald-400 focus:bg-white transition-colors resize-none"
              />
              <div className="mt-3 flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-emerald-700 text-sm">Approving this booking will confirm the resource reservation. The requester will be notified.</p>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-gray-700 text-sm mb-1.5">
                {action === 'cancel' ? 'Cancellation Reason' : 'Rejection Reason'} 
                <span className={action === 'cancel' ? "text-rose-500" : "text-red-500"}>*</span>
              </label>
              <textarea
                rows={3}
                placeholder={`Please provide a clear reason for ${action === 'cancel' ? 'cancelling' : 'rejecting'} this booking...`}
                value={reason}
                onChange={e => { setReason(e.target.value); setError(''); }}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors resize-none ${
                  error 
                    ? (action === 'cancel' ? 'border-rose-300 bg-rose-50' : 'border-red-300 bg-red-50') 
                    : `border-gray-200 bg-gray-50 focus:bg-white ${action === 'cancel' ? 'focus:border-rose-400' : 'focus:border-red-500'}`
                }`}
              />
              {error && (
                <p className={`text-xs mt-1 ${action === 'cancel' ? 'text-rose-500' : 'text-red-500'}`}>
                  {error}
                </p>
              )}
              <div className={`mt-3 flex items-start gap-2 p-3 rounded-xl border ${
                action === 'cancel' ? 'bg-rose-50 border-rose-100' : 'bg-red-50 border-red-100'
              }`}>
                <AlertCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                  action === 'cancel' ? 'text-rose-600' : 'text-red-600'
                }`} />
                <p className={`text-sm ${
                  action === 'cancel' ? 'text-rose-700' : 'text-red-700'
                }`}>
                  The {action === 'cancel' ? 'cancellation' : 'rejection'} reason will be visible to the requester. Please be clear and professional.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 pb-5 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors">
            Back
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-medium transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed ' : ''}${action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : action === 'cancel' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-red-500 hover:bg-red-600'}`}>
            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : action === 'approve' ? 'Confirm Approval' : action === 'cancel' ? 'Confirm Cancellation' : 'Confirm Rejection'}
          </button>
        </div>
      </div>
    </div>
  );
}