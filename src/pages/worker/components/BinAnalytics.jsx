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

  useEffect(() => {
    const fetchBins = async () => {
      try {
        setInitialLoading(true);
        const res = await apiCall('GET', ENDPOINTS?.DUSTBIN?.MAP_DUSTBINS || ENDPOINTS?.ADMIN?.GET_CITY_BINS);
        setBins(Array.isArray(res) ? res : res?.data || []);
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {bins.map(bin => (
            <button 
              key={bin._id}
              onClick={() => handleSelectBin(bin)}
              className={`p-4 rounded-3xl border transition-all text-left shadow-sm ${
                selectedBin?._id === bin._id ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-100'
              }`}
            >
              <p className={`font-black text-xs truncate ${selectedBin?._id === bin._id ? 'text-white' : 'text-slate-800'}`}>{bin.name}</p>
              <p className={`text-[8px] font-bold uppercase ${selectedBin?._id === bin._id ? 'text-blue-100' : 'text-slate-400'}`}>{bin.area}</p>
              <p className={`mt-2 font-black ${selectedBin?._id === bin._id ? 'text-white' : 'text-blue-600'}`}>{bin.currentLevel}%</p>
            </button>
          ))}
        </div>
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
              <div className="bg-blue-50 px-3 py-1.5 rounded-xl text-center">
                <p className="text-[8px] font-black text-blue-500 uppercase">Avg Fill Speed</p>
                <p className="text-sm font-black text-slate-800">{analytics?.stats?.avgFillingRate || 'N/A'}</p>
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