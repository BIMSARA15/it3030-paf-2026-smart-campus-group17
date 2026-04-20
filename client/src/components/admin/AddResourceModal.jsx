import { useEffect, useMemo, useState } from 'react';
import { Building2, Loader2, ShieldCheck, Sparkles, Users, X } from 'lucide-react';

const TYPE_OPTIONS = ['Lecture Room', 'Lab', 'Meeting Room'];
const FEATURE_OPTIONS = ['Air Conditioning', 'Audio System', 'Projector'];
const ACCESS_OPTIONS = ['Lecturer', 'Student', 'Anyone'];
const STATUS_OPTIONS = ['Available', 'Not Available', 'Out Of Service'];

const INITIAL_FORM = {
  resourceCode: '',
  resourceName: '',
  block: '',
  level: '',
  capacity: '',
  type: TYPE_OPTIONS[0],
  features: [],
  status: STATUS_OPTIONS[0],
  access: ACCESS_OPTIONS[0],
  description: '',
};

export default function AddResourceModal({ isOpen, onClose, onSave, saving, initialData, mode = 'create' }) {
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
        resourceCode: initialData.resourceCode || '',
        resourceName: initialData.resourceName || '',
        block: initialData.block || '',
        level: initialData.level || '',
        capacity: initialData.capacity || '',
        type: initialData.type || TYPE_OPTIONS[0],
        features: Array.isArray(initialData.features) ? initialData.features : [],
        status: initialData.status || STATUS_OPTIONS[0],
        access: initialData.access || ACCESS_OPTIONS[0],
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

  const toggleFeature = (feature) => {
    const nextFeatures = form.features.includes(feature)
      ? form.features.filter((item) => item !== feature)
      : [...form.features, feature];

    updateField('features', nextFeatures);
  };

  const resetAndClose = () => {
    setForm(INITIAL_FORM);
    setError('');
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.resourceName.trim() ||
      !form.resourceCode.trim() ||
      !form.block.trim() ||
      !form.level.toString().trim() ||
      !form.capacity ||
      Number(form.capacity) <= 0
    ) {
      setError('Please complete all required fields before saving.');
      return;
    }

    setError('');

    const success = await onSave({
      resourceCode: form.resourceCode.trim().toUpperCase(),
      resourceName: form.resourceName.trim(),
      block: form.block.trim(),
      level: form.level.toString().trim(),
      capacity: Number(form.capacity),
      type: form.type,
      features: form.features,
      status: form.status,
      access: form.access,
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
                <Building2 className="h-6 w-6" />
              </div>
              <h2 className="mt-6 text-2xl font-semibold">{mode === 'edit' ? 'Edit Resource' : 'Add Resource'}</h2>
              <p className="mt-2 max-w-xs text-sm leading-6 text-blue-50/90">
                {mode === 'edit'
                  ? 'Update this campus space and keep the catalog accurate across the portal.'
                  : 'Create a new campus space and make it immediately available across the portal.'}
              </p>

              <div className="mt-8 space-y-3">
                <div className="flex items-start gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-white" />
                  <div>
                    <p className="text-sm font-medium">Consistent catalog</p>
                    <p className="mt-1 text-xs text-blue-50/80">Saved resources appear after refresh and stay backed by MongoDB.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <Users className="mt-0.5 h-4 w-4 flex-shrink-0 text-white" />
                  <div>
                    <p className="text-sm font-medium">Capacity-aware</p>
                    <p className="mt-1 text-xs text-blue-50/80">Room size and amenities stay visible to staff and students.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-white" />
                  <div>
                    <p className="text-sm font-medium">Access rules</p>
                    <p className="mt-1 text-xs text-blue-50/80">Set who can use each resource right from the creation flow.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex min-h-0 flex-col">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-[#2563EB]">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Resource Details</h3>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {mode === 'edit' ? 'Update the information below.' : 'Fill in the core information below.'}
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
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Resource Code</label>
                    <input
                      type="text"
                      value={form.resourceCode}
                      onChange={(event) => updateField('resourceCode', event.target.value)}
                      className={inputClass}
                      placeholder="A-101"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Resource Name</label>
                    <input
                      type="text"
                      value={form.resourceName}
                      onChange={(event) => updateField('resourceName', event.target.value)}
                      className={inputClass}
                      placeholder="Lecture Hall A"
                    />
                  </div>

                  <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Block</label>
                      <input
                        type="text"
                        value={form.block}
                        onChange={(event) => updateField('block', event.target.value)}
                        className={inputClass}
                        placeholder="A"
                    />
                  </div>

                  <div className="sm:col-span-1">
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Level</label>
                      <input
                        type="text"
                        value={form.level}
                        onChange={(event) => updateField('level', event.target.value)}
                        className={inputClass}
                        placeholder="1"
                    />
                  </div>

                  <div className="sm:col-span-1">
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Capacity</label>
                      <input
                        type="number"
                        min="1"
                        value={form.capacity}
                        onChange={(event) => updateField('capacity', event.target.value)}
                        className={inputClass}
                        placeholder="200"
                    />
                  </div>

                  <div className="sm:col-span-1">
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Type</label>
                      <select
                        value={form.type}
                        onChange={(event) => updateField('type', event.target.value)}
                        className={inputClass}
                      >
                      {TYPE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-1">
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

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
                    <textarea
                      rows={4}
                      value={form.description}
                      onChange={(event) => updateField('description', event.target.value)}
                      className={`${inputClass} resize-none`}
                      placeholder="Add any details about the space, equipment setup, usage notes, or special instructions."
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Access</label>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {ACCESS_OPTIONS.map((option) => {
                        const selected = form.access === option;

                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => updateField('access', option)}
                            className={`rounded-2xl border px-4 py-3 text-sm font-medium transition-all ${
                              selected
                                ? 'border-blue-200 bg-blue-50 text-[#1E3A8A] shadow-sm'
                                : 'border-gray-200 bg-gray-50 text-slate-600 hover:border-blue-100 hover:bg-blue-50/60'
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                  <label className="mb-3 block text-sm font-medium text-slate-700">Features</label>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {FEATURE_OPTIONS.map((feature) => {
                      const checked = form.features.includes(feature);

                      return (
                        <label
                          key={feature}
                          className={`flex cursor-pointer items-center gap-2 rounded-2xl border px-3.5 py-3 text-sm transition-all ${
                            checked
                              ? 'border-blue-200 bg-blue-50 text-[#1E3A8A]'
                              : 'border-gray-200 bg-white text-slate-600 hover:border-blue-100 hover:bg-blue-50/60'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleFeature(feature)}
                            className="h-4 w-4 rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB]/30"
                          />
                          <span>{feature}</span>
                        </label>
                      );
                    })}
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
