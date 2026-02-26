import React, { useState } from 'react';
import { apiCall } from '../../utils/apiClient'; 
import { ENDPOINTS } from '../../utils/endpoints';

const locationData = {
  "Amravati": ["Rajkamal Square", "Gadge Nagar", "Rathi Nagar", "Badnera", "Sainagar", "Amravati Central", "Camp", "Panchavati", "Irwin Square", "Dastur Nagar","ShegovNaka","Shivaji Nagar","Sangam Nagar","Gandhi Nagar","Dharampeth","Morshi Road","Chowk","Nirala Bazar"],
  "Nagpur": ["Sitabuldi", "Dharampeth", "Itwari", "Manish Nagar", "Sonegaon", "Wadi", "Mihan", "Koramadi", "Sadar", "Nandanvan"],
  "Pune": ["Kothrud", "Hinjewadi", "Viman Nagar", "Baner", "Hadapsar", "Wakad", "Magarpatta", "Kalyani Nagar", "Pimpri", "Shivaji Nagar"],
  "Mumbai": ["Andheri", "Bandra", "Borivali", "Dadar", "Goregaon", "Juhu", "Kurla", "Malad", "Colaba", "Powai"],
  "Nashik": ["Panchavati", "CIDCO", "Indira Nagar", "Satpur", "Ambad", "Pathardi", "Gangapur Road", "Nashik Road", "Deolali", "Govind Nagar"],
  "Aurangabad": ["Cidco", "Waluj", "Paithan Road", "Station Road", "Aurangpura", "Gulmandi", "Nirala Bazar", "Usmanpura", "Garkheda", "Seven Hills"],
  "Akola": ["Civil Lines", "Ramdaspeth", "Jatharpeth", "Kaulkhed", "Toshniwal Layout", "Murtizapur Road", "Old City", "Ranpise Nagar", "Ganesh Nagar", "Khadki"]
};

const AddDustbinForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    city: 'Amravati', 
    area: locationData['Amravati'][0], 
    location_type: 'Residential',
    size: 'Medium',
    sizeCM: 30,
    bin_type: 'Organic', // new field for dustbin type
    lat: '',
    lng: ''
  });

  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  
  // Naya State: ID copy feature ke liye
  const [newDustbinId, setNewDustbinId] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'city') {
      setFormData({
        ...formData,
        city: value,
        area: locationData[value][0] 
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleGetLocation = () => {
    setMessage({ type: '', text: '' }); 
    setNewDustbinId(null); // Purani ID hide karein
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setMessage({ type: 'success', text: '📍 Location successfully fetch ho gayi!' });
        },
        (error) => {
          setMessage({ type: 'error', text: 'Error: Location access allow karein tabhi GPS detect hoga.' });
        }
      );
    } else {
      setMessage({ type: 'error', text: 'Aapka browser Geolocation support nahi karta.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.lat || !formData.lng) {
      setMessage({ type: 'error', text: '❌ Kripya pehle "Get Current Location" button par click karein.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
    setNewDustbinId(null);

    try {
      const response = await apiCall(
        'POST', 
        ENDPOINTS.DUSTBIN.ADD_SINGLE, 
        {
          ...formData,
          sizeCM: Number(formData.sizeCM),
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng),
          bin_type: formData.bin_type // send new field
        }
      );

      setMessage({ type: 'success', text: '✅ Success! Naya Dustbin database mein add ho gaya.' });
      setNewDustbinId(response.dustbin._id); // ✅ ID save kar li
      
      setFormData({ 
        name: '', city: 'Amravati', area: locationData['Amravati'][0], 
        location_type: 'Residential', size: 'Medium', sizeCM: 30, lat: '', lng: '' 
      });

    } catch (error) {
      setMessage({ type: 'error', text: `❌ Error: ${error.message || 'Dustbin add karne mein issue aaya.'}` });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Clipboard me copy karne ka function
  const handleCopy = () => {
    if (newDustbinId) {
      navigator.clipboard.writeText(newDustbinId);
      setCopied(true);
      // 2 seconds baad wapas 'Copy ID' dikhayega
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const inputClass = "w-full p-3 mt-1 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all";
  const labelClass = "text-sm font-semibold text-gray-600";
  const readOnlyInputClass = "w-full p-3 mt-1 text-gray-500 bg-gray-200 border border-gray-300 rounded-lg cursor-not-allowed";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      
      <div className="w-full max-w-lg bg-white p-6 sm:p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Add New Dustbin
        </h2>
        
        {/* Naya Message Box with Copy Button */}
        {message.text && (
          <div className={`p-4 mb-6 text-sm font-medium rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border-green-200' 
              : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            <p>{message.text}</p>
            
            {/* Agar ID aayi hai, toh copy wala box dikhao */}
            {newDustbinId && (
              <div className="mt-3 flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-green-300 shadow-sm">
                <span className="font-mono text-gray-700 tracking-wider overflow-hidden overflow-ellipsis whitespace-nowrap">
                  {newDustbinId}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`ml-3 px-3 py-1.5 rounded text-xs font-bold transition-all ${
                    copied 
                      ? 'bg-green-500 text-white' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {copied ? 'Copied! ✓' : 'Copy ID'}
                </button>
              </div>
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          <div>
            <label className={labelClass}>Dustbin Name / ID Code</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputClass} placeholder="e.g. BIN-001" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>City</label>
              <select name="city" value={formData.city} onChange={handleChange} className={inputClass}>
                {Object.keys(locationData).map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Area</label>
              <select name="area" value={formData.area} onChange={handleChange} className={inputClass}>
                {locationData[formData.city].map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Location Type</label>
            <select name="location_type" value={formData.location_type} onChange={handleChange} className={inputClass}>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Industrial">Industrial</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Size</label>
              <select name="size" value={formData.size} onChange={handleChange} className={inputClass}>
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Depth (CM)</label>
              <input type="number" name="sizeCM" value={formData.sizeCM} onChange={handleChange} required className={inputClass} placeholder="e.g. 30" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Dustbin Type</label>
            <select name="bin_type" value={formData.bin_type} onChange={handleChange} className={inputClass}>
              <option value="Organic">Organic</option>
              <option value="Recyclable">Recyclable</option>
              <option value="Hazardous">Hazardous</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Latitude</label>
              <input type="number" name="lat" value={formData.lat} readOnly required className={readOnlyInputClass} placeholder="Auto-detect" />
            </div>
            <div>
              <label className={labelClass}>Longitude</label>
              <input type="number" name="lng" value={formData.lng} readOnly required className={readOnlyInputClass} placeholder="Auto-detect" />
            </div>
          </div>
          
          <button 
            type="button" 
            onClick={handleGetLocation} 
            className="w-full mt-2 p-3 text-sky-700 bg-sky-50 border border-dashed border-sky-400 rounded-lg font-semibold hover:bg-sky-100 transition-colors active:scale-95"
          >
            📍 Get Current Location
          </button>

          <button 
            type="submit" 
            disabled={loading} 
            className={`w-full mt-4 p-3 md:p-4 rounded-lg font-bold text-white shadow-md transition-all active:scale-95 ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? 'Adding Dustbin...' : 'Create Dustbin'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default AddDustbinForm;