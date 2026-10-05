import React from 'react';
import { MapPin, ShieldCheck, Sparkles, MessageSquare, Check, Phone, Clock, AlertTriangle, X } from 'lucide-react';
import PriceAnomaly from './PriceAnomaly';

export default function RecyclerCard({ 
  recycler, 
  fairValue, 
  onAccept, 
  onOpenMessage,
  onToggleChat,
  isSelectedForChat = false,
  messages = [] 
}) {
  const isBestMatch = recycler.isBestMatch;
  const isAnomaly = recycler.isAnomaly;

  return (
    <div className={`card relative transition-all duration-200 ${
      isSelectedForChat
        ? 'border-2 border-primary ring-2 ring-primary/30 shadow-lg bg-white'
        : isBestMatch 
        ? 'border-2 border-primary ring-1 ring-primary/20 shadow-md bg-white' 
        : isAnomaly 
        ? 'border-2 border-amber-300 bg-amber-50/30' 
        : 'border border-gray-200 bg-white'
    }`}>
      {/* Best Match Badge */}
      {isBestMatch && (
        <div className="absolute -top-3.5 right-4 bg-gradient-to-r from-primary to-emerald-600 text-white text-xs font-black px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-md">
          <Sparkles className="w-3.5 h-3.5" /> AI Recommended Best Match
        </div>
      )}

      {/* Recycler Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-black text-lg text-gray-800">{recycler.name}</h3>
            {recycler.verified && (
              <span className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full border border-blue-200">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> CPCB Auth
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
            <span className="flex items-center gap-1 font-medium text-gray-600">
              <MapPin className="w-3.5 h-3.5 text-gray-400" /> {recycler.distance} km ({recycler.location || 'Chennai'})
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" /> Pickup: <strong className="text-gray-700">{recycler.pickupTime || 'Today by 3 PM'}</strong>
            </span>
          </div>
        </div>

        {/* Offered Price Display */}
        <div className="text-left sm:text-right bg-gray-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Recycler's Bid</span>
          <p className="text-2xl font-black text-gray-900">
            ₹{recycler.offeredPrice.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-gray-500">100% Direct UPI Handover</span>
        </div>
      </div>

      {/* Materials accepted badges */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-1.5 font-medium">Certified for handling:</p>
        <div className="flex flex-wrap gap-1.5">
          {recycler.materialsAccepted.map((m, i) => (
            <span key={i} className="px-2.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-md font-medium capitalize">
              {m.replace('_', ' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Price Anomaly Alert Component */}
      <div className="mb-4">
        <PriceAnomaly offeredPrice={recycler.offeredPrice} fairValue={fairValue} />
      </div>

      {/* CHAT MESSAGES HISTORY: SHOWN ONLY FOR THE SELECTED RECYCLER */}
      {isSelectedForChat && (
        <div className="mb-4 bg-gray-50 rounded-xl p-3.5 border-2 border-primary/30 space-y-2.5 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center pb-1 border-b border-gray-200">
            <p className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> Message History with {recycler.name} ({messages.length})
            </p>
            <button
              type="button"
              onClick={onToggleChat}
              className="text-gray-400 hover:text-gray-700 text-xs font-bold flex items-center gap-0.5 bg-gray-200/60 hover:bg-gray-200 px-2 py-0.5 rounded-md transition-colors"
            >
              <X className="w-3 h-3" /> Close Chat
            </button>
          </div>

          {messages.length === 0 ? (
            <div className="text-center py-3 text-gray-500 text-xs">
              <p>No prior messages with {recycler.name}.</p>
              <button
                type="button"
                onClick={() => onOpenMessage(recycler)}
                className="mt-1.5 text-primary font-bold underline hover:text-green-700"
              >
                Send first message / request pickup
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`text-xs p-2.5 rounded-xl ${
                    msg.sender === 'collector' 
                      ? 'bg-green-100/90 text-green-900 border border-green-200 ml-6' 
                      : 'bg-white text-gray-800 border border-gray-200 mr-6 shadow-2xs'
                  }`}
                >
                  <div className="flex justify-between items-center font-bold mb-1">
                    <span className={msg.sender === 'collector' ? 'text-green-800' : 'text-gray-900'}>
                      {msg.sender === 'collector' ? 'You (Collector)' : recycler.name}
                    </span>
                    <span className="text-[10px] text-gray-400 font-normal">{msg.timestamp}</span>
                  </div>
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Quick Action to write a new message */}
          <div className="pt-2 border-t border-gray-200/80 flex justify-end">
            <button
              type="button"
              onClick={() => onOpenMessage(recycler)}
              className="text-xs bg-primary hover:bg-green-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-2xs transition-colors"
            >
              <MessageSquare className="w-3 h-3" /> Reply / Send New Message
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons: Message and Accept */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        <button
          type="button"
          onClick={() => {
            onToggleChat();
            // If opening and has no messages, also open the compose modal
            if (!isSelectedForChat && messages.length === 0) {
              onOpenMessage(recycler);
            }
          }}
          className={`py-2.5 px-4 rounded-xl border-2 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            isSelectedForChat 
              ? 'border-primary bg-primary text-white shadow-sm'
              : 'border-gray-200 hover:border-primary text-gray-700 hover:text-primary hover:bg-green-50/50'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> 
          {isSelectedForChat 
            ? 'Hide Messages' 
            : messages.length > 0 
            ? `View Messages (${messages.length})` 
            : 'Send Message / Inquiry'}
        </button>

        <button 
          type="button"
          onClick={() => onAccept(recycler)}
          className="py-2.5 px-4 bg-primary hover:bg-green-700 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <Check className="w-4 h-4" /> Accept Offer & Schedule Handover
        </button>
      </div>
    </div>
  );
}
