import React, { useState, useEffect } from 'react';
import { AlertTriangle, Truck, Loader2, MapPin, Activity, CheckCircle2, Archive } from 'lucide-react';
import { apiCall } from '../../../utils/apiClient'; // Path maintained
import { ENDPOINTS } from '../../../utils/endpoints'; 
import BinAnalytics from './BinAnalytics';

const DashboardTab = () => {
  const [data, setData] = useState(null); // Backend stats object
  const [pendingCount, setPendingCount] = useState(0); // Old local logic count
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        // Using existing endpoint logic as per your old code
        const response = await apiCall('GET', ENDPOINTS?.WORKER?.GET_CITY_BINS || '/api/worker/dashboard-stats');
        console.log("dashboard responce :", response);

        if (response?.success) {
          setData(response);
          
          // --- OLD CODE LOGIC PRESERVED ---
          // Local filter logic from your previous snippet
          // Assuming 'response.bins' exists or using 'response' if it's an array
          const binsArray = Array.isArray(response) ? response : response?.data || [];
          const pending = binsArray.filter(bin => (bin.currentLevel || 0) > 80 || bin.isPredictedFull).length;
          setPendingCount(pending);
          // --------------------------------
        }
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="animate-spin text-blue-500" size={32}/>
    </div>
  );

  // Mapping backend response properties
  const workerArea = data?.workerArea || 'Global View';
  const summary = data?.stats?.summary || {};
  const levels = data?.stats?.levels || {};
  const performance = data?.stats?.performance || {};

 return (
    /* Main container: Added h-screen and overflow-y-auto */
    <div className="h-screen overflow-y-auto bg-slate-50/50">
      <div className="p-4 flex flex-col gap-6 pb-32"> {/* Increased padding bottom for mobile nav safety */}
        
        {/* HEADER */}
        <div className="mt-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Overview</h2>
            <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-lg mt-1 w-fit">
              <MapPin size={12} strokeWidth={3} />
              <span className="text-[10px] font-black uppercase tracking-wider">{workerArea}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Health</p>
            <p className="text-sm font-black text-emerald-500">{summary?.systemHealth || "100.0%"}</p>
          </div>
        </div>

        {/* TOP STATS CARDS */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-xl">
            <Archive size={22} className="mb-2 text-blue-400" />
            <h3 className="text-3xl font-black">{summary?.totalBins || 0}</h3>
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">Total Bins</p>
          </div>
          
          <div className={`p-6 rounded-[2rem] text-white shadow-xl ${summary?.needsCollection > 0 ? 'bg-orange-500' : 'bg-emerald-500'}`}>
            <AlertTriangle size={22} className="mb-2 opacity-80" />
            <h3 className="text-3xl font-black">{summary?.needsCollection || 0}</h3>
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Pending Bins</p>
          </div>
        </div>

        {/* BREAKDOWN SECTION */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 uppercase text-xs tracking-widest">Area Status</h3>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-[10px] font-black mb-2 text-slate-400 uppercase">
                <span>Critical</span>
                <span className="text-orange-500">{levels?.critical || 0} Bins</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500" 
                  style={{ width: `${(levels?.critical / (summary?.totalBins || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-black mb-2 text-slate-400 uppercase">
                <span>Healthy</span>
                <span className="text-emerald-500">{levels?.normal || 0} Bins</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500" 
                  style={{ width: `${(levels?.normal / (summary?.totalBins || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* ANALYTICS SECTION */}
        <div className="mt-4">
            <BinAnalytics />
        </div>

      </div>
    </div>
  );
};

export default DashboardTab;