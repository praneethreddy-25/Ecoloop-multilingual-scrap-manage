const express = require('express');
const router = express.Router();
const { get, all, run } = require('../db/setup');

// GET all recyclers
router.get('/', (req, res) => {
  try {
    const { material, city } = req.query;
    let recyclers = all('SELECT * FROM recyclers WHERE status = ?', ['active']);

    if (material) {
      recyclers = recyclers.filter(r => {
        try {
          const mats = JSON.parse(r.materials_accepted || '[]');
          return mats.includes(material);
        } catch { return true; }
      });
    }
    if (city) {
      recyclers = recyclers.filter(r => r.location && r.location.toLowerCase().includes(city.toLowerCase()));
    }

    res.json(recyclers.map(r => ({
      ...r,
      materials_accepted: JSON.parse(r.materials_accepted || '[]')
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single recycler
router.get('/:id', (req, res) => {
  try {
    const recycler = get('SELECT * FROM recyclers WHERE id = ?', [req.params.id]);
    if (!recycler) return res.status(404).json({ error: 'Recycler not found' });
    res.json({ ...recycler, materials_accepted: JSON.parse(recycler.materials_accepted || '[]') });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET matched recyclers for a lot
router.get('/match/:lotId', (req, res) => {
  try {
    const lot = get('SELECT * FROM lots WHERE id = ? OR lot_code = ?', [req.params.lotId, req.params.lotId]);
    if (!lot) return res.status(404).json({ error: 'Lot not found' });

    const items = JSON.parse(lot.items || '[]');
    const materialTypes = items.map(i => i.type || i.material_type).filter(Boolean);

    const recyclers = all('SELECT * FROM recyclers WHERE status = ?', ['active']);
    const priceMap = {};
    all('SELECT * FROM material_prices').forEach(p => { priceMap[p.material_type] = p; });

    const matched = recyclers.map(r => {
      const accepted = JSON.parse(r.materials_accepted || '[]');
      const matchCount = materialTypes.filter(m => accepted.includes(m)).length;
      const matchScore = materialTypes.length ? matchCount / materialTypes.length : 0;

      // Calculate a consistent offer based on recycler rating and material match
      const multiplier = 0.85 + (r.rating / 10);
      const midValue = (lot.estimated_value_min + lot.estimated_value_max) / 2;
      const matchBonus = 1 + (matchScore * 0.1);
      const offerPrice = Math.round(midValue * multiplier * matchBonus);

      const pickupAvailable = r.rating >= 4.5 ? 'Today' : 'Tomorrow';

      return {
        ...r,
        materials_accepted: accepted,
        matchScore,
        offerPrice,
        pickupAvailable,
        isRecommended: false,
      };
    }).filter(r => r.matchScore > 0)
      .sort((a, b) => b.offerPrice - a.offerPrice);

    // Mark best match
    if (matched.length > 0) matched[0].isRecommended = true;

    res.json(matched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST rate a recycler
router.post('/:id/rate', (req, res) => {
  try {
    const { rating } = req.body;
    const recycler = get('SELECT * FROM recyclers WHERE id = ?', [req.params.id]);
    if (!recycler) return res.status(404).json({ error: 'Recycler not found' });
    const newRating = ((recycler.rating + parseFloat(rating)) / 2).toFixed(1);
    run('UPDATE recyclers SET rating = ? WHERE id = ?', [newRating, req.params.id]);
    res.json({ message: 'Rating updated', rating: newRating });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
