const express = require('express');
const router = express.Router();
const { get, all } = require('../db/setup');

// GET municipality analytics
router.get('/municipality', (req, res) => {
  try {
    const lots = all('SELECT * FROM lots');
    const transactions = all('SELECT * FROM transactions');
    const collectors = all('SELECT * FROM collectors');
    const recyclers = all('SELECT * FROM recyclers');

    const totalWeight = lots.reduce((sum, l) => sum + (l.total_weight || 0), 0);
    const totalEarnings = transactions.reduce((sum, t) => sum + (t.final_price || 0), 0);
    const completedLots = lots.filter(l => l.status === 'payment_done' || l.status === 'recycling_confirmed');

    // Material breakdown
    const materialBreakdown = {};
    lots.forEach(l => {
      const items = JSON.parse(l.items || '[]');
      items.forEach(item => {
        const type = item.type || item.material_type || 'unknown';
        materialBreakdown[type] = (materialBreakdown[type] || 0) + (item.weight || 0.3);
      });
    });

    // Monthly trend calculated from real database records
    const monthlyMap = {};

    lots.forEach(lot => {
      const dateValue = lot.created_at || lot.createdAt;
      if (!dateValue) return;

      const date = new Date(dateValue);
      if (Number.isNaN(date.getTime())) return;

      const monthKey = date.toISOString().slice(0, 7);
      const monthName = date.toLocaleString('en-US', { month: 'short' });

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          month: monthName,
          weight: 0,
          earnings: 0,
          lots: 0,
        };
      }

      monthlyMap[monthKey].weight += Number(lot.total_weight || 0);
      monthlyMap[monthKey].lots += 1;
    });

    transactions.forEach(transaction => {
      const dateValue = transaction.created_at || transaction.createdAt;
      if (!dateValue) return;

      const date = new Date(dateValue);
      if (Number.isNaN(date.getTime())) return;

      const monthKey = date.toISOString().slice(0, 7);

      if (monthlyMap[monthKey]) {
        monthlyMap[monthKey].earnings += Number(transaction.final_price || 0);
      }
    });

    const monthlyTrend = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([, data]) => ({
        month: data.month,
        weight: Math.round(data.weight),
        earnings: Math.round(data.earnings),
        lots: data.lots,
      }));

    res.json({
      summary: {
        totalWeightKg: Math.round(totalWeight),
        formalRecyclingKg: Math.round(
          completedLots.reduce(
            (sum, lot) => sum + Number(lot.total_weight || 0),
            0
          )
        ),
        activeCollectors: collectors.length,
        verifiedRecyclers: recyclers.length,
        totalTransactions: transactions.length,
        totalEarningsINR: Math.round(totalEarnings),
      },
      materialBreakdown: Object.entries(materialBreakdown).map(([name, weight]) => ({ name, weight: Math.round(weight) })),
      monthlyTrend,
      topCollectors: collectors.slice(0, 5).map(c => ({
        id: c.id,
        code: c.collector_code,
        rating: c.rating,
        score: c.score,
        badge: c.badge_level,
      })),
      zoneData: [
        { zone: 'North Chennai', weight: 4200, color: '#ef4444' },
        { zone: 'South Chennai', weight: 3100, color: '#f59e0b' },
        { zone: 'West Chennai', weight: 2800, color: '#22c55e' },
        { zone: 'East Chennai', weight: 5600, color: '#ef4444' },
        { zone: 'Central', weight: 2700, color: '#22c55e' },
      ],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET collector personal analytics
router.get('/collector/:id', (req, res) => {
  try {
    const collector = get('SELECT * FROM collectors WHERE id = ? OR collector_code = ?', [req.params.id, req.params.id]);

    const weeklyData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
      day,
      earnings: Math.round(800 + Math.random() * 2000),
      weight: Math.round(3 + Math.random() * 15),
    }));

    res.json({
      collector,
      today: { earnings: 2200, weight: 8.4, transactions: 2 },
      week: { earnings: 13250, weight: 48.7, transactions: 7 },
      month: { earnings: 27650, weight: 198.2, transactions: 24 },
      weeklyData,
      materialBreakdown: [
        { name: 'Mobile Phones', value: 5200 },
        { name: 'Laptops', value: 9850 },
        { name: 'PCBs', value: 8400 },
        { name: 'Cables', value: 4200 },
      ],
      impact: {
        ewasteKg: 248,
        co2Kg: 412,
        batteriesHandled: 32,
        materialsRecovered: ['Copper', 'Aluminium', 'Gold traces', 'Plastics', 'Steel'],
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET platform-wide environmental impact
router.get('/impact', (req, res) => {
  try {
    res.json({
      ewasteKgDiverted: 124000,
      co2KgAvoided: 206000,
      batteriesSafelyHandled: 8420,
      materialsRecovered: { copper: 12400, aluminium: 8900, gold: 0.8, silver: 4.2, plastics: 22000 },
      activeCollectors: 428,
      verifiedRecyclers: 37,
      citiesCovered: 12,
      transactionsCompleted: 5840,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
