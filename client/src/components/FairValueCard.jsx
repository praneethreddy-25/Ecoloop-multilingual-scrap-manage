import React, { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';

export default function FairValueCard({ fairValue, materialType, condition }) {
  const [expanded, setExpanded] = useState(false);

  if (!fairValue) return null;

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
      <div className="flex items-center gap-2 text-primary font-bold mb-2">
        <TrendingUp className="w-5 h-5" />
        Estimated Fair Value
      </div>
      
      <div className="flex justify-between items-end mb-4">
        <div>
          <p className="text-3xl font-black text-gray-800">
            ₹{fairValue.recommended}
          </p>
          <p className="text-sm text-gray-500">Range: ₹{fairValue.min} - ₹{fairValue.max}</p>
        </div>
      </div>

      <div className="relative h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
        <div className="absolute top-0 left-1/4 right-1/4 h-full bg-primary/30"></div>
        <div className="absolute top-0 left-1/2 w-2 h-full bg-primary -ml-1"></div>
      </div>

      <button 
        onClick={() => setExpanded(!expanded)}
        className="text-sm text-secondary font-medium flex items-center gap-1"
      >
        Why this price? {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expanded && (
        <div className="mt-3 text-sm text-gray-600 bg-white p-3 rounded border border-green-100">
          <p className="mb-2">Calculated based on live market rates for {condition} {materialType}.</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Current market demand</li>
            <li>Condition modifier applied</li>
            <li>Local transport offsets</li>
          </ul>
        </div>
      )}
    </div>
  );
}
