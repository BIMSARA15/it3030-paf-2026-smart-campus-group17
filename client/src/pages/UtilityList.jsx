import React, { useEffect, useState } from 'react';
import { getUtilities } from '../services/api';
import UtilityCard from '../components/UtilityCard';
import { Search, Filter, Wrench } from 'lucide-react';

export default function UtilityList() {
  const [utilities, setUtilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    assignedLocation: '',
    status: '',
  });

  useEffect(() => {
    const fetchUtilities = async () => {
      try {
        setLoading(true);
        const params = Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== ''));
        const response = await getUtilities(params);
        setUtilities(response.data);
      } catch (error) {
        console.error('Error fetching utilities', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUtilities();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <Wrench className="w-5 h-5 mr-2 text-indigo-500" />
            Utilities Dashboard
          </h2>
          <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">
            {utilities.length} Utilities
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Category
            </label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2 px-3 border bg-white text-slate-700"
            >
              <option value="">All Categories</option>
              <option value="PROJECTOR">Projector</option>
              <option value="SOUND_SYSTEM">Sound System</option>
              <option value="MICROPHONE">Microphone</option>
              <option value="SMART_BOARD">Smart Board</option>
              <option value="DISPLAY_SCREEN">Display Screen</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Status
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2 px-3 border bg-white text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="OUT_OF_SERVICE">Out of Service</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Assigned Location
            </label>
            <input
              type="text"
              name="assignedLocation"
              value={filters.assignedLocation}
              onChange={handleFilterChange}
              placeholder="Search by location..."
              className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2 px-3 border bg-white text-slate-700 placeholder-slate-400"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 text-slate-500">
          <Filter className="w-8 h-8 animate-pulse" />
        </div>
      ) : utilities.length === 0 ? (
        <div className="bg-white p-16 text-center rounded-xl shadow-sm border border-slate-200">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No utilities found</h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            Add a projector, sound system, or another utility to start tracking utility inventory.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
          {utilities.map((utility) => (
            <UtilityCard key={utility.id} utility={utility} />
          ))}
        </div>
      )}
    </div>
  );
}
