import { useState, useRef } from "react";
import { UploadCloud, X } from "lucide-react";

export default function ImageUploader({ value = [], onChange, max = 3 }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Convert uploaded files to Base64 strings so the backend accepts them
  const processFiles = async (files) => {
    // Only accept image files
    const validFiles = Array.from(files).filter(file => file.type.startsWith("image/"));
    
    // Calculate how many more images are allowed
    const availableSlots = max - value.length;
    const filesToProcess = validFiles.slice(0, availableSlots);

    const promises = filesToProcess.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file); // Converts the image to a Base64 String
      });
    });

    const base64Images = await Promise.all(promises);
    onChange([...value, ...base64Images]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      // Reset input value so the same file can be selected again if removed
      e.target.value = null; 
    }
  };

  const removeImage = (indexToRemove) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-slate-700">
        Attach Images (Max {max})
      </label>

      {/* Drag & Drop Zone */}
      {value.length < max && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
            isDragging 
              ? "border-orange-500 bg-orange-50" 
              : "border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400"
          }`}
        >
          <UploadCloud className={`w-8 h-8 mb-2 transition-colors ${isDragging ? "text-orange-500" : "text-slate-400"}`} />
          <p className="text-sm text-slate-600 text-center font-medium">
            Click or drag & drop images here
          </p>
          <p className="text-xs text-slate-400 mt-1">
            JPEG, PNG, GIF (Upload up to {max - value.length} more)
          </p>
          
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleChange}
            accept="image/*"
            multiple
            className="hidden"
          />
        </div>
      )}

      {/* Image Previews Gallery */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mt-3">
          {value.map((imgUrl, idx) => (
            <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square shadow-sm">
              <img 
                src={imgUrl} 
                alt={`upload-preview-${idx}`} 
                className="w-full h-full object-cover" 
              />
              
              {/* Delete Button (Shows on Hover) */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                className="absolute top-1.5 right-1.5 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 shadow-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}