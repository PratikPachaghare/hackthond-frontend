import React, { useState } from 'react';
import { mockData } from '../../../data';
import { MapPin, AlertCircle, CheckCircle2, WifiOff, X } from 'lucide-react';

const Dashboard = () => {
  const [selectedBin, setSelectedBin] = useState(null);

  return (
    <div className="space-y-6 relative overflow-hidden">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Bins', val: mockData.stats.total, icon: <MapPin/>, color: 'blue' },
          { label: 'Critical (>80%)', val: mockData.stats.critical, icon: <AlertCircle/>, color: 'red' },
          { label: 'Offline', val: mockData.stats.offline, icon: <WifiOff/>, color: 'gray' },
          { label: 'Active Workers', val: mockData.stats.workersActive, icon: <CheckCircle2/>, color: 'green' },
        ].map((item, i) => (
          <div key={i} className={`bg-white p-5 rounded-2xl shadow-sm border-l-4 border-${item.color}-500 flex justify-between items-center`}>
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase">{item.label}</p>
              <h3 className="text-2xl font-black">{item.val}</h3>
            </div>
            <div className={`text-${item.color}-500`}>{item.icon}</div>
          </div>
        ))}
      </div>

      {/* Map View */}
      <div className="bg-slate-200 rounded-3xl h-[500px] relative border-4 border-white shadow-inner flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://carto.com/help/images/posts/all/carto-mobile-sdk/basic-concepts/map-tiles.png')] opacity-40"></div>
        {mockData.dustbins.map(bin => (
          <button 
            key={bin.id}
            onClick={() => setSelectedBin(bin)}
            className="relative group transition-transform hover:scale-110"
            style={{ position: 'absolute', top: `${(bin.lat % 1) * 1000}%`, left: `${(bin.lng % 1) * 1000}%` }}
          >
            <MapPin className={`${bin.level > 80 ? 'text-red-500 animate-bounce' : 'text-green-500'}`} size={32} fill="currentColor" fillOpacity={0.2}/>
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">{bin.location}</span>
          </button>
        ))}
      </div>

      {/* Animated Detail Modal (Slide in from right) */}
      {selectedBin && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 p-6 transition-transform transform translate-x-0 border-l border-gray-100">
          <button onClick={() => setSelectedBin(null)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"><X/></button>
          
          <h2 className="text-xl font-black mt-8">{selectedBin.location}</h2>
          <p className="text-sm text-gray-400">ID: {selectedBin.id}</p>

          {/* Animated Bin Fill Visual */}
          <div className="my-10 flex justify-center">
            <div className="w-24 h-36 border-4 border-slate-800 rounded-b-2xl relative overflow-hidden bg-gray-50">
              <div 
                className={`absolute bottom-0 w-full transition-all duration-1000 ${selectedBin.level > 80 ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ height: `${selectedBin.level}%` }}
              >
                <div className="absolute top-0 w-full h-2 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between border-b pb-2"><span>Fill Level</span><span className="font-bold text-red-500">{selectedBin.level}%</span></div>
            <div className="flex justify-between border-b pb-2"><span>Battery</span><span className="font-bold">{selectedBin.battery}</span></div>
            <div className="flex justify-between border-b pb-2"><span>Status</span><span className="text-green-600 font-bold">{selectedBin.status}</span></div>
          </div>
          <button className="w-full mt-8 bg-slate-900 text-white py-3 rounded-xl font-bold">Assign Collector</button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;