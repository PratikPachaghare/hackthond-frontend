import React, { useState, useEffect, useRef } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Loader2, Activity } from 'lucide-react';
import { apiCall } from '../../../utils/apiClient';
import { ENDPOINTS } from '../../../utils/endpoints';

const BinAnalytics = () => {
  const [bins, setBins] = useState([]);
  const [selectedBin, setSelectedBin] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const analyticsRef = useRef(null);

  // Helper to map bin_type to color scheme (keeps UI consistent with other components)
  const getColorByType = (binType) => {
    const typeColorMap = {
      Organic: { bg: 'bg-green-600', text: 'text-green-600', light: 'bg-green-50', border: 'border-green-200' },
      Recyclable: { bg: 'bg-blue-700', text: 'text-blue-700', light: 'bg-blue-50', border: 'border-blue-200' },
      Hazardous: { bg: 'bg-red-600', text: 'text-red-600', light: 'bg-red-50', border: 'border-red-200' },
    };
    return typeColorMap[binType] || { bg: 'bg-slate-600', text: 'text-slate-600', light: 'bg-slate-50', border: 'border-slate-200' };
  };

  // Change bin type on backend and update local state
  const handleChangeBinType = async (binId, newType) => {
    try {
      setLoading(true);
      const endpoint = ENDPOINTS?.DUSTBIN?.UPDATE_TYPE || '/api/dustbins/update-type';
      const resp = await apiCall('POST', endpoint, { bin_id: binId, bin_type: newType });
      if (resp?.success) {
        // update local list and selected bin
        setBins(prev => prev.map(b => b._id === binId ? { ...b, bin_type: newType } : b));
        if (selectedBin && selectedBin._id === binId) setSelectedBin(prev => ({ ...prev, bin_type: newType }));
      } else {
        console.error('Failed to update bin type', resp);
        alert(resp?.message || 'Could not update bin type');
      }
    } catch (err) {
      console.error('Error updating bin type', err);
      alert('Network error while updating bin type');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchBins = async () => {
      try {
        setInitialLoading(true);
        const res = await apiCall('GET', ENDPOINTS?.DUSTBIN?.MAP_DUSTBINS || ENDPOINTS?.ADMIN?.GET_CITY_BINS);
        console.log("Bins fetched for analytics:", res);
        const fetched = Array.isArray(res) ? res : res?.data || [];
        // sort by area name (alphabetical). If same area, keep type order as secondary sort
        const typeOrder = { Organic: 0, Recyclable: 1, Hazardous: 2 };
        fetched.sort((a, b) => {
          const areaA = (a.area || '').toString().toLowerCase();
          const areaB = (b.area || '').toString().toLowerCase();
          if (areaA === areaB) {
            return (typeOrder[a.bin_type] ?? 99) - (typeOrder[b.bin_type] ?? 99);
          }
          return areaA.localeCompare(areaB);
        });
        setBins(fetched);
      } catch (err) {
        console.error("Failed to fetch bins:", err);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchBins();
  }, []);

  const handleSelectBin = async (bin) => {
    setLoading(true);
    setSelectedBin(bin);
    try {
      const res = await apiCall('GET', ENDPOINTS?.WORKER?.GET_BIN_ANALYTICS(bin._id));
      if (res?.success) {
        setAnalytics(res.data);
        setTimeout(() => {
          analyticsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" /></div>;

  return (
    <div className="flex flex-col gap-8">
      {/* BIN SELECTION GRID */}
      <div className="space-y-4 px-2">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Select Dustbin</h3>
        {/* Group bins by area and display each area as a separate row */}
        {(() => {
          const grouped = bins.reduce((acc, b) => {
            const area = (b.area || 'Unknown').toString();
            if (!acc[area]) acc[area] = [];
            acc[area].push(b);
            return acc;
          }, {});

          const areaKeys = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

          return areaKeys.map(area => {
            const areaBins = (grouped[area] || []).sort((x, y) => (x.name || '').localeCompare(y.name || ''));
            return (
              <div key={area} className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-black uppercase text-slate-700">{area}</h4>
                  <p className="text-xs text-slate-400">{areaBins.length} bins</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {areaBins.map(bin => {
                    const scheme = getColorByType(bin.bin_type);
                    return (
                      <button
                        key={bin._id}
                        onClick={() => handleSelectBin(bin)}
                        className={`p-4 rounded-3xl border transition-all text-left shadow-sm flex flex-col items-start gap-2 ${
                          selectedBin?._id === bin._id ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-100'
                        }`}
                      >
                        <div className="flex items-center w-full justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`w-3 h-3 rounded-full ${scheme.bg}`}></span>
                            <p className={`font-black text-xs truncate ${selectedBin?._id === bin._id ? 'text-white' : 'text-slate-800'}`}>{bin.name}</p>
                          </div>
                          <p className={`mt-0 font-black text-sm ${selectedBin?._id === bin._id ? 'text-white' : 'text-blue-600'}`}>{bin.currentLevel}%</p>
                        </div>
                        <p className={`text-[8px] font-bold uppercase ${selectedBin?._id === bin._id ? 'text-blue-100' : 'text-slate-400'}`}>{bin.location_type || 'General'}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          });
        })()}
      </div>

      {/* CHART SECTION */}
      <div ref={analyticsRef} className={`transition-all duration-500 pb-10 ${selectedBin ? 'opacity-100' : 'opacity-0'}`}>
        {selectedBin && (
          <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-xl mx-2">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-black text-slate-800 uppercase">{selectedBin.name} Analysis</h2>
                <p className="text-[10px] font-bold text-slate-400">{selectedBin.area}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 px-3 py-1.5 rounded-xl text-center">
                  <p className="text-[8px] font-black text-blue-500 uppercase">Avg Fill Speed</p>
                  <p className="text-sm font-black text-slate-800">{analytics?.stats?.avgFillingRate || 'N/A'}</p>
                </div>

                
              </div>
            </div>

            {/* FIXED HEIGHT CONTAINER TO PREVENT RECHARTS ERRORS */}
            <div className="w-full h-[250px] relative">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                  <Loader2 className="animate-spin text-blue-500" size={32}/>
                </div>
              ) : analytics?.graphData?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.graphData}>
                    <defs>
                      <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" hide />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8'}} />
                    <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="level" stroke="#3b82f6" strokeWidth={4} fill="url(#colorLevel)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl">
                  <Activity size={40} className="mb-2 opacity-20" />
                  <p className="text-xs font-bold uppercase tracking-widest">No History Data</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BinAnalytics;