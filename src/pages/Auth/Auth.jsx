import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../../utils/apiClient';
import { ENDPOINTS } from '../../utils/endpoints';
import { Mail, Lock, User, Phone, MapPin, ShieldCheck, Loader2, Building2 } from 'lucide-react';

const Auth = ({ setUser }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const locationData = {
    "Amravati": ["Rajkamal Square", "Gadge Nagar", "Rathi Nagar", "Badnera", "Sainagar", "Amravati Central", "Camp", "Panchavati", "Irwin Square", "Dastur Nagar"],
    "Nagpur": ["Sitabuldi", "Dharampeth", "Itwari", "Manish Nagar", "Sonegaon", "Wadi", "Mihan", "Koramadi", "Sadar", "Nandanvan"],
    "Pune": ["Kothrud", "Hinjewadi", "Viman Nagar", "Baner", "Hadapsar", "Wakad", "Magarpatta", "Kalyani Nagar", "Pimpri", "Shivaji Nagar"],
    "Mumbai": ["Andheri", "Bandra", "Borivali", "Dadar", "Goregaon", "Juhu", "Kurla", "Malad", "Colaba", "Powai"],
    "Nashik": ["Panchavati", "CIDCO", "Indira Nagar", "Satpur", "Ambad", "Pathardi", "Gangapur Road", "Nashik Road", "Deolali", "Govind Nagar"],
    "Aurangabad": ["Cidco", "Waluj", "Paithan Road", "Station Road", "Aurangpura", "Gulmandi", "Nirala Bazar", "Usmanpura", "Garkheda", "Seven Hills"],
    "Akola": ["Civil Lines", "Ramdaspeth", "Jatharpeth", "Kaulkhed", "Toshniwal Layout", "Murtizapur Road", "Old City", "Ranpise Nagar", "Ganesh Nagar", "Khadki"]
  };

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'worker', 
    phone: '', city: '', area: '', adminSecret: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'city') {
      setFormData({ ...formData, city: value, area: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.role === 'admin' && formData.adminSecret !== "admin12345") {
      alert("Invalid Admin Security Key!");
      return;
    }

    try {
      setLoading(true);
      const url = isLogin ? ENDPOINTS.AUTH.LOGIN : ENDPOINTS.AUTH.REGISTER;
      const response = await apiCall('POST', url, formData);

      // FIX: Backend se data flat aa raha hai (response.role, response.token)
      if (response && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response)); 
        
        if (setUser) setUser(response); 
        
        alert(isLogin ? "Welcome Back!" : "Account Created!");
        
        // Navigation logic using flat response
        const targetPath = response.role === 'admin' ? '/admin' : '/worker';
        navigate(targetPath);
      }
    } catch (err) {
      alert(err || "Authentication Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-slate-900 p-8 text-center text-white">
          <h2 className="text-3xl font-black tracking-tight italic">SMART BIN</h2>
          <p className="text-slate-400 text-sm mt-2">{isLogin ? 'Sign in to your account' : 'Create a new account'}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button type="button" onClick={() => setFormData({...formData, role: 'worker'})} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${formData.role === 'worker' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Worker</button>
            <button type="button" onClick={() => setFormData({...formData, role: 'admin'})} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${formData.role === 'admin' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Admin</button>
          </div>

          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={18}/>
              <input name="name" placeholder="Full Name" onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none" required />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={18}/>
            <input name="email" type="email" placeholder="Email Address" onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none" required />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={18}/>
            <input name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none" required />
          </div>

          {!isLogin && (
            <>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-gray-400" size={18}/>
                <input name="phone" placeholder="Phone Number" onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none" required />
              </div>

              <div className="relative">
                <Building2 className="absolute left-3 top-3 text-gray-400" size={18}/>
                <select name="city" value={formData.city} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none appearance-none" required>
                  <option value="">Select City</option>
                  {Object.keys(locationData).map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>

              <div className={`relative transition-all ${!formData.city ? 'opacity-50' : 'opacity-100'}`}>
                <MapPin className="absolute left-3 top-3 text-gray-400" size={18}/>
                <select name="area" value={formData.area} onChange={handleChange} disabled={!formData.city} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none appearance-none" required>
                  <option value="">Select Area</option>
                  {formData.city && locationData[formData.city].map(area => <option key={area} value={area}>{area}</option>)}
                </select>
              </div>
            </>
          )}

          {formData.role === 'admin' && (
            <div className="relative animate-in slide-in-from-top-2">
              <ShieldCheck className="absolute left-3 top-3 text-red-500" size={18}/>
              <input name="adminSecret" type="password" placeholder="Admin Security Key" onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-red-50 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" required />
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-black text-lg shadow-lg flex justify-center items-center gap-2 mt-4 transition-all active:scale-95">
            {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'LOGIN' : 'CREATE ACCOUNT')}
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="ml-2 font-black text-slate-900 hover:underline">
              {isLogin ? 'Register Now' : 'Sign In'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Auth;