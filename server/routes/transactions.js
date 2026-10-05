const express = require('express');
const router = express.Router();
const { get, all, run } = require('../db/setup');
const { generateTxCode } = require('../utils/fairValue');

// GET all transactions
router.get('/', (req, res) => {
  try {
    const transactions = all('SELECT * FROM transactions ORDER BY created_at DESC');
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single transaction + receipt data
router.get('/:id', (req, res) => {
  try {
    const tx = get('SELECT * FROM transactions WHERE id = ? OR tx_code = ?', [req.params.id, req.params.id]);
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });
    
    const lot = get('SELECT * FROM lots WHERE id = ?', [tx.lot_id]);
    const recycler = get('SELECT * FROM recyclers WHERE id = ?', [tx.recycler_id]);

    res.json({
      ...tx,
      lot: lot ? { ...lot, items: JSON.parse(lot.items || '[]') } : null,
      recycler,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create transaction (accept offer)
router.post('/', (req, res) => {
  try {
    const { lotId, recyclerId, offeredPrice, paymentMethod = 'UPI', collectorId = 1 } = req.body;
    
    if (!lotId || !recyclerId || !offeredPrice) {
      return res.status(400).json({ error: 'lotId, recyclerId, offeredPrice are required' });
    }

    const txCode = generateTxCode();
    const lot = get('SELECT * FROM lots WHERE id = ? OR lot_code = ?', [lotId, lotId]);
    if (!lot) return res.status(404).json({ error: 'Lot not found' });

    // Detect anomaly
    const midFair = (lot.estimated_value_min + lot.estimated_value_max) / 2;
    const pct = (offeredPrice / midFair) * 100;
    let anomalySeverity = 'fair';
    if (pct < 75) anomalySeverity = 'abnormal';
    else if (pct < 88) anomalySeverity = 'slightly_low';

    run(
      'INSERT INTO transactions (tx_code, lot_id, collector_id, recycler_id, offered_price, final_price, payment_method, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [txCode, lot.id, collectorId, recyclerId, offeredPrice, offeredPrice, paymentMethod, 'paid']
    );

    // Update lot status
    run("UPDATE lots SET status = 'payment_done', updated_at = datetime('now') WHERE id = ?", [lot.id]);

    // Add traceability events
    const events = [
      ['offer_accepted', `Offer of ₹${offeredPrice} accepted`, 'ECOLOOP Platform'],
      ['handover', 'Material handover scheduled', 'Recycler Facility'],
      ['payment_done', `Payment of ₹${offeredPrice} via ${paymentMethod}`, 'ECOLOOP Platform'],
    ];
    events.forEach(([type, desc, loc]) => {
      run(
        'INSERT INTO traceability_events (lot_id, event_type, description, location, hash) VALUES (?, ?, ?, ?, ?)',
        [lot.id, type, desc, loc, `HASH_${Math.random().toString(36).substr(2,16).toUpperCase()}`]
      );
    });

    const newTx = get('SELECT * FROM transactions WHERE tx_code = ?', [txCode]);
    res.status(201).json({ ...newTx, anomalySeverity, fairValueRange: `₹${lot.estimated_value_min}–₹${lot.estimated_value_max}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update payment status
router.put('/:id', (req, res) => {
  try {
    const { payment_status } = req.body;
    run('UPDATE transactions SET payment_status = ? WHERE id = ? OR tx_code = ?', 
        [payment_status, req.params.id, req.params.id]);
    res.json({ message: 'Payment status updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET receipt data
router.get('/:id/receipt', (req, res) => {
  try {
    const tx = get('SELECT * FROM transactions WHERE id = ? OR tx_code = ?', [req.params.id, req.params.id]);
    if (!tx) return res.status(404).json({ error: 'Not found' });
    const lot = get('SELECT * FROM lots WHERE id = ?', [tx.lot_id]);
    const recycler = get('SELECT * FROM recyclers WHERE id = ?', [tx.recycler_id]);
    res.json({
      transactionId: tx.tx_code,
      lotCode: lot ? lot.lot_code : '',
      material: lot ? JSON.parse(lot.items || '[]').map(i => i.type).join(', ') : '',
      weight: lot ? `${lot.total_weight} kg` : '',
      grossValue: tx.final_price,
      platformFee: 0,
      netEarnings: tx.final_price,
      recyclerName: recycler ? recycler.facility_name : '',
      paymentMethod: tx.payment_method,
      status: tx.payment_status,
      date: tx.created_at,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
