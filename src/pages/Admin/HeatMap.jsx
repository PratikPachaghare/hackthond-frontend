import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Circle, Popup, Tooltip, ScaleControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Activity, AlertTriangle, Flame, MapPinned } from 'lucide-react';

const CITY_CENTER = [20.932, 77.7523];

// Internet-informed simulation anchors:
// - World Bank "What a Waste 2.0" (South Asia/urban waste growth context)
// - MoHUA SWM manual ranges (~0.2-0.6 kg/cap/day in Indian cities)
// - CPCB MSW reporting patterns (collection/processing variability)
const SIMULATION_BASELINE = {
  perCapitaKgPerDay: 0.52,
  collectionEfficiency: 0.82,
  avgOrganicShare: 0.56,
};

const CITY_ZONES = [
  { name: 'Rajkamal Square', lat: 20.9348, lng: 77.7589, density: 1.35, commercial: 1.25 },
  { name: 'Gadge Nagar', lat: 20.9252, lng: 77.7443, density: 1.18, commercial: 1.15 },
  { name: 'Rathi Nagar', lat: 20.9426, lng: 77.7691, density: 1.12, commercial: 1.1 },
  { name: 'Badnera', lat: 20.8745, lng: 77.7275, density: 0.95, commercial: 0.92 },
  { name: 'Camp', lat: 20.9386, lng: 77.7812, density: 1.24, commercial: 1.3 },
  { name: 'Panchavati', lat: 20.9534, lng: 77.7351, density: 1.05, commercial: 0.98 },
  { name: 'Irwin Square', lat: 20.9299, lng: 77.7608, density: 1.28, commercial: 1.22 },
  { name: 'Dastur Nagar', lat: 20.9217, lng: 77.7764, density: 1.09, commercial: 1.04 },
  { name: 'Sainagar', lat: 20.9467, lng: 77.7288, density: 0.97, commercial: 0.9 },
  { name: 'Amravati Central', lat: 20.9318, lng: 77.7529, density: 1.32, commercial: 1.28 },
];

