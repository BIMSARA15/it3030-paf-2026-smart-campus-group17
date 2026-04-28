import React, { useState } from 'react';
import { Building2, Wrench, Search, Filter } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';

export default function FacilitiesAssets() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Header />
        
        <div className="p-4 lg:p-6 space-y-6">
          <div>
            <h1 className="text-gray-900 text-2xl font-semibold">Facilities & Assets</h1>
            <p className="text-gray-500 text-sm mt-0.5">Manage campus buildings, rooms, and equipment inventory</p>
          </div>

          {/* Search Bar Placeholder */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search assets by ID, name, or location..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2F3A52]"
                disabled
              />
            </div>
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 flex items-center gap-2 hover:bg-slate-50">
              <Filter className="w-4 h-4" /> Filters
            </button>
          </div>

          <div className="rounded-[28px] border border-dashed border-slate-200 bg-white p-12 text-center shadow-[0_10px_30px_rgba(15,23,42,0.04)] mt-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF2F7]">
              <Building2 className="w-8 h-8 text-[#2F3A52]" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Module A Integration Pending</h2>
            <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
              This section is reserved for the Facilities & Assets integration. Once Module A is connected, you will be able to view and manage all physical campus assets here.
            </p>
            <button className="mt-6 px-6 py-2.5 bg-[#2F3A52] text-white rounded-xl text-sm font-semibold hover:bg-[#1F2937] transition-colors inline-flex items-center gap-2">
              <Wrench className="w-4 h-4" /> Go to Maintenance Tasks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}