import { useState } from "react";
import { X } from "lucide-react";
import ImageUploader from "./ImageUploader";
import { createTicket } from "../../services/ticketService";
import { RESOURCES } from "../../data/resources";
import { useAuth } from "../../context/AuthContext";

const CATEGORIES = ["IT_EQUIPMENT", "FURNITURE", "HVAC", "ELECTRICAL", "SAFETY", "OTHER"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function ReportIssueModal({ onClose, onCreated }) {
  const { user } = useAuth();
  const isLecturer = (user?.role || '').toUpperCase() === 'LECTURER';

  const themeClasses = {
    focusRing: isLecturer 
      ? "focus:ring-[#C54E08]/30 focus:border-[#C54E08]" 
      : "focus:ring-[#17A38A]/30 focus:border-[#17A38A]",
    submitBtn: isLecturer
      ? "bg-gradient-to-r from-[#8A3505] to-[#C54E08] hover:from-[#702A04] hover:to-[#A74106]"
      : "bg-gradient-to-r from-[#0F6657] to-[#17A38A] hover:from-[#0c5246] hover:to-[#128a74]",
  };

  const [resourceId, setResourceId] = useState(RESOURCES?.id || "");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [priority, setPriority] = useState("MEDIUM");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [imageUrls, setImageUrls] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Description is required.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const resourceLabel = RESOURCES.find((r) => r.id === resourceId)?.label || resourceId;
      const created = await createTicket({
        title: `[${category.replace("_", " ")}] ${resourceLabel}`,
        description: description.trim(),
        priority,
        category,
        resourceId,
        contactInfo: contact || undefined,
        imageUrls,
      });
      onCreated?.(created);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit ticket");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-8">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">Report a Maintenance Issue</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Resource / Location *
            </label>
            <select
              required
              value={resourceId}
              onChange={(e) => setResourceId(e.target.value)}
              className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${themeClasses.focusRing}`}
            >
              {RESOURCES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${themeClasses.focusRing}`}
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Priority *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${themeClasses.focusRing}`}
              >
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description *</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe the issue in detail..."
              className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${themeClasses.focusRing}`}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contact Info *</label>
            <input
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="email@northridge.edu | Ext: 0000"
              className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${themeClasses.focusRing}`}
            />
          </div>

          <ImageUploader value={imageUrls} onChange={setImageUrls} max={3} />

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className={`py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-all border-t border-white/20 shadow-sm ${themeClasses.submitBtn}`}
            >
              {busy ? "Submitting..." : "Submit Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
