import React from 'react';
import { Camera, Upload, Coins } from 'lucide-react';

const CaptureTab = ({
  creditPoints,
  setUploadCount,
  setSelectedImage,
  previewUrl,
  setPreviewUrl,
  setVerification,
  onUploadComplete,
}) => {
  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setVerification(null);
    setUploadCount((prev) => prev + 1);
    if (onUploadComplete) onUploadComplete();
  };

  return (
    <div className="p-4 sm:p-6 max-w-md mx-auto">
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900">Snap Garbage Image</h2>
          <span className="inline-flex items-center gap-1 text-xs font-black bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
            <Coins size={14} />
            {creditPoints} pts
          </span>
        </div>

        <p className="text-xs text-slate-500 mt-2">
          Use camera or upload a photo of garbage/waste.
        </p>

        <label className="mt-4 h-56 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center cursor-pointer overflow-hidden">
          {previewUrl ? (
            <img src={previewUrl} alt="Captured garbage" className="h-full w-full object-cover" />
          ) : (
            <div className="text-center px-4">
              <Camera className="mx-auto text-slate-400" size={26} />
              <p className="mt-2 text-sm font-semibold text-slate-700">Tap to add image</p>
              <p className="text-[11px] text-slate-500">Camera or gallery</p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>

        <label className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-2xl font-bold text-sm cursor-pointer active:scale-[0.99] transition-transform">
          <Upload size={16} />
          Upload / Retake
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
};

export default CaptureTab;
