import React, { useState } from 'react';
import { mockData } from '../../data';
import { Search, Map, PhoneCall } from 'lucide-react';

const Prediction = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = mockData.workers.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-800">Field Staff Tracking</h2>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18}/>
          <input 
            type="text" 
            placeholder="Search workers..." 
            className="pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none w-64"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map(worker => (
          <div key={worker.id} className="bg-white p-4 rounded-2xl shadow-sm border flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-600 border-2 border-white shadow-sm">
                {worker.avatar}
              </div>
              <div>
                <h4 className="font-bold">{worker.name}</h4>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Map size={12}/> {worker.location} • {worker.collectionCount} Bins Collected
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
               <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${worker.status === 'On Duty' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {worker.status}
               </span>
               <button className="p-2 bg-blue-50 text-blue-600 rounded-lg"><PhoneCall size={18}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Prediction;