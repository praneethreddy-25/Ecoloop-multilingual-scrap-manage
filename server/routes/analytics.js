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
    const collector = get(
      'SELECT * FROM collectors WHERE id = ? OR collector_code = ?',
      [req.params.id, req.params.id]
    );

    if (!collector) {
      return res.status(404).json({ error: 'Collector not found' });
    }

    const collectorId = collector.id;

    const lots = all(
      'SELECT * FROM lots WHERE collector_id = ?',
      [collectorId]
    );

    const transactions = all(
      'SELECT * FROM transactions WHERE collector_id = ?',
      [collectorId]
    );

    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const daysSinceMonday = day === 0 ? 6 : day - 1;
    startOfWeek.setDate(startOfWeek.getDate() - daysSinceMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const getDate = item =>
      new Date(item.created_at || item.createdAt);

    const getWeight = lot =>
      Number(lot.total_weight || lot.weight || 0);

    const getEarnings = transaction =>
      Number(
        transaction.final_price ||
        transaction.finalPrice ||
        transaction.amount ||
        0
      );

    const todayLots = lots.filter(
      lot => getDate(lot) >= startOfToday
    );

    const weekLots = lots.filter(
      lot => getDate(lot) >= startOfWeek
    );

    const monthLots = lots.filter(
      lot => getDate(lot) >= startOfMonth
    );

    const todayTransactions = transactions.filter(
      transaction => getDate(transaction) >= startOfToday
    );

    const weekTransactions = transactions.filter(
      transaction => getDate(transaction) >= startOfWeek
    );

    const monthTransactions = transactions.filter(
      transaction => getDate(transaction) >= startOfMonth
    );

    const sumWeight = list =>
      list.reduce((sum, item) => sum + getWeight(item), 0);

    const sumEarnings = list =>
      list.reduce((sum, item) => sum + getEarnings(item), 0);

    // Weekly chart data
    const weeklyData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      .map((dayName, index) => {
        const dayDate = new Date(startOfWeek);
        dayDate.setDate(startOfWeek.getDate() + index);

        const nextDay = new Date(dayDate);
        nextDay.setDate(dayDate.getDate() + 1);

        const dayLots = lots.filter(lot => {
          const date = getDate(lot);
          return date >= dayDate && date < nextDay;
        });

        const dayTransactions = transactions.filter(transaction => {
          const date = getDate(transaction);
          return date >= dayDate && date < nextDay;
        });

        return {
          day: dayName,
          earnings: Math.round(sumEarnings(dayTransactions)),
          weight: Math.round(sumWeight(dayLots) * 10) / 10,
        };
      });

    // Material breakdown
    const materialBreakdownMap = {};

    monthLots.forEach(lot => {
      const items = JSON.parse(lot.items || '[]');

      items.forEach(item => {
        const name =
          item.type ||
          item.material_type ||
          item.name ||
          'Unknown';

        materialBreakdownMap[name] =
          (materialBreakdownMap[name] || 0) +
          Number(item.weight || 0);
      });
    });

    const materialBreakdown = Object.entries(
      materialBreakdownMap
    ).map(([name, value]) => ({
      name,
      value: Math.round(value * 10) / 10,
    }));

    const monthWeight = sumWeight(monthLots);

    res.json({
      collector,

      today: {
        earnings: Math.round(sumEarnings(todayTransactions)),
        weight: Math.round(sumWeight(todayLots) * 10) / 10,
        transactions: todayTransactions.length,
      },

      week: {
        earnings: Math.round(sumEarnings(weekTransactions)),
        weight: Math.round(sumWeight(weekLots) * 10) / 10,
        transactions: weekTransactions.length,
      },

      month: {
        earnings: Math.round(sumEarnings(monthTransactions)),
        weight: Math.round(monthWeight * 10) / 10,
        transactions: monthTransactions.length,
      },

      weeklyData,

      materialBreakdown,

      impact: {
        ewasteKg: Math.round(monthWeight * 10) / 10,
        co2Kg: Math.round(monthWeight * 1.66 * 10) / 10,
        batteriesHandled: monthLots.reduce((count, lot) => {
          const items = JSON.parse(lot.items || '[]');

          return (
            count +
            items
              .filter(item =>
                String(
                  item.type ||
                  item.material_type ||
                  item.name ||
                  ''
                ).toLowerCase().includes('battery')
              )
              .reduce(
                (sum, item) =>
                  sum + Number(item.quantity || 1),
                0
              )
          );
        }, 0),
        materialsRecovered: Object.keys(materialBreakdownMap),
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
