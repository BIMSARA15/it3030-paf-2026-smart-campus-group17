import { X, CheckCircle, XCircle } from 'lucide-react';

export default function ResultModal({ resultModal, onClose }) {
  if (!resultModal) return null;

  return (
    <div className="fixed inset-0 z- flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center z-10 border border-gray-100 animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 mt-2 ${
          resultModal.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'
        }`}>
          {resultModal.type === 'success' ? (
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          ) : (
            <XCircle className="w-8 h-8 text-red-600" />
          )}
        </div>
        
        <h2 className="text-gray-900 text-xl font-semibold mb-1">{resultModal.title}</h2>
        
        {resultModal.bookingId && (
          <div className="mb-3">
            <span className={`inline-block px-2.5 py-1 text-xs font-mono rounded-lg border shadow-sm ${
              resultModal.title.includes('Rejected')
                ? 'bg-red-50 text-red-600 border-red-200' 
                : 'bg-gray-50 text-gray-600 border-gray-200'
            }`}>
              {resultModal.bookingId}
            </span>
          </div>
        )}

        <p className="text-gray-500 text-sm mb-6">{resultModal.message}</p>

        <button
          onClick={onClose}
          className={`w-full py-2.5 px-4 rounded-xl text-white text-sm font-medium shadow-sm transition-all ${
            resultModal.type === 'success' 
              ? 'bg-emerald-600 hover:bg-emerald-700 shadow-[0_4px_12px_rgba(5,150,105,0.2)]' 
              : 'bg-red-600 hover:bg-red-700 shadow-[0_4px_12px_rgba(220,38,38,0.2)]'
          }`}
        >
          Close
        </button>
      </div>
    </div>
  );
}