import { useState } from 'react';
import { AlertCircle, Building2, Loader2, Plus, RefreshCw, Search, SlidersHorizontal } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import ResourceCard from '../../components/admin/ResourceCard';
import AddResourceModal from '../../components/admin/AddResourceModal';
import { useBooking } from '../../context/BookingContext';

const API_BASE_URL = 'http://localhost:8080';
const BLOCK_OPTIONS = ['A', 'B', 'C'];

const getCanonicalType = (resource) => {
  const rawType = (resource.resourceType || resource.type || '').toString().trim().toLowerCase();

  if (rawType === 'lab') return 'Lab';
  if (rawType === 'meeting room') return 'Meeting Room';
  if (rawType === 'lecture room' || rawType === 'room') return 'Lecture Room';

  return resource.resourceType || resource.type || '';
};

export default function Resources() {
  const {
    resources,
    fetchResources: refreshSharedResources,
    resourcesLoading,
    resourcesError,
  } = useBooking();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
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

  const handleSaveResource = async (resourceData) => {
    try {
      setSaving(true);
      setError('');

      const isEditing = Boolean(editingResource);
      const response = await fetch(
        `${API_BASE_URL}/api/resources${isEditing ? `/${editingResource.id}` : ''}`,
        {
          method: isEditing ? 'PUT' : 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(resourceData),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to save resource: ${response.status}`);
      }

      await refreshSharedResources();
      setEditingResource(null);
      return true;
    } catch (saveError) {
      console.error('Error saving resource:', saveError);
      setError('Unable to save the resource. Please try again.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleEditResource = (resource) => {
    setError('');
    setEditingResource(resource);
    setShowModal(true);
  };

  const handleDeleteResource = async (resource) => {
    const confirmed = window.confirm(`Delete "${resource.resourceName}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      setDeletingId(resource.id);
      setError('');

      const response = await fetch(`${API_BASE_URL}/api/resources/${resource.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete resource: ${response.status}`);
      }

      await refreshSharedResources();
    } catch (deleteError) {
      console.error('Error deleting resource:', deleteError);
      setError('Unable to delete the resource. Please try again.');
    } finally {
      setDeletingId('');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingResource(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Header />

        <div className="p-4 lg:p-6 space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Resources</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {resources.length} campus resource{resources.length !== 1 ? 's' : ''} available in the system
              </p>
            </div>

            <button
              onClick={() => {
                setEditingResource(null);
                setShowModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white hover:from-[#172554] hover:to-[#1D4ED8] shadow-[0_4px_12px_rgba(37,99,235,0.3)] border-t border-white/20 rounded-xl transition-all text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Resource
            </button>
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
                  The portal couldn&apos;t reach the resources API. Please make sure the backend is running and try again.
                </p>
                <button
                  onClick={refreshSharedResources}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-white px-4 py-2.5 text-sm font-medium text-[#1E3A8A] shadow-sm transition-all hover:bg-blue-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </button>
              </div>
            ) : resourcesLoading ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
                <p className="text-sm">Loading resources...</p>
              </div>
            ) : resources.length === 0 ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-[24px] bg-slate-50 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#2563EB]">
                  <Building2 className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-base font-medium text-slate-700">No resources available yet</p>
                  <p className="mt-1 text-sm text-slate-400">Add the first campus resource to populate this module.</p>
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
                          className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-700 shadow-sm outline-none transition-all focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                      Showing <span className="font-semibold text-[#1E3A8A]">{filteredResources.length}</span> of{' '}
                      <span className="font-semibold text-slate-700">{resources.length}</span> resources
                    </div>
                  </div>

                  <div className="mt-5 rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-600">
                      <SlidersHorizontal className="h-4 w-4 text-[#2563EB]" />
                      Filter Resources
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-medium text-slate-500">Status</span>
                        <select
                          value={statusFilter}
                          onChange={(event) => setStatusFilter(event.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-slate-50 px-3.5 py-2.5 text-sm text-gray-700 outline-none transition-all focus:border-[#2563EB] focus:bg-white focus:ring-4 focus:ring-[#2563EB]/10"
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
                          className="w-full rounded-xl border border-gray-200 bg-slate-50 px-3.5 py-2.5 text-sm text-gray-700 outline-none transition-all focus:border-[#2563EB] focus:bg-white focus:ring-4 focus:ring-[#2563EB]/10"
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
                          className="w-full rounded-xl border border-gray-200 bg-slate-50 px-3.5 py-2.5 text-sm text-gray-700 outline-none transition-all focus:border-[#2563EB] focus:bg-white focus:ring-4 focus:ring-[#2563EB]/10"
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
                          className="w-full rounded-xl border border-gray-200 bg-slate-50 px-3.5 py-2.5 text-sm text-gray-700 outline-none transition-all focus:border-[#2563EB] focus:bg-white focus:ring-4 focus:ring-[#2563EB]/10"
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
                          className="w-full rounded-xl border border-gray-200 bg-slate-50 px-3.5 py-2.5 text-sm text-gray-700 outline-none transition-all focus:border-[#2563EB] focus:bg-white focus:ring-4 focus:ring-[#2563EB]/10"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {filteredResources.length === 0 ? (
                  <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[24px] bg-slate-50 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#2563EB]">
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
                        deleting={deletingId === resource.id}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <AddResourceModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={handleSaveResource}
        saving={saving}
        initialData={editingResource}
        mode={editingResource ? 'edit' : 'create'}
      />
    </div>
  );
}
