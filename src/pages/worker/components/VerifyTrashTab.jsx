import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, MapPin, AlertCircle, ExternalLink } from 'lucide-react';
import { API_BASE_URL } from '../../../utils/endpoints'; 

export default function VerifyTrashTab() {
  const [pendingReports, setPendingReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const WORKER_ID = 'WORKER_999';

  const fallbackImage = "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20200%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_18b%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A20pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_18b%22%3E%3Crect%20width%3D%22400%22%20height%3D%22200%22%20fill%3D%22%23eeeeee%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22105%22%20y%3D%22108.5%22%3EImage%20Not%20Found%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E";

  useEffect(() => {
    fetchPendingReports();
  }, []);

  const fetchPendingReports = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reports/pending`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      setPendingReports(data.reports || []);
    } catch (error) {
      console.error("Network error fetching reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (reportId, decision) => {
    setActionLoadingId(reportId);
    try {
      const response = await fetch(`${API_BASE_URL}/verify-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, workerId: WORKER_ID, decision }),
      });

      if (response.ok) {
        setPendingReports((prev) => prev.filter((report) => report._id !== reportId));
      } else {
        const errorData = await response.json();
        alert(`Verification failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error submitting verification:", error);
      alert("Network error while submitting verification.");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500">
        <Loader2 size={32} className="animate-spin mb-4 text-blue-500" />
        <p className="text-sm font-bold">Loading pending reports...</p>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-900">Verify Reports</h2>
        <p className="text-sm text-slate-500 mt-1">Review user submissions and locations.</p>
      </div>

      {pendingReports.length === 0 ? (
        <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
          <CheckCircle size={48} className="text-emerald-400 mb-4" />
          <h3 className="text-lg font-black text-emerald-900">All Caught Up!</h3>
          <p className="text-xs text-emerald-700 mt-2">There are no pending reports to verify.</p>
        </div>
      ) : (
        <div className="space-y-6 pb-20"> 
          {pendingReports.map((report) => {
            const lng = report.location?.coordinates?.[0];
            const lat = report.location?.coordinates?.[1];
            
            const mapEmbedUrl = lat && lng 
              ? `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.003},${lat-0.003},${lng+0.003},${lat+0.003}&layer=mapnik&marker=${lat},${lng}`
              : null;

            // Safely construct the image URL to prevent double slashes
            const safeBaseUrl = API_BASE_URL.replace(/\/$/, '');
            const finalImageUrl = `${safeBaseUrl}${report.imageUrl}`;

            return (
              <div key={report._id} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm flex flex-col">
                
                {/* Image Section - INCREASED HEIGHT TO h-64 */}
                <div className="h-64 bg-slate-100 relative">
                  <img 
                    src={finalImageUrl} 
                    alt="Trash Report" 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = fallbackImage; }}
                  />
                  {report.modelResult?.garbageStrash && (
                    <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 z-10">
                      <AlertCircle size={12} className={report.modelResult.garbageStrash.detected ? 'text-amber-400' : 'text-slate-400'} />
                      AI: {Math.round(report.modelResult.garbageStrash.confidence * 100)}% Match
                    </div>
                  )}
                </div>

                {/* Map Section - INCREASED HEIGHT TO h-48 & REMOVED pointer-events-none */}
                {mapEmbedUrl ? (
                  <div className="h-48 bg-slate-200 relative border-y border-slate-200">
                    <iframe 
                      title="Location Map"
                      width="100%" 
                      height="100%" 
                      frameBorder="0" 
                      src={mapEmbedUrl}
                      // Map is now fully interactive!
                    ></iframe>
                  </div>
                ) : (
                  <div className="h-16 bg-slate-100 flex items-center justify-center text-xs text-slate-400 border-y border-slate-200">
                    No location data available
                  </div>
                )}

                {/* Info & Actions */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm font-black text-slate-800">
                        Report #{report._id.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin size={12} />
                        {lat ? lat.toFixed(4) : 'N/A'}, {lng ? lng.toFixed(4) : 'N/A'}
                      </p>
                    </div>
                    
                    {lat && lng && (
                      <a 
                        href={`https://maps.google.com/?q=${lat},${lng}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1 hover:bg-blue-100 transition-colors"
                      >
                        Google Maps <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                  
                  <div className="flex gap-3 mt-2">
                    <button 
                      onClick={() => handleVerification(report._id, 'invalid')}
                      disabled={actionLoadingId === report._id}
                      className="flex-1 py-3 px-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 font-bold text-sm flex justify-center items-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
                    >
                      {actionLoadingId === report._id ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={18} />}
                      Reject
                    </button>
                    <button 
                      onClick={() => handleVerification(report._id, 'valid')}
                      disabled={actionLoadingId === report._id}
                      className="flex-1 py-3 px-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 font-bold text-sm flex justify-center items-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
                    >
                      {actionLoadingId === report._id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={18} />}
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}