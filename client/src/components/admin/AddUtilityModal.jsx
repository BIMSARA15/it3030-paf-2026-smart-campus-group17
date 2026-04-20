import { useEffect, useMemo, useState } from 'react';
import { Loader2, Package, Sparkles, Wrench, X } from 'lucide-react';

const CATEGORY_OPTIONS = ['Projector', 'Sound System', 'Microphone', 'Printer'];
const STATUS_OPTIONS = ['Available', 'In Use', 'Maintenance'];

const INITIAL_FORM = {
  utilityCode: '',
  utilityName: '',
  category: CATEGORY_OPTIONS[0],
  quantity: '',
  status: STATUS_OPTIONS[0],
  location: '',
  description: '',
};

export default function AddUtilityModal({ isOpen, onClose, onSave, saving, initialData, mode = 'create' }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');

  const inputClass = useMemo(
    () => 'w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-700 outline-none transition-all focus:border-[#2563EB] focus:bg-white focus:ring-4 focus:ring-[#2563EB]/10',
    []
  );

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setForm({
        utilityCode: initialData.utilityCode || '',
        utilityName: initialData.utilityName || '',
        category: initialData.category || CATEGORY_OPTIONS[0],
        quantity: initialData.quantity || '',
        status: initialData.status || STATUS_OPTIONS[0],
        location: initialData.location || '',
        description: initialData.description || '',
      });
    } else {
      setForm(INITIAL_FORM);
    }

    setError('');
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetAndClose = () => {
    setForm(INITIAL_FORM);
    setError('');
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.utilityCode.trim() ||
      !form.utilityName.trim() ||
      !form.category.trim() ||
      !form.quantity ||
      Number(form.quantity) <= 0 ||
      !form.status.trim() ||
      !form.location.trim()
    ) {
      setError('Please complete all required fields before saving.');
      return;
    }

    setError('');

    const success = await onSave({
      utilityCode: form.utilityCode.trim().toUpperCase(),
      utilityName: form.utilityName.trim(),
      category: form.category,
      quantity: Number(form.quantity),
      status: form.status,
      location: form.location.trim(),
      description: form.description.trim(),
    });

    if (success) {
      setForm(INITIAL_FORM);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={resetAndClose} />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[32px] border border-white/60 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.2)]">
        <div className="grid min-h-0 flex-1 lg:grid-cols-[1.1fr_1.6fr]">
          <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#60A5FA] px-6 py-7 text-white sm:px-7 lg:block">
            <div className="absolute right-0 top-0 h-40 w-40 translate-x-10 -translate-y-10 rounded-full bg-white/10" />
            <div className="absolute bottom-0 left-0 h-28 w-28 -translate-x-8 translate-y-8 rounded-full bg-white/10" />
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <Package className="h-6 w-6" />
              </div>
              <h2 className="mt-6 text-2xl font-semibold">{mode === 'edit' ? 'Edit Utility' : 'Add Utility'}</h2>
              <p className="mt-2 max-w-xs text-sm leading-6 text-blue-50/90">
                {mode === 'edit'
                  ? 'Update utility inventory details and keep the admin catalog current.'
                  : 'Add campus utilities like projectors, sound systems, mics, and printers.'}
              </p>

              <div className="mt-8 space-y-3">
                <div className="flex items-start gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-white" />
                  <div>
                    <p className="text-sm font-medium">Inventory ready</p>
                    <p className="mt-1 text-xs text-blue-50/80">Track utilities in one place with quantity and status details.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <Wrench className="mt-0.5 h-4 w-4 flex-shrink-0 text-white" />
                  <div>
                    <p className="text-sm font-medium">Maintenance friendly</p>
                    <p className="mt-1 text-xs text-blue-50/80">Mark equipment as available, in use, or under maintenance.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex min-h-0 flex-col">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-[#2563EB]">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Utility Details</h3>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {mode === 'edit' ? 'Update the information below.' : 'Fill in the utility information below.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={resetAndClose}
                className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 sm:px-7">
                <div className="grid gap-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Utility Code</label>
                      <input
                        type="text"
                        value={form.utilityCode}
                        onChange={(event) => updateField('utilityCode', event.target.value)}
                        className={inputClass}
                        placeholder="UT-001"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Utility Name</label>
                      <input
                        type="text"
                        value={form.utilityName}
                        onChange={(event) => updateField('utilityName', event.target.value)}
                        className={inputClass}
                        placeholder="Main Hall Projector"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Category</label>
                      <select
                        value={form.category}
                        onChange={(event) => updateField('category', event.target.value)}
                        className={inputClass}
                      >
                        {CATEGORY_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={form.quantity}
                        onChange={(event) => updateField('quantity', event.target.value)}
                        className={inputClass}
                        placeholder="1"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
                      <select
                        value={form.status}
                        onChange={(event) => updateField('status', event.target.value)}
                        className={inputClass}
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Location</label>
                      <input
                        type="text"
                        value={form.location}
                        onChange={(event) => updateField('location', event.target.value)}
                        className={inputClass}
                        placeholder="Media Room"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
                      <textarea
                        rows={4}
                        value={form.description}
                        onChange={(event) => updateField('description', event.target.value)}
                        className={`${inputClass} resize-none`}
                        placeholder="Add any notes about the utility, accessories, condition, or intended usage."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mx-6 mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 sm:mx-7">
                  {error}
                </div>
              )}

              <div className="mt-4 flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-5 sm:px-7 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] px-4 py-2.5 text-sm font-medium text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)] border-t border-white/20 transition-all hover:from-[#172554] hover:to-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {mode === 'edit' ? 'Save Changes' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
