const express = require('express');
const router = express.Router();
const { get, all, run } = require('../db/setup');

// GET all material prices
router.get('/', (req, res) => {
  try {
    const prices = all('SELECT * FROM material_prices ORDER BY category, material_type');
    res.json(prices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET specific material price
router.get('/:materialType', (req, res) => {
  try {
    const price = get('SELECT * FROM material_prices WHERE material_type = ?', [req.params.materialType]);
    if (!price) return res.status(404).json({ error: 'Material not found' });
    res.json(price);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET persistent price history
router.get('/history/:materialType', (req, res) => {
  try {
    const materialType = req.params.materialType;

    const price = get(
      'SELECT * FROM material_prices WHERE material_type = ?',
      [materialType]
    );

    if (!price) {
      return res.status(404).json({ error: 'Material not found' });
    }

    const today = new Date().toISOString().split('T')[0];

    // Record today's current price if it does not already exist
    run(
      `INSERT OR IGNORE INTO material_price_history
       (material_type, recorded_date, min_price, max_price, avg_price)
       VALUES (?, ?, ?, ?, ?)`,
      [
        materialType,
        today,
        price.min_price,
        price.max_price,
        (price.min_price + price.max_price) / 2,
      ]
    );

    const history = all(
      `SELECT
         recorded_date AS date,
         min_price,
         max_price,
         avg_price
       FROM material_price_history
       WHERE material_type = ?
       ORDER BY recorded_date DESC
       LIMIT 30`,
      [materialType]
    ).reverse();

    res.json({
      material_type: materialType,
      history,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST estimate lot value
router.post('/estimate', (req, res) => {
  try {
    const { items = [] } = req.body;
    const prices = all('SELECT * FROM material_prices');
    const priceMap = {};
    prices.forEach(p => { priceMap[p.material_type] = p; });

    const condMults = { working: 1.2, good: 1.0, fair: 0.85, damaged: 0.65, non_functional: 0.5 };

    let totalMin = 0, totalMax = 0, totalWeight = 0;
    const breakdown = items.map(item => {
      const weight = parseFloat(item.weight) || (parseInt(item.quantity || 1) * 0.3);
      totalWeight += weight;
      const price = priceMap[item.type || item.material_type];
      if (!price) return { ...item, weight, min: 0, max: 0 };
      const mult = condMults[item.condition] || 1.0;
      const min = Math.round(price.min_price * weight * mult);
      const max = Math.round(price.max_price * weight * mult);
      totalMin += min;
      totalMax += max;
      return { ...item, weight, min, max, pricePerKg: `₹${price.min_price}–₹${price.max_price}` };
    });

    res.json({
      totalWeight,
      estimatedMin: totalMin,
      estimatedMax: totalMax,
      recommended: Math.round((totalMin + totalMax) / 2),
      breakdown,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
