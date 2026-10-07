const express = require('express');
const router = express.Router();
const { get, all, run } = require('../db/setup');
const { generateLotCode } = require('../utils/fairValue');
const authMiddleware = require('../middleware/auth');

// GET all lots for current collector (no auth for demo)
router.get('/', (req, res) => {
  try {
    const lots = all('SELECT * FROM lots ORDER BY created_at DESC');
    res.json(lots.map(lot => ({
      ...lot,
      items: JSON.parse(lot.items || '[]')
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single lot
router.get('/:id', (req, res) => {
  try {
    const lot = get('SELECT * FROM lots WHERE id = ? OR lot_code = ?', [req.params.id, req.params.id]);
    if (!lot) return res.status(404).json({ error: 'Lot not found' });

    const events = all('SELECT * FROM traceability_events WHERE lot_id = ? ORDER BY id ASC', [lot.id]);
    res.json({ ...lot, items: JSON.parse(lot.items || '[]'), traceability: events });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new lot
router.post('/', authMiddleware, (req, res) => {
  try {
    const { items = [], collectorId = 1 } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one item is required' });
    }

    if (!collectorId || Number.isNaN(Number(collectorId))) {
      return res.status(400).json({ error: 'Valid collectorId is required' });
    }

    for (const item of items) {
      const materialType = item.type || item.material_type;
      const weight = Number(item.weight);
      const quantity = Number(item.quantity);

      if (!materialType || typeof materialType !== 'string') {
        return res.status(400).json({
          error: 'Each item must have a valid material type'
        });
      }

      if (
        (item.weight !== undefined &&
          (!Number.isFinite(weight) || weight <= 0)) ||
        (item.quantity !== undefined &&
          (!Number.isInteger(quantity) || quantity <= 0))
      ) {
        return res.status(400).json({
          error: `Invalid weight or quantity for ${materialType}`
        });
      }

      if (item.weight === undefined && item.quantity === undefined) {
        return res.status(400).json({
          error: `Weight or quantity is required for ${materialType}`
        });
      }
    }

    const lotCode = generateLotCode();
    let totalWeight = 0;
    let totalMin = 0;
    let totalMax = 0;

    // Load prices
    const prices = all('SELECT * FROM material_prices');
    const priceMap = {};
    prices.forEach(p => { priceMap[p.material_type] = p; });

    items.forEach(item => {
      const w =
        item.weight !== undefined
          ? Number(item.weight)
          : Number(item.quantity) * 0.3;
      totalWeight += w;
      const price = priceMap[item.type] || priceMap[item.material_type];
      if (price) {
        const condMult = { working: 1.2, good: 1.0, fair: 0.85, damaged: 0.65, non_functional: 0.5 }[item.condition] || 1.0;
        totalMin += price.min_price * w * condMult;
        totalMax += price.max_price * w * condMult;
      }
    });

    run(
      'INSERT INTO lots (lot_code, collector_id, items, total_weight, estimated_value_min, estimated_value_max, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [lotCode, collectorId, JSON.stringify(items), totalWeight, Math.round(totalMin), Math.round(totalMax), 'collected']
    );

    const newLot = get('SELECT * FROM lots WHERE lot_code = ?', [lotCode]);

    // Add traceability event
    if (newLot) {
      run(
        'INSERT INTO traceability_events (lot_id, event_type, description, location, hash) VALUES (?, ?, ?, ?, ?)',
        [newLot.id, 'lot_created', `Lot ${lotCode} created with ${items.length} item type(s)`, 'ECOLOOP Platform', `HASH_${Math.random().toString(36).substr(2, 16).toUpperCase()}`]
      );
    }

    res.status(201).json({
      ...newLot,
      items: JSON.parse(newLot.items || '[]'),
      message: 'Lot created successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update lot status
router.put('/:id/status', authMiddleware, (req, res) => {
  try {
    const { status } = req.body;
    run('UPDATE lots SET status = ?, updated_at = datetime(\'now\') WHERE id = ? OR lot_code = ?',
      [status, req.params.id, req.params.id]);
    const lot = get('SELECT * FROM lots WHERE id = ? OR lot_code = ?', [req.params.id, req.params.id]);
    res.json({ ...lot, items: JSON.parse(lot.items || '[]') });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE lot
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    run('DELETE FROM lots WHERE id = ? OR lot_code = ?', [req.params.id, req.params.id]);
    res.json({ message: 'Lot deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
