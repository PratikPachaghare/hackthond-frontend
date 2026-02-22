import React, { useState, useEffect } from 'react';
import { User, Loader2, LogOut, History, Truck, MapPin } from 'lucide-react';
import { apiCall } from '../../../utils/apiClient'; // Path maintained
import { ENDPOINTS } from '../../../utils/endpoints'; 

const ProfileTab = () => {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkerProfile = async () => {
      try {
        setLoading(true);
        // Backend function call jo token se worker data nikalta hai
        const response = await apiCall('GET', ENDPOINTS?.WORKER?.GET_WORKER_TOKEN || '/api/worker/profile'); 
        console.log("profile responce :", response);
        if (response?.success) {
          setWorker(response.data);
        }
      } catch (error) {
        console.error("Profile Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkerProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token'); // Token clear karein
    window.location.href = '/login'; // Redirect to login
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="animate-spin text-blue-500" size={32}/>
    </div>
  );

  return (
    <div className="p-4 flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
      {/* 👤 Profile Image & Name Section */}
      <div className="mt-8 flex flex-col items-center">
        <div className="w-24 h-24 bg-blue-100 rounded-full mb-4 flex items-center justify-center shadow-inner border-4 border-white">
          <User size={40} className="text-blue-600" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight text-center">
          {worker?.name || "Worker Name"} 
        </h2>
        <div className="flex items-center gap-1 mt-1 text-slate-500">
          <MapPin size={14} />
          <p className="text-xs font-bold uppercase tracking-widest">
            {worker?.area || "Not Assigned"} 
          </p>
        </div>
        {/* Added Email Display as seen in backend response */}
        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tight italic">
            {worker?.email || ""}
        </p>
      </div>

      {/* 📊 Quick Stats (Rank & Tasks) - Updated with backend mapping */}
      <div className="grid grid-cols-2 gap-4 w-full mt-8">
        <div className="bg-slate-50 p-4 rounded-3xl text-center border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Your Rank</p>
          <p className="text-xl font-black text-blue-600">{worker?.rank || "#1"}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-3xl text-center border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Completed</p>
          <p className="text-xl font-black text-slate-800">{worker?.tasksCompleted || 0}</p>
        </div>
      </div>

      {/* ⚙️ Settings / Actions */}
      <div className="mt-6 w-full bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col">
          <button className="flex items-center gap-3 text-left text-sm font-bold text-slate-700 p-4 hover:bg-slate-50 rounded-2xl transition-colors border-b border-slate-50">
            <History size={18} className="text-slate-400" />
            Duty History
          </button>
          
          <button className="flex items-center gap-3 text-left text-sm font-bold text-slate-700 p-4 hover:bg-slate-50 rounded-2xl transition-colors border-b border-slate-50">
            <Truck size={18} className="text-slate-400" />
            Vehicle Settings
          </button>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 text-left text-sm font-bold text-red-500 p-4 hover:bg-red-50 rounded-2xl transition-colors"
          >
            <LogOut size={18} />
            End Shift & Logout
          </button>
      </div>

      {/* Email / ID Footer - Updated mapping for backend ID */}
      <p className="mt-8 text-[10px] font-medium text-slate-300">
        Worker ID: {worker?.id ? worker.id.slice(-8).toUpperCase() : "N/A"} 
      </p>
    </div>
  );
};

export default ProfileTab;