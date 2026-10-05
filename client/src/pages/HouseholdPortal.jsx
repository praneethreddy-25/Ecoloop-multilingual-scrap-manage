import React, { useState } from 'react';
import { 
  Home, LocateFixed, Calendar, MapPin, Gift, Clock, 
  Smartphone, Laptop, Tv, Battery, CheckCircle2, ShieldCheck, 
  Plus, Minus, ArrowRight, Truck, Phone, Award, Sparkles, AlertCircle
} from 'lucide-react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';

const dropOffPoints = [
  { name: 'ECOLOOP Central Hub', position: [13.0827, 80.2707], address: 'Central Chennai, EVR Periyar Salai', hours: '9 AM - 7 PM Daily' },
  { name: 'Green Earth Drop-off', position: [13.0569, 80.2425], address: 'Guindy Industrial Estate', hours: '10 AM - 6 PM Mon-Sat' },
  { name: 'Anna Nagar TechDrop Center', position: [13.1067, 80.2206], address: '2nd Avenue, Anna Nagar East', hours: '9 AM - 8 PM Daily' },
  { name: 'Velachery EcoKiosk', position: [12.9815, 80.2180], address: 'Velachery Bypass Road', hours: '10 AM - 7 PM Daily' }
];

function RecenterMap({ position }) {
  const map = useMap();
  map.setView(position, 13);
  return null;
}

