import React, { useState, useEffect, useRef } from 'react';
import { apiCall } from '../../utils/apiClient';
import { ENDPOINTS } from '../../utils/endpoints';
import { 
  MapPin, AlertCircle, X, Loader2, Activity, 
  ShieldCheck, Users, LayoutGrid, Search, ChevronRight 
} from 'lucide-react';
import DustbinStatus from './DustbinStatusValue'; 

const Dashboard = () => {
  const [dustbins, setDustbins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(false);
  const mapSectionRef = useRef(null);
  
  const [stats, setStats] = useState({
    summary: { total: 0, active: 0, underMaintenance: 0, systemHealth: "0%" },
    levels: { critical: 0, warning: 0, healthy: 0 },
    workforce: { total: 0, onField: 0 },
    areaBreakdown: []
  });

  // INITIAL LOAD: Fetch Stats and All Bins
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [binData, statsResponse] = await Promise.all([
          apiCall('GET', ENDPOINTS.ADMIN.GET_CITY_BINS),
          apiCall('GET', ENDPOINTS.ADMIN.DASHBOARD_STATS)
        ]);

        if (binData?.data) setDustbins(binData.data);
        if (statsResponse?.success) setStats(statsResponse.stats);
      } catch (error) {
        console.error("Dashboard Initial Load Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // BACKEND CALL: Fetch bins filtered by area or get all
  const handleAreaClick = async (areaId) => {
    try {
      setMapLoading(true);
      setSelectedArea(areaId);

      // Scroll to map for better UX
      mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Build URL: Add area as query param if it exists
      const url = areaId 
      ? `${ENDPOINTS?.DUSTBIN.DUSTBINAREA}?area=${encodeURIComponent(areaId)}`
      : `${ENDPOINTS?.DUSTBIN.DUSTBINAREA}`;

    // CRITICAL: Must use 'POST' because your backend router uses router.post()
    // Even if the body is empty, the method MUST match.
    const response = await apiCall('POST', url, {});
      if (response && response.data) {
        setDustbins(response.data);
      }
    } catch (error) {
      console.error("Fetch Area Bins Error:", error);
    } finally {
      setMapLoading(false);
    }
  };

  const filteredAreas = stats.areaBreakdown.filter(area => 
    area._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-slate-900 mb-4" size={48} />
      <p className="text-slate-500 font-medium animate-pulse">Initializing Smart City Dashboard...</p>
    </div>
  );

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-screen font-sans">
      
      {/* 1. HEADER SECTION */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
            <Activity size={16} className="text-green-500"/> Live Analytics & Infrastructure
          </p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-sm font-bold text-slate-400">System Health</p>
          <p className="text-2xl font-black text-green-500">{stats.summary.systemHealth}</p>
        </div>
      </div>

      {/* 2. TOP KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><MapPin size={24}/></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bins</span>
          </div>
          <h3 className="text-4xl font-black text-slate-800">{stats.summary.total}</h3>
          <p className="text-slate-500 text-sm mt-2 font-medium">Total Installed Units</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${stats.levels.critical > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              <AlertCircle size={24}/>
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alerts</span>
          </div>
          <h3 className="text-4xl font-black text-slate-800">{stats.levels.critical}</h3>
          <p className="text-slate-500 text-sm mt-2 font-medium">Critical {'>'} 80% Full</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-50 rounded-2xl text-purple-600"><Users size={24}/></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Field</span>
          </div>
          <h3 className="text-4xl font-black text-slate-800">{stats.workforce.onField}</h3>
          <p className="text-slate-500 text-sm mt-2 font-medium">Workers On-Field</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-slate-800 rounded-2xl text-green-400"><ShieldCheck size={24}/></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Network</span>
          </div>
          <h3 className="text-4xl font-black text-white">{stats.summary.active}</h3>
          <p className="text-slate-300 text-sm mt-2 font-medium">Online & Syncing</p>
        </div>
      </div>

      {/* 3. AREA SELECTION GRID */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
          <div className="flex items-center gap-2">
            <LayoutGrid size={18} className="text-slate-400" />
            <h3 className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Area-wise Deployment</h3>
            {selectedArea && (
              <button 
                onClick={() => handleAreaClick(null)}
                className="ml-4 px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black flex items-center gap-1 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                RESET VIEW <X size={12} />
              </button>
            )}
          </div>

          <div className="relative group w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Search area name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl py-2.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
        
        <div className="max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
            {filteredAreas.length > 0 ? (
              filteredAreas.map((area, idx) => (
                <div 
                  key={idx} 
                  onClick={() => handleAreaClick(area._id)}
                  className={`cursor-pointer p-5 rounded-[1.8rem] border transition-all duration-300 relative group ${
                    selectedArea === area._id 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200 scale-[0.98]' 
                      : 'bg-white border-slate-100 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className={`p-2 rounded-xl ${
                      selectedArea === area._id ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-400 group-hover:text-blue-500'
                    }`}>
                      <MapPin size={16}/>
                    </div>
                    <ChevronRight size={16} className={selectedArea === area._id ? 'text-white/50' : 'text-slate-300'} />
                  </div>
                  <h4 className="font-bold text-sm truncate mb-1">{area._id}</h4>
                  <div className="flex items-end gap-1.5">
                    <span className="text-2xl font-black leading-none">{area.count}</span>
                    <span className={`text-[10px] font-bold uppercase pb-0.5 ${
                      selectedArea === area._id ? 'text-blue-100' : 'text-slate-400'
                    }`}>Units</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-dashed border-slate-200 text-slate-400">
                 <Search size={32} className="opacity-10 mb-2" />
                 <p className="text-sm font-bold uppercase tracking-widest">No areas found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. MAP SECTION */}
      <div ref={mapSectionRef} className="pt-4 space-y-4 relative">
        {/* Loading Overlay for Map Data fetching */}
        {mapLoading && (
          <div className="absolute inset-0 z-[2000] bg-white/40 backdrop-blur-[1px] flex items-center justify-center rounded-[2.5rem] mt-12">
            <div className="bg-white p-4 rounded-2xl shadow-2xl flex items-center gap-3">
              <Loader2 className="animate-spin text-blue-600" size={20} />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Syncing Area Data...</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-blue-500" />
            <h3 className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">
              {selectedArea ? `Focused Area: ${selectedArea}` : 'Live City-wide Map'}
            </h3>
          </div>
          {selectedArea && (
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Showing {dustbins.length} markers
            </span>
          )}
        </div>
        
        <DustbinStatus dustbins={dustbins} />
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
};

export default Dashboard;