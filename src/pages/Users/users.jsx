import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ShieldCheck, Info, BarChart3 } from 'lucide-react';

import CaptureTab from './components/CaptureTab';
import VerifyTab from './components/VerifyTab';
import InfoTab from './components/InfoTab';
import StatsTab from './components/StatsTab';
import { API_BASE_URL } from '../../utils/endpoints';

export default function UsersApp({ initialTab = 'capture' }) {
  const navigate = useNavigate();

  // --- AUTHENTICATION STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // --- APP STATE ---
  const [activeTab, setActiveTab] = useState(initialTab);
  const [creditPoints, setCreditPoints] = useState(100);
  const [uploadCount, setUploadCount] = useState(0);
  const [pointsReceived, setPointsReceived] = useState(0);
  const [verificationCount, setVerificationCount] = useState(0);
  const [validReportCount, setValidReportCount] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [verification, setVerification] = useState(null);
  const [reports, setReports] = useState([]);

  // Check for existing login session on load
  useEffect(() => {
    const storedUserId = localStorage.getItem('publicUserId');
    if (storedUserId) {
      setUserId(storedUserId);
      setIsAuthenticated(true);
    }
  }, []);

  // --- LOGIN HANDLER ---
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');

    try {
      // Make sure the port matches your backend (8000 based on your logs)
      const response = await fetch(`${API_BASE_URL}/public-user-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput })
      });
      
      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        setUserId(data.userId);
        localStorage.setItem('publicUserId', data.userId); // Keep user logged in
        localStorage.setItem('publicUsername', data.username);
      } else {
        setAuthError(data.error || 'Authentication failed');
      }
    } catch (err) {
      console.error(err);
      setAuthError('Error connecting to the server. Is the backend running?');
    }
  };

  // --- TAB NAVIGATION ---
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/user/${tab}`);
  };

  // --- LOGOUT HANDLER (Optional, but good to have) ---
  const handleLogout = () => {
    localStorage.removeItem('publicUserId');
    localStorage.removeItem('publicUsername');
    setIsAuthenticated(false);
    setUserId(null);
  };

  const sharedProps = useMemo(
    () => ({
      userId, // Passed down so CaptureTab can use it for uploads
      creditPoints,
      setCreditPoints,
      uploadCount,
      setUploadCount,
      pointsReceived,
      setPointsReceived,
      verificationCount,
      setVerificationCount,
      validReportCount,
      setValidReportCount,
      selectedImage,
      setSelectedImage,
      previewUrl,
      setPreviewUrl,
      verification,
      setVerification,
      reports,
      setReports,
      onUploadComplete: () => handleTabChange('stats'),
    }),
    [
      userId,
      creditPoints,
      uploadCount,
      pointsReceived,
      verificationCount,
      validReportCount,
      selectedImage,
      previewUrl,
      verification,
      reports,
    ]
  );

  // --- LOGIN SCREEN RENDER ---
  if (!isAuthenticated) {
    return (
      <div className="h-screen w-full bg-slate-50 flex items-center justify-center font-sans">
        <form onSubmit={handleAuth} className="bg-white p-8 rounded-xl shadow-lg w-80 flex flex-col gap-4 border border-slate-100">
          <div className="text-center mb-2">
            <h2 className="text-2xl font-bold text-emerald-600">SmartBin</h2>
            <p className="text-sm text-slate-500 mt-1">Sign in or auto-register to report</p>
          </div>
          
          {authError && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{authError}</div>}
          
          <input
            type="text"
            placeholder="Username"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            className="p-3 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 transition-colors"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="p-3 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 transition-colors"
            required
          />
          <button 
            type="submit" 
            className="bg-emerald-600 text-white font-semibold p-3 rounded-lg hover:bg-emerald-700 transition-colors mt-2"
          >
            Continue
          </button>
        </form>
      </div>
    );
  }

  // --- MAIN APP RENDER ---
  const renderTab = () => {
    switch (activeTab) {
      case 'capture': return <CaptureTab {...sharedProps} />;
      case 'stats': return <StatsTab {...sharedProps} />;
      case 'info': return <InfoTab {...sharedProps} />;
      default: return <CaptureTab {...sharedProps} />;
    }
  };

  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col font-sans overflow-hidden relative">
      
      {/* Optional Top bar for logout */}
      <div className="absolute top-0 right-0 p-4 z-50">
        <button onClick={handleLogout} className="text-xs text-slate-500 hover:text-slate-800 bg-white px-3 py-1 rounded shadow-sm border border-slate-200">
          Logout
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-[86px] pt-12">{renderTab()}</div>

      <div className="fixed bottom-0 left-0 right-0 h-[74px] bg-white border-t border-slate-200 px-4 py-2 flex justify-around items-center z-[1000] shadow-[0_-8px_24px_rgba(15,23,42,0.08)]">
        <NavButton icon={Camera} label="SnapBin" tab="capture" activeTab={activeTab} onClick={handleTabChange} />
        <NavButton icon={Info} label="app Guide" tab="info" activeTab={activeTab} onClick={handleTabChange} />
        <NavButton icon={BarChart3} label="Report Stats" tab="stats" activeTab={activeTab} onClick={handleTabChange} />
      </div>
    </div>
  );
}

const NavButton = ({ icon: Icon, label, tab, activeTab, onClick }) => (
  <button
    onClick={() => onClick(tab)}
    className={`flex flex-col items-center justify-center gap-1 px-2 transition-colors ${
      activeTab === tab ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-700'
    }`}
  >
    <Icon size={20} />
    <span className="text-[10px] font-bold tracking-wide">{label}</span>
  </button>
);