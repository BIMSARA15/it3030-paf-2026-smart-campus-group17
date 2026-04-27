import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export default function VerifyBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bookings, getResourceById, utilities } = useBooking();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const found = bookings.find(b => b.id === id);
    setBooking(found);
  }, [id, bookings]);

  const handleCheckIn = async () => {
    setLoading(true);
    setError(''); // Clear previous errors
    
    try {
      const response = await fetch(`http://localhost:8080/api/bookings/${id}/checkin`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      
      if (response.ok) {
        const updatedBooking = await response.json();
        setBooking(updatedBooking); // Update the UI with the fresh data from the DB
        setSuccess(true);
      } else {
        const errData = await response.json();
        setError(errData.error || "Check-in failed. Please verify the time.");
      }
    } catch (err) {
      setError("Network error occurred.");
    }
    setLoading(false);
  };

  if (!booking) return <div className="p-10 text-center text-gray-500">Loading booking details...</div>;

  let resource = getResourceById(booking.resourceId);
  let isUtility = false;
  
  // Fallback: If not found in standard resources, check utilities (equipment)
  if (!resource && utilities) {
    const util = utilities.find(u => u.id === booking.resourceId);
    if (util) {
      isUtility = true;
      resource = {
        name: util.utilityName,
        location: util.location || 'Equipment Room'
      };
    }
  }

  const formatTimestamp = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#0F6657] p-6 text-center text-white relative">
          <button onClick={() => navigate('/admin/bookings')} className="absolute left-4 top-6 opacity-80 hover:opacity-100 transition-opacity">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold">Booking Verification</h2>
        </div>

        <div className="p-6">
          <h3 className="text-gray-800 font-semibold mb-4">Check-in Details</h3>
          
          {/* Organized Details Card */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex flex-col gap-5 mb-8 shadow-sm">
            
            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wide font-bold mb-1">Booking ID</p>
                <p className="text-sm font-semibold text-gray-900 font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-block border border-emerald-100">
                  ID-{booking.id.slice(-5).toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wide font-bold mb-1">Student / Requester</p>
                <p className="text-sm font-semibold text-gray-900 truncate" title={booking.userName || booking.userEmail}>
                  {booking.userName || booking.userEmail}
                </p>
              </div>
            </div>

            <div className="w-full h-px bg-gray-200/60" />

            {/* Row 2 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wide font-bold mb-1">Resource Name</p>
                <p className="text-sm font-semibold text-gray-900">{resource?.name || 'Unknown Resource'}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wide font-bold mb-1">Booking Location</p>
                <p className="text-sm font-semibold text-gray-900">{resource?.location || 'Location not specified'}</p>
              </div>
            </div>

            <div className="w-full h-px bg-gray-200/60" />

            {/* Row 3 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wide font-bold mb-1">Date</p>
                <p className="text-sm font-medium text-gray-700">{booking.date}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wide font-bold mb-1">Time</p>
                <p className="text-sm font-medium text-gray-700">{booking.startTime} - {booking.endTime}</p>
              </div>
            </div>

            {/* Row 4 (Dynamic: Quantity/Attendees) */}
            {(booking.attendees || booking.quantity) && (
              <>
                <div className="w-full h-px bg-gray-200/60" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase tracking-wide font-bold mb-1">
                      {isUtility ? 'Quantity' : 'Attendees'}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {booking.quantity || booking.attendees}
                    </p>
                  </div>
                </div>
              </>
            )}
            
          </div>

          {/* Action Area */}
          
          {/* Show Error Message if Time Validation Fails */}
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center justify-center gap-2 font-medium border border-red-200 shadow-sm mb-4 text-sm text-center">
              <AlertCircle className="w-5 h-5 flex-shrink-0" /> 
              {error}
            </div>
          )}

          {booking.checkedIn ? (
            <div className="bg-green-50 flex flex-col items-center justify-center p-4 rounded-xl border border-green-200 shadow-sm">
              <div className="text-green-700 flex items-center gap-2 font-medium mb-1">
                <CheckCircle className="w-5 h-5" /> 
                Student Checked In Successfully
              </div>
              {/* Show the Check-in Timestamp! */}
              {booking.checkInTime && (
                <div className="text-green-600/80 text-xs font-semibold">
                  at {formatTimestamp(booking.checkInTime)}
                </div>
              )}
            </div>
          ) : booking.status !== 'APPROVED' ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center justify-center gap-2 font-medium border border-red-200 shadow-sm">
              <AlertCircle className="w-5 h-5" /> 
              Cannot Check-in. Status: {booking.status}
            </div>
          ) : (
            <button
              onClick={handleCheckIn}
              disabled={loading}
              className="w-full py-3.5 bg-[#0F6657] text-white rounded-xl font-medium hover:bg-[#0a483d] transition-colors shadow-lg shadow-[#0F6657]/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Check-In'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}