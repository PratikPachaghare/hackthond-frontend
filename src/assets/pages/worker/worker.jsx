import React, { useState } from 'react';
import { mockData } from '../../../data';
import { Truck, CheckCircle, Navigation, Trash2 } from 'lucide-react';

const WorkerView = () => {
  const [tasks, setTasks] = useState(mockData.dustbins.filter(b => b.level > 60));

  const markAsEmpty = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
    alert("Dustbin Status Updated to Empty!");
  };

  return (
    <div className="bg-slate-50 min-h-screen p-4 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-black">Pickup Tasks</h1>
        <div className="bg-slate-900 text-white px-3 py-1 rounded-full text-xs">Total: {tasks.length}</div>
      </div>

      <div className="space-y-4">
        {tasks.map(bin => (
          <div key={bin.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">{bin.type}</span>
                <h3 className="text-lg font-bold mt-1">{bin.location}</h3>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-red-500">{bin.level}%</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Fill Level</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-3 rounded-2xl font-bold text-sm">
                <Navigation size={16}/> Navigate
              </button>
              <button 
                onClick={() => markAsEmpty(bin.id)}
                className="flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-2xl font-bold text-sm shadow-lg shadow-green-200"
              >
                <CheckCircle size={16}/> Mark Empty
              </button>
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={40} className="text-green-600"/>
            </div>
            <h2 className="text-xl font-bold">All Clean!</h2>
            <p className="text-gray-400">No bins currently require pickup.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerView;