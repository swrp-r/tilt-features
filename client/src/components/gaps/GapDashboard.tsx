import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import type { Feature, FilterKey } from '@/types/feature';

interface GapDashboardProps {
  features: Feature[] | undefined;
  onFilterToExplorer: (key: FilterKey, value: string) => void;
}

type Dimension = 'geo' | 'model_name' | 'product_business';

const DIMENSION_LABELS: Record<Dimension, string> = {
  geo: 'Geography',
  model_name: 'Model',
  product_business: 'Product',
};

const COLORS: Record<string, string> = {
  'Cash Flow': '#10b981',
  'Device Data': '#8b5cf6',
  'Loan Activity': '#ec4899',
  'Bureau': '#f59e0b',
  'User-Reported Data': '#f97316',
  'Platform Data': '#06b6d4',
};

interface ModelRow {
  geo: string;
  product: string;
  model: string;
  key: string;
}

export function GapDashboard({ features, onFilterToExplorer }: GapDashboardProps) {
  const [rowDimension, setRowDimension] = useState<Dimension>('geo');

  const analysis = useMemo(() => {
    if (!features?.length) return null;

    const categories = [...new Set(features.map(f => f.primary_category).filter(Boolean))].sort();
    const types = [...new Set(features.map(f => f.feature_type).filter(Boolean))].sort();

    // Get values for each dimension
    const getDimensionValues = (dim: Dimension) =>
      [...new Set(features.map(f => f[dim]).filter(Boolean))].sort() as string[];

    const geos = getDimensionValues('geo');
    const models = getDimensionValues('model_name');

    // Build model rows with geo/product context, sorted by geo then product then model
    const modelRows: ModelRow[] = [];
    const seen = new Set<string>();
    for (const f of features) {
      const key = `${f.geo}|${f.product_business}|${f.model_name}`;
      if (!seen.has(key) && f.geo && f.product_business && f.model_name) {
        seen.add(key);
        modelRows.push({
          geo: f.geo,
          product: f.product_business,
          model: f.model_name,
          key,
        });
      }
    }
    modelRows.sort((a, b) => {
      if (a.geo !== b.geo) return a.geo.localeCompare(b.geo);
      if (a.product !== b.product) return a.product.localeCompare(b.product);
      return a.model.localeCompare(b.model);
    });

    // Build matrix for model rows
    const buildModelMatrix = () => {
      const matrix: Record<string, Record<string, number>> = {};
      for (const row of modelRows) {
        matrix[row.key] = {};
        for (const cat of categories) {
          matrix[row.key][cat] = features.filter(
            f => f.geo === row.geo && f.product_business === row.product && f.model_name === row.model && f.primary_category === cat
          ).length;
        }
      }
      const allCounts = Object.values(matrix).flatMap(o => Object.values(o));
      const maxCount = Math.max(...allCounts, 1);
      return { modelRows, matrix, maxCount };
    };

    // Build matrix for current row dimension (geo or product)
    const buildMatrix = (rowDim: Dimension) => {
      const rowValues = getDimensionValues(rowDim);
      const matrix: Record<string, Record<string, number>> = {};

      for (const row of rowValues) {
        matrix[row] = {};
        for (const cat of categories) {
          matrix[row][cat] = features.filter(f => f[rowDim] === row && f.primary_category === cat).length;
        }
      }

      const allCounts = Object.values(matrix).flatMap(o => Object.values(o));
      const maxCount = Math.max(...allCounts);

      return { rowValues, matrix, maxCount };
    };

    return {
      categories,
      types,
      geos,
      models,
      buildMatrix,
      buildModelMatrix,
    };
  }, [features]);

  if (!analysis) {
    return <div className="p-8 text-center text-gray-500">No data</div>;
  }

  const { categories, types, geos, models, buildMatrix, buildModelMatrix } = analysis;
  const isModelView = rowDimension === 'model_name';
  const simpleMatrix = !isModelView ? buildMatrix(rowDimension) : null;
  const modelMatrix = isModelView ? buildModelMatrix() : null;

  const maxCount = isModelView ? modelMatrix!.maxCount : simpleMatrix!.maxCount;

  const getHeatColor = (count: number) => {
    if (count === 0) return 'bg-gray-100 text-gray-400';
    const intensity = count / maxCount;
    if (intensity > 0.7) return 'bg-blue-600 text-white';
    if (intensity > 0.4) return 'bg-blue-400 text-white';
    if (intensity > 0.2) return 'bg-blue-200 text-blue-900';
    return 'bg-blue-100 text-blue-800';
  };

  const handleCellClick = (rowValue: string, category: string) => {
    onFilterToExplorer(rowDimension, rowValue);
    setTimeout(() => onFilterToExplorer('primary_category', category), 0);
  };

  const handleModelCellClick = (row: ModelRow, category: string) => {
    onFilterToExplorer('geo', row.geo);
    setTimeout(() => onFilterToExplorer('product_business', row.product), 0);
    setTimeout(() => onFilterToExplorer('model_name', row.model), 10);
    setTimeout(() => onFilterToExplorer('primary_category', category), 20);
  };

  return (
    <div className="p-4 space-y-4 h-[calc(100vh-140px)] overflow-auto">
      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Total Features" value={features?.length || 0} />
        <StatCard label="Geographies" value={geos.length} />
        <StatCard label="Models" value={models.length} />
        <StatCard label="Categories" value={categories.length} />
      </div>

      {/* Coverage Heatmap */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              {DIMENSION_LABELS[rowDimension]} × Category Coverage
            </h3>
            <p className="text-xs text-gray-500">Click a cell to filter in Explorer</p>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            {(['geo', 'model_name', 'product_business'] as Dimension[]).map((dim) => (
              <button
                key={dim}
                onClick={() => setRowDimension(dim)}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                  rowDimension === dim
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {DIMENSION_LABELS[dim]}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="text-xs">
            <thead>
              <tr>
                {isModelView ? (
                  <>
                    <th className="px-3 py-2 text-left text-gray-600 font-medium sticky left-0 bg-white z-10">Geo</th>
                    <th className="px-3 py-2 text-left text-gray-600 font-medium bg-white">Product</th>
                    <th className="px-3 py-2 text-left text-gray-600 font-medium bg-white">Model</th>
                  </>
                ) : (
                  <th className="px-3 py-2 text-left text-gray-600 font-medium sticky left-0 bg-white">
                    {DIMENSION_LABELS[rowDimension]}
                  </th>
                )}
                {categories.map(cat => (
                  <th key={cat} className="px-3 py-2 text-center text-gray-600 font-medium min-w-20">
                    <div className="flex items-center justify-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[cat] || '#6b7280' }} />
                      <span className="truncate max-w-16" title={cat}>{cat.split(' ')[0]}</span>
                    </div>
                  </th>
                ))}
                <th className="px-3 py-2 text-center text-gray-600 font-medium bg-gray-50">Total</th>
              </tr>
            </thead>
            <tbody>
              {isModelView && modelMatrix ? (
                <>
                  {modelMatrix.modelRows.map((row, idx) => {
                    const rowTotal = Object.values(modelMatrix.matrix[row.key]).reduce((a, b) => a + b, 0);
                    const prevRow = idx > 0 ? modelMatrix.modelRows[idx - 1] : null;
                    const showGeo = !prevRow || prevRow.geo !== row.geo;
                    const showProduct = !prevRow || prevRow.geo !== row.geo || prevRow.product !== row.product;
                    return (
                      <tr key={row.key} className={cn('border-t border-gray-100', showGeo && idx > 0 && 'border-t-2 border-gray-300')}>
                        <td className={cn('px-3 py-2 font-medium text-gray-900 sticky left-0 bg-white z-10', !showGeo && 'text-transparent')}>
                          {row.geo}
                        </td>
                        <td className={cn('px-3 py-2 text-gray-700 bg-white', !showProduct && 'text-transparent')}>
                          {row.product}
                        </td>
                        <td className="px-3 py-2 text-gray-600 bg-white">{row.model}</td>
                        {categories.map(cat => {
                          const count = modelMatrix.matrix[row.key][cat];
                          return (
                            <td
                              key={cat}
                              onClick={() => handleModelCellClick(row, cat)}
                              className={cn(
                                'px-3 py-2 text-center font-mono cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all',
                                getHeatColor(count)
                              )}
                            >
                              {count || '-'}
                            </td>
                          );
                        })}
                        <td className="px-3 py-2 text-center font-mono font-medium text-gray-900 bg-gray-50">{rowTotal}</td>
                      </tr>
                    );
                  })}
                  {/* Column totals */}
                  <tr className="border-t-2 border-gray-300 bg-gray-50">
                    <td colSpan={3} className="px-3 py-2 font-medium text-gray-900 sticky left-0 bg-gray-50">Total</td>
                    {categories.map(cat => {
                      const colTotal = modelMatrix.modelRows.reduce((sum, row) => sum + modelMatrix.matrix[row.key][cat], 0);
                      return (
                        <td key={cat} className="px-3 py-2 text-center font-mono font-medium text-gray-900">{colTotal}</td>
                      );
                    })}
                    <td className="px-3 py-2 text-center font-mono font-bold text-gray-900">{features?.length}</td>
                  </tr>
                </>
              ) : simpleMatrix ? (
                <>
                  {simpleMatrix.rowValues.map(row => {
                    const rowTotal = Object.values(simpleMatrix.matrix[row]).reduce((a, b) => a + b, 0);
                    return (
                      <tr key={row} className="border-t border-gray-100">
                        <td className="px-3 py-2 font-medium text-gray-900 sticky left-0 bg-white">{row}</td>
                        {categories.map(cat => {
                          const count = simpleMatrix.matrix[row][cat];
                          return (
                            <td
                              key={cat}
                              onClick={() => handleCellClick(row, cat)}
                              className={cn(
                                'px-3 py-2 text-center font-mono cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all',
                                getHeatColor(count)
                              )}
                            >
                              {count || '-'}
                            </td>
                          );
                        })}
                        <td className="px-3 py-2 text-center font-mono font-medium text-gray-900 bg-gray-50">{rowTotal}</td>
                      </tr>
                    );
                  })}
                  {/* Column totals */}
                  <tr className="border-t-2 border-gray-300 bg-gray-50">
                    <td className="px-3 py-2 font-medium text-gray-900 sticky left-0 bg-gray-50">Total</td>
                    {categories.map(cat => {
                      const colTotal = simpleMatrix.rowValues.reduce((sum, row) => sum + simpleMatrix.matrix[row][cat], 0);
                      return (
                        <td key={cat} className="px-3 py-2 text-center font-mono font-medium text-gray-900">{colTotal}</td>
                      );
                    })}
                    <td className="px-3 py-2 text-center font-mono font-bold text-gray-900">{features?.length}</td>
                  </tr>
                </>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stacked Composition Comparison */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-900">Category Composition by {DIMENSION_LABELS[rowDimension]}</h3>
          <p className="text-xs text-gray-500">Compare category mix across different {DIMENSION_LABELS[rowDimension].toLowerCase()}s</p>
        </div>
        <div className="p-4 space-y-2">
          {isModelView && modelMatrix ? (
            modelMatrix.modelRows.map(row => {
              const rowTotal = Object.values(modelMatrix.matrix[row.key]).reduce((a, b) => a + b, 0);
              if (rowTotal === 0) return null;
              return (
                <div key={row.key} className="flex items-center gap-3">
                  <div className="w-44 text-xs font-medium text-gray-700 truncate" title={`${row.geo} / ${row.product} / ${row.model}`}>
                    <span className="text-gray-400">{row.geo}</span>
                    <span className="text-gray-300 mx-1">/</span>
                    <span className="text-gray-500">{row.product}</span>
                    <span className="text-gray-300 mx-1">/</span>
                    <span className="text-gray-700">{row.model}</span>
                  </div>
                  <div className="flex-1 h-6 flex rounded overflow-hidden bg-gray-100">
                    {categories.map(cat => {
                      const count = modelMatrix.matrix[row.key][cat];
                      const pct = (count / rowTotal) * 100;
                      if (pct === 0) return null;
                      return (
                        <div
                          key={cat}
                          style={{ width: `${pct}%`, backgroundColor: COLORS[cat] || '#6b7280' }}
                          className="relative group cursor-pointer hover:opacity-80"
                          title={`${cat}: ${count} (${pct.toFixed(1)}%)`}
                          onClick={() => handleModelCellClick(row, cat)}
                        >
                          {pct > 10 && (
                            <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-medium">
                              {pct.toFixed(0)}%
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="w-12 text-xs font-mono text-gray-500 text-right">{rowTotal}</div>
                </div>
              );
            })
          ) : simpleMatrix ? (
            simpleMatrix.rowValues.map(row => {
              const rowTotal = Object.values(simpleMatrix.matrix[row]).reduce((a, b) => a + b, 0);
              if (rowTotal === 0) return null;
              return (
                <div key={row} className="flex items-center gap-3">
                  <div className="w-28 text-xs font-medium text-gray-700 truncate" title={row}>{row}</div>
                  <div className="flex-1 h-6 flex rounded overflow-hidden bg-gray-100">
                    {categories.map(cat => {
                      const count = simpleMatrix.matrix[row][cat];
                      const pct = (count / rowTotal) * 100;
                      if (pct === 0) return null;
                      return (
                        <div
                          key={cat}
                          style={{ width: `${pct}%`, backgroundColor: COLORS[cat] || '#6b7280' }}
                          className="relative group cursor-pointer hover:opacity-80"
                          title={`${cat}: ${count} (${pct.toFixed(1)}%)`}
                          onClick={() => handleCellClick(row, cat)}
                        >
                          {pct > 10 && (
                            <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-medium">
                              {pct.toFixed(0)}%
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="w-12 text-xs font-mono text-gray-500 text-right">{rowTotal}</div>
                </div>
              );
            })
          ) : null}
        </div>
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-3">
            {categories.map(cat => (
              <div key={cat} className="flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[cat] || '#6b7280' }} />
                <span className="text-gray-600">{cat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Breakdown Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => {
          const catFeatures = features?.filter(f => f.primary_category === cat) || [];
          const typeBreakdown = types
            .map(t => ({ type: t, count: catFeatures.filter(f => f.feature_type === t).length }))
            .filter(t => t.count > 0)
            .sort((a, b) => b.count - a.count);
          const color = COLORS[cat] || '#6b7280';

          return (
            <div key={cat} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between" style={{ borderLeftWidth: 3, borderLeftColor: color }}>
                <span className="text-sm font-medium text-gray-900">{cat}</span>
                <span className="text-sm font-mono text-gray-600">{catFeatures.length}</span>
              </div>
              <div className="p-2 max-h-40 overflow-auto">
                {typeBreakdown.slice(0, 8).map(({ type, count }) => (
                  <div key={type} className="flex items-center justify-between py-1 text-xs">
                    <span className="text-gray-600 truncate flex-1" title={type}>{type}</span>
                    <span className="text-gray-500 font-mono ml-2">{count}</span>
                  </div>
                ))}
                {typeBreakdown.length > 8 && (
                  <div className="text-xs text-gray-400 pt-1">+{typeBreakdown.length - 8} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      <div className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
