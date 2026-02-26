import React from 'react';
import { CircleHelp, Coins, TrendingUp, TrendingDown } from 'lucide-react';

const InfoTab = ({ creditPoints }) => {
  return (
    <div className="p-4 sm:p-6 max-w-md mx-auto">
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900">Point Guide</h2>
          <span className="inline-flex items-center gap-1 text-xs font-black bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
            <Coins size={14} />
            {creditPoints} pts
          </span>
        </div>

        <div className="mt-4 space-y-3 text-sm">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
            <p className="font-bold text-slate-800">Initial Credits</p>
            <p className="text-slate-600 mt-1">
              Every new user starts with <span className="font-bold">100 credit points</span>.
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3">
            <p className="font-bold text-emerald-800 inline-flex items-center gap-1">
              <TrendingUp size={15} />
              Correct Garbage Image
            </p>
            <p className="text-emerald-700 mt-1">
              If the uploaded image is considered a genuine garbage/waste report, you get
              <span className="font-bold"> +10 points</span>.
            </p>
          </div>

          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3">
            <p className="font-bold text-rose-800 inline-flex items-center gap-1">
              <TrendingDown size={15} />
              Wrong / Random Image
            </p>
            <p className="text-rose-700 mt-1">
              If the image appears unrelated to garbage (random/unusable), your score is reduced by
              <span className="font-bold"> -10 points</span>.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3">
            <p className="font-bold text-blue-800 inline-flex items-center gap-1">
              <CircleHelp size={15} />
              Why this rule exists
            </p>
            <p className="text-blue-700 mt-1">
              This points system keeps submissions trustworthy. High-quality and accurate uploads improve
              response quality, while repeated irrelevant uploads reduce credibility and points.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoTab;
