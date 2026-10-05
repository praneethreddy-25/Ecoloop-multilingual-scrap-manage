import React from 'react';
import { Award } from 'lucide-react';

export default function BadgeDisplay({ badgeLevel }) {
  const badges = {
    bronze: { color: 'text-amber-700 bg-amber-50 border-amber-200', label: 'Bronze Recycler' },
    silver: { color: 'text-slate-500 bg-slate-50 border-slate-200', label: 'Silver Recycler' },
    gold: { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', label: 'Gold Recycler' }
  };
  
  const current = badges[badgeLevel] || badges.bronze;

  return (
    <div className={`px-3 py-1.5 rounded-full border flex items-center gap-1.5 text-sm font-bold w-fit ${current.color}`}>
      <Award className="w-4 h-4" />
      {current.label}
    </div>
  );
}
