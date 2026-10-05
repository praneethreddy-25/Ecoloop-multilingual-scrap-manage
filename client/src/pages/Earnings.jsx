import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Download, IndianRupee } from 'lucide-react';

export default function Earnings() {
  const data = [
    { name: 'Mon', earnings: 450 },
    { name: 'Tue', earnings: 1200 },
    { name: 'Wed', earnings: 800 },
    { name: 'Thu', earnings: 300 },
    { name: 'Fri', earnings: 1500 },
    { name: 'Sat', earnings: 2000 },
    { name: 'Sun', earnings: 0 },
  ];

  const transactions = [
    { id: 'TXN-2026-A1B2C3', date: '2026-09-10', amount: 1250, status: 'Credited' },
    { id: 'TXN-2026-X9Y8Z7', date: '2026-09-09', amount: 800, status: 'Credited' },
    { id: 'TXN-2026-M4N5P6', date: '2026-09-08', amount: 2100, status: 'Credited' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-800">Earnings</h1>

      <div className="bg-gradient-to-r from-green-600 to-primary p-6 rounded-2xl text-white shadow-lg">
        <p className="text-green-100 font-medium mb-1">Total Earnings (This Week)</p>
        <h2 className="text-4xl font-black flex items-center gap-2">
          <IndianRupee className="w-8 h-8" /> 6,250
        </h2>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-6">Weekly Trend</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} tickFormatter={(val) => `₹${val}`} />
              <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Bar dataKey="earnings" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Recent Transactions</h3>
          <button className="text-primary text-sm font-bold flex items-center gap-1">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          {transactions.map(txn => (
            <div key={txn.id} className="p-5 flex justify-between items-center hover:bg-gray-50">
              <div>
                <p className="font-mono text-sm font-bold text-gray-800">{txn.id}</p>
                <p className="text-xs text-gray-500">{txn.date}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-green-600">+ ₹{txn.amount}</p>
                <p className="text-xs text-gray-500">{txn.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
