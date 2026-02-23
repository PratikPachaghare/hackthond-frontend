import React, { useState } from 'react';
import { Home, Calendar, Map as MapIcon, User } from 'lucide-react';

// Import Components
import DashboardTab from './components/DashboardTab';
import ScheduleTab from './components/ScheduleTab';
import TrackTab from './components/TrackTab';
import ProfileTab from './components/ProfileTab'; // Assuming you kept this as-is from the previous step

export default function WorkerApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Only state shared is the active route (because it transitions from Schedule -> Track)
  const [activeRoute, setActiveRoute] = useState(null); 

  const handleStartRoute = (binsToCollect) => {
    setActiveRoute(binsToCollect);
    setActiveTab('track');
  };

  const handleRouteFinished = () => {
    setActiveRoute(null);
    setActiveTab('dashboard');
  };

  const renderTab = () => {
    switch(activeTab) {
      case 'dashboard': return <DashboardTab />;
      case 'schedule': return <ScheduleTab onStartRoute={handleStartRoute} />;
      case 'track': return <TrackTab activeRoute={activeRoute} setActiveRoute={setActiveRoute} onRouteFinished={handleRouteFinished} />;
      case 'profile': return <ProfileTab />;
      default: return <DashboardTab />;
    }
  };

  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col font-sans overflow-hidden">
      
      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative pb-[70px]"> 
        {renderTab()}
      </div>

      {/* BOTTOM NAVIGATION BAR */}
      <div className="fixed bottom-0 left-0 right-0 h-[70px] bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] px-6 py-2 flex justify-between items-center z-[1000] pb-safe">
        <NavButton icon={Home} label="Dash" tab="dashboard" activeTab={activeTab} onClick={setActiveTab} />
        <NavButton icon={Calendar} label="Schedule" tab="schedule" activeTab={activeTab} onClick={setActiveTab} />
        <NavButton icon={MapIcon} label="Track" tab="track" activeTab={activeTab} onClick={setActiveTab} />
        <NavButton icon={User} label="Profile" tab="profile" activeTab={activeTab} onClick={setActiveTab} />
      </div>
      
    </div>
  );
}

// Reusable Bottom Nav Button
const NavButton = ({ icon: Icon, label, tab, activeTab, onClick }) => (
  <button onClick={() => onClick(tab)} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === tab ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
    <Icon size={22} className={activeTab === tab ? 'fill-blue-100' : ''} />
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);