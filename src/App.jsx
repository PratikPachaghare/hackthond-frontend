import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Dashboard from './pages/Admin/Dashboard';
import DustbinStatus from './pages/Admin/DustbinStatus';
import Prediction from './pages/Admin/WorkforceManager';
import WorkerView from './pages/worker/worker';
import UsersView from './pages/Users/users';
import Sidebar from './Layout/Sidebar';
import Auth from './pages/Auth/Auth';
import HotspotAnalysis from './pages/Admin/HotspotAnalysis';
import WorkforceManager from './pages/Admin/WorkforceManager';
import AddDustbinForm from './pages/Admin/AddDustbinForm';
import HeatMap from './pages/Admin/HeatMap';

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
    const currentRole = user?.role?.toLowerCase?.();
    const normalizedRole = currentRole === 'users' ? 'user' : currentRole;
    const normalizedAllowedRole = allowedRole?.toLowerCase?.();
    if (initialLoading) return null; // Wait for localStorage check
    if (!user) return <Navigate to="/auth" />;
    if (normalizedAllowedRole && normalizedRole !== normalizedAllowedRole) return <Navigate to="/auth" />;
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
                  {activeTab === 'heatMap' && <HeatMap />}
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

        <Route path="/user" element={<UsersView initialTab="capture" />} />
        <Route path="/user/capture" element={<UsersView initialTab="capture" />} />
        <Route path="/user/verify" element={<UsersView initialTab="verify" />} />
        <Route path="/user/info" element={<UsersView initialTab="info" />} />
        <Route path="/user/stats" element={<UsersView initialTab="stats" />} />
        <Route path="/users" element={<Navigate to="/user" replace />} />
        <Route path="/Users" element={<Navigate to="/user" replace />} />
        <Route path="/users/capture" element={<Navigate to="/user/capture" replace />} />
        <Route path="/Users/capture" element={<Navigate to="/user/capture" replace />} />
        <Route path="/users/verify" element={<Navigate to="/user/verify" replace />} />
        <Route path="/Users/verify" element={<Navigate to="/user/verify" replace />} />
        <Route path="/users/info" element={<Navigate to="/user/info" replace />} />
        <Route path="/Users/info" element={<Navigate to="/user/info" replace />} />
        <Route path="/users/stats" element={<Navigate to="/user/stats" replace />} />
        <Route path="/Users/stats" element={<Navigate to="/user/stats" replace />} />
        
        <Route 
          path="/" 
          element={
            user ? (
              user?.role?.toLowerCase?.() === 'admin'
                ? <Navigate to="/admin" />
                : user?.role?.toLowerCase?.() === 'worker'
                  ? <Navigate to="/worker" />
                  : <Navigate to="/user" />
            ) : (
              <Navigate to="/user" />
            )
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
