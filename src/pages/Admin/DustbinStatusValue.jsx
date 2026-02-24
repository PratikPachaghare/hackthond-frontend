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

// COMPONENT: Handles camera movement when the filtered 'dustbins' prop changes
const ChangeView = ({ bins }) => {
  const map = useMap();
  
  useEffect(() => {
    if (bins && bins.length > 0) {
      // Create bounds based on the coordinates of all visible bins
      const bounds = L.latLngBounds(bins.map(b => [b.location.lat, b.location.lng]));
      
      // If there's only one bin, flyTo it specifically. If many, fit the screen to all.
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
  const amravatiCenter = [20.9320, 77.7523]; 

  // Stats for the Map Sub-header
  const activeCount = dustbins.filter(bin => bin.isActive).length;
  const criticalCount = dustbins.filter(bin => (bin.currentLevel || 0) > 80).length;

  return (
    <div className="h-[800px] flex flex-col space-y-4 font-sans relative">
      
      {/* MAP SUB-HEADER */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-700 rounded-xl text-white shadow-lg shadow-blue-100">
            <LucideMap size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Geospatial Intelligence</h2>
            <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1.5 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              {dustbins.length} Active Nodes in this cluster
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
        {/* LEAFLET MAP */}
        <MapContainer center={amravatiCenter} zoom={13} className="h-full w-full z-0" zoomControl={false}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; Smart City AMC'
          />
          
          {dustbins.map((bin) => {
            if (!bin.location?.lat || !bin.location?.lng) return null;

            const isCritical = (bin.currentLevel || 0) > 80;
            
            const customIcon = new L.DivIcon({
              className: 'custom-div-icon',
              html: `<div class="relative cursor-pointer">
                      ${isCritical ? '<div class="absolute -inset-2 bg-red-500/40 rounded-full animate-ping"></div>' : ''}
                      <div class="p-2 rounded-full shadow-lg transition-all border-2 border-white ${isCritical ? 'bg-red-600' : 'bg-blue-700'} text-white">
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
                eventHandlers={{ click: () => setSelectedBin(bin) }} 
              />
            );
          })}
          
          <ChangeView bins={dustbins} />
        </MapContainer>

        {/* DETAILS SIDEBAR OVERLAY */}
        <div className={`absolute top-0 right-0 h-full w-[330px] bg-white/95 backdrop-blur-md border-l border-slate-100 p-8 transform transition-transform duration-500 z-[1000] shadow-2xl ${selectedBin ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`}>
          {selectedBin && (
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black px-3 py-1 bg-slate-900 text-white rounded uppercase tracking-widest">
                  {selectedBin.location_type || 'General'}
                </span>
                <button onClick={() => setSelectedBin(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                  <X size={20}/>
                </button>
              </div>

              <h3 className="text-2xl font-black text-slate-900 leading-tight mb-2 tracking-tight">{selectedBin.name}</h3>
              <p className="text-blue-600 text-[11px] font-bold flex items-center gap-1.5 mb-8 uppercase tracking-widest">
                <MapPin size={14}/> {selectedBin.area}
              </p>

              {/* LEVEL ANIMATION */}
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 mb-8 flex flex-col items-center shadow-inner">
                <div className="w-24 h-36 bg-white rounded-b-2xl border-x-4 border-b-4 border-slate-800 relative overflow-hidden shadow-lg">
                  <div 
                    className={`absolute bottom-0 w-full transition-all duration-[1.5s] ease-in-out ${(selectedBin.currentLevel || 0) > 80 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                    style={{ height: `${selectedBin.currentLevel || 0}%` }}
                  />
                </div>
                <h4 className="text-4xl font-black mt-4 text-slate-900">{selectedBin.currentLevel || 0}%</h4>
                <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-1">Live Fill Level</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-white p-4 rounded-2xl border border-slate-100">
                  <ShieldCheck size={16} className={selectedBin.isActive ? 'text-emerald-500' : 'text-red-500'}/>
                  <p className="text-[9px] text-slate-400 font-black uppercase mt-2">Status</p>
                  <p className="text-xs font-black">{selectedBin.isActive ? 'ONLINE' : 'OFFLINE'}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100">
                  <Clock size={16} className="text-slate-400"/>
                  <p className="text-[9px] text-slate-400 font-black uppercase mt-2">Sync Time</p>
                  <p className="text-xs font-black">
                    {selectedBin.updatedAt ? new Date(selectedBin.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just Now'}
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DustbinStatus;