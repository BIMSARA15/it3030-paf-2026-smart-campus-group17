import { X, CheckCircle, Clock, Download, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function QRCodeModal({ booking, theme, onClose }) {
  if (!booking) return null;

  const handleDownloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `Booking-QR-${booking.id}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col items-center p-8 relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Icon */}
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
          <QrCode className="w-6 h-6" />
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">Check-in QR Code</h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          Show this code to the admin or facility manager upon arrival.
        </p>

        {/* QR Code Graphic */}
        <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm mb-6">
          <QRCodeSVG 
            id="qr-code-svg"
            value={`${window.location.origin}/admin/verify/${booking.id}`} 
            size={160} 
            level="H"
            includeMargin={true} 
          />
        </div>

        {/* Dynamic Status Badge */}
        {booking.checkedIn ? (
          <span className={`inline-flex items-center gap-1.5 px-4 py-2 ${theme.lightBg} ${theme.textAccent} rounded-xl text-sm font-medium mb-6`}>
            <CheckCircle className={`w-4 h-4 ${theme.textAccent}`} /> Checked In Successfully
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium mb-6">
            <Clock className="w-4 h-4 text-gray-400" /> Awaiting Check-in
          </span>
        )}

        {/* Download Button */}
        <button
          onClick={handleDownloadQR}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-medium transition-all ${theme.gradientBtn}`}
        >
          <Download className="w-4 h-4" /> Download PNG
        </button>
      </div>
    </div>
  );
}