const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { get, run } = require('../db/setup');

const JWT_SECRET = process.env.JWT_SECRET || 'ecoloop_secret_2026';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, phone, role = 'collector', language = 'en', password } = req.body;
    if (!name || !phone || !password) return res.status(400).json({ error: 'name, phone, password required' });

    const existing = get('SELECT id FROM users WHERE phone = ?', [phone]);
    if (existing) return res.status(409).json({ error: 'Phone already registered' });

    const hash = bcrypt.hashSync(password, 10);
    run('INSERT INTO users (name, phone, role, language, password_hash) VALUES (?, ?, ?, ?, ?)', [name, phone, role, language, hash]);
    
    const user = get('SELECT * FROM users WHERE phone = ?', [phone]);
    
    if (role === 'collector') {
      const code = `COL-CHN-${String(user.id).padStart(3,'0')}`;
      run('INSERT INTO collectors (user_id, collector_code) VALUES (?, ?)', [user.id, code]);
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const { password_hash, ...safeUser } = user;
    res.status(201).json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ error: 'phone and password required' });

    const user = get('SELECT * FROM users WHERE phone = ?', [phone]);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const { password_hash, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Demo login — returns a mock collector token without real auth (for hackathon demo)
router.post('/demo-login', (req, res) => {
  try {
    const { role = 'collector' } = req.body;
    const user = get('SELECT * FROM users WHERE role = ? LIMIT 1', [role]);
    if (!user) return res.status(404).json({ error: 'No demo user found' });
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    const { password_hash, ...safeUser } = user;
    res.json({ token, user: safeUser, message: `Demo login as ${role}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
