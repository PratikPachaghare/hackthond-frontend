import React from 'react';
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  Camera, 
  ShieldCheck, 
  Leaf, 
  Trash2, 
  Recycle,
  Info
} from 'lucide-react';

const InfoTab = ({ creditPoints = 0 }) => {
  return (
    <div className="p-4 sm:p-6 max-w-md mx-auto pb-24">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900">App Guide & Info</h2>
          <span className="inline-flex items-center gap-1 text-xs font-black bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
            <Coins size={14} />
            {creditPoints} pts
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-2 font-medium">
          Learn how to earn rewards while keeping our city clean.
        </p>
      </div>

      <div className="space-y-6">
        
        {/* Section 1: How to get points (The Flow) */}
        <div>
          <h3 className="text-sm font-black text-slate-900 mb-3 px-1 flex items-center gap-2">
            <Coins size={16} className="text-amber-500" /> 
            How to Earn Points
          </h3>
          <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm relative overflow-hidden">
            {/* Connecting line */}
            <div className="absolute left-[31px] top-8 bottom-8 w-0.5 bg-slate-100 z-0"></div>
            
            <div className="space-y-4 relative z-10">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 border-4 border-white shadow-sm">
                  <Camera size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">1. Snap & Report</p>
                  <p className="text-xs text-slate-500 mt-0.5">Find overflowing bins or illegal garbage dumps and upload a clear photo with your location.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 border-4 border-white shadow-sm">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">2. AI & Worker Verification</p>
                  <p className="text-xs text-slate-500 mt-0.5">Our AI model and municipal workers will review your submission to verify it is genuine waste.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 border-4 border-white shadow-sm">
                  <Coins size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">3. Earn Rewards</p>
                  <p className="text-xs text-slate-500 mt-0.5">Once approved, points are credited to your wallet which can be redeemed for local rewards!</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Point Rules */}
        <div>
          <h3 className="text-sm font-black text-slate-900 mb-3 px-1 flex items-center gap-2">
            <Info size={16} className="text-blue-500" /> 
            Point Rules
          </h3>
          <div className="grid gap-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex gap-3 items-start">
              <div className="bg-emerald-100 text-emerald-700 p-1.5 rounded-lg mt-0.5"><TrendingUp size={16} /></div>
              <div>
                <p className="font-bold text-emerald-900 text-sm">Valid Report (+10 pts)</p>
                <p className="text-xs text-emerald-700 mt-1">Genuine photos of uncollected garbage earn you points and help the city.</p>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 flex gap-3 items-start">
              <div className="bg-rose-100 text-rose-700 p-1.5 rounded-lg mt-0.5"><TrendingDown size={16} /></div>
              <div>
                <p className="font-bold text-rose-900 text-sm">Invalid/Fake Report (-10 pts)</p>
                <p className="text-xs text-rose-700 mt-1">Uploading random images, selfies, or non-garbage photos deducts points to prevent spam.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Smart Dustbin Awareness */}
        <div>
          <h3 className="text-sm font-black text-slate-900 mb-3 px-1 flex items-center gap-2">
            <Trash2 size={16} className="text-slate-700" /> 
            Smart Dustbin System
          </h3>
          <div className="bg-slate-800 rounded-3xl p-5 text-white shadow-md relative overflow-hidden">
            <Recycle size={80} className="absolute -bottom-4 -right-4 text-slate-700 opacity-50" />
            <div className="relative z-10">
              <p className="font-bold text-sm text-blue-300 mb-2">How Technology Helps</p>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                Our city is upgrading to IoT-enabled Smart Dustbins. These bins have built-in ultrasonic sensors that track garbage levels in real-time.
              </p>
              <ul className="text-xs text-slate-200 space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div> 
                  Automatically alerts trucks when 80% full.
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div> 
                  Optimizes collection routes to save fuel.
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div> 
                  Prevents street overflow and disease spread.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 4: Swachh Bharat Abhiyan */}
        <div>
          <h3 className="text-sm font-black text-slate-900 mb-3 px-1 flex items-center gap-2">
            <Leaf size={16} className="text-green-600" /> 
            Swachh Bharat Abhiyan
          </h3>
          <div className="bg-gradient-to-br from-orange-50 via-white to-green-50 border border-slate-200 rounded-3xl p-5 shadow-sm text-center">
            <div className="w-12 h-12 mx-auto bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center mb-3">
              <Leaf size={24} className="text-green-600" />
            </div>
            <p className="font-black text-slate-800 text-sm mb-2">Ek Kadam Swachhata Ki Ore</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              By using this app, you are directly contributing to the <span className="font-bold text-slate-800">Clean India Mission</span>. Cleanliness is not just the responsibility of sanitation workers—it is a collective duty. Report waste, spread awareness, and help us build a greener, healthier nation!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InfoTab;