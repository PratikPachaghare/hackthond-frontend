import React, { useState, useEffect } from 'react';
import { AlertTriangle, Truck, Loader2, MapPin, Activity, CheckCircle2, Archive } from 'lucide-react';
import { apiCall } from '../../../utils/apiClient'; // Path maintained
import { ENDPOINTS } from '../../../utils/endpoints'; 

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
    <div className="p-4 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-300 pb-20">
      
      {/* 📍 Header: Shows Global View & Health */}
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

      {/* 📊 Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total Bins from Backend Summary */}
        <div className="bg-slate-900 p-4 rounded-[2rem] text-white shadow-xl">
          <Archive size={22} className="mb-2 text-blue-400" />
          <h3 className="text-3xl font-black">{summary?.totalBins || 0}</h3>
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">Total Bins</p>
        </div>
        
        {/* Needs Collection - Backend Value */}
        <div className={`p-4 rounded-[2rem] text-white shadow-xl ${summary?.needsCollection > 0 ? 'bg-orange-500' : 'bg-emerald-500'}`}>
          <AlertTriangle size={22} className="mb-2 opacity-80" />
          <h3 className="text-3xl font-black">{summary?.needsCollection || 0}</h3>
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Pending Bins</p>
        </div>
      </div>

      {/* 📈 Status Breakdown: Critical vs Healthy */}
      <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Activity size={18} className="text-slate-400"/> Area Status Breakdown
        </h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-[10px] font-black mb-1.5 text-slate-400">
              <span>CRITICAL BINS</span>
              <span className="text-orange-500">{levels?.critical || 0} Bins</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-500 transition-all duration-500" 
                style={{ width: `${(levels?.critical / (summary?.totalBins || 1)) * 100}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[10px] font-black mb-1.5 text-slate-400">
              <span>HEALTHY BINS</span>
              <span className="text-emerald-500">{levels?.normal || 0} Bins</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500" 
                style={{ width: `${(levels?.normal / (summary?.totalBins || 1)) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* 🏆 Rank Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 rounded-[2rem] text-white flex items-center justify-between shadow-lg">
        <div>
          <p className="text-[10px] font-bold uppercase opacity-70 tracking-tighter">Your Performance</p>
          <h4 className="text-xl font-black">Rank {performance?.areaRank || "N/A"}</h4>
        </div>
        <div className="bg-white/20 p-3 rounded-2xl">
          <CheckCircle2 size={24} />
        </div>
      </div>

    </div>
  );
};

export default DashboardTab;