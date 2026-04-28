import { MapPin, Package } from 'lucide-react';

export default function BookingUtilityCard({ 
  utility, 
  theme, 
  typeColors, 
  typeIcons, 
  isDisabled, 
  isInUse, 
  isOutOfStock, 
  onClick 
}) {
  return (
    <button
      disabled={isDisabled}
      onClick={onClick}
      className={`text-left p-4 rounded-xl border-2 relative transition-all ${
        isDisabled 
          ? 'opacity-60 grayscale cursor-not-allowed bg-gray-100 border-gray-200' 
          : `border-gray-100 group ${theme.cardHover}`
      }`}
    >
      {isDisabled && (
        <div className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-md z-10 border ${
          isInUse ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-red-100 text-red-600 border-red-200'
        }`}>
          {isInUse ? 'In Use' : 'Out of Stock'}
        </div>
      )}

      <div className="flex items-start justify-between gap-2 mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeColors.equipment}`}>
          {typeIcons['equipment']}
        </div>
        
        {!isDisabled && (
          <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${typeColors.equipment}`}>
            {utility.category || 'Equipment'}
          </span>
        )}
      </div>
      
      <h4 className={`text-gray-900 mb-1 transition-colors ${!isDisabled ? theme.textHover : ''}`}>
        {utility.utilityName}
      </h4>
      
      <div className="flex items-center gap-1 text-gray-400 text-xs mb-2">
        <MapPin className="w-3 h-3" />
        {utility.location}
      </div>
      
      <div className={`flex items-center gap-1 text-xs ${isOutOfStock ? 'text-red-500 font-medium' : isInUse ? 'text-amber-600 font-medium' : 'text-gray-400'}`}>
        <Package className="w-3 h-3" />
        Quantity: {utility.quantity}
      </div>
      
      <div className="mt-2">
        <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-md uppercase tracking-wide">
          {utility.utilityCode}
        </span>
      </div>
    </button>
  );
}