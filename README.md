# ♻️ ECOLOOP — Digital Platform for Formal E-Waste Collection

> **"Collect. Know the Value. Sell Fairly. Recycle Safely."**

ECOLOOP bridges informal e-waste collectors with the formal recycling ecosystem through AI classification, fair-value estimation, price anomaly detection, authorized-recycler matching, and offline-first digital material passports.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (https://nodejs.org)
- npm 9+

### 1. Start the Backend Server

```bash
cd server
npm install
npm run dev
```
Server runs at: **http://localhost:5000**

### 2. Start the Frontend

```bash
cd client
npm install
npm run dev
```
Frontend runs at: **http://localhost:3000**

### 3. Open in Browser

Visit **http://localhost:3000** to see ECOLOOP.

### Offline mode

The collector photo flow runs without Google, SerpAPI, or any other API key. GPS uses browser location permission and stores coordinates on the lot; no API key is required.

---

## 🗺️ Portal Access

| Portal | URL | Description |
|--------|-----|-------------|
| 🏠 Landing | `/` | Main landing page |
| 👷 Collector | `/collector` | Informal collector dashboard |
| 📦 New Collection | `/collector/collect` | AI classification + lot creation |
| ♻️ Recycler Match | `/collector/recyclers` | Find authorized recyclers |
| 💰 Earnings | `/collector/earnings` | Payment dashboard |
| 🛡️ Safety Guide | `/collector/safety` | Pictorial safety guide |
| 🏠 Household | `/household` | Household e-waste disposal |
| 🏭 Recycler | `/recycler` | Recycler management portal |
| 🏛️ Municipality | `/municipality` | City analytics dashboard |
| 🔗 Track Lot | `/track/:lotId` | Traceability ledger |

---

## 🧠 Key Features

### 1. AI E-Waste Classification
- In-browser image classification
- Confidence percentages per category
- Collector can confirm or correct

### 2. Digital Material Passport
- Unique LOT ID: `EW-CHN-2026-XXXXX`
- Full traceability from collection → recycling
- QR code for each lot

### 3. Fair Value Engine
- Price range estimation based on material + weight + condition
- "Why this price?" detailed explanation
- Market context and recycler demand

### 4. Price Anomaly Detection
- 🟢 Fair offer
- 🟡 Slightly low (< 85% of fair value)
- 🔴 Abnormally low (< 70% of fair value)
- Suggests alternative recyclers

### 5. Offline-First
- Works without internet
- IndexedDB local storage
- Auto-sync when connection restored
- Service Worker caching

### 6. Voice Interface
- Web Speech API
- Ask prices by voice
- Audio safety instructions
- Multilingual (EN/HI/TA)

### 7. Multilingual UI
- English 🇬🇧
- Hindi 🇮🇳
- Tamil 🇮🇳

### 8. Environmental Impact
- E-waste diverted (kg)
- CO₂ avoided (kg)
- Materials recovered

### 9. Gamification
- Collector reputation score (0-100)
- Bronze → Silver → Gold Recycler badges
- Achievement milestones

---

## 🏗️ Architecture

```
ECOLOOP
├── client/          # React 18 + Vite + TailwindCSS
│   ├── src/
│   │   ├── pages/   # 10 portal pages
│   │   ├── components/  # 15+ reusable components
│   │   ├── store/   # Zustand global state
│   │   ├── hooks/   # useOfflineSync, useVoice
│   │   ├── utils/   # fairValue, db (IndexedDB), lotId
│   │   └── i18n/    # EN, HI, TA translations
│   └── public/
│       └── sw.js    # Service Worker
└── server/          # Node.js + Express + SQLite
    ├── routes/      # auth, lots, recyclers, transactions, prices, analytics
    ├── db/          # SQLite setup + seed data
    ├── middleware/  # JWT auth, error handling
    └── utils/       # fairValue, hash generation
```

## 💡 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, TailwindCSS |
| State | Zustand, React Query |
| Charts | Recharts |
| Maps | Leaflet.js |
| Offline | Service Worker, IndexedDB |
| i18n | react-i18next |
| Voice | Web Speech API |
| PDF | jsPDF |
| QR Code | qrcode.react |
| Backend | Node.js, Express |
| Database | SQLite (better-sqlite3) |
| Auth | JWT |
| Animations | Framer Motion |

---

## 🎬 Demo Flow (3-minute presentation)

1. **Problem** → Show collector without info
2. **AI Classification** → Upload phone photo → 94% confidence
3. **Digital Lot** → 18 phones, LOT #EW10025
4. **Fair Value** → ₹1,850–₹2,150 range
5. **Anomaly** → Recycler offers ₹1,450 → 🔴 WARNING
6. **Recycler Match** → Choose best authorized recycler
7. **Offline** → Turn off Wi-Fi → App still works → Sync when back online
8. **Payment** → Digital receipt TXN00125
9. **Traceability** → Full chain from collection to recycling

---

## 🏆 Hackathon: Challenge 19 — KPR Institute

Built for the **Digital Platform for Formal E-Waste Collection and Recycling** challenge.

**Innovation highlights:**
- Digital Material Passport (unique traceability)
- AI Fair Value Engine (price protection)
- Price Anomaly Detection (fraud prevention)
- Offline-First (low connectivity areas)
- Voice + Pictorial UI (low-literacy users)
