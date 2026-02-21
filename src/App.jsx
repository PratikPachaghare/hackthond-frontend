import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Dashboard from './assets/pages/Admin/Dashboard';
import DustbinStatus from './assets/pages/Admin/DustbinStatus';
import Prediction from './assets/pages/Admin/Prediction';
// import { Sidebar } from 'lucide-react';
import WorkerView from './assets/pages/worker/worker';
import Sidebar from './assets/Layout/Sidebar';

function App() {
  const [activeTab, setActiveTab] = useState('dash');

  return (
    <Router>
      <Routes>
        {/* Admin Route (Desktop/Mobile) */}
        <Route path="/admin" element={
          <div className="flex bg-gray-50 min-h-screen">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className="flex-1 ml-64 p-8">
              {activeTab === 'dash' && <Dashboard />}
              {activeTab === 'status' && <DustbinStatus />}
              {activeTab === 'predict' && <Prediction />}
            </main>
          </div>
        } />

        {/* Worker Route (Mobile View) */}
        <Route path="/worker" element={<WorkerView />} />
        
        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/admin" />} />
      </Routes>
    </Router>
  );
}

export default App;
