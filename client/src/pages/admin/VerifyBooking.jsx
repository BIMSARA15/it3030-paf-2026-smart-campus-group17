import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export default function VerifyBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bookings, getResourceById } = useBooking();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const found = bookings.find(b => b.id === id);
    setBooking(found);
  }, [id, bookings]);

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/bookings/${id}/checkin`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (response.ok) {
        setSuccess(true);
      }
    } catch (error) {
      console.error("Check-in failed", error);
    }
    setLoading(false);
  };

  if (!booking) return <div className="p-10 text-center text-gray-500">Loading booking details...</div>;

  const resource = getResourceById(booking.resourceId);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-[#0F6657] p-6 text-center text-white relative">
          <button onClick={() => navigate('/admin/bookings')} className="absolute left-4 top-6 opacity-80 hover:opacity-100">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold">Booking Verification</h2>
          <p className="text-[#0F6657] bg-white/20 inline-block px-3 py-1 rounded-full text-xs mt-2 font-mono text-white">ID-{booking.id.slice(-5).toUpperCase()}</p>
        </div>

        <div className="p-6">
          <div className="space-y-4 mb-8">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Student / Requester</p>
              <p className="text-gray-800 font-medium">{booking.userName || booking.userEmail}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Resource</p>
              <p className="text-gray-800 font-medium">{resource?.name} ({resource?.location})</p>
            </div>
            <div className="flex gap-8">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Date</p>
                <p className="text-gray-800">{booking.date}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Time</p>
                <p className="text-gray-800">{booking.startTime} - {booking.endTime}</p>
              </div>
            </div>
          </div>

          {booking.checkedIn || success ? (
            <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center justify-center gap-2 font-medium border border-green-200">
              <CheckCircle className="w-5 h-5" /> 
              Student Checked In Successfully
            </div>
          ) : booking.status !== 'APPROVED' ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center justify-center gap-2 font-medium border border-red-200">
              <AlertCircle className="w-5 h-5" /> 
              Cannot Check-in. Status: {booking.status}
            </div>
          ) : (
            <button
              onClick={handleCheckIn}
              disabled={loading}
              className="w-full py-3.5 bg-[#0F6657] text-white rounded-xl font-medium hover:bg-[#0a483d] transition-colors shadow-lg shadow-[#0F6657]/30"
            >
              {loading ? 'Processing...' : 'Confirm Check-In'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}