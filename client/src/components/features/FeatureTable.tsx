import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Feature } from '@/types/feature';

interface FeatureTableProps {
  features: Feature[];
  isLoading: boolean;
  onSelectFeature: (feature: Feature) => void;
  selectedFeature: Feature | null;
}

type SortKey = keyof Feature;
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 50;

const COLUMNS: { key: SortKey; label: string; width: string }[] = [
  { key: 'geo', label: 'Geo', width: 'w-14' },
  { key: 'product_business', label: 'Product', width: 'w-24' },
  { key: 'model_name', label: 'Model', width: 'w-24' },
  { key: 'user_type', label: 'User', width: 'w-16' },
  { key: 'feature_name', label: 'Feature Name', width: 'w-48' },
  { key: 'primary_category', label: 'Category', width: 'w-32' },
  { key: 'feature_type', label: 'Type', width: 'w-32' },
  { key: 'feature_subtype', label: 'Subtype', width: 'w-32' },
  { key: 'feature_l3', label: 'L3', width: 'w-24' },
  { key: 'top_20_50', label: 'Top', width: 'w-14' },
  { key: 'shap_rank', label: 'SHAP', width: 'w-12' },
];

export function FeatureTable({
  features,
  isLoading,
  onSelectFeature,
  selectedFeature,
}: FeatureTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('feature_name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(0);

  const sortedFeatures = useMemo(() => {
    return [...features].sort((a, b) => {
      const aVal = a[sortKey] ?? '';
      const bVal = b[sortKey] ?? '';
      const aStr = String(aVal);
      const bStr = String(bVal);
      const cmp = aStr.localeCompare(bStr, undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [features, sortKey, sortDir]);

  const totalPages = Math.ceil(sortedFeatures.length / PAGE_SIZE);
  const paginatedFeatures = sortedFeatures.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  useMemo(() => setPage(0), [features.length]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
        Loading features...
      </div>
    );
  }

  if (features.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
        No features found. Adjust filters.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={cn(
                    'px-2 py-2 text-left font-medium text-gray-600 cursor-pointer hover:bg-gray-100 select-none',
                    col.width
                  )}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && (
                      sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedFeatures.map((feature) => {
              const isSelected = selectedFeature?.id === feature.id;
              return (
                <tr
                  key={feature.id}
                  onClick={() => onSelectFeature(feature)}
                  className={cn(
                    'border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors',
                    isSelected && 'bg-blue-100'
                  )}
                >
                  <td className="px-2 py-1.5">
                    <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700 font-medium">
                      {feature.geo}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-gray-600 truncate max-w-24">{feature.product_business || '-'}</td>
                  <td className="px-2 py-1.5 text-gray-600 truncate max-w-24">{feature.model_name || '-'}</td>
                  <td className="px-2 py-1.5 text-gray-600 truncate">{feature.user_type || '-'}</td>
                  <td className="px-2 py-1.5 font-mono text-gray-900 truncate max-w-48" title={feature.feature_name}>
                    {feature.feature_name}
                  </td>
                  <td className="px-2 py-1.5">
                    <span className={cn(
                      'px-1.5 py-0.5 rounded text-xs whitespace-nowrap',
                      feature.primary_category === 'Cash Flow' && 'bg-emerald-100 text-emerald-700',
                      feature.primary_category === 'Device Data' && 'bg-violet-100 text-violet-700',
                      feature.primary_category === 'Loan Activity' && 'bg-pink-100 text-pink-700',
                      feature.primary_category === 'Bureau' && 'bg-amber-100 text-amber-700',
                      feature.primary_category === 'User-Reported Data' && 'bg-orange-100 text-orange-700',
                      feature.primary_category === 'Platform Data' && 'bg-cyan-100 text-cyan-700',
                    )}>
                      {feature.primary_category || '-'}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-gray-600 truncate max-w-28">{feature.feature_type || '-'}</td>
                  <td className="px-2 py-1.5 text-gray-500 truncate max-w-28">{feature.feature_subtype || '-'}</td>
                  <td className="px-2 py-1.5 text-gray-400 truncate max-w-24">{feature.feature_l3 || '-'}</td>
                  <td className="px-2 py-1.5 text-center">
                    {feature.top_20_50 && (
                      <span className="px-1 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                        {feature.top_20_50}
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-1.5 text-gray-500 text-center font-mono">
                    {feature.shap_rank || '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-3 py-2 border-t border-gray-200 flex items-center justify-between bg-gray-50 text-xs">
        <span className="text-gray-600">
          {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, features.length)} of {features.length}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(0)}
            disabled={page === 0}
            className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
            <ChevronLeft className="w-4 h-4 -ml-2" />
          </button>
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
            className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 text-gray-600">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages - 1}
            className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPage(totalPages - 1)}
            disabled={page >= totalPages - 1}
            className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
            <ChevronRight className="w-4 h-4 -ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}
