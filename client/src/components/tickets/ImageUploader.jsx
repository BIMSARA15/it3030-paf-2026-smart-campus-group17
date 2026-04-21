import { useState } from "react";
import { Plus, X, Image as ImageIcon } from "lucide-react";

/**
 * Lightweight image-URL list (no real file upload backend yet).
 * Caps the gallery at MAX images (default 3) to match the backend rule.
 *
 * Props:
 *   value     : string[]            current list of URLs
 *   onChange  : (string[]) => void  updates parent state
 *   max       : number              hard cap (default 3)
 */
export default function ImageUploader({ value = [], onChange, max = 3 }) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const url = draft.trim();
    if (!url) return;
    if (value.length >= max) return;
    onChange([...value, url]);
    setDraft("");
  };

  const remove = (idx) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
        Image Attachments (up to {max})
      </label>

      <div className="flex gap-2">
        <input
          type="url"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Paste image URL..."
          disabled={value.length >= max}
          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:bg-slate-50"
        />
        <button
          type="button"
          onClick={add}
          disabled={!draft || value.length >= max}
          className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold disabled:opacity-50"
        >
          Add
        </button>
      </div>

      {value.length === max && (
        <p className="text-xs text-amber-600 mt-1.5">
          Maximum of {max} images reached.
        </p>
      )}

      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {value.map((url, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-50 group">
              <img
                src={url}
                alt={`attachment ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-slate-300 -z-10">
                <ImageIcon className="w-8 h-8" />
              </div>
              <button
                type="button"
                onClick={() => remove(idx)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {value.length < max && (
            <div className="aspect-square rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300">
              <Plus className="w-6 h-6" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
