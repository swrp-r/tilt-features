import { motion } from 'framer-motion';
import { CATEGORY_ORDER } from '@/data/brainstorm-mapping';
import type { GeoMatrix } from '@/hooks/use-gap-analysis';
import { formatNumber, getCategoryColor } from '@/lib/utils';

interface GeoHeatmapProps {
  data: GeoMatrix[];
  maxCount: number;
  onCellClick?: (geo: string, category: string) => void;
}

export function GeoHeatmap({ data, maxCount, onCellClick }: GeoHeatmapProps) {
  const getIntensity = (count: number) => {
    if (count === 0) return 0;
    if (maxCount === 0) return 0;
    return Math.min(1, count / maxCount);
  };

  const getCellColor = (category: string, count: number) => {
    const baseColor = getCategoryColor(category);
    const intensity = getIntensity(count);

    if (count === 0) {
      return 'rgba(239, 68, 68, 0.15)'; // Red tint for zero
    }

    // Parse hex to RGB and apply intensity
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${0.15 + intensity * 0.6})`;
  };

  return (
    <div className="bg-surface-raised rounded-xl border border-surface-overlay overflow-hidden">
      <div className="px-4 py-3 border-b border-surface-overlay">
        <h3 className="font-display text-sm font-medium text-ink">
          Geographic Coverage Heatmap
        </h3>
        <p className="text-xs text-ink-faint mt-1">
          Feature count by geography and category
        </p>
      </div>

      <div className="p-4 overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr>
              <th className="text-left text-xs font-medium text-ink-faint uppercase tracking-wider pb-3 pr-4">
                Geo
              </th>
              {CATEGORY_ORDER.map((cat) => (
                <th
                  key={cat}
                  className="text-center text-xs font-medium text-ink-faint uppercase tracking-wider pb-3 px-2"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getCategoryColor(cat) }}
                    />
                    <span className="whitespace-nowrap">
                      {cat.replace(' Data', '').replace('-Reported', '')}
                    </span>
                  </div>
                </th>
              ))}
              <th className="text-center text-xs font-medium text-ink-faint uppercase tracking-wider pb-3 pl-4">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <motion.tr
                key={row.geo}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: rowIdx * 0.05 }}
              >
                <td className="py-2 pr-4">
                  <span className="text-sm font-medium text-ink">{row.geo}</span>
                </td>
                {CATEGORY_ORDER.map((cat) => {
                  const count = row.categories[cat] || 0;
                  return (
                    <td key={cat} className="py-2 px-2">
                      <button
                        onClick={() => onCellClick?.(row.geo, cat)}
                        className="w-full h-10 rounded-md flex items-center justify-center transition-all hover:ring-2 hover:ring-accent/50"
                        style={{ backgroundColor: getCellColor(cat, count) }}
                        title={`${row.geo} - ${cat}: ${count} features`}
                      >
                        <span
                          className={`text-sm font-mono ${
                            count === 0 ? 'text-red-400' : 'text-ink'
                          }`}
                        >
                          {formatNumber(count)}
                        </span>
                      </button>
                    </td>
                  );
                })}
                <td className="py-2 pl-4">
                  <span className="text-sm font-mono text-ink-muted">
                    {formatNumber(row.total)}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-surface-overlay">
              <td className="pt-3 pr-4">
                <span className="text-xs font-medium text-ink-faint">Total</span>
              </td>
              {CATEGORY_ORDER.map((cat) => {
                const total = data.reduce((sum, row) => sum + (row.categories[cat] || 0), 0);
                return (
                  <td key={cat} className="pt-3 px-2 text-center">
                    <span className="text-xs font-mono text-ink-faint">
                      {formatNumber(total)}
                    </span>
                  </td>
                );
              })}
              <td className="pt-3 pl-4 text-center">
                <span className="text-sm font-mono font-medium text-ink">
                  {formatNumber(data.reduce((sum, row) => sum + row.total, 0))}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="px-4 py-2 border-t border-surface-overlay flex items-center gap-4 text-xs text-ink-faint">
        <span>Color intensity = feature density</span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-500/20" />
          Zero features
        </span>
      </div>
    </div>
  );
}
