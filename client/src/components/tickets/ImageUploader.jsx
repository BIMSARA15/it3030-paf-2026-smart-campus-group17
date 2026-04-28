import { useState } from "react";
import { Plus, X, Image as ImageIcon } from "lucide-react";

/**
 * Lightweight image file uploader using data URLs.
 * Caps the gallery at MAX images (default 3) to match the backend rule.
 *
 * Props:
 *   value     : string[]            current list of image data URLs
 *   onChange  : (string[]) => void  updates parent state
 *   max       : number              hard cap (default 3)
 */
const ONE_MB = 1024 * 1024;
const MAX_IMAGE_WIDTH = 1280;
const MAX_IMAGE_HEIGHT = 1280;

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read image file."));
    reader.readAsDataURL(file);
  });
}

function getDataUrlByteSize(dataUrl) {
  const base64 = String(dataUrl).split(",")[1] || "";
  return Math.ceil((base64.length * 3) / 4);
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Unable to process image file."));
    img.src = dataUrl;
  });
}

async function compressImage(dataUrl) {
  const img = await loadImage(dataUrl);
  const ratio = Math.min(1, MAX_IMAGE_WIDTH / img.width, MAX_IMAGE_HEIGHT / img.height);
  const width = Math.max(1, Math.round(img.width * ratio));
  const height = Math.max(1, Math.round(img.height * ratio));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, width, height);

  let quality = 0.82;
  let compressed = canvas.toDataURL("image/jpeg", quality);
  while (getDataUrlByteSize(compressed) > ONE_MB && quality > 0.45) {
    quality -= 0.1;
    compressed = canvas.toDataURL("image/jpeg", quality);
  }

  return compressed;
}

export default function ImageUploader({ value = [], onChange, max = 3 }) {
  const [error, setError] = useState("");

  const handleFiles = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = "";
    setError("");

    if (!selectedFiles.length) return;

    const remainingSlots = max - value.length;
    if (remainingSlots <= 0) {
      setError(`Maximum of ${max} images reached.`);
      return;
    }

    const invalidFile = selectedFiles.find((file) => !file.type.startsWith("image/"));
    if (invalidFile) {
      setError("Please upload image files only.");
      return;
    }

    const filesToAdd = selectedFiles.slice(0, remainingSlots);
    if (selectedFiles.length > remainingSlots) {
      setError(`Only ${remainingSlots} more image${remainingSlots === 1 ? "" : "s"} can be added.`);
    }

    try {
      const dataUrls = await Promise.all(
        filesToAdd.map(async (file) => {
          const dataUrl = await readAsDataUrl(file);
          if (file.size <= ONE_MB) return dataUrl;
          return compressImage(dataUrl);
        })
      );
      onChange([...value, ...dataUrls].slice(0, max));
    } catch (err) {
      setError(err.message || "Unable to upload one or more images.");
    }
  };

  const remove = (idx) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
        Upload Photos (up to {max})
      </label>

      <div className="flex items-center gap-2">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFiles}
          disabled={value.length >= max}
          className="block w-full text-sm text-slate-600 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 file:font-semibold hover:file:bg-slate-200 disabled:opacity-50"
        />
      </div>

      {error && <p className="text-xs text-rose-600 mt-1.5">{error}</p>}

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
