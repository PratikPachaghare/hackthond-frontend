import React, { useMemo, useState } from 'react';
import {
  Leaf,
  Fuel,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  Trophy,
  ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar
} from 'recharts';

const monthlyComparison = [
  { month: 'Jan', beforeFuel: 2420, afterFuel: 1680, beforeCO2: 6400, afterCO2: 4420, beforeWorkforce: 78, afterWorkforce: 56, beforeOverflow: 128, afterOverflow: 52, beforeSLA: 68, afterSLA: 89 },
  { month: 'Feb', beforeFuel: 2380, afterFuel: 1625, beforeCO2: 6280, afterCO2: 4310, beforeWorkforce: 76, afterWorkforce: 55, beforeOverflow: 121, afterOverflow: 48, beforeSLA: 70, afterSLA: 90 },
  { month: 'Mar', beforeFuel: 2510, afterFuel: 1710, beforeCO2: 6580, afterCO2: 4550, beforeWorkforce: 79, afterWorkforce: 58, beforeOverflow: 133, afterOverflow: 56, beforeSLA: 67, afterSLA: 88 },
  { month: 'Apr', beforeFuel: 2465, afterFuel: 1692, beforeCO2: 6460, afterCO2: 4475, beforeWorkforce: 77, afterWorkforce: 57, beforeOverflow: 126, afterOverflow: 53, beforeSLA: 69, afterSLA: 89 },
  { month: 'May', beforeFuel: 2590, afterFuel: 1775, beforeCO2: 6815, afterCO2: 4680, beforeWorkforce: 81, afterWorkforce: 59, beforeOverflow: 141, afterOverflow: 60, beforeSLA: 66, afterSLA: 87 },
  { month: 'Jun', beforeFuel: 2530, afterFuel: 1732, beforeCO2: 6640, afterCO2: 4605, beforeWorkforce: 80, afterWorkforce: 58, beforeOverflow: 136, afterOverflow: 58, beforeSLA: 67, afterSLA: 88 }
];

const wardData = [
  { ward: 'Rajkamal', beforeOverflow: 26, afterOverflow: 9, beforeSLA: 69, afterSLA: 92, beforeFuel: 510, afterFuel: 355 },
  { ward: 'Badnera', beforeOverflow: 22, afterOverflow: 10, beforeSLA: 71, afterSLA: 89, beforeFuel: 470, afterFuel: 341 },
  { ward: 'Gadge Nagar', beforeOverflow: 28, afterOverflow: 12, beforeSLA: 66, afterSLA: 86, beforeFuel: 540, afterFuel: 389 },
  { ward: 'Camp', beforeOverflow: 19, afterOverflow: 7, beforeSLA: 73, afterSLA: 91, beforeFuel: 430, afterFuel: 308 },
  { ward: 'Panchavati', beforeOverflow: 24, afterOverflow: 8, beforeSLA: 70, afterSLA: 90, beforeFuel: 490, afterFuel: 346 }
];

