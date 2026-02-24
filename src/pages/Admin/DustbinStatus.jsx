import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { apiCall } from '../../utils/apiClient'; 
import { ENDPOINTS } from '../../utils/endpoints'; 
import { X, MapPin, Clock, Navigation, Activity, Box, ShieldCheck, Loader2, Map as LucideMap } from 'lucide-react';

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

// Component to handle map fly-to animation when a bin is selected
const ChangeView = ({ center }) => {
  const map = useMap();
  map.flyTo(center, 15, { duration: 1.5 });
  return null;
};

const DustbinStatus = () => {
  const [selectedBin, setSelectedBin] = useState(null);
  const [dustbins, setDustbins] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const amravatiCenter = [20.9320, 77.7523]; 

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        setLoading(true);
        // Ensure endpoint matches your exact configuration
        const response = await apiCall('GET', ENDPOINTS?.DUSTBIN?.MAP_DUSTBINS || ENDPOINTS?.ADMIN?.GET_CITY_BINS); 
        
        // FIX: Backend seedha Array bhej raha hai, isliye Array.isArray check lagaya hai
        if (Array.isArray(response)) {
            setDustbins(response);
        } else if (response && response.data) {
            setDustbins(response.data);
        }
      } catch (error) {
        console.error("Map Data Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMapData();
  }, []);

  // Calculate Stats Dynamically
  const activeCount = dustbins.filter(bin => bin.isActive).length;
  const criticalCount = dustbins.filter(bin => (bin.currentLevel || 0) > 80).length;

  if (loading) {
    return (
      <div className="h-[calc(100vh-110px)] flex flex-col items-center justify-center bg-slate-50 rounded-[2rem] border-4 border-white shadow-xl">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-slate-500 font-bold uppercase tracking-widest">Loading Map Grid...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-50px)] flex flex-col space-y-4 bg-slate-50 font-sans relative">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm z-10 relative">
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
            <span className="text-lg font-black text-slate-800">{activeCount}</span>
          </div>
          <div className="bg-red-50 border border-red-100 px-4 py-2 rounded-xl flex flex-col items-center justify-center min-w-[100px]">
            <span className="text-[9px] text-red-400 font-black uppercase">Critical</span>
            <span className="text-lg font-black text-red-600">{criticalCount}</span>
          </div>
        </div>
      </div>

      <div className="relative flex-1 rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl">
        {/* MAP CONTAINER */}
        <MapContainer center={amravatiCenter} zoom={10} className="h-full w-full z-0" zoomControl={false}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; Amravati Smart City'
          />
          
          {/* RENDER MARKERS FROM DB DATA */}
          {dustbins.map((bin) => {
            if (!bin.location || !bin.location.lat || !bin.location.lng) return null;

            // NEW FIX: Add a very tiny random offset (approx 1-2 meters) to prevent perfect overlap
            const offsetLat = bin.location.lat + (Math.random() - 0.5) * 0.0001;
            const offsetLng = bin.location.lng + (Math.random() - 0.5) * 0.0001;

            const isCritical = (bin.currentLevel || 0) > 80;
            
            const customIcon = new L.DivIcon({
              className: 'custom-div-icon',
              html: `<div class="relative group cursor-pointer">
                      ${isCritical ? '<div class="absolute -inset-2 bg-red-500/30 rounded-full animate-ping"></div>' : ''}
                      <div class="p-2.5 rounded-full shadow-xl transition-all duration-300 group-hover:scale-125 ${isCritical ? 'bg-red-600' : 'bg-blue-700'} text-white border-2 border-white">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                      </div>
                    </div>`,
              iconSize: [35, 35]
            });

            return (
              <Marker 
                key={bin._id} 
                position={[offsetLat, offsetLng]} // Updated to use offset coordinates
                icon={customIcon} 
                eventHandlers={{ click: () => setSelectedBin(bin) }} 
              />
            );
          })}
          
          <ChangeView center={selectedBin ? [selectedBin.location.lat, selectedBin.location.lng] : amravatiCenter} />
        </MapContainer>

        {/* RIGHT SIDEBAR PANEL */}
        <div className={`absolute top-0 right-0 h-full w-[350px] bg-white/95 backdrop-blur-xl border-l border-slate-100 p-8 transform transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-[1000] shadow-2xl ${selectedBin ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`}>
          {selectedBin && (
            <div className="flex flex-col h-full text-slate-800">
              
              <div className="flex justify-between items-center mb-6">
                <span className={`text-[10px] font-black px-3 py-1 rounded tracking-[0.2em] uppercase ${selectedBin.location_type === 'Commercial' ? 'bg-orange-100 text-orange-700' : selectedBin.location_type === 'Industrial' ? 'bg-purple-100 text-purple-700' : 'bg-slate-900 text-white'}`}>
                  {selectedBin.location_type || 'General'}
                </span>
                <button onClick={() => setSelectedBin(null)} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full text-slate-400 transition-all">
                  <X size={20}/>
                </button>
              </div>

              <h3 className="text-3xl font-black text-slate-900 leading-tight mb-2 tracking-tight">{selectedBin.name}</h3>
              <p className="text-blue-600 text-[11px] font-extrabold flex items-center gap-2 mb-8 uppercase tracking-widest">
                <MapPin size={14}/> {selectedBin.area}
              </p>

              {/* LIQUID SATURATION ANIMATION */}
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 mb-8 flex flex-col items-center justify-center shadow-inner">
                <div className="w-32 h-44 bg-white rounded-b-3xl border-x-[6px] border-b-[6px] border-slate-800 relative overflow-hidden shadow-2xl">
                  <div 
                    className={`absolute bottom-0 w-full transition-all duration-[1.5s] ease-in-out ${(selectedBin.currentLevel || 0) > 80 ? 'bg-red-500' : (selectedBin.currentLevel || 0) > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                    style={{ height: `${selectedBin.currentLevel || 0}%` }}
                  >
                    <div className="absolute top-0 left-0 w-full h-3 bg-white/30 animate-pulse"></div>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <h4 className={`text-5xl font-black ${(selectedBin.currentLevel || 0) > 80 ? 'text-red-600' : 'text-slate-900'}`}>
                    {selectedBin.currentLevel || 0}%
                  </h4>
                  <p className="text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] mt-1">Saturation Level</p>
                </div>
              </div>

              {/* DATA GRID */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                
                {/* Node Status */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 transition-colors">
                   <ShieldCheck size={18} className={`${selectedBin.isActive ? 'text-emerald-500' : 'text-red-500'} mb-2`}/>
                   <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">Node Status</p>
                   <p className={`text-lg font-black ${selectedBin.isActive ? 'text-emerald-600' : 'text-red-600'}`}>
                     {selectedBin.isActive ? 'Online' : 'Offline'}
                   </p>
                </div>

                {/* Capacity Size */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 transition-colors">
                   <Box size={18} className="text-blue-500 mb-2"/>
                   <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">Capacity</p>
                   <p className="text-lg font-black text-slate-800">{selectedBin.size || 'Medium'}</p>
                </div>

                {/* AI Priority Score */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 transition-colors">
                   <Activity size={18} className="text-indigo-500 mb-2"/>
                   <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">Priority Score</p>
                   <p className="text-lg font-black text-slate-800">{selectedBin.priority_score || 0}</p>
                </div>

                {/* Last Seen Timestamp */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 transition-colors">
                   <Clock size={18} className="text-slate-400 mb-2"/>
                   <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">Last Seen</p>
                   <p className="text-sm font-black text-slate-800 mt-1">
                     {selectedBin.lastSeenAt ? new Date(selectedBin.lastSeenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
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