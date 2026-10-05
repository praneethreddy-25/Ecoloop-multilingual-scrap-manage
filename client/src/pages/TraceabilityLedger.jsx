import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import TraceabilityTimeline from '../components/TraceabilityTimeline';
import { 
  Download, Share2, ShieldCheck, Box, ArrowLeft, 
  CheckCircle2, Clock, Sparkles, RefreshCw, Truck, Recycle, Award, Check
} from 'lucide-react';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import useStore from '../store/useStore';

export default function TraceabilityLedger() {
  const { lotId } = useParams();
  const { lots, updateLotStatus } = useStore();

  const foundLot = lots.find(l => l.id === lotId) || {
    id: lotId || 'EW-CHN-2026-00125',
    materials: [{ name: 'Smartphones / Mobiles', quantity: 18, weight: 4.5, unit: 'pcs' }],
    status: 'Matched',
    fairValue: { recommended: 6075, min: 5400, max: 6800 },
    matchedRecycler: 'EcoTech Recycling Pvt Ltd',
    collectorName: 'Ravi Kumar (COL-1045)',
    createdAt: '10 Sept 2026, 04:27 pm'
  };

  const mat = foundLot.materials?.[0] || { name: 'E-Waste Material', quantity: 18, weight: 4.5, unit: 'pcs' };
  const agreedPrice = foundLot.finalAgreedPrice || foundLot.fairValue?.recommended || 6075;

  // Local state to track completion of milestones for immediate feedback
  const [milestone3Done, setMilestone3Done] = useState(
    foundLot.status === 'Handover & Paid' || foundLot.status === 'Recycled'
  );
  const [milestone4Done, setMilestone4Done] = useState(
    foundLot.status === 'Recycled'
  );
  const [isProcessing, setIsProcessing] = useState(false);

  // Milestone 3: Handover & Payment
  const handleCompleteHandover = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setMilestone3Done(true);
      updateLotStatus(foundLot.id, 'Handover & Paid', {
        handoverCompletedAt: new Date().toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        }),
        handoverHash: '0x889E41B7F012CC21'
      });
      setIsProcessing(false);
      toast.success(
        `✅ Milestone 3 Completed! Handover verified & UPI Payment of ₹${agreedPrice.toLocaleString('en-IN')} released to Collector!`,
        { duration: 4500, icon: '💳' }
      );
    }, 600);
  };

  // Milestone 4: Formal Recycling & Recovery
  const handleCompleteRecycling = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setMilestone4Done(true);
      updateLotStatus(foundLot.id, 'Recycled', {
        recycledCompletedAt: new Date().toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        }),
        recyclingHash: '0xCC90172FE991E4A1',
        recoveredMaterials: '850g Copper, 140g Aluminium, 1.2g Gold trace, Plastics'
      });
      setIsProcessing(false);
      toast.success(
        `🎉 Milestone 4 Completed! Formal recycling verified. CPCB Extended Producer Responsibility Certificate issued!`,
        { duration: 5000, icon: '🏆' }
      );
    }, 600);
  };

  // Complete all milestones for instant demo
  const handleCompleteAll = () => {
    setMilestone3Done(true);
    setMilestone4Done(true);
    updateLotStatus(foundLot.id, 'Recycled');
    toast.success('All 4 Milestones completed! Circular loop verified.', { icon: '♻️' });
  };

  const steps = [
    { 
      title: 'Digital Lot Created & AI Classified', 
      description: `${mat.quantity}x ${mat.name} (${mat.weight || 4.5} kg) verified at collection point by ${foundLot.collectorName || 'Ravi Kumar'}.`, 
      status: 'done', 
      date: foundLot.createdAt || '10 Sept 2026, 04:27 pm', 
      hash: '0x7A4b892F...1F9C' 
    },
    { 
      title: 'Authorized Recycler Matched & Offer Accepted', 
      description: `Matched with ${foundLot.matchedRecycler || 'EcoTech Recycling Pvt Ltd'} (CPCB Auth Level 2). Value: ₹${agreedPrice.toLocaleString('en-IN')}.`, 
      status: 'done', 
      date: '2026-09-10 10:25 AM', 
      hash: '0xB29c314E...8D2A' 
    },
    { 
      title: 'Collection Manifest & Safe Handover', 
      description: milestone3Done 
        ? `Physical handover verified at ${foundLot.matchedRecycler || 'EcoTech Recycling'}. Digital UPI payment of ₹${agreedPrice.toLocaleString('en-IN')} transferred to collector account.` 
        : 'Physical handover to authorized recycler logistics vehicle with hazardous material compliance.', 
      status: milestone3Done ? 'done' : 'active', 
      date: milestone3Done ? (foundLot.handoverCompletedAt || 'Today, 04:45 PM') : 'Scheduled (Pending Verification)', 
      hash: milestone3Done ? '0x889E41B7...CC21' : '' 
    },
    { 
      title: 'Formal Recycling & Material Recovery', 
      description: milestone4Done 
        ? 'Dismantling & precious metals refining complete: 850g Copper, 140g Aluminium, and 1.2g Gold trace recovered. CPCB EPR credit verified.' 
        : 'Dismantling, PCB refining, and recovery of copper, gold traces, and lithium.', 
      status: milestone4Done ? 'done' : milestone3Done ? 'active' : 'pending', 
      date: milestone4Done ? (foundLot.recycledCompletedAt || 'Today, 05:10 PM') : 'Pending Handover Completion', 
      hash: milestone4Done ? '0xCC90172F...E4A1' : '' 
    }
  ];

  const completedCount = steps.filter(s => s.status === 'done').length;

  const handleDownload = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(22, 163, 74);
    doc.text('ECOLOOP TRACEABILITY PASSPORT', 20, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Digital Platform for Formal E-Waste Collection & Recycling', 20, 30);
    doc.line(20, 34, 190, 34);

    doc.setFontSize(12);
    doc.setTextColor(20);
    doc.text(`Digital Material Lot ID: ${foundLot.id}`, 20, 46);
    doc.text(`Material Type: ${mat.name}`, 20, 56);
    doc.text(`Quantity / Weight: ${mat.quantity} ${mat.unit || 'units'} / ${mat.weight || 4.5} kg`, 20, 66);
    doc.text(`Collector: ${foundLot.collectorName || 'Ravi Kumar (COL-1045)'}`, 20, 76);
    doc.text(`Authorized Recycler: ${foundLot.matchedRecycler || 'EcoTech Recycling Pvt Ltd'}`, 20, 86);
    doc.text(`Agreed Final Value: INR ${agreedPrice.toLocaleString('en-IN')}`, 20, 96);
    doc.text(`Lifecycle Milestones: ${completedCount} of 4 Completed`, 20, 106);
    doc.text(`Status: ${completedCount === 4 ? '100% Fully Recycled (Loop Closed)' : 'In Progress'}`, 20, 116);
    
    doc.line(20, 126, 190, 126);
    doc.setFontSize(10);
    doc.setTextColor(50);
    doc.text('VERIFIED BLOCKCHAIN TRANSACTION HASHES:', 20, 134);
    doc.text('1. Lot AI Classification: 0x7A4b892F38D91F9CA12', 25, 142);
    doc.text('2. Recycler Offer Acceptance: 0xB29c314E87F18D2AB09', 25, 150);
    doc.text(`3. Handover & UPI Transfer: ${milestone3Done ? '0x889E41B7F012CC21D44' : 'Pending'}`, 25, 158);
    doc.text(`4. Formal Refining & Recovery: ${milestone4Done ? '0xCC90172FE991E4A1088' : 'Pending'}`, 25, 166);

    doc.line(20, 176, 190, 176);
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text('Authorized by Central Pollution Control Board (CPCB) EPR Audit Framework.', 20, 184);

    doc.save(`ECOLOOP-Certificate-${foundLot.id}.pdf`);
    toast.success('Traceability Certificate PDF downloaded!');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Back button */}
      <div className="flex justify-between items-center">
        <Link 
          to="/collector/lots"
          className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Lots
        </Link>
        <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md font-bold">
          Lot: {foundLot.id}
        </span>
      </div>

      {/* Header card with QR code */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6 rounded-2xl shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Box className="w-36 h-36" />
        </div>
        <div className="flex justify-between items-start relative z-10 gap-4">
          <div>
            <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider bg-green-950/80 px-2.5 py-0.5 rounded-full border border-green-800">
              E-Waste Digital Passport
            </span>
            <h1 className="text-2xl font-black mt-1 mb-1 font-mono">{foundLot.id}</h1>
            <p className="text-xs text-gray-300 mb-3">
              {mat.name} • {mat.quantity} {mat.unit || 'units'} ({mat.weight || 4.5} kg)
            </p>
            <div className="flex items-center gap-2 text-xs text-green-400 font-bold bg-green-400/10 w-fit px-3 py-1 rounded-full border border-green-400/20">
              <ShieldCheck className="w-4 h-4" /> Cryptographically Verified Record
            </div>
          </div>
          <div className="bg-white p-2 rounded-xl shrink-0 shadow-lg text-center">
            <QRCodeSVG value={`https://ecoloop.com/track/${foundLot.id}`} size={75} />
            <span className="text-[9px] font-bold text-gray-700 block mt-1">SCAN LOT</span>
          </div>
        </div>
      </div>

      {/* Milestone Completion Banner */}
      {completedCount === 4 ? (
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white p-4 rounded-2xl shadow-md flex items-center justify-between gap-3 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-black text-sm">🎉 4 / 4 Milestones Complete!</h3>
              <p className="text-xs text-green-100">Full Circular Loop Closed. Zero Waste to Landfill Verified.</p>
            </div>
          </div>
          <span className="bg-white text-green-800 font-black text-xs px-3 py-1.5 rounded-xl shadow-xs shrink-0">
            EPR Certified ✓
          </span>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-900">Milestones In Progress: {completedCount} / 4 Complete</p>
              <p className="text-[11px] text-amber-700">Advance the remaining milestones below to complete formal recycling.</p>
            </div>
          </div>
          <button
            onClick={handleCompleteAll}
            className="text-[11px] font-bold bg-amber-200/80 hover:bg-amber-300 text-amber-900 px-3 py-1.5 rounded-lg shrink-0 transition-colors"
          >
            ⚡ Quick Complete All
          </button>
        </div>
      )}

      {/* Traceability Timeline */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-black text-gray-800">Material Traceability Trail</h2>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
            completedCount === 4 
              ? 'bg-green-100 text-green-800 border-green-300' 
              : 'bg-green-50 text-primary border-green-200'
          }`}>
            {completedCount} / 4 Milestones Complete
          </span>
        </div>

        <TraceabilityTimeline steps={steps} />

        {/* INTERACTIVE MILESTONE PROGRESSION BUTTONS */}
        <div className="pt-4 border-t border-gray-100 space-y-3">
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">
            👉 Advance Remaining Milestones:
          </p>

          {/* Action for Milestone 3 */}
          {!milestone3Done && (
            <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h4 className="font-black text-sm text-blue-900 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-blue-600" /> Milestone 3: Safe Handover & Payment
                </h4>
                <p className="text-xs text-blue-700 mt-0.5">
                  Recycler driver arrived. Verify weight (4.5 kg) and transfer ₹{agreedPrice.toLocaleString('en-IN')} via UPI.
                </p>
              </div>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleCompleteHandover}
                className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all shrink-0"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Confirm Handover & Pay ₹{agreedPrice.toLocaleString('en-IN')}
              </button>
            </div>
          )}

          {/* Action for Milestone 4 */}
          {milestone3Done && !milestone4Done && (
            <div className="bg-emerald-50 border-2 border-emerald-200 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-in fade-in duration-300">
              <div>
                <h4 className="font-black text-sm text-emerald-900 flex items-center gap-1.5">
                  <Recycle className="w-4 h-4 text-emerald-600" /> Milestone 4: Formal Recycling & Recovery
                </h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Safe dismantling complete at {foundLot.matchedRecycler}. Extract precious metals and issue EPR compliance seal.
                </p>
              </div>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleCompleteRecycling}
                className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all shrink-0"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Complete Formal Recycling (4/4)
              </button>
            </div>
          )}

          {/* When all are complete */}
          {completedCount === 4 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-800 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              All milestones recorded on the tamper-evident ledger. You can now download the official certificate.
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={handleDownload} 
          className="btn-large bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center justify-center gap-2 font-bold shadow-xs"
        >
          <Download className="w-5 h-5 text-gray-700" /> Download Certificate (PDF)
        </button>
        <button 
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Traceability link copied to clipboard!');
          }} 
          className="btn-large btn-primary flex items-center justify-center gap-2 font-bold shadow-sm"
        >
          <Share2 className="w-5 h-5" /> Share Record Link
        </button>
      </div>
    </div>
  );
}