const SustainabilityScoreboard = () => {
  const [selectedMonth, setSelectedMonth] = useState('Jun');

  const selectedMonthData = useMemo(
    () => monthlyComparison.find((item) => item.month === selectedMonth) || monthlyComparison[monthlyComparison.length - 1],
    [selectedMonth]
  );

  const totals = useMemo(() => {
    const beforeFuel = monthlyComparison.reduce((sum, m) => sum + m.beforeFuel, 0);
    const afterFuel = monthlyComparison.reduce((sum, m) => sum + m.afterFuel, 0);
    const beforeCO2 = monthlyComparison.reduce((sum, m) => sum + m.beforeCO2, 0);
    const afterCO2 = monthlyComparison.reduce((sum, m) => sum + m.afterCO2, 0);
    const beforeOverflow = monthlyComparison.reduce((sum, m) => sum + m.beforeOverflow, 0);
    const afterOverflow = monthlyComparison.reduce((sum, m) => sum + m.afterOverflow, 0);
    const avgBeforeSLA = Math.round(monthlyComparison.reduce((sum, m) => sum + m.beforeSLA, 0) / monthlyComparison.length);
    const avgAfterSLA = Math.round(monthlyComparison.reduce((sum, m) => sum + m.afterSLA, 0) / monthlyComparison.length);

    return {
      fuelSaved: beforeFuel - afterFuel,
      co2Saved: beforeCO2 - afterCO2,
      overflowPrevented: beforeOverflow - afterOverflow,
      slaLift: avgAfterSLA - avgBeforeSLA,
      avgBeforeSLA,
      avgAfterSLA
    };
  }, []);

  const rankedWards = useMemo(() => {
    return wardData
      .map((ward) => {
        const overflowReduction = ward.beforeOverflow - ward.afterOverflow;
        const fuelReduction = ward.beforeFuel - ward.afterFuel;
        const slaLift = ward.afterSLA - ward.beforeSLA;
        const score = overflowReduction * 4 + fuelReduction * 0.5 + slaLift * 3;
        return { ...ward, overflowReduction, fuelReduction, slaLift, score: Math.round(score) };
      })
      .sort((a, b) => b.score - a.score);
  }, []);

  const trendChartData = monthlyComparison.map((item) => ({
    month: item.month,
    'Fuel Before': item.beforeFuel,
    'Fuel After': item.afterFuel,
    'CO2 Before': item.beforeCO2,
    'CO2 After': item.afterCO2,
    'Workforce Before': item.beforeWorkforce,
    'Workforce After': item.afterWorkforce
  }));

  const slaChartData = monthlyComparison.map((item) => ({
    month: item.month,
    'SLA Before': item.beforeSLA,
    'SLA After': item.afterSLA
  }));

  const monthFuelSaved = selectedMonthData.beforeFuel - selectedMonthData.afterFuel;
  const monthCO2Saved = selectedMonthData.beforeCO2 - selectedMonthData.afterCO2;
  const monthOverflowPrevented = selectedMonthData.beforeOverflow - selectedMonthData.afterOverflow;
  const monthSLALift = selectedMonthData.afterSLA - selectedMonthData.beforeSLA;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sustainability Scoreboard</h1>
          <p className="text-slate-500 mt-1 font-medium">Amravati simulation: before Smart Bin system vs after deployment</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-sm">
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Month</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {monthlyComparison.map((item) => (
              <option key={item.month} value={item.month}>
                {item.month}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600"><Leaf size={20} /></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly</span>
          </div>
          <p className="text-3xl font-black text-slate-800 mt-4">{monthCO2Saved.toLocaleString()} kg</p>
          <p className="text-xs text-slate-500 font-medium mt-1">CO2 avoided in {selectedMonth}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600"><Fuel size={20} /></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly</span>
          </div>
          <p className="text-3xl font-black text-slate-800 mt-4">{monthFuelSaved.toLocaleString()} L</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Fuel saved in collection routes</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-red-50 text-red-600"><AlertTriangle size={20} /></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly</span>
          </div>
          <p className="text-3xl font-black text-slate-800 mt-4">{monthOverflowPrevented}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Overflow incidents prevented</p>
        </div>

        <div className="bg-slate-900 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-slate-800 text-green-400"><ShieldCheck size={20} /></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly</span>
          </div>
          <p className="text-3xl font-black text-white mt-4">+{monthSLALift}%</p>
          <p className="text-xs text-slate-300 font-medium mt-1">SLA compliance uplift</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={18} className="text-blue-600" />
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Monthly Trend: Fuel, CO2 and Workforce (Before vs After)</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2ff" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" domain={[40, 90]} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip />
                <Line yAxisId="left" type="monotone" dataKey="Fuel Before" stroke="#f97316" strokeWidth={2.5} dot={false} />
                <Line yAxisId="left" type="monotone" dataKey="Fuel After" stroke="#2563eb" strokeWidth={2.5} dot={false} />
                <Line yAxisId="left" type="monotone" dataKey="CO2 Before" stroke="#ef4444" strokeWidth={2.5} dot={false} />
                <Line yAxisId="left" type="monotone" dataKey="CO2 After" stroke="#10b981" strokeWidth={2.5} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="Workforce Before" stroke="#7c3aed" strokeWidth={2} dot={false} strokeDasharray="6 4" />
                <Line yAxisId="right" type="monotone" dataKey="Workforce After" stroke="#0f766e" strokeWidth={2} dot={false} strokeDasharray="6 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <ShieldCheck size={18} className="text-green-600" />
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">SLA Compliance (Before vs After)</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={slaChartData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2ff" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis domain={[50, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="SLA Before" fill="#94a3b8" radius={[8, 8, 0, 0]} />
                <Bar dataKey="SLA After" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <Trophy size={16} className="text-amber-500" /> Ward-wise Sustainability Ranking
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">Score based on overflow reduction, fuel savings and SLA uplift</p>
          </div>
          <div className="p-4 space-y-3">
            {rankedWards.map((ward, index) => (
              <div key={ward.ward} className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
                    index === 0 ? 'bg-amber-100 text-amber-700' : index === 1 ? 'bg-slate-200 text-slate-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-black text-slate-800">{ward.ward}</p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Overflow -{ward.overflowReduction}, Fuel -{ward.fuelReduction}L, SLA +{ward.slaLift}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-slate-900">{ward.score}</p>
                  <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Impact Score</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 rounded-3xl shadow-xl p-6 text-white">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-300">6-Month Civic Outcome</h3>
          <div className="space-y-4 mt-6">
            <div className="bg-slate-800 rounded-2xl p-4">
              <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Total CO2 Saved</p>
              <p className="text-3xl font-black mt-1">{totals.co2Saved.toLocaleString()} kg</p>
            </div>
            <div className="bg-slate-800 rounded-2xl p-4">
              <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Total Fuel Saved</p>
              <p className="text-3xl font-black mt-1">{totals.fuelSaved.toLocaleString()} L</p>
            </div>
            <div className="bg-slate-800 rounded-2xl p-4">
              <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Overflow Prevented</p>
              <p className="text-3xl font-black mt-1">{totals.overflowPrevented}</p>
            </div>
            <div className="bg-emerald-500/15 border border-emerald-400/20 rounded-2xl p-4">
              <p className="text-[10px] uppercase tracking-widest font-black text-emerald-300">Avg SLA Improvement</p>
              <p className="text-3xl font-black text-emerald-300 mt-1">+{totals.slaLift}%</p>
              <p className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
                <ArrowUpRight size={12} /> From {totals.avgBeforeSLA}% to {totals.avgAfterSLA}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SustainabilityScoreboard;
