import React, { useState, useEffect, useRef } from 'react';
import { apiCall } from '../../utils/apiClient';
import { ENDPOINTS } from '../../utils/endpoints';
import { 
  MapPin, AlertCircle, X, Loader2, Activity, 
  ShieldCheck, Users, LayoutGrid, Search, ChevronRight 
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import DustbinStatus from './DustbinStatusValue'; 

const GARBAGE_TYPES = ['organic', 'recycle', 'hazardous'];
const TYPE_COLORS = {
  organic: '#16a34a',
  recycle: '#2563eb',
  hazardous: '#dc2626',
};

// Internet-informed simulated fallback:
// - Organic dominant, recyclable moderate, hazardous low
//   (aligned with common MSW composition ranges in India/global studies).
const SIMULATED_CITY_DISTRIBUTION = { organic: 72, recycle: 24, hazardous: 4 };
const SIMULATED_HOTSPOTS = [
  { area: 'Rajkamal Square', total: 42 },
  { area: 'Gadge Nagar', total: 38 },
  { area: 'Rathi Nagar', total: 35 },
  { area: 'Badnera', total: 33 },
  { area: 'Camp', total: 31 },
  { area: 'Panchavati', total: 28 },
  { area: 'Irwin Square', total: 25 },
  { area: 'Dastur Nagar', total: 22 },
  { area: 'Sainagar', total: 20 },
  { area: 'Amravati Central', total: 18 },
];

const Dashboard = () => {
  const [dustbins, setDustbins] = useState([]);
  const [allCityDustbins, setAllCityDustbins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState(null); 
  const [selectedAreaForPie, setSelectedAreaForPie] = useState(null);
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
        console.log("Dashboard Initial Data:", { binData, statsResponse });

        if (binData?.data) {
          setDustbins(binData.data);
          setAllCityDustbins(binData.data);
        }
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

  const getGarbageType = (bin) => {
    const rawType = String(
      bin?.garbageType || bin?.garbage_type || bin?.wasteType || bin?.waste_type || bin?.type || ''
    ).toLowerCase();

    if (rawType.includes('hazard') || rawType.includes('medical') || rawType.includes('battery') || rawType.includes('chemical')) {
      return 'hazardous';
    }
    if (rawType.includes('recycle') || rawType.includes('plastic') || rawType.includes('paper') || rawType.includes('metal') || rawType.includes('glass') || rawType.includes('dry')) {
      return 'recycle';
    }
    return 'organic';
  };

  const computeDistribution = (bins = []) => {
    const base = { organic: 0, recycle: 0, hazardous: 0 };
    bins.forEach((bin) => {
      const type = getGarbageType(bin);
      base[type] += 1;
    });
    return base;
  };

  const areaWiseGarbageMap = allCityDustbins.reduce((acc, bin) => {
    const areaKey = String(bin?.area || 'Unknown');
    if (!acc[areaKey]) acc[areaKey] = { organic: 0, recycle: 0, hazardous: 0 };
    acc[areaKey][getGarbageType(bin)] += 1;
    return acc;
  }, {});

  const getAreaDistribution = (areaId) => {
    if (areaWiseGarbageMap[areaId]) return areaWiseGarbageMap[areaId];
    const matchedKey = Object.keys(areaWiseGarbageMap).find(
      (k) => k.toLowerCase() === String(areaId).toLowerCase()
    );
    return matchedKey ? areaWiseGarbageMap[matchedKey] : { organic: 0, recycle: 0, hazardous: 0 };
  };

  const toPieData = (distribution) =>
    GARBAGE_TYPES.map((type) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: distribution[type] || 0,
      color: TYPE_COLORS[type],
    }));

  const cityDistribution = computeDistribution(allCityDustbins);
  const cityPieData = toPieData(cityDistribution);
  const cityDistributionTotal = cityPieData.reduce((sum, item) => sum + item.value, 0);
  const cityPieDataForRender = cityDistributionTotal > 0
    ? cityPieData
    : toPieData(SIMULATED_CITY_DISTRIBUTION);

  const areaHotspotData = Object.entries(areaWiseGarbageMap)
    .map(([area, dist]) => ({
      area,
      total: (dist.organic || 0) + (dist.recycle || 0) + (dist.hazardous || 0),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
  const areaHotspotDataForRender = areaHotspotData.length > 0 ? areaHotspotData : SIMULATED_HOTSPOTS;

  const selectedAreaHistogramData = selectedAreaForPie
    ? [
        { type: 'Organic', tons: +((Number(selectedAreaForPie.count) || 0) * 0.18).toFixed(2) },
        { type: 'Recycle', tons: +((Number(selectedAreaForPie.count) || 0) * 0.12).toFixed(2) },
        { type: 'Hazardous', tons: +((Number(selectedAreaForPie.count) || 0) * 0.08).toFixed(2) },
      ]
    : [];

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

      {/* 3. GARBAGE TYPE CHARTS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider mb-4">
            City Distribution: Organic vs Recycle vs Hazardous
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={cityPieDataForRender} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95}>
                  {cityPieDataForRender.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider mb-4">
            City Garbage Hotspots (Area-wise)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areaHotspotDataForRender} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="area" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={55} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [`${value} tons`, 'Estimated Collected']} />
                <Bar dataKey="total" fill="#f97316" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. AREA SELECTION GRID */}
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
                (() => {
                  // const sameCount = Number(.count) || 0;
                  const distribution = {
                    organic: area.organicCount || 0,
                    recycle: area.recyclableCount || 0,
                    hazardous: area.hazardousCount || 0,
                  };
                  return (
                <div 
                  key={idx} 
                  onClick={() => {
                    handleAreaClick(area._id);
                  }}
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
                    <span className={`text-[10px] font-bold uppercase pb-0.5 ${
                      selectedArea === area._id ? 'text-blue-100' : 'text-slate-400'
                    }`}></span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className={`rounded-lg px-2 py-1 text-center ${selectedArea === area._id ? 'bg-white/20' : 'bg-green-50'}`}>
                      <p className={`text-[9px] font-black uppercase ${selectedArea === area._id ? 'text-green-100' : 'text-green-700'}`}>Organic</p>
                      <p className={`text-sm font-black ${selectedArea === area._id ? 'text-white' : 'text-slate-800'}`}>{distribution.organic}</p>
                    </div>
                    <div className={`rounded-lg px-2 py-1 text-center ${selectedArea === area._id ? 'bg-white/20' : 'bg-blue-50'}`}>
                      <p className={`text-[9px] font-black uppercase ${selectedArea === area._id ? 'text-blue-100' : 'text-blue-700'}`}>Recycle</p>
                      <p className={`text-sm font-black ${selectedArea === area._id ? 'text-white' : 'text-slate-800'}`}>{distribution.recycle}</p>
                    </div>
                    <div className={`rounded-lg px-2 py-1 text-center ${selectedArea === area._id ? 'bg-white/20' : 'bg-red-50'}`}>
                      <p className={`text-[9px] font-black uppercase ${selectedArea === area._id ? 'text-red-100' : 'text-red-700'}`}>Hazard</p>
                      <p className={`text-sm font-black ${selectedArea === area._id ? 'text-white' : 'text-slate-800'}`}>{distribution.hazardous}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAreaForPie({ id: area._id, count: area.count });
                    }}
                    className={`mt-4 w-full text-[10px] font-black uppercase tracking-wider py-2 rounded-xl transition-all ${
                      selectedArea === area._id
                        ? 'bg-white text-blue-700 hover:bg-blue-50'
                        : 'bg-slate-900 text-white hover:bg-slate-700'
                    }`}
                  >
                    View Tons Histogram
                  </button>
                </div>
                  );
                })()
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

      {/* 5. AREA PIE MODAL */}
      {selectedAreaForPie && (
        <div className="fixed inset-0 z-[3000] bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                {selectedAreaForPie.id} Garbage Collected (Tons)
              </h3>
              <button
                onClick={() => setSelectedAreaForPie(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X size={18} />
              </button>
            </div>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={selectedAreaHistogramData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="type" tick={{ fontSize: 12, fill: '#475569', fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value) => [`${value} tons`, 'Collected']} />
                  <Legend />
                  <Bar dataKey="tons" radius={[10, 10, 0, 0]}>
                    {selectedAreaHistogramData.map((entry) => (
                      <Cell
                        key={entry.type}
                        fill={
                          entry.type === 'Organic'
                            ? TYPE_COLORS.organic
                            : entry.type === 'Recycle'
                              ? TYPE_COLORS.recycle
                              : TYPE_COLORS.hazardous
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 6. MAP SECTION */}
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
