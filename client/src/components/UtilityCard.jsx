import React from 'react';
import { Package, MapPin, Layers } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function UtilityCard({ utility }) {
  return (
    <div className="min-w-0 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
      <div className="p-5 border-b border-slate-100 flex justify-between items-start gap-3 w-full">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-slate-800 mb-1 leading-tight break-words">{utility.name}</h3>
          <p className="text-xs font-semibold text-indigo-600 tracking-wider uppercase break-words">
            {utility.category.replace(/_/g, ' ')} • {utility.utilityCode}
          </p>
        </div>
        <StatusBadge status={utility.status} />
      </div>

      <div className="p-5 bg-slate-50/50 space-y-3 flex-1">
        <div className="flex items-center text-sm text-slate-600">
          <Layers className="w-4 h-4 mr-3 text-slate-400 shrink-0" />
          <span className="font-medium text-slate-800">{utility.quantity}</span>
          <span className="ml-1">Units</span>
        </div>
        <div className="flex items-center text-sm text-slate-600 min-w-0">
          <MapPin className="w-4 h-4 mr-3 text-slate-400 shrink-0" />
          <span className="break-words">{utility.assignedLocation || 'Unassigned'}</span>
        </div>
        <div className="flex items-start text-sm text-slate-600 min-w-0">
          <Package className="w-4 h-4 mr-3 mt-0.5 text-slate-400 shrink-0" />
          <span className="break-words">
            {utility.description || 'No additional notes for this utility.'}
          </span>
        </div>
      </div>
    </div>
  );
}
