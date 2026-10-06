/**
 * ECOLOOP Database Setup
 * Uses sql.js (pure JavaScript SQLite) — no native compilation needed
 */

const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const DB_FILE = path.join(__dirname, 'ecoloop.db');

let db;
let SQL;

/**
 * Initialize sql.js and load/create the database
 */
async function initDb() {
  if (db) return db;

  SQL = await require('sql.js')();

  if (fs.existsSync(DB_FILE)) {
    const fileBuffer = fs.readFileSync(DB_FILE);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Helper: auto-save to disk after every write
  db.run = function (sql, params) {
    this.exec(sql, params);
    persist();
  };

  createTables();
  seedData();
  persist();

  console.log('✅ ECOLOOP database initialized');
  return db;
}

function persist() {
  if (db) {
    const data = db.export();
    fs.writeFileSync(DB_FILE, Buffer.from(data));
  }
}

function execSQL(sql) {
  try { db.exec(sql); } catch (e) { /* ignore if already exists */ }
}

function run(sql, params = []) {
  try {
    db.run(sql, params);
    persist();
    return true;
  } catch (e) {
    console.error('DB run error:', e.message);
    return false;
  }
}

function get(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  } catch (e) {
    return null;
  }
}

function all(sql, params = []) {
  try {
    const results = db.exec(sql, params);
    if (!results || results.length === 0) return [];
    const { columns, values } = results[0];
    return values.map(row => {
      const obj = {};
      columns.forEach((col, i) => { obj[col] = row[i]; });
      return obj;
    });
  } catch (e) {
    return [];
  }
}

