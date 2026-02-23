import React, { useState, useEffect } from 'react';
import { apiCall } from '../../utils/apiClient';
import { ENDPOINTS } from '../../utils/endpoints';
import { MapPin, AlertCircle, CheckCircle2, WifiOff, X, Loader2, Activity, ShieldCheck, Users, BarChart3, LayoutGrid } from 'lucide-react';

const Dashboard = () => {
  const [selectedBin, setSelectedBin] = useState(null);
  const [dustbins, setDustbins] = useState([]);
  
  const [stats, setStats] = useState({
    summary: { total: 0, active: 0, underMaintenance: 0, systemHealth: "0%" },
    levels: { critical: 0, warning: 0, healthy: 0 },
    workforce: { total: 0, onField: 0 },
    areaBreakdown: []
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const binData = await apiCall('GET', ENDPOINTS.ADMIN.GET_CITY_BINS);
        if (binData && binData.data) setDustbins(binData.data);

        const statsResponse = await apiCall('GET', ENDPOINTS.ADMIN.DASHBOARD_STATS);
        
        if (statsResponse && statsResponse.success) {
          setStats(statsResponse.stats);
        }
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-slate-900 mb-4" size={48} />
      <p className="text-slate-500 font-medium animate-pulse">Loading Smart Bin Data...</p>
    </div>
  );

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-screen relative overflow-hidden font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
            <Activity size={16} className="text-green-500"/> Live Smart Bin Analytics
          </p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-sm font-bold text-slate-400">System Health</p>
          <p className="text-2xl font-black text-green-500">{stats.summary.systemHealth}</p>
        </div>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Bins & Maintenance */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><MapPin size={24}/></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Infrastructure</span>
          </div>
          <h3 className="text-4xl font-black text-slate-800">{stats.summary.total}</h3>
          <p className="text-slate-500 text-sm mt-2 font-medium">Total Installed Bins</p>
          <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between text-xs font-bold">
            <span className="text-green-500">Active: {stats.summary.active}</span>
            <span className="text-orange-500">Maintenance: {stats.summary.underMaintenance}</span>
          </div>
        </div>

        {/* Card 2: Fill Levels */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${stats.levels.critical > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              <AlertCircle size={24}/>
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bin Status</span>
          </div>
          <h3 className="text-4xl font-black text-slate-800">{stats.levels.critical}</h3>
          <p className="text-slate-500 text-sm mt-2 font-medium">Critical Bins ({'>'}80% Full)</p>
          <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between text-xs font-bold">
            <span className="text-slate-500">Healthy: {stats.levels.healthy}</span>
            <span className="text-yellow-500">Warning: {stats.levels.warning}</span>
          </div>
        </div>

        {/* Card 3: Workforce */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-50 rounded-2xl text-purple-600"><Users size={24}/></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Workforce</span>
          </div>
          <h3 className="text-4xl font-black text-slate-800">{stats.workforce.onField}</h3>
          <p className="text-slate-500 text-sm mt-2 font-medium">Workers On-Field</p>
          <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between text-xs font-bold">
            <span className="text-slate-500">Total Staff: {stats.workforce.total}</span>
            <span className={stats.workforce.onField === 0 ? "text-slate-400" : "text-purple-500"}>Active Duty</span>
          </div>
        </div>

        {/* Card 4: Overall Health */}
        <div className="bg-slate-900 p-6 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-slate-800 rounded-full blur-2xl opacity-50"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-slate-800 rounded-2xl text-green-400"><ShieldCheck size={24}/></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Network</span>
          </div>
          <h3 className="text-4xl font-black text-white relative z-10">{stats.summary.active}</h3>
          <p className="text-slate-300 text-sm mt-2 font-medium relative z-10">Bins Online & Syncing</p>
          <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between text-xs font-bold relative z-10">
            <span className="text-green-400">Health: {stats.summary.systemHealth}</span>
            <span className="text-red-400">Offline: {stats.summary.total - stats.summary.active}</span>
          </div>
        </div>
      </div>

      {/* AREA BREAKDOWN SECTION (FLEX WRAP GRID STYLE) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <LayoutGrid size={18} className="text-slate-400" />
          <h3 className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Area-wise Deployment</h3>
        </div>
        
        {/* Container with flex-wrap instead of overflow-x-auto */}
        <div className="flex flex-wrap gap-4">
          {stats.areaBreakdown.length > 0 ? (
            stats.areaBreakdown.map((area, idx) => (
              <div 
                key={idx} 
                className="flex-1 min-w-[200px] max-w-[280px] bg-white p-5 rounded-[1.8rem] shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-100 transition-all group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 transition-all">
                    <MapPin size={16}/>
                  </div>
                  <span className="text-[9px] font-black text-slate-300 group-hover:text-blue-400 tracking-tighter uppercase">Verified</span>
                </div>
                
                <h4 className="font-bold text-slate-700 text-sm truncate mb-1">{area._id}</h4>
                
                <div className="flex items-end gap-1.5">
                  <span className="text-2xl font-black text-slate-900 leading-none">{area.count}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase pb-0.5 tracking-wider">Units</span>
                </div>
              </div>
            ))
          ) : (
            <div className="w-full py-10 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400">
               <BarChart3 size={24} className="mb-2 opacity-30" />
               <p className="text-xs font-medium uppercase tracking-widest">No area data found</p>
            </div>
          )}
        </div>
      </div>

      {/* MAP SECTION */}
      <div className="bg-white rounded-3xl h-[600px] relative border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-white/80 backdrop-blur-md absolute top-0 w-full z-20">
          <h3 className="font-bold text-slate-800 flex items-center gap-2"><MapPin size={18}/> Live Deployment Map</h3>
        </div>
        
        <div className="flex-1 relative mt-[60px]">
          <div className="absolute inset-0 bg-slate-100 bg-[url('https://carto.com/help/images/posts/all/carto-mobile-sdk/basic-concepts/map-tiles.png')] opacity-30"></div>
          
          {dustbins.map(bin => (
            <button 
              key={bin._id}
              onClick={() => setSelectedBin(bin)}
              className="absolute z-10 group transition-all hover:scale-125"
              style={{ 
                  top: `${((bin.location?.lat - 20) * 100) % 90}%`, 
                  left: `${((bin.location?.lng - 77) * 100) % 90}%` 
              }}
            >
              <div className="relative">
                <MapPin 
                  className={`${bin.currentLevel > 80 ? 'text-red-500 animate-bounce drop-shadow-lg' : 'text-emerald-500 drop-shadow-md'}`} 
                  size={40} 
                  fill="currentColor" 
                  fillOpacity={0.2}
                />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-black/20 rounded-full blur-[2px]"></div>
              </div>
              <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 whitespace-nowrap shadow-xl transition-all scale-95 group-hover:scale-100 pointer-events-none">
                {bin.name} • <span className={bin.currentLevel > 80 ? 'text-red-400' : 'text-emerald-400'}>{bin.currentLevel}%</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* DRAWER: BIN DETAILS */}
      {selectedBin && (
        <>
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity" onClick={() => setSelectedBin(null)}></div>
          <div className="fixed right-0 top-0 h-full w-full md:w-[400px] bg-white shadow-2xl z-50 p-8 transition-transform transform translate-x-0 border-l border-slate-100 overflow-y-auto">
            <button onClick={() => setSelectedBin(null)} className="absolute top-6 right-6 p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={20}/></button>
            
            <div className="mt-6">
              <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wider uppercase ${selectedBin.location_type === 'Commercial' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                {selectedBin.location_type || 'General Setup'}
              </span>
              <h2 className="text-3xl font-black text-slate-800 mt-4 leading-tight">{selectedBin.name}</h2>
              <p className="text-slate-400 font-medium flex items-center gap-1.5 mt-2"><MapPin size={16}/> {selectedBin.area}</p>
            </div>

            <div className="my-10 flex flex-col items-center">
              <div className="w-32 h-48 border-[8px] border-slate-800 rounded-b-[40px] relative overflow-hidden bg-slate-50 shadow-inner">
                <div 
                  className={`absolute bottom-0 w-full transition-all duration-[1500ms] ease-out ${selectedBin.currentLevel > 80 ? 'bg-gradient-to-t from-red-600 to-red-400' : 'bg-gradient-to-t from-emerald-600 to-emerald-400'}`}
                  style={{ height: `${selectedBin.currentLevel || 0}%` }}
                >
                  <div className="absolute top-0 w-full h-4 bg-white/20 animate-pulse"></div>
                  <div className="absolute top-0 w-full h-2 bg-white/10 rounded-full blur-[1px]"></div>
                </div>
              </div>
              <p className="mt-6 text-5xl font-black text-slate-800 tracking-tighter">{selectedBin.currentLevel || 0}<span className="text-2xl text-slate-400">%</span></p>
              <p className="text-slate-400 text-sm font-bold mt-1 uppercase tracking-widest">Current Fill Level</p>
            </div>

            <div className="space-y-3 bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
                  <span className="text-slate-500 font-medium text-sm">Hardware Status</span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${selectedBin.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {selectedBin.isActive ? 'Online & Syncing' : 'Connection Lost'}
                  </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
                  <span className="text-slate-500 font-medium text-sm">Last Synced</span>
                  <span className="text-slate-800 font-bold text-sm">{new Date(selectedBin.updatedAt || Date.now()).toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium text-sm">Capacity</span>
                  <span className="text-slate-800 font-bold text-sm">{selectedBin.size || 'Medium (120L)'}</span>
              </div>
            </div>

            <button className="w-full mt-8 bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-black shadow-lg shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2">
              <Users size={18} /> Assign Collector Task
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;