import React, { useState, useEffect } from 'react';
import { BarChart3, Images, Trophy, ShieldCheck, Clock4, Coins, MapPin, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../../../utils/endpoints';

const StatsTab = ({
  creditPoints,
  setCreditPoints,       // Added setter to update global state
  uploadCount,
  setUploadCount,        // Added setter
  pointsReceived,
  setPointsReceived,     // Added setter
  verificationCount,
  setVerificationCount,  // Added setter
  validReportCount,
  setValidReportCount    // Added setter
}) => {
  const [localReports, setLocalReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real stats and history from backend on load
  useEffect(() => {
    const fetchMyStats = async () => {
      const userId = localStorage.getItem('publicUserId');
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/reports/user/${userId}`);
        const data = await response.json();

        if (response.ok) {
          // Update local list
          setLocalReports(data.reports);

          // Update parent state so the whole app is synced!
          setCreditPoints(data.stats.totalPoints);
          setUploadCount(data.stats.totalUploads);
          setValidReportCount(data.stats.validReports);
          setPointsReceived(data.stats.validReports * 10); // 10 pts per valid
          setVerificationCount(data.stats.validReports + data.stats.invalidReports);
        }
      } catch (error) {
        console.error("Failed to fetch user stats", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyStats();
  }, [setCreditPoints, setUploadCount, setValidReportCount, setPointsReceived, setVerificationCount]);

  const pendingChecks = Math.max(uploadCount - verificationCount, 0);
  const accuracy = verificationCount > 0 ? Math.round((validReportCount / verificationCount) * 100) : 0;

  // Helper for dynamic status badge colors
  const getStatusBadge = (status) => {
    if (status === 'valid') return 'bg-emerald-100 text-emerald-700';
    if (status === 'invalid') return 'bg-rose-100 text-rose-700';
    return 'bg-amber-100 text-amber-700'; // pending
  };

  return (
    <div className="p-4 sm:p-6 max-w-md mx-auto pb-24">
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-slate-900 inline-flex items-center gap-2">
            <BarChart3 size={18} />
            Report Stats
          </h2>
          <span className="inline-flex items-center gap-1 text-xs font-black bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
            <Coins size={14} />
            {creditPoints} pts
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Images} title="Total Uploads" value={uploadCount} tone="text-blue-700 bg-blue-50" />
          <StatCard icon={Trophy} title="Points Received" value={pointsReceived} tone="text-emerald-700 bg-emerald-50" />
          <StatCard icon={ShieldCheck} title="Valid Reports" value={validReportCount} tone="text-indigo-700 bg-indigo-50" />
          <StatCard icon={Clock4} title="Pending Checks" value={pendingChecks} tone="text-orange-700 bg-orange-50" />
        </div>

        <div className="mt-4 bg-slate-50 border border-slate-200 rounded-2xl p-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Verification Accuracy</span>
            <span>{accuracy}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${accuracy}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recent Reports Status */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm">
        <h3 className="text-md font-black text-slate-900 mb-3 flex items-center justify-between">
          Recent Submissions
          {isLoading && <Loader2 size={14} className="animate-spin text-slate-400" />}
        </h3>
        
        {!isLoading && localReports.length > 0 ? (
          <div className="space-y-3">
            {localReports.map((report) => {
              // Safely extract MongoDB coordinates and format the Cloudinary/Local image URL
              const lng = report.location?.coordinates?.[0] || 0;
              const lat = report.location?.coordinates?.[1] || 0;
              const date = new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              
              const isAbsoluteUrl = report.imageUrl && report.imageUrl.startsWith('http');
              const finalImageUrl = isAbsoluteUrl ? report.imageUrl : `${API_BASE_URL.replace(/\/$/, '')}${report.imageUrl}`;

              return (
                <div key={report._id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <img 
                    src={finalImageUrl} 
                    alt="Report thumbnail" 
                    className="w-12 h-12 rounded-xl object-cover bg-slate-200"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Error'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        Report #{report._id.slice(-4).toUpperCase()}
                      </p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap uppercase tracking-wider ${getStatusBadge(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
                      <MapPin size={10} />
                      {lat.toFixed(4)}, {lng.toFixed(4)}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : !isLoading ? (
          <p className="text-xs font-medium text-slate-500 text-center py-6">No reports submitted yet.</p>
        ) : (
          <p className="text-xs font-medium text-slate-500 text-center py-6 flex items-center justify-center gap-2">
            <Loader2 size={14} className="animate-spin" /> Loading...
          </p>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, title, value, tone }) => (
  <div className={`rounded-2xl p-3 border border-slate-200 ${tone}`}>
    <Icon size={16} />
    <p className="text-[11px] font-bold mt-2">{title}</p>
    <p className="text-xl font-black mt-1">{value}</p>
  </div>
);

export default StatsTab;