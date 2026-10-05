import React from 'react';
import useStore from '../store/useStore';
import { CloudOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OfflineBanner() {
  const { isOnline } = useStore();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-accent text-white py-2 px-4 flex items-center justify-center gap-2 text-sm font-medium"
        >
          <CloudOff className="w-4 h-4" />
          You are offline. Data is saved locally and will sync when connected.
        </motion.div>
      )}
    </AnimatePresence>
  );
}
