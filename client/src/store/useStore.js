import { create } from 'zustand';

// Initial seed lots
const initialLots = [
  {
    id: 'EW-CHN-2026-00125',
    status: 'Matched',
    fairValue: { min: 1850, max: 2150, recommended: 2000, unit: 'pcs' },
    materials: [{ type: 'smartphone', name: 'Smartphones', quantity: 18, weight: 4.8, condition: 'average', unit: 'pcs' }],
    photo: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=60',
    notes: 'Mixed brands, batteries intact',
    createdAt: '2026-09-10 10:15 AM',
    collectorName: 'Ravi Kumar (COL-1045)',
    matchedRecycler: 'EcoTech Recycling Pvt Ltd',
    finalAgreedPrice: 2050,
    isVerified: true
  },
  {
    id: 'EW-CHN-2026-X7M9P',
    status: 'Collected',
    fairValue: { min: 450, max: 600, recommended: 520, unit: 'pcs' },
    materials: [{ type: 'smartphone', name: 'Smartphones', quantity: 2, weight: 0.6, condition: 'broken', unit: 'pcs' }],
    photo: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300&auto=format&fit=crop&q=60',
    notes: 'Screens cracked',
    createdAt: '2026-09-09 03:40 PM',
    collectorName: 'Ravi Kumar (COL-1045)',
    isVerified: true
  },
  {
    id: 'EW-CHN-2026-B4K2L',
    status: 'Recycled',
    fairValue: { min: 2400, max: 3200, recommended: 2800, unit: 'kg' },
    materials: [{ type: 'pcb', name: 'Motherboard PCBs', quantity: 5, weight: 5.0, condition: 'good', unit: 'kg' }],
    photo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&auto=format&fit=crop&q=60',
    notes: 'High-grade telecommunication circuit boards',
    createdAt: '2026-09-07 11:20 AM',
    collectorName: 'Ravi Kumar (COL-1045)',
    matchedRecycler: 'GreenTech Solutions',
    finalAgreedPrice: 2950,
    isVerified: true
  }
];

// Initial messages between collector and recyclers
const initialMessages = [
  {
    id: 'msg-1',
    lotId: 'EW-CHN-2026-00125',
    recyclerId: 'r1',
    recyclerName: 'EcoTech Recycling Pvt Ltd',
    sender: 'collector',
    text: 'Hello, Lot EW-CHN-2026-00125 (18 Smartphones, 4.8 kg) is verified and ready for pickup.',
    timestamp: '10:18 AM'
  },
  {
    id: 'msg-2',
    lotId: 'EW-CHN-2026-00125',
    recyclerId: 'r1',
    recyclerName: 'EcoTech Recycling Pvt Ltd',
    sender: 'recycler',
    text: 'Received! Our pickup vehicle can arrive today at 2:30 PM. Offer confirmed at ₹2,050.',
    timestamp: '10:22 AM'
  }
];

// Initial household pickup requests
const initialHouseholdPickups = [
  {
    id: 'HH-REQ-8821',
    userName: 'Anita Sundaram',
    phone: '+91 98401 23456',
    address: 'Plot 42, 2nd Avenue, Anna Nagar West, Chennai',
    items: [
      { name: 'Old Smartphones', count: 3, estWeight: '0.7 kg', value: 900 },
      { name: 'Broken Dell Laptop', count: 1, estWeight: '2.2 kg', value: 1800 },
      { name: 'Adapters & Cables', count: 4, estWeight: '0.8 kg', value: 250 }
    ],
    totalEstValue: 2950,
    ecoPoints: 295,
    scheduledDate: 'Today, 4:00 PM - 6:00 PM',
    status: 'Collector Assigned',
    assignedCollector: 'Ravi Kumar (COL-1045)',
    collectorPhone: '+91 99990 00001',
    otp: '4829',
    paymentPreference: 'UPI Direct to Bank',
    createdAt: 'Today, 09:30 AM'
  },
  {
    id: 'HH-REQ-8794',
    userName: 'Karthik Raja',
    phone: '+91 97102 98765',
    address: 'Flat 3B, Sunshine Apts, Velachery, Chennai',
    items: [
      { name: 'CRT Monitor', count: 1, estWeight: '9.0 kg', value: 200 },
      { name: 'Old Keyboards', count: 2, estWeight: '1.2 kg', value: 100 }
    ],
    totalEstValue: 300,
    ecoPoints: 60,
    scheduledDate: 'Tomorrow, 10:00 AM',
    status: 'Requested',
    assignedCollector: 'Pending Assignment',
    otp: '3157',
    paymentPreference: 'Eco-Points Voucher (2x)',
    createdAt: 'Yesterday, 04:15 PM'
  }
];

const useStore = create((set, get) => ({
  user: { role: 'collector', name: 'Ravi Kumar', collectorCode: 'COL-1045', score: 92 },
  currentLot: null,
  lots: initialLots,
  recyclerMessages: initialMessages,
  householdPickups: initialHouseholdPickups,
  householdPoints: 540,
  offlineQueue: [],
  isOnline: navigator.onLine,
  language: 'en',
  
  setUser: (user) => set({ user }),
  
  setLot: (lot) => set((state) => {
    const exists = state.lots.some(l => l.id === lot.id);
    const updatedLots = exists 
      ? state.lots.map(l => l.id === lot.id ? lot : l)
      : [lot, ...state.lots];
    return { currentLot: lot, lots: updatedLots };
  }),

  addLot: (lot) => set((state) => ({
    currentLot: lot,
    lots: [lot, ...state.lots]
  })),

  updateLotStatus: (lotId, status, extra = {}) => set((state) => {
    const updatedLots = state.lots.map(l => l.id === lotId ? { ...l, status, ...extra } : l);
    const updatedCurrent = state.currentLot?.id === lotId 
      ? { ...state.currentLot, status, ...extra } 
      : state.currentLot;
    return { lots: updatedLots, currentLot: updatedCurrent };
  }),

  sendMessage: (message) => set((state) => ({
    recyclerMessages: [
      ...state.recyclerMessages,
      {
        id: `msg-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ...message
      }
    ]
  })),

  addHouseholdPickup: (pickup) => set((state) => ({
    householdPickups: [pickup, ...state.householdPickups],
    householdPoints: state.householdPoints + (pickup.ecoPoints || 50)
  })),

  updateHouseholdPickupStatus: (id, status) => set((state) => ({
    householdPickups: state.householdPickups.map(p => p.id === id ? { ...p, status } : p)
  })),

  addToOfflineQueue: (item) => set((state) => ({ 
    offlineQueue: [...state.offlineQueue, item] 
  })),
  syncOfflineQueue: () => set({ offlineQueue: [] }),
  setOnlineStatus: (status) => set({ isOnline: status }),
  setLanguage: (lang) => set({ language: lang })
}));

export default useStore;
