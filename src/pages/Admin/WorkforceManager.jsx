import React, { useState, useEffect } from 'react';
import { apiCall } from '../../utils/apiClient';
import { ENDPOINTS } from '../../utils/endpoints';
import { Users, Search, CheckCircle2, XCircle, Phone, Mail, Loader2, UserMinus, ShieldCheck, HardHat } from 'lucide-react';

const WorkforceManager = () => {
  // 1. Initial states set to empty structures to prevent 'undefined' errors
  const [data, setData] = useState({ admins: [], workers: [] });
  const [stats, setStats] = useState({ total: 0, adminCount: 0, workerCount: 0 });
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [viewRole, setViewRole] = useState("worker"); 
  const [workerFilter, setWorkerFilter] = useState("all");

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        const response = await apiCall('GET', ENDPOINTS?.WORKER?.GET_ALL_WORKERS);
        
        // 2. Defensive check: Ensure response and response.data exist
        if (response && response.success && response.data) {
          setData({
            admins: response.data.admins ?? [],
            workers: response.data.workers ?? []
          });

          // 3. Safe stats extraction using Optional Chaining
          setStats({
            total: response.totalCount ?? 0,
            adminCount: response.stats?.adminCount ?? 0,
            workerCount: response.stats?.workerCount ?? 0
          });
        }
      } catch (error) {
        console.error("Error fetching staff:", error);
        // Reset to empty state on error instead of leaving it undefined
        setData({ admins: [], workers: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  // 4. Helper to get the current list safely
  const getFilteredList = () => {
    // Fallback to empty array if data or properties are missing
    const currentList = viewRole === 'admin' ? (data?.admins ?? []) : (data?.workers ?? []);
    
    return currentList.filter(user => {
      if (!user) return false;
      const name = user.name?.toLowerCase() ?? "";
      const email = user.email?.toLowerCase() ?? "";
      const matchesSearch = name.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase());

      if (viewRole === 'worker' && workerFilter !== 'all') {
        const isWorking = workerFilter === 'working';
        return matchesSearch && user.isOnDuty === isWorking;
      }
      return matchesSearch;
    });
  };

  const displayList = getFilteredList();

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 text-slate-400">
      <Loader2 className="animate-spin mb-4" size={40} />
      <p className="font-bold tracking-widest uppercase text-xs">Syncing Staff Records...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* KPI BOXES */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[140px] bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Staff</p>
          <h3 className="text-2xl font-black text-slate-800">{stats.total}</h3>
        </div>
        <div className="flex-1 min-w-[140px] bg-white p-5 rounded-3xl border border-slate-100 shadow-sm border-l-4 border-l-blue-500">
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Admins</p>
          <h3 className="text-2xl font-black text-slate-800">{stats.adminCount}</h3>
        </div>
        <div className="flex-1 min-w-[140px] bg-white p-5 rounded-3xl border border-slate-100 shadow-sm border-l-4 border-l-orange-500">
          <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Field Workers</p>
          <h3 className="text-2xl font-black text-slate-800">{stats.workerCount}</h3>
        </div>
      </div>

      {/* TABS & SEARCH */}
      <div className="bg-white p-3 rounded-[2rem] shadow-sm border border-slate-100 space-y-3">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex bg-slate-100 p-1 rounded-2xl w-full md:w-auto">
            <button 
              onClick={() => setViewRole('worker')}
              className={`flex-1 md:flex-none flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${viewRole === 'worker' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              <HardHat size={14} /> WORKERS
            </button>
            <button 
              onClick={() => setViewRole('admin')}
              className={`flex-1 md:flex-none flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${viewRole === 'admin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              <ShieldCheck size={14} /> ADMINS
            </button>
          </div>

          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder={`Search ${viewRole}s...`}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* GRID LIST */}
      <div className="flex flex-wrap gap-4">
        {displayList.length > 0 ? (
          displayList.map((user) => (
            <div 
              key={user.id || user._id} 
              className="flex-1 min-w-[300px] max-w-[380px] bg-white p-6 rounded-[2.5rem] border border-slate-100 hover:shadow-xl transition-all relative group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl ${viewRole === 'admin' ? 'bg-blue-600' : 'bg-slate-800'}`}>
                    {user.name?.charAt(0) ?? '?'}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-lg leading-tight">{user.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{user.role}</p>
                  </div>
                </div>
                {viewRole === 'worker' && (
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${user.isOnDuty ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    {user.isOnDuty ? 'On Duty' : 'Off Duty'}
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-slate-500">
                  <Mail size={14} className="text-slate-300" />
                  <span className="text-sm font-medium truncate">{user.email}</span>
                </div>
                {viewRole === 'worker' && (
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl">
                     <div className="text-center flex-1 border-r border-slate-200">
                        <p className="text-[9px] font-black text-slate-400 uppercase">Rank</p>
                        <p className="text-sm font-black text-blue-600">{user.rank ?? 'N/A'}</p>
                     </div>
                     <div className="text-center flex-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase">Tasks</p>
                        <p className="text-sm font-black text-slate-800">{user.tasksCompleted ?? 0}</p>
                     </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="w-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-slate-400 font-bold">
             No records found.
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkforceManager;