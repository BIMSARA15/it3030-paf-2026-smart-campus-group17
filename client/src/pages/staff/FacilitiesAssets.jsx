import React, { useState } from 'react';
import { AlertCircle, Building2, Loader2, RefreshCw, Search, SlidersHorizontal, ShieldAlert } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import ResourceCard from '../../components/admin/ResourceCard';
import { useBooking } from '../../context/BookingContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const BLOCK_OPTIONS = ['A', 'B', 'C'];

const getCanonicalType = (resource) => {
  const rawType = (resource.resourceType || resource.type || '').toString().trim().toLowerCase();
  if (rawType === 'lab') return 'Lab';
  if (rawType === 'meeting room') return 'Meeting Room';
  if (rawType === 'lecture room' || rawType === 'room') return 'Lecture Room';
  return resource.resourceType || resource.type || '';
};

export default function FacilitiesAssets() {
  const {
    resources,
    fetchResources: refreshSharedResources,
    resourcesLoading,
    resourcesError,
  } = useBooking();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Custom State for the Technician Status Modal
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [accessFilter, setAccessFilter] = useState('All');
  const [blockFilter, setBlockFilter] = useState('All');
  const [minCapacityFilter, setMinCapacityFilter] = useState('');

  const filteredResources = resources.filter((resource) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      query === '' ||
      resource.resourceName.toLowerCase().includes(query) ||
      resource.resourceCode.toLowerCase().includes(query) ||
      resource.block.toLowerCase().includes(query) ||
      resource.level.toLowerCase().includes(query) ||
      resource.description.toLowerCase().includes(query) ||
      resource.features.some((feature) => feature.toLowerCase().includes(query));

    const matchesStatus = statusFilter === 'All' || resource.status === statusFilter;
    const matchesType = typeFilter === 'All' || getCanonicalType(resource) === typeFilter;
    const matchesAccess = accessFilter === 'All' || resource.access === accessFilter;
    const matchesBlock =
      blockFilter === 'All' ||
      resource.block === blockFilter ||
      resource.block === `Block ${blockFilter}`;
    const minCapacity = Number(minCapacityFilter);
    const matchesCapacity =
      minCapacityFilter.trim() === '' ||
      (!Number.isNaN(minCapacity) && Number(resource.capacity) >= minCapacity);

    return matchesSearch && matchesStatus && matchesType && matchesAccess && matchesBlock && matchesCapacity;
  });

  const statusOptions = ['All', 'Available', 'Not Available', 'Out Of Service'];
  const typeOptions = ['All', 'Lecture Room', 'Lab', 'Meeting Room'];
  const accessOptions = ['All', 'Lecturer', 'Student', 'Anyone'];
  const blockOptions = ['All', ...BLOCK_OPTIONS];

  // Restrict Deletion for Technicians
  const handleDeleteResource = () => {
    alert("Action Denied: Technicians are not authorized to delete facility records. Please contact an Administrator.");
  };

  // Open the lightweight status-only modal
  const handleEditResource = (resource) => {
    setError('');
    setEditingResource(resource);
    setNewStatus(resource.status || 'Available');
    setShowModal(true);
  };

  // Save only the modified status back to the database
  const handleSaveStatus = async () => {
    try {
      setSaving(true);
      setError('');

      // Create a copy of the resource, but only alter the status
      const updatedResource = { ...editingResource, status: newStatus };

      const response = await fetch(`${API_BASE_URL}/api/resources/${editingResource.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedResource),
      });

      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.status}`);
      }

      await refreshSharedResources();
      setShowModal(false);
      setEditingResource(null);
    } catch (saveError) {
      console.error('Error saving resource status:', saveError);
      setError('Unable to update the asset status. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Header />

        <div className="p-4 lg:p-6 space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Facilities & Assets</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage and monitor the status of {resources.length} campus assets.
              </p>
            </div>
            {/* The "Add Resource" button has been intentionally removed for Technicians */}
          </div>

          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.05)] sm:p-6 lg:p-8">
            {resourcesError ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[24px] border border-red-100 bg-red-50/60 px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-red-500 shadow-sm">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">Unable to load resources right now</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  The portal couldn't reach the resources API. Please make sure the backend is running and try again.
                </p>
                <button
                  onClick={refreshSharedResources}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-[#2F3A52] shadow-sm transition-all hover:bg-slate-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </button>
              </div>
            ) : resourcesLoading ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin text-[#2F3A52]" />
                <p className="text-sm">Loading resources...</p>
              </div>
            ) : resources.length === 0 ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-[24px] bg-slate-50 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-[#2F3A52]">
                  <Building2 className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-base font-medium text-slate-700">No resources available yet</p>
                  <p className="mt-1 text-sm text-slate-400">Administrators need to add campus resources first.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div className="w-full lg:max-w-3xl">
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Search Resources
                      </label>
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={search}
                          onChange={(event) => setSearch(event.target.value)}
                          placeholder="Search by name, code, block, level, or feature..."
                          className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-700 shadow-sm outline-none transition-all focus:border-[#2F3A52] focus:ring-4 focus:ring-[#2F3A52]/10"
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                      Showing <span className="font-semibold text-[#2F3A52]">{filteredResources.length}</span> of{' '}
                      <span className="font-semibold text-slate-700">{resources.length}</span> resources
                    </div>
                  </div>

                  <div className="mt-5 rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-600">
                      <SlidersHorizontal className="h-4 w-4 text-[#2F3A52]" />
                      Filter Resources
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-medium text-slate-500">Status</span>
                        <select
                          value={statusFilter}
                          onChange={(event) => setStatusFilter(event.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-slate-50 px-3.5 py-2.5 text-sm text-gray-700 outline-none transition-all focus:border-[#2F3A52] focus:bg-white focus:ring-4 focus:ring-[#2F3A52]/10"
                        >
                          {statusOptions.map((option) => (
                            <option key={option} value={option}>
                              {option === 'All' ? 'All Statuses' : option}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-xs font-medium text-slate-500">Type</span>
                        <select
                          value={typeFilter}
                          onChange={(event) => setTypeFilter(event.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-slate-50 px-3.5 py-2.5 text-sm text-gray-700 outline-none transition-all focus:border-[#2F3A52] focus:bg-white focus:ring-4 focus:ring-[#2F3A52]/10"
                        >
                          {typeOptions.map((option) => (
                            <option key={option} value={option}>
                              {option === 'All' ? 'All Types' : option}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-xs font-medium text-slate-500">Access</span>
                        <select
                          value={accessFilter}
                          onChange={(event) => setAccessFilter(event.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-slate-50 px-3.5 py-2.5 text-sm text-gray-700 outline-none transition-all focus:border-[#2F3A52] focus:bg-white focus:ring-4 focus:ring-[#2F3A52]/10"
                        >
                          {accessOptions.map((option) => (
                            <option key={option} value={option}>
                              {option === 'All' ? 'All Access' : option}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-xs font-medium text-slate-500">Block</span>
                        <select
                          value={blockFilter}
                          onChange={(event) => setBlockFilter(event.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-slate-50 px-3.5 py-2.5 text-sm text-gray-700 outline-none transition-all focus:border-[#2F3A52] focus:bg-white focus:ring-4 focus:ring-[#2F3A52]/10"
                        >
                          {blockOptions.map((option) => (
                            <option key={option} value={option}>
                              {option === 'All' ? 'All Blocks' : `Block ${option}`}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-xs font-medium text-slate-500">Capacity</span>
                        <input
                          type="number"
                          min="1"
                          value={minCapacityFilter}
                          onChange={(event) => setMinCapacityFilter(event.target.value)}
                          placeholder="Minimum"
                          className="w-full rounded-xl border border-gray-200 bg-slate-50 px-3.5 py-2.5 text-sm text-gray-700 outline-none transition-all focus:border-[#2F3A52] focus:bg-white focus:ring-4 focus:ring-[#2F3A52]/10"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {filteredResources.length === 0 ? (
                  <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[24px] bg-slate-50 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-[#2F3A52]">
                      <Search className="h-6 w-6" />
                    </div>
                    <div className="mt-4">
                      <p className="text-base font-medium text-slate-700">No resources match your filters</p>
                      <p className="mt-1 text-sm text-slate-400">Try changing the search text or filter values.</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {filteredResources.map((resource) => (
                      <ResourceCard
                        key={resource.id}
                        resource={resource}
                        onEdit={handleEditResource}
                        onDelete={handleDeleteResource}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Technician Status-Only Update Modal */}
      {showModal && editingResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative z-10 w-full max-w-md bg-white rounded-[24px] shadow-2xl p-6 border border-white/60 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#2F3A52]">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Update Asset Status</h3>
                <p className="text-xs text-slate-500">{editingResource.resourceName} ({editingResource.resourceCode})</p>
              </div>
            </div>
            
            <div className="mb-6 bg-amber-50 border border-amber-100 p-3 rounded-xl">
              <p className="text-xs text-amber-800">
                Technicians are restricted to updating availability statuses. Other details must be changed by an Administrator.
              </p>
            </div>

            <label className="block text-sm font-medium text-slate-700 mb-2">Current Status</label>
            <select 
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-slate-50 px-3.5 py-3 text-sm text-gray-700 outline-none transition-all focus:border-[#2F3A52] focus:bg-white focus:ring-4 focus:ring-[#2F3A52]/10 mb-6"
            >
              <option value="Available">Available</option>
              <option value="Not Available">Not Available</option>
              <option value="Out Of Service">Out Of Service</option>
            </select>

            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowModal(false)} 
                className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-xl font-medium text-sm transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveStatus} 
                disabled={saving} 
                className="px-5 py-2.5 bg-gradient-to-r from-[#2F3A52] to-[#1F2937] text-white rounded-xl flex items-center gap-2 font-medium text-sm shadow-md hover:from-[#1F2937] hover:to-[#111827] transition-all disabled:opacity-70"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} 
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}