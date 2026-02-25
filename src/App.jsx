import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Dashboard from './pages/Admin/Dashboard';
import DustbinStatus from './pages/Admin/DustbinStatus';
import Prediction from './pages/Admin/WorkforceManager';
import WorkerView from './pages/worker/worker';
import Sidebar from './Layout/Sidebar';
import Auth from './pages/Auth/Auth';
import HotspotAnalysis from './pages/Admin/HotspotAnalysis';
import WorkforceManager from './pages/Admin/WorkforceManager';
import AddDustbinForm from './pages/Admin/AddDustbinForm';

function App() {
  const [activeTab, setActiveTab] = useState('dash');
  const [user, setUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

useEffect(() => {
    const savedUser = localStorage.getItem('user');
    
    // Check karein ki savedUser null ya literal string "undefined" toh nahi hai
    if (savedUser && savedUser !== 'undefined') {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem('user'); // Agar kachra data hai, toh use hata dein
      }
    }
    
    setInitialLoading(false);
  }, []);

  const ProtectedRoute = ({ children, allowedRole }) => {
    if (initialLoading) return null; // Wait for localStorage check
    if (!user) return <Navigate to="/auth" />;
    if (allowedRole && user.role !== allowedRole) return <Navigate to="/auth" />;
    return children;
  };

  if (initialLoading) return null;

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth setUser={setUser} />} />

        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRole="admin">
              <div className="flex bg-gray-50 min-h-screen">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
                <main className="flex-1 ml-64 p-8">
                  {activeTab === 'dash' && <Dashboard />}
                  {activeTab === 'status' && <DustbinStatus />}
                  {activeTab === 'AddDustbin' && <AddDustbinForm />}
                  {activeTab === 'Staff' && <WorkforceManager />}
                  {activeTab === 'hotspot' && <HotspotAnalysis />}
                </main>
              </div>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/worker" 
          element={
            <ProtectedRoute allowedRole="worker">
              <WorkerView />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/" 
          element={
            user ? (
              user?.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/worker" />
            ) : (
              <Navigate to="/auth" />
            )
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;