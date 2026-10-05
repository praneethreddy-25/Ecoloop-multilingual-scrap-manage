const express = require('express');
const router = express.Router();
const { get, all, run } = require('../db/setup');

// GET all collectors
router.get('/collectors', (req, res) => {
  try {
    const collectors = all('SELECT c.*, u.name, u.phone, u.language FROM collectors c JOIN users u ON c.user_id = u.id');
    res.json(collectors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single collector profile
router.get('/collectors/:id', (req, res) => {
  try {
    const collector = get(
      'SELECT c.*, u.name, u.phone, u.language FROM collectors c JOIN users u ON c.user_id = u.id WHERE c.id = ? OR c.collector_code = ?',
      [req.params.id, req.params.id]
    );
    if (!collector) return res.status(404).json({ error: 'Collector not found' });
    
    const lots = all('SELECT * FROM lots WHERE collector_id = ? ORDER BY created_at DESC', [collector.id]);
    const transactions = all('SELECT * FROM transactions WHERE collector_id = ?', [collector.id]);
    
    res.json({
      ...collector,
      lots: lots.map(l => ({ ...l, items: JSON.parse(l.items || '[]') })),
      transactionCount: transactions.length,
      totalEarnings: transactions.reduce((s, t) => s + (t.final_price || 0), 0),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update language preference
router.put('/collectors/:id/language', (req, res) => {
  try {
    const { language } = req.body;
    const collector = get('SELECT * FROM collectors WHERE id = ?', [req.params.id]);
    if (!collector) return res.status(404).json({ error: 'Collector not found' });
    run('UPDATE users SET language = ? WHERE id = ?', [language, collector.user_id]);
    res.json({ message: 'Language updated', language });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