export default function HouseholdPortal() {
  const { householdPickups, addHouseholdPickup, householdPoints } = useStore();

  const [activeTab, setActiveTab] = useState('schedule'); // 'schedule' | 'my-pickups' | 'rewards' | 'dropoff'

  // Item counts for pickup
  const [items, setItems] = useState({
    smartphones: 2,
    laptops: 1,
    monitors: 0,
    accessories: 3,
    appliances: 0
  });

  // Form states
  const [fullName, setFullName] = useState('Anita Sundaram');
  const [phone, setPhone] = useState('+91 98401 23456');
  const [address, setAddress] = useState('Plot 42, 2nd Avenue, Anna Nagar West, Chennai');
  const [timeSlot, setTimeSlot] = useState('Today, 4:00 PM - 6:00 PM');
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'points'

  // Map state
  const [mapPosition, setMapPosition] = useState([13.0827, 80.2707]);

  // Pricing configuration for items
  const itemConfig = {
    smartphones: { label: 'Old Smartphones / Mobiles', icon: <Smartphone className="w-5 h-5" />, unitValue: 400, unitWeight: 0.25, unitPoints: 40 },
    laptops: { label: 'Laptops / Notebooks / Tablets', icon: <Laptop className="w-5 h-5" />, unitValue: 1800, unitWeight: 2.0, unitPoints: 180 },
    monitors: { label: 'Monitors / CRT / Old TVs', icon: <Tv className="w-5 h-5" />, unitValue: 450, unitWeight: 5.0, unitPoints: 50 },
    accessories: { label: 'Chargers, Cables & Keyboards', icon: <Battery className="w-5 h-5" />, unitValue: 80, unitWeight: 0.3, unitPoints: 10 },
    appliances: { label: 'Small Home Appliances (Mixer, Iron)', icon: <Home className="w-5 h-5" />, unitValue: 350, unitWeight: 2.5, unitPoints: 35 }
  };

  // Compute total estimate
  const totalValue = Object.entries(items).reduce((sum, [key, count]) => {
    return sum + (count * itemConfig[key].unitValue);
  }, 0);

  const totalPoints = Object.entries(items).reduce((sum, [key, count]) => {
    return sum + (count * itemConfig[key].unitPoints);
  }, 0);

  const totalItemsCount = Object.values(items).reduce((a, b) => a + b, 0);

  const updateItemCount = (key, delta) => {
    setItems(prev => ({
      ...prev,
      [key]: Math.max(0, prev[key] + delta)
    }));
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (totalItemsCount === 0) {
      toast.error('Please select at least one e-waste item to recycle!');
      return;
    }

    const selectedItemsList = Object.entries(items)
      .filter(([_, count]) => count > 0)
      .map(([key, count]) => ({
        name: itemConfig[key].label,
        count,
        value: count * itemConfig[key].unitValue
      }));

    const newReqId = `HH-REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const newPickup = {
      id: newReqId,
      userName: fullName,
      phone,
      address,
      items: selectedItemsList,
      totalEstValue: totalValue,
      ecoPoints: paymentMethod === 'points' ? totalPoints * 2 : totalPoints,
      scheduledDate: timeSlot,
      status: 'Collector Assigned',
      assignedCollector: 'Ravi Kumar (COL-1045)',
      collectorPhone: '+91 99990 00001',
      otp: randomOtp,
      paymentPreference: paymentMethod === 'upi' ? 'UPI Direct to Bank' : 'Eco-Points Voucher (2x Bonus)',
      createdAt: 'Just now'
    };

    addHouseholdPickup(newPickup);

    toast.success(
      `🎉 Pickup request ${newReqId} confirmed! Verified collector Ravi Kumar has been assigned for ${timeSlot}.`,
      { duration: 5000 }
    );

    setActiveTab('my-pickups');
  };

  const findNearby = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setMapPosition([coords.latitude, coords.longitude]);
        toast.success('Centered map to your location.');
      },
      () => toast.error('Using default Chennai collection points.')
    );
  };

  const handleRedeemVoucher = (name, cost) => {
    if (householdPoints < cost) {
      toast.error(`You need ${cost} points. Current balance: ${householdPoints} points.`);
      return;
    }
    toast.success(`🎉 Voucher redeemed! ${name} promo code sent to ${phone}.`, {
      icon: '🎁',
      duration: 4500
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-blue-100 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Responsible Household E-Waste Drive
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Household E-Waste Portal</h1>
            <p className="text-blue-100 text-sm sm:text-base max-w-xl mt-1">
              Don't let old gadgets pollute landfills. Schedule a free doorstep pickup by a verified collector, get instant fair cash via UPI, or earn eco-rewards.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-right shrink-0 w-full md:w-auto">
            <span className="text-xs uppercase tracking-wider text-blue-200 font-bold block">Your Eco-Rewards</span>
            <p className="text-3xl font-black text-yellow-300 mt-0.5">{householdPoints} Pts</p>
            <span className="text-[11px] text-blue-200">Redeemable for shopping vouchers</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 bg-white rounded-2xl p-1.5 shadow-xs gap-1 overflow-x-auto">
        {[
          { id: 'schedule', label: '📅 Schedule Pickup', badge: null },
          { id: 'my-pickups', label: '🚚 My Pickups', badge: householdPickups.length },
          { id: 'rewards', label: '🎁 Eco-Rewards & Vouchers', badge: null },
          { id: 'dropoff', label: '📍 Nearby Drop-off Centers', badge: null }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {tab.label}
            {tab.badge !== null && (
              <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                activeTab === tab.id ? 'bg-white text-primary' : 'bg-gray-200 text-gray-700'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: SCHEDULE PICKUP */}
      {activeTab === 'schedule' && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Item Selector & Value Estimator */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <div>
                <h2 className="text-xl font-black text-gray-800">1. Select E-Waste to Recycle</h2>
                <p className="text-xs text-gray-500">Pick what you have at home to see your live estimated payout.</p>
              </div>

              <div className="space-y-3">
                {Object.entries(itemConfig).map(([key, config]) => (
                  <div 
                    key={key} 
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                      items[key] > 0 
                        ? 'border-primary bg-green-50/40 ring-1 ring-primary/20' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        items[key] > 0 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {config.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-800">{config.label}</h4>
                        <p className="text-xs text-gray-500">
                          Est. Value: <strong className="text-green-700">~₹{config.unitValue}/pc</strong> • Earns: <strong className="text-yellow-600">+{config.unitPoints} Pts</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateItemCount(key, -1)}
                        disabled={items[key] === 0}
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 font-bold text-gray-700 flex items-center justify-center"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-black text-base text-gray-800">
                        {items[key]}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateItemCount(key, 1)}
                        className="w-8 h-8 rounded-lg bg-primary hover:bg-green-700 text-white font-bold flex items-center justify-center shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Address & Slot Details */}
            <form onSubmit={handleScheduleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <div>
                <h2 className="text-xl font-black text-gray-800">2. Pickup Details & Address</h2>
                <p className="text-xs text-gray-500">A verified collector wearing formal ECOLOOP ID badge will arrive at your door.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl text-sm font-medium focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Phone (For Collector OTP)</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl text-sm font-medium focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Doorstep Pickup Address</label>
                <textarea
                  required
                  rows="2"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm font-medium focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Preferred Time Window</label>
                  <select
                    value={timeSlot}
                    onChange={e => setTimeSlot(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl text-sm font-bold bg-gray-50"
                  >
                    <option>Today, 4:00 PM - 6:00 PM</option>
                    <option>Tomorrow, 10:00 AM - 1:00 PM</option>
                    <option>Tomorrow, 3:00 PM - 6:00 PM</option>
                    <option>This Saturday, 10:00 AM - 2:00 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Payment Preference</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                        paymentMethod === 'upi' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200'
                      }`}
                    >
                      💳 Instant UPI
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('points')}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                        paymentMethod === 'points' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-gray-700 border-gray-200'
                      }`}
                    >
                      🎁 2x Eco-Points
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full btn-large btn-primary flex items-center justify-center gap-2 shadow-lg mt-4"
              >
                <Truck className="w-5 h-5" /> Request Verified Collector Pickup
              </button>
            </form>
          </div>

          {/* Value Summary Sticky Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
              <h3 className="font-black text-gray-800 text-base">Estimated Recycled Value</h3>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 text-center">
                <span className="text-xs text-green-700 font-bold uppercase tracking-wider">You Will Receive Approx.</span>
                <p className="text-3xl font-black text-green-800 mt-1">₹{totalValue.toLocaleString('en-IN')}</p>
                <p className="text-xs text-green-700 mt-1">
                  or <strong className="text-amber-700 font-bold">+{totalPoints * 2} Eco-Points</strong>
                </p>
              </div>

              <div className="space-y-2 text-xs border-t border-gray-100 pt-3">
                <div className="flex justify-between text-gray-600">
                  <span>Selected Devices:</span>
                  <span className="font-bold text-gray-800">{totalItemsCount} items</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Collector Service Fee:</span>
                  <span className="font-bold text-green-600">FREE (Zero Cost)</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>CO₂ Avoided:</span>
                  <span className="font-bold text-emerald-600">~14.2 kg CO₂</span>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p>
                  <strong>ECOLOOP Guarantee:</strong> 100% of collected electronics are channeled into authorized CPCB-certified dismantling facilities. No toxic burning.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY SCHEDULED PICKUPS */}
      {activeTab === 'my-pickups' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-gray-800">Your Active Doorstep Pickups</h2>
            <button
              onClick={() => setActiveTab('schedule')}
              className="btn-primary text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Book Another Pickup
            </button>
          </div>

          <div className="space-y-4">
            {householdPickups.map((pickup) => (
              <div 
                key={pickup.id}
                className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-gray-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-gray-800">{pickup.id}</span>
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                        {pickup.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" /> Slot: <strong className="text-gray-700">{pickup.scheduledDate}</strong>
                    </p>
                  </div>

                  <div className="text-left sm:text-right bg-green-50 p-2 sm:p-0 rounded-lg">
                    <span className="text-[10px] text-gray-500 uppercase font-bold">Estimated Payout</span>
                    <p className="text-lg font-black text-green-700">₹{pickup.totalEstValue?.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Items summary */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold text-gray-600 uppercase">Items for Collection:</p>
                    <div className="space-y-1">
                      {pickup.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-gray-700 bg-gray-50 p-2 rounded-lg">
                          <span>{it.count}x {it.name}</span>
                          <span className="font-bold text-gray-800">₹{it.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Collector Assignment & OTP */}
                  <div className="space-y-2 bg-blue-50/50 p-3.5 rounded-xl border border-blue-100">
                    <p className="text-xs font-bold text-blue-900 uppercase">Assigned Collector Details:</p>
                    <div className="text-xs text-gray-700 space-y-1">
                      <p className="font-bold flex items-center gap-1 text-gray-900">
                        <Truck className="w-3.5 h-3.5 text-primary" /> {pickup.assignedCollector}
                      </p>
                      <p className="text-gray-600 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-gray-400" /> Phone: {pickup.collectorPhone || '+91 99990 00001'}
                      </p>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-blue-200 mt-2 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase font-bold">Doorstep Handover OTP</span>
                        <p className="font-mono text-base font-black text-blue-800">{pickup.otp || '4829'}</p>
                      </div>
                      <span className="text-[11px] text-gray-400 italic">Give OTP to collector at door</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                  <span className="truncate max-w-sm">📍 {pickup.address}</span>
                  <span className="font-bold text-primary">Payment: {pickup.paymentPreference}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ECO-REWARDS & VOUCHERS */}
      {activeTab === 'rewards' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white p-6 rounded-2xl shadow-md flex justify-between items-center">
            <div>
              <span className="text-xs uppercase tracking-wider text-amber-100 font-bold">Current Balance</span>
              <h2 className="text-3xl font-black">{householdPoints} Eco-Points</h2>
              <p className="text-xs text-amber-100 mt-0.5">Earn 10 points for every ₹100 of recycled electronics.</p>
            </div>
            <Award className="w-16 h-16 text-yellow-200 opacity-80" />
          </div>

          <div>
            <h3 className="text-lg font-black text-gray-800 mb-3">Redeem Partner Vouchers</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { name: 'Amazon ₹100 Gift Voucher', points: 400, icon: '🛒', desc: 'Valid across all shopping categories' },
                { name: 'Swiggy / Zomato ₹150 Food Pass', points: 500, icon: '🍔', desc: 'Direct discount on next 2 meals' },
                { name: 'Plant 2 Native Trees in Chennai', points: 300, icon: '🌳', desc: 'Geo-tagged tree planted via NGO Partner' },
                { name: 'Uber / Ola ₹100 Ride Voucher', points: 350, icon: '🚖', desc: 'Valid for eco-friendly EV rides' },
                { name: 'Apollo Pharmacy ₹200 Health Card', points: 600, icon: '💊', desc: 'Medicines & health check discounts' },
                { name: 'BigBasket ₹250 Grocery Coupon', points: 750, icon: '🥦', desc: 'Organic fruits & daily essentials' }
              ].map((v, i) => (
                <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-2xl block mb-1">{v.icon}</span>
                    <h4 className="font-bold text-sm text-gray-800">{v.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{v.desc}</p>
                  </div>
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="font-black text-sm text-amber-700">{v.points} Pts</span>
                    <button
                      type="button"
                      onClick={() => handleRedeemVoucher(v.name, v.points)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold"
                    >
                      Redeem
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: NEARBY DROP-OFF CENTERS MAP */}
      {activeTab === 'dropoff' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div>
                <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" /> Authorized E-Waste Drop-Off Centers
                </h2>
                <p className="text-xs text-gray-500">
                  Drop off your gadgets anytime at our certified neighborhood kiosks.
                </p>
              </div>

              <button 
                type="button" 
                onClick={findNearby} 
                className="py-2 px-4 rounded-xl border border-primary text-primary font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-green-50"
              >
                <LocateFixed className="w-4 h-4" /> Locate Nearest Kiosk
              </button>
            </div>

            <div className="h-80 rounded-2xl overflow-hidden border border-gray-200 shadow-inner">
              <MapContainer center={mapPosition} zoom={12} scrollWheelZoom className="h-full w-full">
                <RecenterMap position={mapPosition} />
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {dropOffPoints.map(point => (
                  <CircleMarker 
                    key={point.name} 
                    center={point.position} 
                    radius={10} 
                    pathOptions={{ color: '#16a34a', fillColor: '#22c55e', fillOpacity: 0.9 }}
                  >
                    <Popup>
                      <div className="p-1 space-y-1">
                        <strong className="text-sm text-gray-800">{point.name}</strong>
                        <p className="text-xs text-gray-600">{point.address}</p>
                        <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-bold block">
                          🕒 {point.hours}
                        </span>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              {dropOffPoints.map((p, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                  <p className="font-bold text-gray-800">{p.name}</p>
                  <p className="text-gray-500 mt-0.5">{p.address}</p>
                  <span className="text-primary font-bold mt-1 block">Hours: {p.hours}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
