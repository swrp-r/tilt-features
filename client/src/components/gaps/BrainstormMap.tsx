import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, MinusCircle } from 'lucide-react';
import type { BrainstormSectionResult } from '@/hooks/use-gap-analysis';
import { formatNumber } from '@/lib/utils';

interface BrainstormMapProps {
  sections: BrainstormSectionResult[];
}

export function BrainstormMap({ sections }: BrainstormMapProps) {
  const getStatus = (current: number, planned: number | null) => {
    if (planned === null) return 'neutral';
    const ratio = current / planned;
    if (ratio >= 1) return 'good';
    if (ratio >= 0.5) return 'partial';
    return 'gap';
  };

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'partial':
        return <MinusCircle className="w-4 h-4 text-amber-500" />;
      case 'gap':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <MinusCircle className="w-4 h-4 text-ink-faint" />;
    }
  };

  return (
    <div className="bg-surface-raised rounded-xl border border-surface-overlay overflow-hidden">
      <div className="px-4 py-3 border-b border-surface-overlay">
        <h3 className="font-display text-sm font-medium text-ink">
          Brainstorm Framework Mapping
        </h3>
        <p className="text-xs text-ink-faint mt-1">
          Current features vs. planned targets
        </p>
      </div>

      <div className="p-4 space-y-6">
        {sections.map((section, sectionIdx) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIdx * 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-ink">{section.label}</h4>
              <span className="text-xs font-mono text-ink-muted">
                {formatNumber(section.total)} features
              </span>
            </div>

            <div className="space-y-2">
              {section.categories.map((cat) => {
                const status = getStatus(cat.current, cat.planned);
                const percentage = cat.planned
                  ? Math.min(100, Math.round((cat.current / cat.planned) * 100))
                  : null;

                return (
                  <div key={cat.id} className="group">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusIcon status={status} />
                      <span className="text-sm text-ink flex-1">{cat.label}</span>
                      <span className="text-xs font-mono text-ink-muted">
                        {formatNumber(cat.current)}
                        {cat.planned && (
                          <span className="text-ink-faint"> / {cat.planned}</span>
                        )}
                      </span>
                    </div>

                    {cat.planned && (
                      <div className="ml-6 h-1.5 bg-surface-overlay rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${
                            status === 'good'
                              ? 'bg-green-500'
                              : status === 'partial'
                              ? 'bg-amber-500'
                              : 'bg-red-400'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: sectionIdx * 0.1 }}
                        />
                      </div>
                    )}

                    {/* Geo breakdown on hover */}
                    <div className="ml-6 mt-1 hidden group-hover:flex gap-2 text-xs text-ink-faint">
                      {Object.entries(cat.byGeo)
                        .filter(([_, count]) => count > 0)
                        .map(([geo, count]) => (
                          <span key={geo}>
                            {geo}: {count}
                          </span>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="px-4 py-2 border-t border-surface-overlay flex items-center gap-4 text-xs text-ink-faint">
        <span className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3 text-green-500" /> At target
        </span>
        <span className="flex items-center gap-1">
          <MinusCircle className="w-3 h-3 text-amber-500" /> Partial
        </span>
        <span className="flex items-center gap-1">
          <AlertCircle className="w-3 h-3 text-red-400" /> Below 50%
        </span>
      </div>
    </div>
  );
}
