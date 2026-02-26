import { LayoutDashboard, Map, BarChart3, LogOut, Users, Trash2, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dash', name: 'Dashboard', icon: <LayoutDashboard size={20}/> },
    { id: 'status', name: 'Dustbin Status', icon: <Map size={20}/> },
    { id: 'AddDustbin', name: 'Add Dustbin', icon: <Trash2 size={20}/> },
    { id: 'Staff', name: 'Staff Status', icon: <Users size={20}/> },
    { id: 'hotspot', name: 'Hotspot Analysis', icon: <BarChart3 size={20}/> },
    { id: 'heatMap', name: 'Heat Map', icon: <Map size={20}/> },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col p-6">
      <div className="mb-10 text-center">
        <h1 className="text-xl font-bold text-green-400 tracking-wider underline">SMART DUSTBIN</h1>
        <p className="text-xs text-gray-400 mt-1 uppercase">HOD Control Panel</p>
      </div>

      <nav className="flex-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 p-3 rounded-lg mb-2 transition-all ${
              activeTab === item.id ? 'bg-green-600 shadow-lg shadow-green-900/20' : 'hover:bg-slate-800'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </button>
        ))}
      </nav>

      <Link to="/auth" className="mt-auto flex items-center gap-3 p-3 text-gray-400 hover:text-white transition">
        <LogOut size={22} onClick={()=>localStorage.removeItem("token")} className="cursor-pointer"/> Logout
      </Link>
    </aside>
  );
};

export default Sidebar;
