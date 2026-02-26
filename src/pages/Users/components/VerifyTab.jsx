import React from 'react';
import { CircleCheck, CircleX, Coins, ShieldAlert } from 'lucide-react';

const garbageKeywords = ['garbage', 'trash', 'waste', 'dustbin', 'litter', 'bin', 'kooda'];

const VerifyTab = ({
  selectedImage,
  previewUrl,
  creditPoints,
  setCreditPoints,
  setPointsReceived,
  setVerificationCount,
  setValidReportCount,
  verification,
  setVerification,
}) => {
  const runVerification = () => {
    if (!selectedImage) {
      setVerification({
        ok: false,
        message: 'No image found. Please capture/upload image first.',
        delta: 0,
      });
      return;
    }

    const name = selectedImage.name.toLowerCase();
    const looksLikeGarbage = garbageKeywords.some((keyword) => name.includes(keyword));
    const passesBasicImageQuality = selectedImage.size > 30 * 1024;

    const isRealGarbage = looksLikeGarbage || passesBasicImageQuality;
    const delta = isRealGarbage ? 10 : -10;

    setCreditPoints((prev) => Math.max(0, prev + delta));
    setVerificationCount((prev) => prev + 1);
    if (delta > 0) {
      setPointsReceived((prev) => prev + delta);
      setValidReportCount((prev) => prev + 1);
    }
    setVerification({
      ok: isRealGarbage,
      message: isRealGarbage
        ? 'Valid garbage report. +10 credit points added.'
        : 'Image seems unrelated to garbage. -10 credit points deducted.',
      delta,
    });
  };

  return (
    <div className="p-4 sm:p-6 max-w-md mx-auto">
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900">TruthCheck Validation</h2>
          <span className="inline-flex items-center gap-1 text-xs font-black bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
            <Coins size={14} />
            {creditPoints} pts
          </span>
        </div>

        <p className="text-xs text-slate-500 mt-2">
          This checks whether uploaded image looks like a garbage report.
        </p>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 h-52 overflow-hidden flex items-center justify-center">
          {previewUrl ? (
            <img src={previewUrl} alt="Preview for verification" className="h-full w-full object-cover" />
          ) : (
            <div className="text-center px-4">
              <ShieldAlert size={24} className="mx-auto text-slate-400" />
              <p className="text-sm font-semibold text-slate-600 mt-2">No image selected</p>
            </div>
          )}
        </div>

        <button
          onClick={runVerification}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-bold text-sm active:scale-[0.99] transition-transform"
        >
          Check Authenticity
        </button>

        {verification && (
          <div
            className={`mt-4 p-3 rounded-2xl border ${
              verification.ok
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            <div className="flex items-start gap-2">
              {verification.ok ? <CircleCheck size={18} /> : <CircleX size={18} />}
              <div>
                <p className="text-sm font-bold">{verification.message}</p>
                <p className="text-xs mt-1">
                  Points update: {verification.delta > 0 ? '+' : ''}
                  {verification.delta}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyTab;
