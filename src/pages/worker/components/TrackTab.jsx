import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Map as MapIcon, Navigation, CheckCircle2, Loader2, ArrowRight, Clock, Milestone } from 'lucide-react';
import { apiCall } from '../../../utils/apiClient';
import { ENDPOINTS } from '../../../utils/endpoints';

// Leaflet default icon fix
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import shadowIcon from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: shadowIcon });

// 🔥 AUTO-CENTER CAMERA COMPONENT
const AutoCenterMap = ({ userLocation, isActive }) => {
  const map = useMap();
  useEffect(() => {
    if (userLocation && isActive) {
      map.panTo(new L.LatLng(userLocation[0], userLocation[1]));
    }
  }, [userLocation, map, isActive]);
  return null;
};

const TrackTab = ({ activeRoute, setActiveRoute, onRouteFinished }) => {
  const [userLoc, setUserLoc] = useState([20.9320, 77.7523]); 
  const [allBins, setAllBins] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [roadPath, setRoadPath] = useState([]); 
  
  // 🔥 NEW STATES FOR DIRECTIONS & ETA
  const [routeStats, setRouteStats] = useState({ distance: 0, duration: 0 });
  const [nextTurn, setNextTurn] = useState("Heading to first bin...");
  // Popup selection state for markers that have multiple bins with the same name
  const [popupSelected, setPopupSelected] = useState({});

  const amravatiCenter = [20.9320, 77.7523];

  // 1. Fetch Location
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => setUserLoc([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.error("GPS Error:", err),
        { enableHighAccuracy: true, maximumAge: 10000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // 2. Fetch Map Bins Data
  useEffect(() => {
    const fetchMapBins = async () => {
      if (activeRoute) return; 
      
      try {
        setLoading(true);
        const response = await apiCall('GET', ENDPOINTS?.DUSTBIN?.MAP_DUSTBINS || ENDPOINTS?.ADMIN?.GET_CITY_BINS);
        console.log("Map bins fetched:", response);
        setAllBins(Array.isArray(response) ? response : response?.data || []);
      } catch (error) {
        console.error("Map Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMapBins();
  }, [activeRoute]);

  // 3. Fetch Road Route & Directions
  useEffect(() => {
    if (!activeRoute || activeRoute.length === 0) {
      setRoadPath([]);
      setRouteStats({ distance: 0, duration: 0 });
      setNextTurn("");
      return;
    }

    const fetchRoadRoute = async () => {
      try {
        let coordinatesString = `${userLoc[1]},${userLoc[0]}`; 
        let validDestinations = 0;

        activeRoute.forEach(bin => {
          const lat = bin.location?.lat || bin.lat || bin.latitude;
          const lng = bin.location?.lng || bin.lng || bin.longitude;
          
          if (lat && lng) {
            coordinatesString += `;${lng},${lat}`;
            validDestinations++;
          }
        });

        if (validDestinations === 0) return;

        // 🔥 Added &steps=true to get turn-by-turn directions
        const url = `https://router.project-osrm.org/route/v1/driving/${coordinatesString}?overview=full&geometries=geojson&steps=true`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.code === "Ok" && data.routes && data.routes.length > 0) {
          const mainRoute = data.routes[0];
          
          // Draw Path
          const decodedRoads = mainRoute.geometry.coordinates.map(coord => [coord[1], coord[0]]);
          setRoadPath(decodedRoads);

          // Calculate ETA and Distance
          setRouteStats({
            distance: (mainRoute.distance / 1000).toFixed(1), // Meters to KM
            duration: Math.ceil(mainRoute.duration / 60) // Seconds to Minutes
          });

          // Get Next Turn Instruction
          if (mainRoute.legs && mainRoute.legs[0] && mainRoute.legs[0].steps && mainRoute.legs[0].steps.length > 1) {
            // Step 1 is usually the actual next turn (Step 0 is "head straight")
            const nextStep = mainRoute.legs[0].steps[1]; 
            const instruction = nextStep.maneuver.type.replace('-', ' ') + (nextStep.name ? ` on ${nextStep.name}` : "");
            setNextTurn(instruction.toUpperCase());
          } else {
            setNextTurn("Arriving at destination shortly");
          }
        }
      } catch (error) {
        console.error("❌ Network Error fetching road route:", error);
      }
    };

    fetchRoadRoute();
  }, [activeRoute, userLoc]);

const handleMarkCollected = async (binId) => {
  try {
    // 1. ENDPOINTS file se constant uthayein
    const endpoint = ENDPOINTS?.DUSTBIN?.COLLECTED_BIN || '/api/dustbins/update/collectBin';
    
    // 2. POST request bhejni hai body ke saath (Kyunki router.post hai)
    const response = await apiCall('POST', endpoint, { bin_id: binId });

    console.log("Collection response:", response);

    if (response?.success) {
      // 3. UI logic: Active route se bin ko remove karein
      if (activeRoute) {
        const updatedRoute = activeRoute.filter(bin => bin._id !== binId);
        
        if (updatedRoute.length === 0) {
          alert("All bins collected! Route finished.");
          onRouteFinished(); 
        } else {
          // Map markers aur polylines update karega
          setActiveRoute(updatedRoute);
        }
      }
      
      // Worker ki performance backend mein automatically update ho chuki hai
    } else {
      alert(response?.message || "Failed to update bin level.");
    }
  } catch (error) {
    console.error("Error collecting bin:", error);
    alert("Network Error: Could not reach server.");
  }
};

  const userIcon = new L.DivIcon({
    className: 'custom-user-icon',
    html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-pulse"></div>`,
    iconSize: [16, 16]
  });

  // Helper to map bin_type to color scheme
  const getColorByType = (binType) => {
    const typeColorMap = {
      Organic: { bg: 'bg-green-600', text: 'text-green-600', light: 'bg-green-50', border: 'border-green-200' },
      Recyclable: { bg: 'bg-blue-700', text: 'text-blue-700', light: 'bg-blue-50', border: 'border-blue-200' },
      Hazardous: { bg: 'bg-red-600', text: 'text-red-600', light: 'bg-red-50', border: 'border-red-200' },
    };
    return typeColorMap[binType] || { bg: 'bg-slate-600', text: 'text-slate-600', light: 'bg-slate-50', border: 'border-slate-200' };
  };

  if (loading && !activeRoute) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={32}/></div>;

  const displayBins = activeRoute || allBins;

  return (
    <div className="h-full relative flex flex-col">
      {/* HEADER: Shows General or Active Mode */}
      <div className="absolute top-4 left-4 right-4 z-[400] bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-white/50 shadow-lg">
        <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
          {activeRoute ? <><Navigation size={16} className="text-blue-600"/> Active Route Mode</> : <><MapIcon size={16} className="text-slate-400"/> General Map</>}
        </h3>
        {activeRoute && <p className="text-xs text-slate-500 font-medium mt-1">Navigating to {activeRoute.length} pending bins</p>}
      </div>

      <div className="flex-1 z-0">
        <MapContainer center={amravatiCenter} zoom={14} className="h-full w-full" zoomControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
          
          {/* Automatically center map on user when navigating */}
          <AutoCenterMap userLocation={userLoc} isActive={!!activeRoute} />

          <Marker position={userLoc} icon={userIcon} />

          {activeRoute && roadPath.length > 0 ? (
            <Polyline key="real-road" positions={roadPath} color="#2563eb" weight={6} opacity={0.8} />
          ) : activeRoute && (
             <Polyline 
               key="dashed-fallback" 
               positions={[userLoc, ...activeRoute.map(b => [b.location?.lat || b.lat || b.latitude, b.location?.lng || b.lng || b.longitude])]} 
               color="#94a3b8" weight={4} dashArray="8, 8" className="animate-pulse" 
             />
          )}

          {displayBins.map((bin) => {
            const lat = bin.location?.lat || bin.lat || bin.latitude;
            const lng = bin.location?.lng || bin.lng || bin.longitude;
            if (!lat || !lng) return null;

            const isCritical = (bin.currentLevel || 0) > 80;
            const customIcon = new L.DivIcon({
              className: 'custom-div-icon',
              html: `<div class="p-2 rounded-full shadow-lg ${isCritical ? 'bg-red-500' : 'bg-emerald-500'} text-white border-2 border-white"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg></div>`,
              iconSize: [30, 30]
            });

            // Find all bins that share the same name (trimmed) to show tabs in popup
            const sameBins = allBins.filter(b => b.name && bin.name && b.name.trim() === bin.name.trim());
            const selectedIndex = popupSelected[bin._id] || 0;
            const selectedBin = sameBins[selectedIndex] || bin;

            return (
              <Marker key={bin._id} position={[lat, lng]} icon={customIcon}>
                <Popup className="rounded-2xl">
                  <div className="p-2 font-sans max-w-xs">
                    <h4 className="font-bold text-slate-800 mb-2">{bin.name || 'Dustbin'}</h4>

                    {sameBins.length > 1 && (
                      <div className="flex gap-2 mb-3 flex-wrap">
                        {sameBins.map((sbin, idx) => {
                          const scheme = getColorByType(sbin.bin_type);
                          const isActiveTab = idx === selectedIndex;
                          return (
                            <button
                              key={sbin._id}
                              onClick={() => setPopupSelected(prev => ({ ...prev, [bin._id]: idx }))}
                              className={`px-3 py-1 rounded-md text-xs font-bold uppercase ${isActiveTab ? `${scheme.bg} text-white` : `${scheme.light} ${scheme.text} border ${scheme.border}`}`}
                            >
                              {sbin.bin_type} • {sbin.currentLevel || 0}%
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Selected bin details */}
                    <div className="mb-3">
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div className={`${getColorByType(selectedBin.bin_type).bg} h-3`} style={{ width: `${selectedBin.currentLevel || 0}%` }}></div>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">Type: <span className="font-bold">{selectedBin.bin_type || 'N/A'}</span></p>
                      <p className="text-xs text-slate-500">Capacity: <span className="font-bold">{selectedBin.size || 'Medium'}</span></p>
                      <p className="text-xs text-slate-500">Last Seen: <span className="font-bold">{selectedBin.lastSeenAt ? new Date(selectedBin.lastSeenAt).toLocaleString() : 'N/A'}</span></p>
                    </div>

                    {activeRoute && (
                      <button onClick={() => handleMarkCollected(selectedBin._id)} className="bg-emerald-500 text-white px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider w-full flex items-center justify-center gap-2 active:scale-95 transition-all">
                        <CheckCircle2 size={14}/> Mark Collected
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* 🔥 FOOTER: Directions & ETA Panel (Only shows when navigating) */}
      {activeRoute && roadPath.length > 0 && (
        <div className="absolute bottom-6 left-4 right-4 z-[400] bg-slate-900 rounded-2xl shadow-xl p-4 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-3 text-white mb-3">
            <div className="bg-blue-600 p-2 rounded-full"><ArrowRight size={20} className="text-white"/></div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Next Turn</p>
              <h4 className="font-bold text-lg leading-tight">{nextTurn}</h4>
            </div>
          </div>
          <div className="flex gap-4 border-t border-slate-700 pt-3">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Clock size={16} className="text-blue-400"/> <span>{routeStats.duration} Mins</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Milestone size={16} className="text-blue-400"/> <span>{routeStats.distance} KM Total</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackTab;