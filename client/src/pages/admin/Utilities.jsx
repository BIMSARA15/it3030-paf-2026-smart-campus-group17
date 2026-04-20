import { useEffect, useState } from 'react';
import { AlertCircle, Loader2, Package, Plus, RefreshCw } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import UtilityCard from '../../components/admin/UtilityCard';
import AddUtilityModal from '../../components/admin/AddUtilityModal';

const API_BASE_URL = 'http://localhost:8080';

export default function Utilities() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [utilities, setUtilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUtility, setEditingUtility] = useState(null);

  const loadUtilities = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/utilities`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch utilities: ${response.status}`);
      }

      const data = await response.json();
      setUtilities(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      console.error('Error loading utilities:', fetchError);
      setError('Unable to load utilities right now.');
      setUtilities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUtilities();
  }, []);

  const handleSaveUtility = async (utilityData) => {
    try {
      setSaving(true);
      setError('');

      const isEditing = Boolean(editingUtility);
      const response = await fetch(
        `${API_BASE_URL}/api/utilities${isEditing ? `/${editingUtility.id}` : ''}`,
        {
          method: isEditing ? 'PUT' : 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(utilityData),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to save utility: ${response.status}`);
      }

      await loadUtilities();
      setEditingUtility(null);
      return true;
    } catch (saveError) {
      console.error('Error saving utility:', saveError);
      setError('Unable to save the utility. Please try again.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleEditUtility = (utility) => {
    setError('');
    setEditingUtility(utility);
    setShowModal(true);
  };

  const handleDeleteUtility = async (utility) => {
    const confirmed = window.confirm(`Delete "${utility.utilityName}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      setDeletingId(utility.id);
      setError('');

      const response = await fetch(`${API_BASE_URL}/api/utilities/${utility.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete utility: ${response.status}`);
      }

      await loadUtilities();
    } catch (deleteError) {
      console.error('Error deleting utility:', deleteError);
      setError('Unable to delete the utility. Please try again.');
    } finally {
      setDeletingId('');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUtility(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Header />

        <div className="p-4 lg:p-6 space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Utilities</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {utilities.length} utility item{utilities.length !== 1 ? 's' : ''} available in the system
              </p>
            </div>

            <button
              onClick={() => {
                setEditingUtility(null);
                setShowModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white hover:from-[#172554] hover:to-[#1D4ED8] shadow-[0_4px_12px_rgba(37,99,235,0.3)] border-t border-white/20 rounded-xl transition-all text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Utility
            </button>
          </div>

          {error && !loading && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.05)] sm:p-6 lg:p-8">
            {error && loading === false && utilities.length === 0 ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[24px] border border-red-100 bg-red-50/60 px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-red-500 shadow-sm">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">Unable to load utilities right now</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  The portal couldn&apos;t reach the utilities API. Please make sure the backend is running and try again.
                </p>
                <button
                  onClick={loadUtilities}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-white px-4 py-2.5 text-sm font-medium text-[#1E3A8A] shadow-sm transition-all hover:bg-blue-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </button>
              </div>
            ) : loading ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
                <p className="text-sm">Loading utilities...</p>
              </div>
            ) : utilities.length === 0 ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-[24px] bg-slate-50 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#2563EB]">
                  <Package className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-base font-medium text-slate-700">No utilities available yet</p>
                  <p className="mt-1 text-sm text-slate-400">Add the first utility item to populate this module.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {utilities.map((utility) => (
                  <UtilityCard
                    key={utility.id}
                    utility={utility}
                    onEdit={handleEditUtility}
                    onDelete={handleDeleteUtility}
                    deleting={deletingId === utility.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AddUtilityModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={handleSaveUtility}
        saving={saving}
        initialData={editingUtility}
        mode={editingUtility ? 'edit' : 'create'}
      />
    </div>
  );
}
