import React from 'react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Building2, Users, Factory, FileCheck } from 'lucide-react';

export default function MunicipalityDashboard() {
  const trendData = [
    { month: 'Jan', tons: 12 }, { month: 'Feb', tons: 15 }, { month: 'Mar', tons: 18 },
    { month: 'Apr', tons: 14 }, { month: 'May', tons: 22 }, { month: 'Jun', tons: 28 },
  ];

  const materialData = [
    { name: 'Large Appliances', value: 45, color: '#0369a1' },
    { name: 'IT/Telecom', value: 30, color: '#16a34a' },
    { name: 'Consumer Electronics', value: 15, color: '#f59e0b' },
    { name: 'Batteries/Lamps', value: 10, color: '#ef4444' }
  ];

  const kpis = [
    { label: 'Total E-Waste Diverted', value: '1,452 Tons', icon: <Building2 className="w-6 h-6 text-blue-500" /> },
    { label: 'Formal Recycling Rate', value: '78%', icon: <FileCheck className="w-6 h-6 text-green-500" /> },
    { label: 'Active Collectors', value: '845', icon: <Users className="w-6 h-6 text-purple-500" /> },
    { label: 'Verified Facilities', value: '12', icon: <Factory className="w-6 h-6 text-orange-500" /> }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900">City Analytics Dashboard</h1>
          <p className="text-gray-500">E-Waste Flow & Compliance Monitoring</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm font-bold text-primary">
          Live City Data
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="mb-2">{kpi.icon}</div>
            <p className="text-2xl font-black text-gray-800">{kpi.value}</p>
            <p className="text-xs text-gray-500 font-medium">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6">Collection Trend (Tons)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorTons" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <Tooltip />
                <Area type="monotone" dataKey="tons" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#colorTons)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6">Material Breakdown</h3>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={materialData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {materialData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-1/2 space-y-3">
              {materialData.map(item => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-600 flex-1">{item.name}</span>
                  <span className="font-bold">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
