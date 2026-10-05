import React, { useState } from 'react';
import { 
  Factory, ShieldCheck, Box, TrendingUp, AlertCircle, 
  MessageSquare, Check, Send, Phone, MapPin 
} from 'lucide-react';
import useStore from '../store/useStore';
import toast from 'react-hot-toast';

export default function RecyclerPortal() {
  const { lots, updateLotStatus, recyclerMessages, sendMessage } = useStore();
  const [replyText, setReplyText] = useState({});

  // Merge store lots with default incoming bids
  const allLots = lots.length > 0 ? lots : [
    { 
      id: 'EW-CHN-2026-00125', 
      materials: [{ name: 'Smartphones', quantity: 18, weight: 4.8 }], 
      fairValue: { recommended: 2000, min: 1850, max: 2150 }, 
      status: 'Collected',
      createdAt: 'Today, 10:15 AM' 
    }
  ];

  const handleAcceptLot = (lotId) => {
    updateLotStatus(lotId, 'Matched', {
      matchedRecycler: 'EcoTech Recycling Pvt Ltd',
      pickupScheduled: 'Today by 3:00 PM'
    });
    
    // Send automated confirmation message to collector
    sendMessage({
      lotId,
      recyclerId: 'r1',
      recyclerName: 'EcoTech Recycling Pvt Ltd',
      sender: 'recycler',
      text: 'Bid accepted! Pickup logistics vehicle dispatched to your location.'
    });

    toast.success(`Bid accepted for Lot ${lotId}! Collector notified via SMS & Portal.`);
  };

  const handleSendReply = (lotId) => {
    const text = replyText[lotId];
    if (!text || !text.trim()) return;

    // Resolve the exact recycler ID and Name associated with this lot conversation
    const targetLot = allLots.find(l => l.id === lotId);
    const existingMsg = recyclerMessages.filter(m => m.lotId === lotId).slice(-1)[0];
    const recId = existingMsg?.recyclerId || (targetLot?.matchedRecycler?.includes('CleanEarth') ? 'r2' : 'r1');
    const recName = existingMsg?.recyclerName || targetLot?.matchedRecycler || 'EcoTech Recycling Pvt Ltd';

    sendMessage({
      lotId,
      recyclerId: recId,
      recyclerName: recName,
      sender: 'recycler',
      text: text.trim()
    });

    setReplyText(prev => ({ ...prev, [lotId]: '' }));
    toast.success(`Message sent to collector for Lot ${lotId}!`);
  };

  const downloadReport = () => {
    const report = `ECOLOOP EPR COMPLIANCE REPORT
Recycler: EcoTech Recycling Pvt Ltd (CPCB Reg: 2024-TN-1002)
Generated on: ${new Date().toLocaleString()}
Active Lots: ${allLots.length}
Total Diverted Weight: ${allLots.reduce((acc, l) => acc + (l.materials?.[0]?.weight || 2), 0)} kg
Status: EPR Certified & Traceable`;

    const url = URL.createObjectURL(new Blob([report], { type: 'text/plain' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ecoloop-epr-compliance.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Recycler Facility Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center text-accent">
            <Factory className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-gray-800">EcoTech Recycling Pvt Ltd</h1>
              <span className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> CPCB Level-2
              </span>
            </div>
            <p className="text-gray-500 text-sm flex items-center gap-2 mt-0.5">
              <span>📍 Sholinganallur, Chennai</span> • 
              <span>Auth ID: <strong className="text-gray-700 font-mono">TNPCB-EW-2024-8841</strong></span>
            </p>
          </div>
        </div>

        <div className="text-right w-full sm:w-auto bg-gray-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Facility Capacity</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className="w-[68%] h-full bg-accent rounded-full"></div>
            </div>
            <span className="font-black text-sm text-gray-800">68%</span>
          </div>
          <span className="text-[11px] text-gray-400">3,400 kg / 5,000 kg capacity</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Column: Incoming Lots & Messages */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-gray-800">Incoming Lot Inquiries & Bids</h2>
            <span className="text-xs font-bold bg-green-100 text-green-800 px-3 py-1 rounded-full">
              {allLots.length} Active Lots
            </span>
          </div>
          
          <div className="space-y-4">
            {allLots.map(lot => {
              const mat = lot.materials?.[0] || { name: 'E-Waste Items', quantity: 1, weight: 1 };
              const lotMessages = recyclerMessages.filter(m => m.lotId === lot.id);

              return (
                <div 
                  key={lot.id} 
                  className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4 hover:border-gray-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                      {lot.photo ? (
                        <img 
                          src={lot.photo} 
                          alt="Lot" 
                          className="w-14 h-14 rounded-xl object-cover border border-gray-200 shadow-xs" 
                        />
                      ) : (
                        <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-2xl">
                          📦
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                            {lot.id}
                          </span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                            lot.status === 'Matched' 
                              ? 'bg-blue-100 text-blue-800' 
                              : lot.status === 'Recycled' 
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {lot.status}
                          </span>
                        </div>
                        <h3 className="font-black text-base text-gray-800 mt-1">{mat.name}</h3>
                        <p className="text-xs text-gray-500">
                          Qty: <strong>{mat.quantity} {mat.unit || 'pcs'}</strong> • Wt: <strong>{mat.weight || '4.5'} kg</strong> • Collector: <strong>{lot.collectorName || 'Ravi Kumar'}</strong>
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Fair Value</p>
                      <p className="font-black text-xl text-primary">
                        ₹{lot.fairValue?.recommended?.toLocaleString('en-IN') || '2,000'}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Range: ₹{lot.fairValue?.min} - ₹{lot.fairValue?.max}
                      </p>
                    </div>
                  </div>

                  {/* Message History for this lot */}
                  {lotMessages.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 space-y-2">
                      <p className="text-xs font-bold text-gray-600 flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-primary" /> Live Messages with Collector:
                      </p>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {lotMessages.map((msg) => (
                          <div 
                            key={msg.id} 
                            className={`p-2 rounded-lg text-xs ${
                              msg.sender === 'collector' 
                                ? 'bg-amber-50 text-amber-900 border border-amber-200' 
                                : 'bg-primary/10 text-primary font-medium border border-primary/20 ml-4'
                            }`}
                          >
                            <div className="flex justify-between font-bold text-[11px] mb-0.5">
                              <span>{msg.sender === 'collector' ? 'Collector (Ravi)' : 'EcoTech Support'}</span>
                              <span className="text-[10px] text-gray-400">{msg.timestamp}</span>
                            </div>
                            <p>{msg.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reply Box and Action Controls */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-1 border-t border-gray-100">
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={replyText[lot.id] || ''}
                        onChange={(e) => setReplyText({ ...replyText, [lot.id]: e.target.value })}
                        placeholder="Reply to collector regarding pickup or price..."
                        className="flex-1 p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSendReply(lot.id);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleSendReply(lot.id)}
                        className="px-3 py-2 bg-gray-800 hover:bg-black text-white text-xs font-bold rounded-lg flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" /> Reply
                      </button>
                    </div>

                    {lot.status !== 'Matched' && lot.status !== 'Recycled' && (
                      <button 
                        type="button" 
                        onClick={() => handleAcceptLot(lot.id)} 
                        className="px-4 py-2 bg-primary hover:bg-green-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" /> Accept & Dispatch
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Market Insights & EPR Ledger */}
        <div className="space-y-6">
          <div className="card bg-white border border-gray-200">
            <h3 className="font-black flex items-center gap-2 mb-4 text-gray-800">
              <TrendingUp className="w-5 h-5 text-green-600" /> Today's Scrap Market
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Smartphones</span>
                <span className="font-bold text-green-700">₹450/pc ↑</span>
              </li>
              <li className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Laptops</span>
                <span className="font-bold text-green-700">₹2,800/pc ↑</span>
              </li>
              <li className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-600 font-medium">PCB Boards</span>
                <span className="font-bold text-green-700">₹850/kg ↑</span>
              </li>
              <li className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Copper Cables</span>
                <span className="font-bold text-green-700">₹420/kg ↑</span>
              </li>
              <li className="flex justify-between items-center py-1">
                <span className="text-gray-600 font-medium">CRT Displays</span>
                <span className="font-bold text-amber-600">₹180/pc →</span>
              </li>
            </ul>
          </div>
          
          <div className="card bg-gray-900 text-white border-none shadow-xl">
            <h3 className="font-bold flex items-center gap-2 mb-2 text-white">
              <Box className="w-5 h-5 text-blue-400" /> Digital EPR Compliance
            </h3>
            <p className="text-gray-400 text-xs mb-4">
              All formal lot handovers generate cryptographic proof for Ministry of Environment & CPCB reporting.
            </p>
            <button 
              type="button" 
              onClick={downloadReport} 
              className="w-full py-2.5 bg-white/10 rounded-xl font-bold text-xs hover:bg-white/20 transition-all border border-white/20"
            >
              Download EPR Compliance Report (.txt)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
