/**
 * ECOLOOP Server — Fair Value Utilities
 */

const MATERIAL_PRICES = {
  mobile_phone:    { min: 220, max: 380 },
  laptop:          { min: 180, max: 320 },
  desktop_computer:{ min: 120, max: 220 },
  crt_monitor:     { min: 15,  max: 40  },
  lcd_monitor:     { min: 80,  max: 150 },
  keyboard:        { min: 30,  max: 60  },
  mouse:           { min: 40,  max: 80  },
  printer:         { min: 50,  max: 120 },
  battery_lithium: { min: 60,  max: 140 },
  battery_lead:    { min: 25,  max: 55  },
  cable_wire:      { min: 90,  max: 180 },
  pcb:             { min: 300, max: 600 },
  refrigerator:    { min: 20,  max: 50  },
  television:      { min: 60,  max: 130 },
  washing_machine: { min: 25,  max: 60  },
  charger_adapter: { min: 80,  max: 160 },
  router_modem:    { min: 100, max: 200 },
  tablet:          { min: 200, max: 350 },
  ups:             { min: 30,  max: 80  },
};

const CONDITION_MULTIPLIERS = {
  working: 1.2, good: 1.0, fair: 0.85, damaged: 0.65, non_functional: 0.5,
};

/**
 * Calculate fair value for items using DB prices
 */
function calculateFairValue(db, items) {
  let totalMin = 0, totalMax = 0;

  items.forEach(item => {
    const weight = parseFloat(item.weight) || (parseInt(item.quantity || 1) * 0.3);
    const condMult = CONDITION_MULTIPLIERS[item.condition] || 1.0;
    const type = item.type || item.material_type;
    const prices = MATERIAL_PRICES[type] || { min: 50, max: 150 };
    totalMin += prices.min * weight * condMult;
    totalMax += prices.max * weight * condMult;
  });

  return {
    min: Math.round(totalMin),
    max: Math.round(totalMax),
    recommended: Math.round((totalMin + totalMax) / 2),
  };
}

/**
 * Detect price anomaly
 */
function detectAnomaly(offeredPrice, fairValueRecommended) {
  const pct = (offeredPrice / fairValueRecommended) * 100;
  if (pct >= 90) return { isAnomaly: false, severity: 'fair', percentage: Math.round(pct) };
  if (pct >= 75) return { isAnomaly: true, severity: 'slightly_low', percentage: Math.round(pct) };
  return { isAnomaly: true, severity: 'abnormal', percentage: Math.round(pct) };
}

let _lotCounter = 125;
/** Generate unique lot code: EW-CHN-YYYY-NNNNN */
function generateLotCode() {
  const year = new Date().getFullYear();
  const num = String(++_lotCounter).padStart(5, '0');
  return `EW-CHN-${year}-${num}`;
}

let _txCounter = 1928;
/** Generate unique transaction code: TXN-YYYY-NNNNNN */
function generateTxCode() {
  const year = new Date().getFullYear();
  const num = String(++_txCounter).padStart(6, '0');
  return `TXN-${year}-${num}`;
}

/** Simple hash for traceability */
function generateHash(data) {
  const str = JSON.stringify(data) + Date.now();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return 'HASH_' + Math.abs(hash).toString(16).toUpperCase().padStart(16, '0');
}

module.exports = { calculateFairValue, detectAnomaly, generateLotCode, generateTxCode, generateHash };
