import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Package, ShieldCheck, ArrowRight, Eye, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LotCard({ lot }) {
  const primaryMaterial = lot.materials?.[0] || { name: 'Mixed E-Waste', quantity: 1, unit: 'pcs' };

  return (
    <div className="card hover:shadow-lg transition-all duration-200 relative overflow-hidden flex flex-col justify-between border border-gray-200 bg-white">
      <div>
        {/* Header: Status and QR Code */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                lot.status === 'Matched' 
                  ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                  : lot.status === 'Recycled' 
                  ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                  : 'bg-green-100 text-green-800 border border-green-200'
              }`}>
                {lot.status}
              </span>
              {lot.isVerified && (
                <span className="flex items-center text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">
                  <ShieldCheck className="w-3 h-3 mr-0.5" /> AI Verified
                </span>
              )}
            </div>
            <h3 className="font-mono font-black mt-1.5 text-gray-900 text-sm">{lot.id}</h3>
          </div>
          <div className="bg-gray-50 p-1 rounded-lg border border-gray-200">
            <QRCodeSVG value={`https://ecoloop.com/track/${lot.id}`} size={44} />
          </div>
        </div>

        {/* Thumbnail & Items details */}
        <div className="flex items-center gap-3 mb-3 bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
          {lot.photo ? (
            <img 
              src={lot.photo} 
              alt="E-Waste lot" 
              className="w-14 h-14 rounded-lg object-cover border border-gray-200 shadow-xs shrink-0" 
            />
          ) : (
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0 text-xl font-bold">
              📦
            </div>
          )}
          <div className="overflow-hidden">
            <h4 className="font-bold text-sm text-gray-800 truncate">
              {primaryMaterial.name || primaryMaterial.type}
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Qty: <strong className="text-gray-700">{primaryMaterial.quantity} {primaryMaterial.unit}</strong>
              {primaryMaterial.weight && ` • ${primaryMaterial.weight} kg`}
            </p>
            {primaryMaterial.condition && (
              <span className="text-[10px] font-bold uppercase text-primary">
                Condition: {primaryMaterial.condition}
              </span>
            )}
          </div>
        </div>

        {lot.notes && (
          <p className="text-xs text-gray-500 italic line-clamp-1 mb-3">
            "{lot.notes}"
          </p>
        )}
      </div>

      <div>
        {/* Footer: Fair Value and Quick Link */}
        <div className="border-t border-gray-100 pt-3 flex justify-between items-center bg-gray-50 -mx-5 -mb-5 p-4 rounded-b-xl">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Fair Value</p>
            <p className="font-black text-base text-primary">
              ₹{lot.fairValue?.min?.toLocaleString('en-IN')} - ₹{lot.fairValue?.max?.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="flex gap-1.5">
            <Link 
              to={`/track/${lot.id}`}
              className="p-2 bg-white hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200 text-xs font-bold flex items-center gap-1 transition-colors"
              title="View Blockchain Traceability"
            >
              <Eye className="w-3.5 h-3.5" /> Ledger
            </Link>
            <Link 
              to="/collector/recyclers"
              className="p-2 bg-primary hover:bg-green-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
              title="Find Recyclers"
            >
              Recyclers <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
