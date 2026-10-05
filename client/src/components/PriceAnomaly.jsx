import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { detectAnomaly } from '../utils/fairValue';

export default function PriceAnomaly({ offeredPrice, fairValue }) {
  if (!fairValue) return null;
  
  const anomaly = detectAnomaly(offeredPrice, fairValue);
  
  if (!anomaly.isAnomaly) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-lg flex gap-2 items-start text-sm mt-2">
        <Info className="w-5 h-5 text-green-600 shrink-0" />
        <p>This price is fair and matches the current market value.</p>
      </div>
    );
  }

  const isSevere = anomaly.severity === 'abnormal';

  return (
    <div className={`p-3 rounded-lg flex gap-2 items-start text-sm mt-2 border ${
      isSevere ? 'bg-red-50 border-red-200 text-red-800' : 'bg-yellow-50 border-yellow-200 text-yellow-800'
    }`}>
      <AlertTriangle className={`w-5 h-5 shrink-0 ${isSevere ? 'text-red-600' : 'text-yellow-600'}`} />
      <div>
        <p className="font-bold">
          {isSevere ? 'Abnormal Price Alert!' : 'Slightly Low Offer'}
        </p>
        <p>This offer is {anomaly.percentage}% below the recommended fair value of ₹{fairValue.recommended}. Consider checking other recyclers.</p>
      </div>
    </div>
  );
}
