import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ShieldCheck, Info, BarChart3 } from 'lucide-react';

import CaptureTab from './components/CaptureTab';
import VerifyTab from './components/VerifyTab';
import InfoTab from './components/InfoTab';
import StatsTab from './components/StatsTab';

export default function UsersApp({ initialTab = 'capture' }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [creditPoints, setCreditPoints] = useState(100);
  const [uploadCount, setUploadCount] = useState(0);
  const [pointsReceived, setPointsReceived] = useState(0);
  const [verificationCount, setVerificationCount] = useState(0);
  const [validReportCount, setValidReportCount] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [verification, setVerification] = useState(null);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/user/${tab}`);
  };

  const sharedProps = useMemo(
    () => ({
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
      onUploadComplete: () => handleTabChange('verify'),
    }),
    [
      creditPoints,
      uploadCount,
      pointsReceived,
      verificationCount,
      validReportCount,
      selectedImage,
      previewUrl,
      verification,
      handleTabChange,
    ]
  );

  const renderTab = () => {
    switch (activeTab) {
      case 'capture':
        return <CaptureTab {...sharedProps} />;
      case 'verify':
        return <VerifyTab {...sharedProps} />;
      case 'info':
        return <InfoTab {...sharedProps} />;
      case 'stats':
        return <StatsTab {...sharedProps} />;
      default:
        return <CaptureTab {...sharedProps} />;
    }
  };

  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col font-sans overflow-hidden">
      <div className="flex-1 overflow-y-auto pb-[86px]">{renderTab()}</div>

      <div className="fixed bottom-0 left-0 right-0 h-[74px] bg-white border-t border-slate-200 px-4 py-2 flex justify-around items-center z-[1000] shadow-[0_-8px_24px_rgba(15,23,42,0.08)]">
        <NavButton
          icon={Camera}
          label="SnapBin"
          tab="capture"
          activeTab={activeTab}
          onClick={handleTabChange}
        />
        <NavButton
          icon={ShieldCheck}
          label="TruthCheck"
          tab="verify"
          activeTab={activeTab}
          onClick={handleTabChange}
        />
        <NavButton
          icon={Info}
          label="Point Guide"
          tab="info"
          activeTab={activeTab}
          onClick={handleTabChange}
        />
        <NavButton
          icon={BarChart3}
          label="Report Stats"
          tab="stats"
          activeTab={activeTab}
          onClick={handleTabChange}
        />
      </div>
    </div>
  );
}

const NavButton = ({ icon: Icon, label, tab, activeTab, onClick }) => (
  <button
    onClick={() => onClick(tab)}
    className={`flex flex-col items-center justify-center gap-1 px-2 transition-colors ${
      activeTab === tab ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
    }`}
  >
    <Icon size={20} />
    <span className="text-[10px] font-bold tracking-wide">{label}</span>
  </button>
);
