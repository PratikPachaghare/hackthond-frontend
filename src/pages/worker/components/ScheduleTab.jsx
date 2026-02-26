import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { apiCall } from '../../../utils/apiClient';
import { ENDPOINTS } from '../../../utils/endpoints';

const ScheduleTab = ({ onStartRoute }) => {
  const [targetBins, setTargetBins] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        setLoading(true);
        // 1. Fetch data from backend
        const response = await apiCall('GET', ENDPOINTS?.WORKER?.GET_OPTIMIZED_TASKS || ENDPOINTS?.ADMIN?.GET_CITY_BINS);
        console.log("Optimized tasks fetched:", response);
        // 2. Extract the 'tasks' array sent by your Node.js backend
        // (Assuming apiCall returns the raw JSON body. If it returns an Axios object, use response.data.tasks)
        const optimizedBins = response?.tasks || response?.data?.tasks || [];
        
        // 3. Set the state directly! Trust the AI model's output instead of filtering again.
        setTargetBins(optimizedBins);

      } catch (error) {
        console.error("Schedule Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchScheduleData();
  }, []);

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={32}/></div>;

  return (
    <div className="p-4 flex flex-col gap-4 h-full animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="mt-4 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Schedule</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Predicted & Critical Bins</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 space-y-3">
        {targetBins.length === 0 ? (
          <p className="text-slate-400 text-center mt-10 font-bold">No bins require collection right now.</p>
        ) : (
          targetBins.map(bin => (
            <div key={bin._id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800">{bin.name}</h4>
                <p className="text-xs flex items-center gap-1 text-slate-500 mt-1"><MapPin size={12}/> {bin.area || 'Unknown Area'}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-red-500 font-black text-lg">{bin.currentLevel || 0}%</span>
                <span className="text-[9px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold uppercase">Critical</span>
              </div>
            </div>
          ))
        )}
      </div>

      {targetBins.length > 0 && (
        <button 
          onClick={() => onStartRoute(targetBins)}
          className="absolute bottom-24 left-4 right-4 bg-slate-900 text-white p-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-slate-300 active:scale-95 transition-all flex justify-center items-center gap-2"
        >
          <Navigation size={18} /> Start Collection Route
        </button>
      )}
    </div>
  );
};

export default ScheduleTab;