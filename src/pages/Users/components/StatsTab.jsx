import React from 'react';
import { BarChart3, Images, Trophy, ShieldCheck, Clock4, Coins } from 'lucide-react';

const StatsTab = ({
  creditPoints,
  uploadCount,
  pointsReceived,
  verificationCount,
  validReportCount,
}) => {
  const pendingChecks = Math.max(uploadCount - verificationCount, 0);
  const accuracy =
    verificationCount > 0 ? Math.round((validReportCount / verificationCount) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 max-w-md mx-auto">
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 inline-flex items-center gap-2">
            <BarChart3 size={18} />
            Report Stats
          </h2>
          <span className="inline-flex items-center gap-1 text-xs font-black bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
            <Coins size={14} />
            {creditPoints} pts
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
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
