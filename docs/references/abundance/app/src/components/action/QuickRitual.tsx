import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../shared/Card';

export const QuickRitual = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div>
          <h3 className="text-sm font-semibold text-warrior-gold">Before Sending</h3>
          <p className="text-xs text-warrior-muted">Quick ritual to align your energy</p>
        </div>
        {isExpanded ? (
          <ChevronUp size={20} className="text-warrior-muted" />
        ) : (
          <ChevronDown size={20} className="text-warrior-muted" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-3 border-t border-warrior-subtle mt-4">
              <div className="flex items-start gap-3">
                <span className="text-warrior-gold font-bold">1.</span>
                <span className="text-sm text-warrior-white">Close eyes, take 5 breaths</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-warrior-gold font-bold">2.</span>
                <span className="text-sm text-warrior-white">Feel yourself as already successful</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-warrior-gold font-bold">3.</span>
                <span className="text-sm text-warrior-white">Connect to gratitude for what's coming</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-warrior-gold font-bold">4.</span>
                <span className="text-sm text-warrior-white">Send from worthiness, not desperation</span>
              </div>
              <p className="text-xs text-warrior-muted italic pt-2">
                "I'm offering something valuable. I'm curious what happens."
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
