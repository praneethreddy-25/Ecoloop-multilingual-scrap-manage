import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, TrendingUp, Package, Search, IndianRupee, ShieldAlert,
  Truck, MapPin, ArrowRight, CheckCircle2, Clock
} from 'lucide-react';
import CollectorScore from '../components/CollectorScore';
import useStore from '../store/useStore';
import VoiceButton from '../components/VoiceButton';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function CollectorDashboard() {
  const { user, householdPickups } = useStore();
  const { t } = useTranslation();

  const handleVoiceCommand = (text) => {
    toast(`Voice recognized: "${text}"`, { icon: '🎙️' });
  };

  const menuItems = [
    { title: t('collector.newCollection'), icon: <PlusCircle className="w-8 h-8" />, to: '/collector/collect', color: 'bg-primary text-white shadow-md' },
    { title: t('collector.myLots'), icon: <Package className="w-8 h-8 text-purple-600" />, to: '/collector/lots', color: 'bg-purple-50 hover:bg-purple-100' },
    { title: t('collector.findRecycler'), icon: <Search className="w-8 h-8 text-accent" />, to: '/collector/recyclers', color: 'bg-yellow-50 hover:bg-yellow-100' },
    { title: t('collector.earnings'), icon: <IndianRupee className="w-8 h-8 text-green-600" />, to: '/collector/earnings', color: 'bg-green-50 hover:bg-green-100' },
    { title: t('collector.safetyGuide'), icon: <ShieldAlert className="w-8 h-8 text-red-600" />, to: '/collector/safety', color: 'bg-red-50 hover:bg-red-100' },
    { title: t('collector.householdDrives'), icon: <Truck className="w-8 h-8 text-blue-600" />, to: '/household', color: 'bg-blue-50 hover:bg-blue-100' },
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Welcome & Score */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-800">{t('collector.welcome')}</h1>
            <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full">
              {user.collectorCode || 'COL-1045'}
            </span>
          </div>
          <p className="text-gray-500 text-xs mt-0.5">Formal Circular Economy Collection Agent</p>
        </div>
        <CollectorScore score={user.score || 92} />
      </div>

      {/* Voice Assistant Bar */}
      <div className="flex items-center gap-4 bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-2xl border border-green-200">
        <VoiceButton onResult={handleVoiceCommand} />
        <div className="text-xs text-gray-700">
          <p className="font-bold text-gray-900">{t('collector.assistantReady')} (English / தமிழ் / हिंदी)</p>
          <p className="text-gray-500 mt-0.5">{t('collector.askPrice')}</p>
        </div>
      </div>

      {/* Grid Menu with Large Pictorial Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
        {menuItems.map((item, i) => (
          <Link 
            key={i} 
            to={item.to} 
            className={`flex flex-col items-center justify-center p-5 rounded-2xl border border-gray-100 transition-all active:scale-95 hover:shadow-md ${item.color}`}
          >
            <div className="mb-2.5">{item.icon}</div>
            <span className={`font-black text-xs sm:text-sm text-center ${i === 0 ? 'text-white' : 'text-gray-800'}`}>
              {item.title}
            </span>
          </Link>
        ))}
      </div>

      {/* Live Household Pickups In Area */}
      {householdPickups.length > 0 && (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-sm text-gray-800 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-blue-600" /> Nearby Household Pickups Assigned To You
            </h3>
            <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
              {householdPickups.length} Ready
            </span>
          </div>

          <div className="space-y-2">
            {householdPickups.slice(0, 2).map((req) => (
              <div key={req.id} className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex justify-between items-center text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-gray-900">{req.userName}</strong>
                    <span className="text-gray-500 font-mono">({req.id})</span>
                  </div>
                  <p className="text-gray-600 text-[11px] truncate max-w-xs mt-0.5">
                    📍 {req.address}
                  </p>
                  <p className="text-primary font-bold text-[11px] mt-0.5">
                    Est. Value: ₹{req.totalEstValue} • Slot: {req.scheduledDate}
                  </p>
                </div>
                <Link
                  to="/collector/collect"
                  className="px-3 py-1.5 bg-primary text-white font-bold rounded-lg text-xs shrink-0 flex items-center gap-1"
                >
                  Collect <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Stats */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-black text-xs uppercase tracking-wider text-gray-500 mb-3">{t('collector.todayPerformance')}</h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-gray-50 p-3 rounded-xl">
            <p className="text-[10px] text-gray-500 uppercase font-bold">{t('collector.collected')}</p>
            <p className="font-black text-lg text-gray-800">48.5 kg</p>
          </div>
          <div className="bg-green-50 p-3 rounded-xl border border-green-100">
            <p className="text-[10px] text-green-700 uppercase font-bold">{t('collector.netEarnings')}</p>
            <p className="font-black text-lg text-green-700">₹6,075</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-xl border border-purple-100">
            <p className="text-[10px] text-purple-700 uppercase font-bold">{t('collector.activeLots')}</p>
            <p className="font-black text-lg text-purple-700">4</p>
          </div>
        </div>
      </div>
    </div>
  );
}
