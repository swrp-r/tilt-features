import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import type { RiskDistribution as RiskData } from '@/hooks/use-gap-analysis';
import { formatNumber } from '@/lib/utils';

interface RiskDistributionProps {
  data: RiskData[];
}

export function RiskDistribution({ data }: RiskDistributionProps) {
  return (
    <div className="bg-surface-raised rounded-xl border border-surface-overlay overflow-hidden">
      <div className="px-4 py-3 border-b border-surface-overlay flex items-center gap-2">
        <Shield className="w-4 h-4 text-ink-faint" />
        <h3 className="font-display text-sm font-medium text-ink">
          Manipulation Risk Distribution
        </h3>
      </div>

      <div className="p-4">
        {/* Stacked bar */}
        <div className="h-8 rounded-lg overflow-hidden flex mb-4">
          {data.map((item, idx) => (
            <motion.div
              key={item.level}
              className="h-full flex items-center justify-center"
              style={{ backgroundColor: item.color }}
              initial={{ width: 0 }}
              animate={{ width: `${item.percentage}%` }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              {item.percentage >= 10 && (
                <span className="text-xs font-medium text-white/90">
                  {item.percentage}%
                </span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Legend */}
        <div className="space-y-2">
          {data.map((item) => (
            <div key={item.level} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-ink">{item.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-ink-muted">
                  {formatNumber(item.count)}
                </span>
                <span className="text-xs text-ink-faint w-10 text-right">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-surface-overlay">
          <p className="text-xs text-ink-faint">
            Low-manipulation features (Bureau, Cash Flow) are harder for borrowers to game.
            High-manipulation features (self-reported) should be weighted accordingly.
          </p>
        </div>
      </div>
    </div>
  );
}
