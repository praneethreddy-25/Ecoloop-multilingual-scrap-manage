import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

export default function TraceabilityTimeline({ steps }) {
  return (
    <div className="relative pl-4 border-l-2 border-gray-200 space-y-6 my-6">
      {steps.map((step, idx) => {
        const isDone = step.status === 'done';
        const isActive = step.status === 'active';
        
        return (
          <div key={idx} className="relative">
            <div className={`absolute -left-[25px] bg-white rounded-full ${isDone ? 'text-primary' : isActive ? 'text-accent' : 'text-gray-300'}`}>
              {isDone ? <CheckCircle2 className="w-6 h-6 bg-white" /> : 
               isActive ? <Clock className="w-6 h-6 bg-white animate-pulse" /> : 
               <Circle className="w-6 h-6 bg-white" />}
            </div>
            
            <div className={`ml-2 ${isActive ? 'bg-blue-50 p-3 rounded-lg border border-blue-100 -mt-2' : ''}`}>
              <h4 className={`font-bold ${isDone ? 'text-gray-800' : isActive ? 'text-blue-800' : 'text-gray-400'}`}>
                {step.title}
              </h4>
              <p className={`text-sm ${isDone || isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                {step.description}
              </p>
              {step.date && (
                <p className="text-xs text-gray-400 mt-1">{step.date}</p>
              )}
              {step.hash && (
                <p className="text-[10px] font-mono text-gray-400 mt-1 break-all bg-gray-50 p-1 rounded">
                  Tx: {step.hash}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
