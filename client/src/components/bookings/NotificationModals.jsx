import { CheckCircle, XCircle, Trash2, X } from 'lucide-react';

export function SuccessModal({ theme, onClose, title = "Success", message }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 sm:p-8 text-center">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-5 ${theme?.lightBg || 'bg-emerald-100'} ${theme?.textAccent || 'text-emerald-600'}`}>
            <CheckCircle className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-500 text-sm mb-8 font-medium">{message}</p>
          <button
            onClick={onClose}
            className={`w-full py-3 rounded-xl text-white text-sm font-semibold transition-all shadow-sm ${theme?.gradientBtn || 'bg-emerald-600 hover:bg-emerald-700'}`}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

export function DeleteWarningModal({ deleteModalId, onClose, onConfirm }) {
  if (!deleteModalId) return null;
  return (
    <div className="fixed inset-0 z- flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center z-10 border border-gray-100 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 mt-2 bg-red-100">
          <Trash2 className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-gray-900 text-xl font-semibold mb-2">Delete Record?</h2>
        <p className="text-gray-500 text-sm mb-6">
          <span className="block mb-1.5">
            Are you sure you want to permanently delete booking record <strong className="text-gray-800 font-mono">ID-{deleteModalId.slice(-5).toUpperCase()}?</strong>
          </span>
          <span className="block text-gray-400">This action cannot be undone.</span>
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors">
            Cancel
          </button>
          <button onClick={() => onConfirm(deleteModalId)} className="flex-1 py-2.5 px-4 rounded-xl text-white text-sm font-medium bg-red-600 hover:bg-red-700 shadow-[0_4px_12px_rgba(220,38,38,0.2)] transition-all">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}