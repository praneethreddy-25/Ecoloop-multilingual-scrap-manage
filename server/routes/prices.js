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

// GET price history (mock 30-day data)
router.get('/history/:materialType', (req, res) => {
  try {
    const price = get('SELECT * FROM material_prices WHERE material_type = ?', [req.params.materialType]);
    if (!price) return res.status(404).json({ error: 'Material not found' });

    const history = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const variation = 0.9 + Math.random() * 0.2;
      history.push({
        date: date.toISOString().split('T')[0],
        min_price: Math.round(price.min_price * variation),
        max_price: Math.round(price.max_price * variation),
        avg_price: Math.round(((price.min_price + price.max_price) / 2) * variation),
      });
    }
    res.json({ material_type: req.params.materialType, history });
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
