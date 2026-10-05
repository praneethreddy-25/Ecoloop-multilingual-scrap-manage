import React from 'react';
import { Battery, Monitor, Zap, AlertTriangle, CheckCircle, XCircle, Volume2 } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';

export default function SafetyGuide() {
  const { speak } = useVoice();

  const guides = [
    {
      title: 'Li-ion Batteries',
      icon: <Battery className="w-8 h-8 text-red-500" />,
      color: 'bg-red-50',
      dos: ['Tape the terminals to prevent short circuits', 'Store in a cool, dry place'],
      donts: ['Never puncture or crush', 'Do not expose to direct sunlight or heat'],
      audio: 'Tape battery terminals to prevent fire. Never crush or puncture lithium batteries.'
    },
    {
      title: 'CRT Monitors',
      icon: <Monitor className="w-8 h-8 text-blue-500" />,
      color: 'bg-blue-50',
      dos: ['Handle with care to avoid breaking the glass', 'Wear thick gloves and safety glasses'],
      donts: ['Never break the glass, it contains toxic lead and phosphor', 'Do not dismantle the tube yourself'],
      audio: 'Handle old monitors carefully. Do not break the glass, as it contains toxic lead.'
    },
    {
      title: 'Printed Circuit Boards (PCBs)',
      icon: <Zap className="w-8 h-8 text-green-500" />,
      color: 'bg-green-50',
      dos: ['Store in anti-static bags if possible', 'Keep away from moisture'],
      donts: ['Do not burn PCBs to extract metals', 'Do not use acid baths without proper facility'],
      audio: 'Never burn circuit boards to extract metals. It releases highly toxic fumes.'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-amber-100 p-5 rounded-2xl border border-amber-200 text-amber-900 flex gap-4 items-start">
        <AlertTriangle className="w-8 h-8 shrink-0 text-amber-600" />
        <div>
          <h1 className="text-xl font-black mb-1">Safety First!</h1>
          <p className="text-sm">Improper handling of e-waste can cause severe health hazards. Follow these rules to protect yourself and the environment.</p>
        </div>
      </div>

      <div className="space-y-4">
        {guides.map((guide, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className={`${guide.color} p-4 flex justify-between items-center border-b border-gray-100`}>
              <div className="flex items-center gap-3">
                {guide.icon}
                <h2 className="font-black text-lg">{guide.title}</h2>
              </div>
              <button 
                onClick={() => speak(guide.audio)}
                className="p-2 bg-white rounded-full shadow-sm text-primary hover:bg-gray-50"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold text-green-600 flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5" /> DOs
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  {guide.dos.map((item, i) => <li key={i}>• {item}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-red-600 flex items-center gap-2 mb-2">
                  <XCircle className="w-5 h-5" /> DON'Ts
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  {guide.donts.map((item, i) => <li key={i}>• {item}</li>)}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
