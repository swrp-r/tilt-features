import { Search, X, Filter, RotateCcw } from 'lucide-react';
import { FilterDropdown } from './FilterDropdown';
import { FilterBadge } from './FilterBadge';
import type { FilterState, FilterKey } from '@/types/feature';
import { FILTER_KEYS, FILTER_LABELS } from '@/types/feature';

interface FilterBarProps {
  filters: FilterState;
  filterOptions: Record<FilterKey, string[]>;
  toggleFilter: (key: FilterKey, value: string) => void;
  setSearch: (search: string) => void;
  clearFilter: (key: FilterKey) => void;
  clearAllFilters: () => void;
  activeFilterCount: number;
}

export function FilterBar({
  filters,
  filterOptions,
  toggleFilter,
  setSearch,
  clearFilter,
  clearAllFilters,
  activeFilterCount,
}: FilterBarProps) {
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="border-b border-gray-200 bg-white">
      {/* Filter Dropdowns */}
      <div className="px-4 py-2 flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-gray-500">
          <Filter className="w-4 h-4" />
          <span className="text-xs font-medium">Filters</span>
        </div>

        <div className="h-4 w-px bg-gray-200" />

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-40 pl-7 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-md text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          {filters.search && (
            <button onClick={() => setSearch('')} className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-200 rounded">
              <X className="w-3 h-3 text-gray-400" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        {FILTER_KEYS.map((key) => (
          <FilterDropdown
            key={key}
            label={FILTER_LABELS[key]}
            options={filterOptions[key]}
            selected={filters[key]}
            onToggle={(value) => toggleFilter(key, value)}
            onClear={() => clearFilter(key)}
          />
        ))}

        {/* Clear All */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Clear ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="px-4 pb-2 flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-gray-400">Active:</span>
          {FILTER_KEYS.map((key) =>
            filters[key].map((value) => (
              <FilterBadge
                key={`${key}-${value}`}
                label={value}
                filterKey={key}
                onRemove={() => toggleFilter(key, value)}
              />
            ))
          )}
          {filters.search && (
            <FilterBadge
              label={`"${filters.search}"`}
              filterKey="search"
              onRemove={() => setSearch('')}
            />
          )}
        </div>
      )}
    </div>
  );
}
