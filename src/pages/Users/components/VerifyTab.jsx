import React, { useState } from 'react';
import { CircleCheck, CircleX, Coins, ShieldAlert, Loader2, Clock } from 'lucide-react';
import { API_BASE_URL } from '../../../utils/endpoints';

const VerifyTab = ({
  previewUrl,
  creditPoints,
  setCreditPoints,
  setUploadCount,
  setPointsReceived,
  setVerificationCount,
  setValidReportCount,
  verification,
  setVerification,
}) => {
  const [isChecking, setIsChecking] = useState(false);

  const runVerification = async () => {
    const userId = localStorage.getItem('publicUserId');
    
    if (!userId) {
      setVerification({
        status: 'error',
        message: 'User ID not found. Please log in again.',
        points: 0,
      });
      return;
    }

    setIsChecking(true);

    try {
      // 1. Fetch real data from your new backend endpoint
      const response = await fetch(`${API_BASE_URL}/reports/user/${userId}`);
      const data = await response.json();

      if (response.ok) {
        // 2. Update all global app stats based on real database numbers
        setCreditPoints(data.stats.totalPoints);
        setUploadCount(data.stats.totalUploads);
        setValidReportCount(data.stats.validReports);
        setPointsReceived(data.stats.validReports * 10); // Assuming 10 pts per valid
        setVerificationCount(data.stats.validReports + data.stats.invalidReports);

        // 3. Check the status of the most recent report to show the user
        const latestReport = data.reports[0];
        
        if (!latestReport) {
          setVerification({
            status: 'neutral',
            message: 'No reports found yet. Go snap some garbage!',
            points: data.stats.totalPoints,
          });
        } else if (latestReport.status === 'pending') {
          setVerification({
            status: 'pending',
            message: 'Your latest report is still pending verification by our workers.',
            points: data.stats.totalPoints,
          });
        } else if (latestReport.status === 'valid') {
          setVerification({
            status: 'valid',
            message: 'Awesome! Your latest report was verified as Valid.',
            points: data.stats.totalPoints,
          });
        } else if (latestReport.status === 'invalid') {
          setVerification({
            status: 'invalid',
            message: 'Your latest report was rejected by workers.',
            points: data.stats.totalPoints,
          });
        }
      } else {
        setVerification({
          status: 'error',
          message: data.error || 'Failed to sync with server.',
          points: creditPoints,
        });
      }
    } catch (error) {
      console.error("Verification sync error:", error);
      setVerification({
        status: 'error',
        message: 'Network error. Is the backend running?',
        points: creditPoints,
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Helper to render the correct UI based on verification status
  const renderVerificationResult = () => {
    if (!verification) return null;

    let style = "bg-slate-50 border-slate-200 text-slate-700";
    let Icon = ShieldAlert;

    if (verification.status === 'valid') {
      style = "bg-emerald-50 border-emerald-200 text-emerald-700";
      Icon = CircleCheck;
    } else if (verification.status === 'invalid' || verification.status === 'error') {
      style = "bg-rose-50 border-rose-200 text-rose-700";
      Icon = CircleX;
    } else if (verification.status === 'pending') {
      style = "bg-amber-50 border-amber-200 text-amber-700";
      Icon = Clock;
    }

    return (
      <div className={`mt-4 p-3 rounded-2xl border ${style}`}>
        <div className="flex items-start gap-3">
          <Icon size={20} className="mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold">{verification.message}</p>
            <p className="text-xs mt-1 font-medium">
              Current Total Points: {verification.points}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-md mx-auto">
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900">TruthCheck Status</h2>
          <span className="inline-flex items-center gap-1 text-xs font-black bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
            <Coins size={14} />
            {creditPoints} pts
          </span>
        </div>

        <p className="text-xs text-slate-500 mt-2">
          Sync with the server to check if our workers have verified your recent uploads and update your points.
        </p>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 h-52 overflow-hidden flex items-center justify-center relative">
          {previewUrl ? (
            <>
              <img src={previewUrl} alt="Preview for verification" className="h-full w-full object-cover" />
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md">
                Latest Local Capture
              </div>
            </>
          ) : (
            <div className="text-center px-4">
              <ShieldAlert size={24} className="mx-auto text-slate-400" />
              <p className="text-sm font-semibold text-slate-600 mt-2">No active preview</p>
            </div>
          )}
        </div>

        <button
          onClick={runVerification}
          disabled={isChecking}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-bold text-sm active:scale-[0.99] transition-transform disabled:opacity-70"
        >
          {isChecking ? <Loader2 size={18} className="animate-spin" /> : <Clock size={18} />}
          {isChecking ? 'Syncing with Server...' : 'Sync Status & Points'}
        </button>

        {renderVerificationResult()}
      </div>
    </div>
  );
};

export default VerifyTab;