import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { AlertTriangle, Plus, MapPin, Activity, Loader2 } from 'lucide-react';
import { apiCall } from '../../utils/apiClient';
import { ENDPOINTS } from '../../utils/endpoints';

// --- MAP FLY-TO HELPER ---
function ChangeView({ center }) {
  const map = useMap();
  map.flyTo(center, 15, { duration: 2 });
  return null;
}

export default function HotspotAnalysis() {
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.9320, 77.7523]);

  // 1. Fetch Hotspot Data
  useEffect(() => {
    const fetchHotspots = async () => {
      try {
        const response = await apiCall('GET', ENDPOINTS?.ADMIN.HOSTPOT_STATS); // Apne endpoint se replace karein
        if (response.success) setHotspots(response.hotspots);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotspots();
  }, []);

  const handleSelectHotspot = (spot) => {
    setSelectedHotspot(spot);
    setMapCenter([spot.location.lat, spot.location.lng]);
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600" size={40}/></div>;

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* LEFT SIDEBAR: Hotspot List */}
      <div className="w-1/3 bg-white border-r border-slate-200 flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <AlertTriangle className="text-orange-500" /> Waste Hotspots
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Areas requiring additional infrastructure</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {hotspots.length === 0 ? (
            <div className="text-center py-10 text-slate-400 font-bold">No critical hotspots detected today.</div>
          ) : (
            hotspots.map((spot) => (
              <div 
                key={spot.bin_id}
                onClick={() => handleSelectHotspot(spot)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  selectedHotspot?.bin_id === spot.bin_id 
                  ? 'border-red-500 bg-red-50 shadow-md' 
                  : 'border-slate-100 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-800 text-lg">{spot.name}</h4>
                  <span className="bg-red-100 text-red-600 text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">High Load</span>
                </div>
                <p className="text-sm text-slate-500 flex items-center gap-1 mt-1"><MapPin size={14}/> {spot.area}</p>
                
                <div className="mt-4 grid grid-cols-2 gap-2">
                   <div className="bg-white p-2 rounded-lg border border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Avg Fill Time</p>
                      <p className="text-sm font-black text-slate-700">{spot.stats.avgFillingTime} hrs</p>
                   </div>
                   <div className="bg-white p-2 rounded-lg border border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Freq. Full</p>
                      <p className="text-sm font-black text-slate-700">{spot.stats.timesFullInLast10}/10 times</p>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT SIDE: Interactive Map */}
      <div className="flex-1 relative">
        <MapContainer center={mapCenter} zoom={15} className="h-full w-full" zoomControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
          
          <ChangeView center={mapCenter} />

          {selectedHotspot && (
            <>
              {/* Hotspot Pulse Circle */}
              <Circle 
                center={[selectedHotspot.location.lat, selectedHotspot.location.lng]}
                radius={600}
                pathOptions={{ 
                  fillColor: '#ef4444', 
                  color: '#ef4444', 
                  weight: 2, 
                  fillOpacity: 0.2,
                  dashArray: '5, 10'
                }}
              />
              
              {/* Original Bin Marker */}
              <Marker position={[selectedHotspot.location.lat, selectedHotspot.location.lng]} />
            </>
          )}
        </MapContainer>

        {/* Action Overlay */}
        {selectedHotspot && (
          <div className="absolute bottom-10 left-10 right-10 bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-white shadow-2xl z-[1000] animate-in slide-in-from-bottom-10">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-slate-800">Optimize {selectedHotspot.area}</h3>
                <p className="text-sm text-slate-500 font-medium">System suggests adding a new bin within the red zone to reduce load by 40%.</p>
              </div>
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95"
                onClick={() => alert(`Redirecting to Add Bin form at Lat: ${selectedHotspot.location.lat}, Lng: ${selectedHotspot.location.lng}`)}
              >
                <Plus size={20}/> Deploy New Bin
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}