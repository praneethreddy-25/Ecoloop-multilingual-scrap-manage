import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import RecyclerCard from '../components/RecyclerCard';
import toast from 'react-hot-toast';
import { 
  ShieldCheck, Package, MapPin, Sparkles, AlertCircle, 
  MessageSquare, Send, X, ArrowLeft, CheckCircle2, Clock 
} from 'lucide-react';

export default function RecyclerMatch() {
  const { currentLot, lots, updateLotStatus, sendMessage, recyclerMessages, user } = useStore();
  const navigate = useNavigate();

  // Active lot: either currentLot or the newest lot in lots
  const activeLot = currentLot || (lots.length > 0 ? lots[0] : null);

  // Tracks WHICH recycler is currently selected to view/display message history
  // Exactly ONE recycler at a time can show message history!
  const [selectedChatRecyclerId, setSelectedChatRecyclerId] = useState(null);

  // Modal state for composing messages
  const [selectedRecycler, setSelectedRecycler] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Compute realistic dynamic offers based on active lot's recommended fair value
  const recommendedVal = activeLot?.fairValue?.recommended || 2000;
  const minVal = activeLot?.fairValue?.min || Math.round(recommendedVal * 0.85);
  const maxVal = activeLot?.fairValue?.max || Math.round(recommendedVal * 1.15);

  const mockRecyclers = [
    {
      id: 'r1',
      name: 'EcoTech Recycling Pvt Ltd',
      distance: 2.4,
      location: 'Sholinganallur, Chennai',
      verified: true,
      isBestMatch: true,
      isAnomaly: false,
      pickupTime: 'Today by 2:30 PM',
      offeredPrice: Math.round(recommendedVal * 1.05),
      materialsAccepted: ['smartphone', 'laptop', 'pcb', 'battery']
    },
    {
      id: 'r2',
      name: 'CleanEarth Recovery Solutions',
      distance: 4.8,
      location: 'Guindy Industrial Estate, Chennai',
      verified: true,
      isBestMatch: false,
      isAnomaly: false,
      pickupTime: 'Tomorrow morning',
      offeredPrice: Math.round(recommendedVal * 0.98),
      materialsAccepted: ['smartphone', 'pcb', 'cables', 'mixed_ewaste']
    },
    {
      id: 'r3',
      name: 'ScrapPoint Traders (Informal/Low)',
      distance: 1.2,
      location: 'Triplicane, Chennai',
      verified: false,
      isBestMatch: false,
      isAnomaly: true,
      pickupTime: 'Immediate',
      offeredPrice: Math.round(minVal * 0.70),
      materialsAccepted: ['smartphone', 'mixed_ewaste']
    }
  ];

  const handleAccept = (recycler) => {
    if (!activeLot) return;

    // Send automatic confirmation message
    sendMessage({
      lotId: activeLot.id,
      recyclerId: recycler.id,
      recyclerName: recycler.name,
      sender: 'collector',
      text: `Offer of ₹${recycler.offeredPrice.toLocaleString('en-IN')} ACCEPTED. Pickup scheduled for ${recycler.pickupTime}.`
    });

    updateLotStatus(activeLot.id, 'Matched', {
      matchedRecycler: recycler.name,
      finalAgreedPrice: recycler.offeredPrice
    });

    toast.success(`🎉 Offer of ₹${recycler.offeredPrice.toLocaleString('en-IN')} accepted with ${recycler.name}! Handover scheduled.`, {
      duration: 4000
    });

    navigate(`/track/${activeLot.id}`);
  };

  const openMessageModal = (recycler) => {
    setSelectedRecycler(recycler);
    // Also select this recycler so message history is focused on this one
    setSelectedChatRecyclerId(recycler.id);

    // Pre-fill message with lot specifics
    const matName = activeLot?.materials?.[0]?.name || 'E-waste lot';
    const qty = activeLot?.materials?.[0]?.quantity || 1;
    setMessageText(`Hello ${recycler.name}, I have approved Lot ${activeLot?.id} (${qty}x ${matName}). When can you send your pickup vehicle?`);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedRecycler || !activeLot) return;

    setIsSending(true);
    setTimeout(() => {
      sendMessage({
        lotId: activeLot.id,
        recyclerId: selectedRecycler.id,
        recyclerName: selectedRecycler.name,
        sender: 'collector',
        text: messageText.trim()
      });

      setIsSending(false);
      toast.success(`Message dispatched to ${selectedRecycler.name}!`, {
        icon: '📨'
      });
      setSelectedRecycler(null);
      setMessageText('');
    }, 350);
  };

  if (!activeLot) {
    return (
      <div className="max-w-md mx-auto text-center py-16 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-4">
        <div className="w-16 h-16 bg-green-50 text-primary rounded-full flex items-center justify-center mx-auto text-2xl">
          📦
        </div>
        <h2 className="text-xl font-black text-gray-800">No active material lot found</h2>
        <p className="text-sm text-gray-500">Scan or upload an e-waste photo first to create your digital lot passport.</p>
        <button 
          className="btn-large btn-primary w-full" 
          onClick={() => navigate('/collector/collect')}
        >
          Scan & Create New Lot
        </button>
      </div>
    );
  }

  const mat = activeLot.materials?.[0] || { name: 'E-Waste Items', quantity: 1, weight: 1 };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/collector')}
          className="text-xs font-bold text-gray-500 hover:text-gray-800 flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md font-bold">
          Collector: {user?.name || 'Ravi Kumar'} ({user?.collectorCode || 'COL-1045'})
        </span>
      </div>

      {/* Collector Approved Lot Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-green-700 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div className="flex items-center gap-4">
            {activeLot.photo ? (
              <img 
                src={activeLot.photo} 
                alt="Approved Lot" 
                className="w-18 h-18 rounded-xl object-cover border-2 border-white/40 shadow" 
              />
            ) : (
              <div className="w-18 h-18 bg-white/20 rounded-xl flex items-center justify-center text-3xl">
                📦
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs bg-black/30 px-2 py-0.5 rounded text-green-200 font-bold">
                  LOT ID: {activeLot.id}
                </span>
                <span className="bg-green-400 text-green-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  Collector Approved
                </span>
              </div>
              <h2 className="text-xl font-black mt-1">{mat.name}</h2>
              <p className="text-xs text-green-100 mt-0.5">
                Quantity: <strong>{mat.quantity} {mat.unit || 'pcs'}</strong> • Weight: <strong>{mat.weight || '4.5'} kg</strong> • Condition: <strong className="capitalize">{mat.condition || 'Average'}</strong>
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/20 text-right w-full sm:w-auto">
            <span className="text-[11px] uppercase tracking-wider text-green-200 font-bold block">
              Calculated Fair Value
            </span>
            <p className="text-2xl font-black text-white">
              ₹{minVal.toLocaleString('en-IN')} - ₹{maxVal.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-green-200">Recommended: ₹{recommendedVal.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {activeLot.notes && (
          <div className="mt-3 pt-3 border-t border-white/15 text-xs text-green-100 flex items-center gap-2">
            <span className="font-bold">Lot Note:</span> {activeLot.notes}
          </div>
        )}
      </div>

      {/* Title & Matching Overview */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Authorized Recycler Bids</h1>
          <p className="text-gray-500 text-sm">
            Select a recycler to chat, view messages, or accept their offer.
          </p>
        </div>
        <span className="text-xs bg-green-50 text-primary border border-green-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> 3 Live Recyclers Ready
        </span>
      </div>

      {/* Recycler Cards */}
      <div className="space-y-4">
        {mockRecyclers.map(recycler => {
          // Strictly filter messages for this recycler and this lot
          const matchingMsgs = recyclerMessages.filter(
            m => m.lotId === activeLot.id && m.recyclerId === recycler.id
          );

          // ONLY the selected recycler has isSelectedForChat = true!
          const isSelected = selectedChatRecyclerId === recycler.id;

          return (
            <RecyclerCard 
              key={recycler.id} 
              recycler={recycler} 
              fairValue={activeLot.fairValue} 
              onAccept={handleAccept}
              onOpenMessage={openMessageModal}
              onToggleChat={() => setSelectedChatRecyclerId(isSelected ? null : recycler.id)}
              isSelectedForChat={isSelected}
              messages={matchingMsgs}
            />
          );
        })}
      </div>

      {/* Direct Messaging Modal */}
      {selectedRecycler && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" /> Message {selectedRecycler.name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Regarding Lot <strong className="font-mono text-gray-700">{activeLot.id}</strong> ({mat.quantity}x {mat.name})
                </p>
              </div>
              <button 
                onClick={() => setSelectedRecycler(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conversation History in Modal for THIS recycler only */}
            {recyclerMessages.filter(m => m.lotId === activeLot.id && m.recyclerId === selectedRecycler.id).length > 0 && (
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 space-y-2 max-h-40 overflow-y-auto">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                  Chat History with {selectedRecycler.name}:
                </span>
                {recyclerMessages
                  .filter(m => m.lotId === activeLot.id && m.recyclerId === selectedRecycler.id)
                  .map(msg => (
                    <div 
                      key={msg.id} 
                      className={`text-xs p-2 rounded-lg ${
                        msg.sender === 'collector' 
                          ? 'bg-green-100 text-green-900 border border-green-200 ml-4' 
                          : 'bg-white text-gray-800 border border-gray-200 mr-4'
                      }`}
                    >
                      <div className="flex justify-between font-bold text-[10px] mb-0.5">
                        <span>{msg.sender === 'collector' ? 'You' : selectedRecycler.name}</span>
                        <span className="text-gray-400">{msg.timestamp}</span>
                      </div>
                      <p>{msg.text}</p>
                    </div>
                  ))}
              </div>
            )}

            {/* Quick Templates */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                Quick Message Templates:
              </label>
              <div className="flex flex-col gap-1.5">
                {[
                  `Can you schedule pickup for Lot ${activeLot.id} today at 2:30 PM?`,
                  `I have ${mat.quantity} ${mat.name} (${mat.weight} kg). Can you offer ₹${Math.round(recommendedVal * 1.08)}?`,
                  `Materials are sorted, packed in CPCB standard crates, and ready for inspection.`
                ].map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setMessageText(tpl)}
                    className="text-left text-xs bg-gray-50 hover:bg-green-50/60 p-2 rounded-lg border border-gray-200 text-gray-700 hover:text-primary transition-colors"
                  >
                    • {tpl}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Your Message to {selectedRecycler.name}:
                </label>
                <textarea
                  rows="3"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your question, pickup time request, or counter-offer..."
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedRecycler(null)}
                  className="py-2.5 px-4 rounded-xl border border-gray-300 font-bold text-sm text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending || !messageText.trim()}
                  className="py-2.5 px-5 bg-primary hover:bg-green-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow transition-all"
                >
                  {isSending ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
