import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { KNOWN_GAPS } from '@/data/brainstorm-mapping';
import { formatNumber } from '@/lib/utils';

interface CriticalGapsProps {
  onGapClick?: (geo: string, category: string) => void;
}

export function CriticalGaps({ onGapClick }: CriticalGapsProps) {
  return (
    <div className="bg-surface-raised rounded-xl border border-surface-overlay overflow-hidden">
      <div className="px-4 py-3 border-b border-surface-overlay flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-500" />
        <h3 className="font-display text-sm font-medium text-ink">Coverage Gaps</h3>
      </div>

      <div className="p-4 space-y-3">
        {KNOWN_GAPS.map((gap, idx) => (
          <motion.button
            key={gap.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => gap.geo !== 'All' && onGapClick?.(gap.geo, gap.category)}
            className="w-full flex items-center gap-3 p-3 bg-surface-overlay/50 hover:bg-surface-overlay rounded-lg transition-colors text-left group"
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono text-sm font-bold ${
                gap.current === 0
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              {formatNumber(gap.current)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-ink">{gap.category}</span>
                <span className="text-xs px-1.5 py-0.5 bg-surface rounded text-ink-muted">
                  {gap.geo}
                </span>
              </div>
              <p className="text-xs text-ink-faint mt-0.5 truncate">{gap.description}</p>
            </div>

            {gap.geo !== 'All' && (
              <ArrowRight className="w-4 h-4 text-ink-faint opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
