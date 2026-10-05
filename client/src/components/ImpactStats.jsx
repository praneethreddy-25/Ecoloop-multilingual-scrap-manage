import React from 'react';
import { Leaf, Zap, BatteryMedium, Recycle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ImpactStats({ ewasteDiverted = 1250, co2Avoided = 850, batteries = 42 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-green-50 p-4 rounded-xl border border-green-100">
        <Leaf className="w-8 h-8 text-green-600 mb-2" />
        <p className="text-2xl font-black text-green-800">{ewasteDiverted} kg</p>
        <p className="text-xs text-green-600 font-medium">E-Waste Diverted</p>
      </motion.div>
      
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-blue-50 p-4 rounded-xl border border-blue-100">
        <Zap className="w-8 h-8 text-blue-600 mb-2" />
        <p className="text-2xl font-black text-blue-800">{co2Avoided} kg</p>
        <p className="text-xs text-blue-600 font-medium">CO₂ Avoided</p>
      </motion.div>

      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
        <BatteryMedium className="w-8 h-8 text-yellow-600 mb-2" />
        <p className="text-2xl font-black text-yellow-800">{batteries}</p>
        <p className="text-xs text-yellow-600 font-medium">Batteries Saved</p>
      </motion.div>

      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-purple-50 p-4 rounded-xl border border-purple-100">
        <Recycle className="w-8 h-8 text-purple-600 mb-2" />
        <p className="text-2xl font-black text-purple-800">95%</p>
        <p className="text-xs text-purple-600 font-medium">Recovery Rate</p>
      </motion.div>
    </div>
  );
}
