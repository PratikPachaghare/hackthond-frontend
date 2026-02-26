import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, MapPin, Clock, Navigation, Activity, Box, ShieldCheck, Map as LucideMap } from 'lucide-react';

// Leaflet default icon fix
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import shadowIcon from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: shadowIcon,
});

const ChangeView = ({ bins }) => {
  const map = useMap();
  useEffect(() => {
    if (bins && bins.length > 0) {
      const bounds = L.latLngBounds(bins.map(b => [b.location.lat, b.location.lng]));
      if (bins.length === 1) {
        map.flyTo([bins[0].location.lat, bins[0].location.lng], 16, { duration: 1.5 });
      } else {
        map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
      }
    }
  }, [bins, map]);
  return null;
};

const DustbinStatus = ({ dustbins = [] }) => {
  const [selectedBin, setSelectedBin] = useState(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0); 
  const [filterType, setFilterType] = useState('All');
  const [searchName, setSearchName] = useState('');
  
  const amravatiCenter = [20.9320, 77.7523]; 

  // Reset tab index when a new marker is selected
  const handleMarkerClick = (bin) => {
    setSelectedBin(bin);
    setActiveTabIndex(0);
  };

  const filteredDustbins = dustbins.filter(b => {
    const matchesType = filterType === 'All' || b.bin_type === filterType;
    const matchesName = !searchName || (b.name || '').toLowerCase().includes(searchName.toLowerCase());
    return matchesType && matchesName;
  });

  const activeCount = filteredDustbins.filter(bin => bin.isActive).length;
  const criticalCount = filteredDustbins.filter(bin => (bin.currentLevel || 0) > 80).length;

  return (
    <div className="h-[800px] flex flex-col space-y-4 font-sans relative">
      {/* MAP SUB-HEADER */}
      <div className="flex flex-col gap-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-700 rounded-xl text-white shadow-lg shadow-blue-100">
            <LucideMap size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Geospatial Intelligence</h2>
            <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1.5 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              {filteredDustbins.length} Nodes in View
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="bg-slate-50 border px-3 py-1.5 rounded-xl flex flex-col items-center min-w-[80px]">
            <span className="text-[8px] text-slate-400 font-black uppercase">Active</span>
            <span className="text-sm font-black text-slate-800">{activeCount}</span>
          </div>
          <div className="bg-red-50 border border-red-100 px-3 py-1.5 rounded-xl flex flex-col items-center min-w-[80px]">
            <span className="text-[8px] text-red-400 font-black uppercase tracking-tighter">Critical</span>
            <span className="text-sm font-black text-red-600">{criticalCount}</span>
          </div>
        </div>
      </div>

      <div className="relative flex-1 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl bg-slate-200">
        {/* Filters Overlay */}
        <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-white/50 shadow-lg flex items-center gap-2">
          <select className="text-xs p-1 border rounded" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="All">All Types</option>
            <option value="Organic">Organic</option>
            <option value="Recyclable">Recyclable</option>
            <option value="Hazardous">Hazardous</option>
          </select>
          <input type="text" placeholder="Search..." className="text-xs p-1 border rounded" value={searchName} onChange={e => setSearchName(e.target.value)} />
        </div>

        <MapContainer center={amravatiCenter} zoom={13} className="h-full w-full z-0" zoomControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
          {filteredDustbins.map((bin) => {
            if (!bin.location?.lat || !bin.location?.lng) return null;
            const isCritical = (bin.currentLevel || 0) > 80;
            const customIcon = new L.DivIcon({
              className: 'custom-div-icon',
              html: `<div class="relative">
                      ${isCritical ? '<div class="absolute -inset-2 bg-red-500/40 rounded-full animate-ping"></div>' : ''}
                      <div class="p-2 rounded-full shadow-lg border-2 border-white ${isCritical ? 'bg-red-600' : 'bg-blue-700'} text-white">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                      </div>
                    </div>`,
              iconSize: [30, 30]
            });
            return (
              <Marker 
                key={bin._id} 
                position={[bin.location.lat, bin.location.lng]} 
                icon={customIcon} 
                eventHandlers={{ click: () => handleMarkerClick(bin) }} 
              />
            );
          })}
          <ChangeView bins={filteredDustbins} />
        </MapContainer>

        {/* SIDEBAR */}
        <div className={`absolute top-0 right-0 h-full w-full sm:w-[350px] bg-white/95 backdrop-blur-md border-l border-slate-100 p-6 transform transition-transform duration-500 z-[1000] shadow-2xl ${selectedBin ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`}>
          {selectedBin && (() => {
            const sameBins = dustbins.filter(bin => bin.name.trim() === selectedBin.name.trim());
            const currentBin = sameBins[activeTabIndex] || selectedBin;

            const getColor = (type) => {
              const map = {
                Organic: { bg: 'bg-green-600', text: 'text-green-600', light: 'bg-green-50', border: 'border-green-200' },
                Recyclable: { bg: 'bg-blue-700', text: 'text-blue-700', light: 'bg-blue-50', border: 'border-blue-200' },
                Hazardous: { bg: 'bg-red-600', text: 'text-red-600', light: 'bg-red-50', border: 'border-red-200' },
              };
              return map[type] || { bg: 'bg-slate-600', text: 'text-slate-600', light: 'bg-slate-50', border: 'border-slate-200' };
            };

            const colors = getColor(currentBin.bin_type);

            return (
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[10px] font-black px-2 py-1 rounded border uppercase tracking-widest ${colors.light} ${colors.text} ${colors.border}`}>
                    {currentBin.bin_type}
                  </span>
                  <button onClick={() => setSelectedBin(null)} className="p-1.5 bg-slate-100 rounded-full hover:bg-red-500 hover:text-white transition-all">
                    <X size={18}/>
                  </button>
                </div>

                {/* FIXED: Title and Location Moved ABOVE the tabs */}
                <h3 className="text-2xl font-black text-slate-800 mb-1">{currentBin.name}</h3>
                <p className="text-slate-500 text-xs flex items-center gap-1 mb-4 font-bold uppercase tracking-wider">
                  <MapPin size={12}/> {currentBin.area}
                </p>

                {/* FIXED: Segmented Control Tabs instead of scrolling "Node 1" buttons */}
                {sameBins.length > 1 && (
                  <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6">
                    {sameBins.map((bin, idx) => (
                      <button
                        key={bin._id}
                        onClick={() => setActiveTabIndex(idx)}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                          activeTabIndex === idx 
                            ? 'bg-white text-slate-900 shadow-sm' 
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {bin.bin_type}
                      </button>
                    ))}
                  </div>
                )}

                {/* Level Animation */}
                <div className={`${colors.light} p-6 rounded-3xl border ${colors.border} mb-6 flex flex-col items-center shadow-inner`}>
                  <div className="w-20 h-32 bg-white rounded-b-2xl border-x-4 border-b-4 border-slate-800 relative overflow-hidden">
                    <div 
                      className={`absolute bottom-0 w-full transition-all duration-1000 ${colors.bg}`} 
                      style={{ height: `${currentBin.currentLevel || 0}%` }}
                    >
                      <div className="w-full h-2 bg-white/20 animate-pulse" />
                    </div>
                  </div>
                  <h4 className={`text-3xl font-black mt-4 ${colors.text}`}>{currentBin.currentLevel}%</h4>
                  <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">Fill Level</p>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                    <ShieldCheck size={16} className={currentBin.isActive ? 'text-emerald-500' : 'text-red-500'} />
                    <p className="text-[8px] uppercase text-slate-400 font-bold mt-2">Status</p>
                    <p className="text-xs font-black">{currentBin.isActive ? 'ONLINE' : 'OFFLINE'}</p>
                  </div>
                  <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                    <Activity size={16} className="text-blue-500" />
                    <p className="text-[8px] uppercase text-slate-400 font-bold mt-2">Priority</p>
                    <p className="text-xs font-black">Score: {currentBin.priority_score || 0}</p>
                  </div>
                  <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm col-span-2 flex justify-between items-center">
                    <div>
                      <p className="text-[8px] uppercase text-slate-400 font-bold">Last Sync</p>
                      <p className="text-xs font-black">{currentBin.lastSeenAt ? new Date(currentBin.lastSeenAt).toLocaleTimeString() : 'Never'}</p>
                    </div>
                    <Clock size={16} className="text-slate-300" />
                  </div>
                </div>

                <button 
                  className={`w-full py-4 ${colors.bg} text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg`}
                  onClick={() => window.open(`https://www.google.com/maps?q=${currentBin.location.lat},${currentBin.location.lng}`)}
                >
                  <Navigation size={18} />
                  Start Route
                </button>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default DustbinStatus;