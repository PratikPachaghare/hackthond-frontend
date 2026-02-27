import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Coins, MapPin, Loader2, X } from 'lucide-react';
import { API_BASE_URL, ENDPOINTS } from '../../../utils/endpoints';

const CaptureTab = ({
  creditPoints,
  setUploadCount,
  setReports,
  onUploadComplete,
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [stream, setStream] = useState(null);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [previewUrl, setLocalPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');

  // Start the device camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Prefers rear camera on mobile
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access denied or unavailable", err);
      alert("Please allow camera access to report waste.");
    }
  };

  // Cleanup camera when component unmounts
  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        setCapturedBlob(blob);
        setLocalPreviewUrl(URL.createObjectURL(blob));
        // Turn off camera momentarily
        if (stream) stream.getTracks().forEach(track => track.stop());
      }, 'image/jpeg', 0.8);
    }
  };

  const retakePhoto = () => {
    setCapturedBlob(null);
    setLocalPreviewUrl('');
    startCamera();
  };

const handleUpload = async () => {
    if (!capturedBlob) return;
    setIsUploading(true);
    setLocationStatus('Getting live location...');

    // 1. Get Live Location
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocationStatus('Uploading to server...');

        // 2. Prepare Data for Backend
        const formData = new FormData();
        
        // Note: The field name 'image' MUST match the multer upload.single('image') in the backend
        formData.append('image', capturedBlob, `garbage_${Date.now()}.jpg`);
        formData.append('latitude', latitude);
        formData.append('longitude', longitude);
        formData.append('userId', localStorage.getItem('publicUserId') || 'anonymous'); // Optional: associate with user if logged in

        try {
          // 3. REAL Backend Call
          // Ensure this URL matches your backend server URL and port
          const response = await fetch(`${API_BASE_URL}/upload-waste`, {
            method: 'POST',
            body: formData,
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Upload failed');
          }

          // 4. Update App State using the data returned from the server
          const newReport = {
            id: data.reportId || Date.now(),
            imageUrl: previewUrl, // Keep local preview for instant UI update
            serverImageUrl: data.imageUrl, // The path stored on the backend
            status: 'Pending Verification',
            date: new Date().toLocaleString(),
            lat: latitude.toFixed(4),
            lng: longitude.toFixed(4)
          };

          setReports(prev => [newReport, ...prev]);
          setUploadCount((prev) => prev + 1);
          setIsUploading(false);
          
          if (onUploadComplete) onUploadComplete();
          
        } catch (error) {
          console.error("Upload failed:", error);
          alert(`Failed to upload: ${error.message}`);
          setIsUploading(false);
        }
      },
      (error) => {
        console.error("Location error:", error);
        alert("Live location is required to submit a report. Please enable GPS.");
        setIsUploading(false);
        setLocationStatus('');
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-md mx-auto">
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900">Snap Garbage Image</h2>
          <span className="inline-flex items-center gap-1 text-xs font-black bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
            <Coins size={14} />
            {creditPoints} pts
          </span>
        </div>

        <p className="text-xs text-slate-500 mt-2">
          Capture a live photo of the waste. Gallery uploads are disabled to ensure authenticity.
        </p>

        {/* Camera Feed or Preview */}
        <div className="mt-4 relative h-72 rounded-2xl bg-black overflow-hidden flex items-center justify-center">
          {!previewUrl ? (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="h-full w-full object-cover"
              />
              <button 
                onClick={captureImage}
                className="absolute bottom-4 w-14 h-14 bg-white rounded-full border-4 border-slate-300 shadow-lg active:scale-95 transition-transform"
              />
            </>
          ) : (
            <>
              <img src={previewUrl} alt="Captured preview" className="h-full w-full object-cover" />
              <button 
                onClick={retakePhoto}
                className="absolute top-2 right-2 p-2 bg-slate-900/50 text-white rounded-full hover:bg-slate-900/70"
              >
                <X size={20} />
              </button>
            </>
          )}
          
          {/* Hidden Canvas for capturing the frame */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Upload Button */}
        {previewUrl && (
          <button 
            onClick={handleUpload}
            disabled={isUploading}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-2xl font-bold text-sm cursor-pointer active:scale-[0.99] transition-transform disabled:opacity-70"
          >
            {isUploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {locationStatus}
              </>
            ) : (
              <>
                <Upload size={16} />
                Submit with Location
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default CaptureTab;