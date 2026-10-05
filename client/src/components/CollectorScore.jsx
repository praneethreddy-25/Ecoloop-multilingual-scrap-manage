import React from 'react';
import { Star } from 'lucide-react';

export default function CollectorScore({ score }) {
  const percentage = Math.min(Math.max(score, 0), 100);
  const strokeDasharray = `${(percentage / 100) * 283} 283`;

  return (
    <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="8" />
          <circle 
            cx="50" cy="50" r="45" fill="none" stroke="#16a34a" strokeWidth="8"
            strokeDasharray={strokeDasharray}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-black text-primary">{score}</span>
        </div>
      </div>
      <div>
        <h4 className="font-bold text-gray-800 flex items-center gap-1">
          Trust Score <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
        </h4>
        <p className="text-xs text-gray-500">Based on fair trading & safe handling.</p>
      </div>
    </div>
  );
}
