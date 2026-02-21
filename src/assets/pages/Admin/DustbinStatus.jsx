import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mockData } from '../../../data'; // Corrected path based on your file structure
import { X, Wifi, MapPin, Clock, Trash2, Info, Navigation, Droplets, Activity, AlertTriangle, Map as LucideMap } from 'lucide-react';

// Fix for default Leaflet icon issues
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import shadowIcon from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: shadowIcon,
});

const ChangeView = ({ center }) => {
  const map = useMap();
  map.setView(center, 15);
  return null;
};

const DustbinStatus = () => {
  const [selectedBin, setSelectedBin] = useState(null);
  const amravatiCenter = [20.9320, 77.7523]; // Default Amravati Center

  return (
    <div className="h-[calc(100vh-110px)] flex flex-col space-y-4 bg-slate-50 font-sans">
      
      {/* MUNICIPAL AUTHORITY HEADER */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-700 rounded-xl text-white shadow-lg shadow-blue-100">
            <LucideMap size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Smart City Waste Grid</h2>
            <p className="text-slate-500 text-[11px] font-bold flex items-center gap-2 tracking-wider">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              AMRAVATI MUNICIPAL CORPORATION • LIVE SENSOR FEED
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <div className="bg-white border px-4 py-2 rounded-xl flex flex-col items-center justify-center min-w-[100px]">
            <span className="text-[9px] text-slate-400 font-black uppercase">Active Bins</span>
            <span className="text-lg font-black text-slate-800">124</span>
          </div>
          <div className="bg-red-50 border border-red-100 px-4 py-2 rounded-xl flex flex-col items-center justify-center min-w-[100px]">
            <span className="text-[9px] text-red-400 font-black uppercase">Critical</span>
            <span className="text-lg font-black text-red-600">18</span>
          </div>
        </div>
      </div>

      <div className="relative flex-1 rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl">
        {/* LIGHT THEME VOYAGER MAP */}
        <MapContainer center={amravatiCenter} zoom={14} className="h-full w-full z-0" zoomControl={false}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; Amravati Smart City'
          />
          
          {mockData.dustbins.map((bin) => {
            const customIcon = new L.DivIcon({
              className: 'custom-div-icon',
              html: `<div class="relative">
                      ${bin.level > 80 ? '<div class="absolute -inset-2 bg-red-500/20 rounded-full animate-ping"></div>' : ''}
                      <div class="p-2.5 rounded-full shadow-xl transition-transform hover:scale-110 ${bin.level > 80 ? 'bg-red-600' : 'bg-blue-700'} text-white border-2 border-white">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                      </div>
                    </div>`,
              iconSize: [35, 35]
            });

            return (
              <Marker 
                key={bin.id} 
                position={[bin.lat, bin.lng]} 
                icon={customIcon} 
                eventHandlers={{ click: () => setSelectedBin(bin) }} 
              />
            );
          })}
          <ChangeView center={selectedBin ? [selectedBin.lat, selectedBin.lng] : amravatiCenter} />
        </MapContainer>

        {/* RIGHT SIDEBAR: SENSOR DATA PANEL */}
        <div className={`absolute top-0 right-0 h-full w-[400px] bg-white/95 backdrop-blur-xl border-l border-slate-100 p-8 transform transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-[1000] shadow-2xl ${selectedBin ? 'translate-x-0' : 'translate-x-full'}`}>
          {selectedBin && (
            <div className="flex flex-col h-full text-slate-800">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black bg-slate-900 text-white px-3 py-1 rounded tracking-[0.2em] uppercase">Node: {selectedBin.id}</span>
                <button onClick={() => setSelectedBin(null)} className="p-2 hover:bg-red-50 hover:text-white rounded-full text-slate-400 transition-all"><X size={20}/></button>
              </div>

              <h3 className="text-3xl font-black text-slate-900 leading-tight mb-2 tracking-tight">{selectedBin.location}</h3>
              <p className="text-blue-600 text-[11px] font-extrabold flex items-center gap-2 mb-8 uppercase tracking-widest">
                <MapPin size={14}/> Amravati Municipal Zone 04
              </p>

              {/* CLEAN LIQUID ANIMATION */}
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 mb-8 flex flex-col items-center justify-center shadow-inner">
                <div className="w-32 h-44 bg-white rounded-b-3xl border-x-[6px] border-b-[6px] border-slate-800 relative overflow-hidden shadow-2xl">
                  <div 
                    className={`absolute bottom-0 w-full transition-all duration-[1.5s] ease-in-out ${selectedBin.level > 80 ? 'bg-red-500' : 'bg-blue-600'}`} 
                    style={{ height: `${selectedBin.level}%` }}
                  >
                    <div className="absolute top-0 left-0 w-full h-3 bg-white/30 animate-pulse"></div>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <h4 className={`text-5xl font-black ${selectedBin.level > 80 ? 'text-red-600' : 'text-slate-900'}`}>{selectedBin.level}%</h4>
                  <p className="text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] mt-1">Saturation Level</p>
                </div>
              </div>

              {/* SENSOR ANALYTICS GRID */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 transition-colors">
                   <Wifi size={18} className="text-blue-600 mb-2"/>
                   <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">Network Signal</p>
                   <p className="text-lg font-black text-slate-800">{selectedBin.signal || '92%'}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 transition-colors">
                   <AlertTriangle size={18} className="text-amber-500 mb-2"/>
                   <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">Methane (CH4)</p>
                   <p className="text-lg font-black text-slate-800">{selectedBin.methane || '0.2%'}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 transition-colors">
                   <Droplets size={18} className="text-cyan-500 mb-2"/>
                   <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">Humidity</p>
                   <p className="text-lg font-black text-slate-800">{selectedBin.humidity || '44%'}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 transition-colors">
                   <Clock size={18} className="text-slate-400 mb-2"/>
                   <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">Last Pickup</p>
                   <p className="text-lg font-black text-slate-800">{selectedBin.lastEmptied || '2h ago'}</p>
                </div>
              </div>

              <button className="mt-auto w-full bg-blue-700 hover:bg-blue-800 text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-[11px] transition-all shadow-xl shadow-blue-200 active:scale-95 flex items-center justify-center gap-3">
                <Navigation size={16}/> Dispatch Collection Unit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DustbinStatus;