const getSeededRandom = (seed) => {
  const x = Math.sin(seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const buildSimulatedBinData = () => {
  const bins = [];

  CITY_ZONES.forEach((zone, zoneIndex) => {
    const binCount = 7 + Math.floor(getSeededRandom(zoneIndex + 1) * 6);

    for (let i = 0; i < binCount; i += 1) {
      const seedBase = zoneIndex * 100 + i + 1;
      const latJitter = (getSeededRandom(seedBase) - 0.5) * 0.02;
      const lngJitter = (getSeededRandom(seedBase + 9) - 0.5) * 0.02;

      const fillFrequencyPerWeek = Math.round(
        clamp(5 + zone.density * 5 + zone.commercial * 4 + getSeededRandom(seedBase + 17) * 3, 3, 18),
      );

      const garbageKgPerDay = Math.round(
        clamp(
          45 +
            SIMULATION_BASELINE.perCapitaKgPerDay * 100 * zone.density +
            zone.commercial * 42 +
            getSeededRandom(seedBase + 33) * 60,
          40,
          260,
        ),
      );

      const expectedCollectionGap = (1 - SIMULATION_BASELINE.collectionEfficiency) * 100;
      const overflowRisk = clamp(
        fillFrequencyPerWeek * 3.2 + garbageKgPerDay * 0.18 + expectedCollectionGap + getSeededRandom(seedBase + 51) * 12,
        25,
        98,
      );

      const heatWeight =
        (fillFrequencyPerWeek / 18) * 0.45 +
        (garbageKgPerDay / 260) * 0.4 +
        (overflowRisk / 100) * 0.15;

      bins.push({
        id: `${zone.name}-${i + 1}`,
        area: zone.name,
        lat: zone.lat + latJitter,
        lng: zone.lng + lngJitter,
        fillFrequencyPerWeek,
        garbageKgPerDay,
        overflowRisk: Math.round(overflowRisk),
        heatWeight: clamp(heatWeight, 0, 1),
      });
    }
  });

  return bins;
};

const getHeatColor = (weight) => {
  if (weight >= 0.82) return '#dc2626';
  if (weight >= 0.68) return '#f97316';
  if (weight >= 0.52) return '#facc15';
  if (weight >= 0.38) return '#84cc16';
  return '#22c55e';
};

const hexToRgb = (hex) => {
  const hx = hex.replace('#', '');
  const bigint = parseInt(hx, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
};

const rgbaFromHex = (hex, alpha = 0.5) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const HeatMap = () => {
  const cityBinHeatData = useMemo(() => buildSimulatedBinData(), []);

  // Use the defined CITY_ZONES as map areas.  Each zone gets a circle centered on its coordinates.
  const ZONE_AREAS = CITY_ZONES.map((zone, idx) => ({
    id: `${zone.name}-${idx}`,
    name: zone.name,
    center: [zone.lat, zone.lng],
    radius: 1200, // meters radius around point
  }));

  // utility to compute distance (haversine) in meters between two lat/lng
  const distanceMeters = (lat1, lon1, lat2, lon2) => {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371000; // earth radius meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Assign a simulated collection status per zone, also compute average fill frequency from bins.
  const zoneStatuses = useMemo(() => {
    return ZONE_AREAS.map((z, idx) => {
      const rv = getSeededRandom(idx + 3);
      const status = rv > 0.72 ? 'critical' : rv > 0.48 ? 'high' : rv > 0.22 ? 'medium' : 'low';
      const color = status === 'critical' ? '#dc2626' : status === 'high' ? '#f97316' : status === 'medium' ? '#facc15' : '#22c55e';
      const binsIn = cityBinHeatData.filter((bin) => {
        return (
          distanceMeters(z.center[0], z.center[1], bin.lat, bin.lng) <= z.radius
        );
      });
      const avgFill = binsIn.length
        ? (binsIn.reduce((a, b) => a + b.fillFrequencyPerWeek, 0) / binsIn.length).toFixed(1)
        : 'N/A';
      const totalGarbage = binsIn.reduce((a, b) => a + b.garbageKgPerDay, 0);
      const avgGarbage = binsIn.length ? (totalGarbage / binsIn.length).toFixed(0) : 'N/A';
      return { ...z, status, color, avgFill, binCount: binsIn.length, totalGarbage, avgGarbage };
    });
  }, [cityBinHeatData]);

  const summary = useMemo(() => {
    const totalDailyKg = cityBinHeatData.reduce((acc, bin) => acc + bin.garbageKgPerDay, 0);
    const avgFillFrequency = cityBinHeatData.reduce((acc, bin) => acc + bin.fillFrequencyPerWeek, 0) / cityBinHeatData.length;
    const highRiskBins = cityBinHeatData.filter((bin) => bin.overflowRisk >= 75).length;

    return {
      totalDailyKg,
      avgFillFrequency: avgFillFrequency.toFixed(1),
      highRiskBins,
      totalBins: cityBinHeatData.length,
    };
  }, [cityBinHeatData]);

  // extra random circles scattered around for visual interest
  const randomCircles = useMemo(() => {
    const colors = ['#dc2626', '#f97316', '#facc15', '#84cc16', '#22c55e', '#3b82f6', '#8b5cf6'];
    return Array.from({ length: 12 }, (_, i) => {
      // increase jitter range so circles are more spread
      const lat = CITY_CENTER[0] + (getSeededRandom(i + 5) - 0.5) * 0.1;
      const lng = CITY_CENTER[1] + (getSeededRandom(i + 15) - 0.5) * 0.1;
      // smaller radius variance also reduces overlaps
      const radius = 600 + getSeededRandom(i + 25) * 1200;
      const color = colors[Math.floor(getSeededRandom(i + 35) * colors.length)];
      return { id: `rand-${i}`, center: [lat, lng], radius, color };
    });
  }, []);

  return (
    <div className="space-y-4 bg-slate-50 min-h-screen">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <MapPinned className="text-red-500" size={22} /> City Heat Map
          </h2>
          <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wide">
            Simulated full-city waste pressure based on dustbin fill frequency + collected garbage + overflow risk
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full md:w-auto">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Simulated Bins</p>
            <p className="text-lg font-black text-slate-800">{summary.totalBins}</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Daily Garbage</p>
            <p className="text-lg font-black text-slate-800">{summary.totalDailyKg} kg</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Avg Fill / Week</p>
            <p className="text-lg font-black text-slate-800">{summary.avgFillFrequency}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            <p className="text-[10px] text-red-500 font-bold uppercase">High Risk</p>
            <p className="text-lg font-black text-red-600">{summary.highRiskBins}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
        <MapContainer
          center={CITY_CENTER}
          zoom={12}
          style={{ height: '60vh', maxHeight: '720px', minHeight: '360px', width: '100%', borderRadius: '0.75rem' }}
          className="w-full rounded-xl"
          zoomControl
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap &copy; CARTO'
          />
          <ScaleControl position="bottomleft" />


          {zoneStatuses.map((q) => (
            <Circle
              key={q.id}
              center={q.center}
              radius={q.radius}
              pathOptions={{
                color: q.color,
                fillColor: q.color,
                fillOpacity: 0.32,
                weight: 1.2,
              }}
            >
              <Tooltip direction="top" sticky>
                <span className="font-semibold">{q.name}</span><br />
                <span className="text-xs">Status: {q.status}</span><br />
                <span className="text-xs">Avg fill/wk: {q.avgFill}</span><br />
                <span className="text-xs">Avg garbage/day: {q.avgGarbage} kg</span>
              </Tooltip>
              <Popup>
                <div className="space-y-1 min-w-[160px]">
                  <p className="font-extrabold text-slate-800">{q.name}</p>
                  <p className="text-xs text-slate-600">Status: {q.status}</p>
                  <p className="text-xs text-slate-600">Avg fill/week: {q.avgFill}</p>
                  <p className="text-xs text-slate-600">Bins counted: {q.binCount}</p>
                </div>
              </Popup>
            </Circle>
          ))}

          {/* random circles for extra color and size variation */}
          {randomCircles.map((c) => (
            <Circle
              key={c.id}
              center={c.center}
              radius={c.radius}
              pathOptions={{
                color: c.color,
                fillColor: c.color,
                fillOpacity: 0.18,
                weight: 0.8,
              }}
            >
              <Tooltip direction="top" sticky>
                <span className="text-xs">radius ~{Math.round(c.radius)} m</span>
              </Tooltip>
            </Circle>
          ))}
        </MapContainer>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
        <span className="flex items-center gap-1"><Flame size={14} className="text-red-600" /> Red = Critical pressure</span>
        <span className="flex items-center gap-1"><AlertTriangle size={14} className="text-orange-500" /> Orange = High pressure</span>
        <span className="flex items-center gap-1"><Activity size={14} className="text-yellow-500" /> Yellow/Green = Moderate to low pressure</span>
      </div>
    </div>
  );
};

export default HeatMap;
