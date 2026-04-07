import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUtility } from '../services/api';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';

export default function UtilityForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    utilityCode: '',
    category: 'PROJECTOR',
    assignedLocation: '',
    quantity: 1,
    status: 'ACTIVE',
    description: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await createUtility({
        ...formData,
        quantity: Number.parseInt(formData.quantity, 10),
      });
      navigate('/utilities');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to save utility';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Add Utility</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Utility Name *</label>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2 px-3 border"
                placeholder="e.g. Epson Projector"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Utility Code *</label>
              <input
                required
                type="text"
                name="utilityCode"
                value={formData.utilityCode}
                onChange={handleChange}
                className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2 px-3 border"
                placeholder="e.g. PROJ-01"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category *</label>
              <select
                required
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2 px-3 border"
              >
                <option value="PROJECTOR">Projector</option>
                <option value="SOUND_SYSTEM">Sound System</option>
                <option value="MICROPHONE">Microphone</option>
                <option value="SMART_BOARD">Smart Board</option>
                <option value="DISPLAY_SCREEN">Display Screen</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Assigned Location</label>
              <input
                type="text"
                name="assignedLocation"
                value={formData.assignedLocation}
                onChange={handleChange}
                className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2 px-3 border"
                placeholder="e.g. Auditorium A"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Quantity *</label>
              <input
                required
                type="number"
                min="1"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2 px-3 border"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status *</label>
              <select
                required
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2 px-3 border"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="OUT_OF_SERVICE">Out of Service</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2 px-3 border"
                placeholder="Optional notes about the utility or its setup."
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Create Utility
          </button>
        </div>
      </form>
    </div>
  );
}