function createTables() {
  execSQL(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL,
      language TEXT DEFAULT 'en',
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS collectors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE,
      collector_code TEXT,
      verification_status TEXT DEFAULT 'verified',
      rating REAL DEFAULT 4.5,
      score INTEGER DEFAULT 85,
      total_weight REAL DEFAULT 0.0,
      total_earnings REAL DEFAULT 0.0,
      badge_level TEXT DEFAULT 'Bronze'
    );

    CREATE TABLE IF NOT EXISTS recyclers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      recycler_code TEXT,
      authorization_number TEXT,
      facility_name TEXT,
      location TEXT,
      latitude REAL,
      longitude REAL,
      materials_accepted TEXT,
      capacity_kg REAL,
      status TEXT DEFAULT 'active',
      rating REAL DEFAULT 4.2
    );

    CREATE TABLE IF NOT EXISTS material_prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      material_type TEXT UNIQUE,
      category TEXT,
      min_price REAL,
      max_price REAL,
      unit TEXT DEFAULT 'per kg',
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS material_price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      material_type TEXT NOT NULL,
      recorded_date TEXT NOT NULL,
      min_price REAL NOT NULL,
      max_price REAL NOT NULL,
      avg_price REAL NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(material_type, recorded_date)
    );

    CREATE TABLE IF NOT EXISTS lots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lot_code TEXT UNIQUE,
      collector_id INTEGER,
      items TEXT,
      total_weight REAL,
      estimated_value_min REAL,
      estimated_value_max REAL,
      status TEXT DEFAULT 'collected',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS lot_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lot_id INTEGER,
      material_type TEXT,
      quantity INTEGER,
      weight REAL,
      condition TEXT DEFAULT 'good'
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tx_code TEXT UNIQUE,
      lot_id INTEGER,
      collector_id INTEGER,
      recycler_id INTEGER,
      offered_price REAL,
      final_price REAL,
      payment_method TEXT DEFAULT 'UPI',
      payment_status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS traceability_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lot_id INTEGER,
      event_type TEXT,
      description TEXT,
      location TEXT DEFAULT 'Chennai',
      timestamp TEXT DEFAULT (datetime('now')),
      hash TEXT
    );

    CREATE TABLE IF NOT EXISTS households (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      address TEXT,
      pickup_requests TEXT
    );
  `);
}

function seedData() {
  // Check if seeded
  const results = db.exec("SELECT COUNT(*) as cnt FROM material_prices");
  const count = results[0] ? results[0].values[0][0] : 0;
  if (count > 0) return;

  // Material prices (INR per kg)
  const materials = [
    ['mobile_phone', 'IT & Telecom', 220, 380],
    ['laptop', 'IT & Telecom', 180, 320],
    ['desktop_computer', 'IT & Telecom', 120, 220],
    ['crt_monitor', 'Displays', 15, 40],
    ['lcd_monitor', 'Displays', 80, 150],
    ['keyboard', 'Peripherals', 30, 60],
    ['mouse', 'Peripherals', 40, 80],
    ['printer', 'Office Equipment', 50, 120],
    ['battery_lithium', 'Batteries', 60, 140],
    ['battery_lead', 'Batteries', 25, 55],
    ['cable_wire', 'Cables', 90, 180],
    ['pcb', 'Components', 300, 600],
    ['refrigerator', 'Large Appliances', 20, 50],
    ['television', 'Displays', 60, 130],
    ['washing_machine', 'Large Appliances', 25, 60],
    ['charger_adapter', 'Small Equipment', 80, 160],
    ['router_modem', 'Networking', 100, 200],
    ['tablet', 'IT & Telecom', 200, 350],
    ['ups', 'Power Equipment', 30, 80],
  ];

  materials.forEach(([type, cat, min, max]) => {
    db.run(
      "INSERT OR IGNORE INTO material_prices (material_type, category, min_price, max_price) VALUES (?, ?, ?, ?)",
      [type, cat, min, max]
    );
  });

  // Recyclers (no password needed for recycler listing)
  const recyclerData = [
    ['GreenTech Recyclers', 'Sholinganallur, Chennai', 12.9010, 80.2279, '["mobile_phone","laptop","pcb","battery_lithium"]', 5000, 4.8],
    ['EcoRecycle India Pvt Ltd', 'Ambattur Industrial Estate, Chennai', 13.1143, 80.1548, '["mobile_phone","laptop","desktop_computer","tablet"]', 8000, 4.5],
    ['Reclytex Solutions', 'Guindy, Chennai', 13.0067, 80.2206, '["pcb","cable_wire","keyboard","mouse"]', 3000, 4.3],
    ['E-Waste Masters', 'Sipcot, Hosur', 12.7409, 77.8253, '["mobile_phone","battery_lithium","charger_adapter"]', 4000, 4.6],
    ['BioGreen Recycling', 'Electronic City, Bangalore', 12.8456, 77.6603, '["laptop","desktop_computer","lcd_monitor","printer"]', 6000, 4.4],
    ['CleanCycle Pvt Ltd', 'Manali, Chennai', 13.1736, 80.2609, '["refrigerator","washing_machine","television","ups"]', 7000, 4.2],
    ['MetalLoop Industries', 'Coimbatore', 11.0168, 76.9558, '["cable_wire","pcb","battery_lead","mobile_phone"]', 5500, 4.7],
    ['TechReclaim TN', 'Madurai', 9.9252, 78.1198, '["mobile_phone","laptop","tablet","charger_adapter","router_modem"]', 3500, 4.1],
  ];

  recyclerData.forEach(([name, loc, lat, lng, mats, cap, rating], i) => {
    db.run(
      "INSERT INTO users (name, phone, role, password_hash) VALUES (?, ?, ?, ?)",
      [name, `98765432${10 + i}`, 'recycler', '$2b$10$dummy_hash_recycler']
    );
    const userRes = db.exec(`SELECT id FROM users WHERE name='${name}'`);
    if (userRes[0]) {
      const userId = userRes[0].values[0][0];
      db.run(
        "INSERT INTO recyclers (user_id, recycler_code, authorization_number, facility_name, location, latitude, longitude, materials_accepted, capacity_kg, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [userId, `REC-${String(i + 1).padStart(3, '0')}`, `MoEFCC-2024-${1000 + i}`, name, loc, lat, lng, mats, cap, rating]
      );
    }
  });

  // Collectors
  const bcrypt = require('bcryptjs');
  const hash = bcrypt.hashSync('password123', 10);
  const collectorData = [
    ['Ravi Kumar', '9999000001', 92, 'Gold'],
    ['Senthil Murugan', '9999000002', 78, 'Silver'],
    ['Lakshmi Devi', '9999000003', 65, 'Bronze'],
    ['Mohammed Ismail', '9999000004', 88, 'Silver'],
    ['Anjali Singh', '9999000005', 55, 'Bronze'],
  ];

  collectorData.forEach(([name, phone, score, badge], i) => {
    db.run(
      "INSERT OR IGNORE INTO users (name, phone, role, password_hash) VALUES (?, ?, ?, ?)",
      [name, phone, 'collector', hash]
    );
    const userRes = db.exec(`SELECT id FROM users WHERE phone='${phone}'`);
    if (userRes[0]) {
      const userId = userRes[0].values[0][0];
      db.run(
        "INSERT INTO collectors (user_id, collector_code, rating, score, badge_level) VALUES (?, ?, ?, ?, ?)",
        [userId, `COL-CHN-00${i + 1}`, 4.0 + (i * 0.2), score, badge]
      );
    }
  });

  // Sample lots
  const sampleLots = [
    ['EW-CHN-2026-00125', 1, '[{"type":"mobile_phone","quantity":18,"weight":4.8,"condition":"good"},{"type":"charger_adapter","quantity":5,"weight":0.5}]', 5.3, 1456, 2124, 'payment_done'],
    ['EW-CHN-2026-00118', 1, '[{"type":"laptop","quantity":3,"weight":6.0,"condition":"fair"}]', 6.0, 1080, 1920, 'handover'],
    ['EW-CHN-2026-00112', 2, '[{"type":"pcb","quantity":2,"weight":0.8,"condition":"good"},{"type":"cable_wire","quantity":10,"weight":3.2}]', 4.0, 528, 1056, 'recycler_matched'],
    ['EW-CHN-2026-00105', 1, '[{"type":"keyboard","quantity":12,"weight":4.8},{"type":"mouse","quantity":8,"weight":1.6}]', 6.4, 384, 704, 'collected'],
    ['EW-CHN-2026-00098', 3, '[{"type":"crt_monitor","quantity":4,"weight":28.0,"condition":"damaged"}]', 28.0, 420, 1120, 'collected'],
  ];

  sampleLots.forEach(([code, colId, items, weight, min, max, status]) => {
    db.run(
      "INSERT INTO lots (lot_code, collector_id, items, total_weight, estimated_value_min, estimated_value_max, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [code, colId, items, weight, min, max, status]
    );
  });

  // Traceability events for first lot
  const lotRes = db.exec("SELECT id FROM lots WHERE lot_code='EW-CHN-2026-00125'");
  if (lotRes[0]) {
    const lotId = lotRes[0].values[0][0];
    const events = [
      ['collected', 'E-waste lot collected from household', 'Anna Nagar, Chennai'],
      ['classified', 'AI classification: Mobile Phones (94% confidence)', 'Anna Nagar, Chennai'],
      ['lot_created', 'Digital Material Lot EW-CHN-2026-00125 created', 'ECOLOOP Platform'],
      ['recycler_matched', 'Matched with GreenTech Recyclers (offer: ₹1,980)', 'ECOLOOP Platform'],
      ['offer_accepted', 'Collector accepted offer from GreenTech Recyclers', 'ECOLOOP Platform'],
      ['pickup_scheduled', 'Pickup scheduled for 2026-09-10 at 10:00 AM', 'Sholinganallur, Chennai'],
      ['handover', 'Material handed over to GreenTech Recyclers', 'Sholinganallur, Chennai'],
      ['payment_done', 'Payment of ₹1,980 processed via UPI', 'ECOLOOP Platform'],
      ['recycling_confirmed', 'Recycling confirmed by GreenTech Recyclers', 'Sholinganallur, Chennai'],
    ];
    events.forEach(([type, desc, loc]) => {
      db.run(
        "INSERT INTO traceability_events (lot_id, event_type, description, location, hash) VALUES (?, ?, ?, ?, ?)",
        [lotId, type, desc, loc, `HASH_${Math.random().toString(36).substr(2, 16).toUpperCase()}`]
      );
    });
  }

  // Sample transaction
  db.run(
    "INSERT INTO transactions (tx_code, lot_id, collector_id, recycler_id, offered_price, final_price, payment_method, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    ['TXN-2026-001928', 1, 1, 1, 1980, 1980, 'UPI', 'paid']
  );

  persist();
  console.log('✅ Database seeded with realistic data');
}

module.exports = { initDb, get, all, run, persist };
