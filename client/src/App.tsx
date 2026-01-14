import { useState, useCallback } from 'react';
import { LayoutGrid, BarChart3, List, BookOpen } from 'lucide-react';
import { useFeatures, useFilterOptions } from '@/hooks/use-features';
import { useFilters } from '@/hooks/use-filters';
import { useTaxonomy } from '@/hooks/use-taxonomy';
import { Header } from '@/components/Header';
import { FilterBar } from '@/components/filters/FilterBar';
import { FeatureTable } from '@/components/features/FeatureTable';
import { TaxonomySidebar } from '@/components/taxonomy/TaxonomySidebar';
import { FeatureDetail } from '@/components/features/FeatureDetail';
import { GapDashboard } from '@/components/gaps/GapDashboard';
import { SummaryView } from '@/components/summary/SummaryView';
import { CreditDefinitions } from '@/components/definitions/CreditDefinitions';
import type { Feature, FilterKey } from '@/types/feature';
import { cn } from '@/lib/utils';

type Tab = 'explorer' | 'gaps' | 'summary' | 'definitions';

export default function App() {
  const { data: features, isLoading, error } = useFeatures();
  const filterOptions = useFilterOptions(features);
  const {
    filters,
    filteredFeatures,
    toggleFilter,
    setSearch,
    setShapRankMax,
    clearFilter,
    clearAllFilters,
    activeFilterCount,
  } = useFilters(features);
  // Use all features for sidebar options (so they don't disappear when filtering)
  const taxonomy = useTaxonomy(features);

  const [activeTab, setActiveTab] = useState<Tab>('summary');
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleFilterToExplorer = useCallback(
    (key: FilterKey, value: string) => {
      if (activeTab !== 'explorer') {
        clearAllFilters();
      }
      toggleFilter(key, value);
      setActiveTab('explorer');
    },
    [activeTab, toggleFilter, clearAllFilters]
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl text-gray-900 mb-2">Failed to load features</h1>
          <p className="text-gray-500">{error.message}</p>
        </div>
      </div>
    );
  }

  const showFilters = activeTab !== 'definitions';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        totalFeatures={features?.length || 0}
        filteredCount={filteredFeatures.length}
        isLoading={isLoading}
      />

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-white">
        <div className="px-4 flex items-center gap-1">
          <TabButton active={activeTab === 'summary'} onClick={() => setActiveTab('summary')} icon={List} label="Summary" />
          <TabButton active={activeTab === 'gaps'} onClick={() => setActiveTab('gaps')} icon={BarChart3} label="Gap Analysis" />
          <TabButton active={activeTab === 'explorer'} onClick={() => setActiveTab('explorer')} icon={LayoutGrid} label="Explorer" />
          <TabButton active={activeTab === 'definitions'} onClick={() => setActiveTab('definitions')} icon={BookOpen} label="Definitions" />
        </div>
      </div>

      {/* Filter Bar - shown on data tabs only */}
      {showFilters && (
        <FilterBar
          filters={filters}
          filterOptions={filterOptions}
          toggleFilter={toggleFilter}
          setSearch={setSearch}
          clearFilter={clearFilter}
          clearAllFilters={clearAllFilters}
          activeFilterCount={activeFilterCount}
        />
      )}

      {activeTab === 'explorer' && (
        <div className="flex">
          <TaxonomySidebar
            taxonomy={taxonomy}
            filters={filters}
            toggleFilter={toggleFilter}
            setShapRankMax={setShapRankMax}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          <main className="flex-1 p-4">
            <FeatureTable
              features={filteredFeatures}
              isLoading={isLoading}
              onSelectFeature={setSelectedFeature}
              selectedFeature={selectedFeature}
            />
          </main>
        </div>
      )}

      {activeTab === 'gaps' && (
        <div className="flex">
          <TaxonomySidebar
            taxonomy={taxonomy}
            filters={filters}
            toggleFilter={toggleFilter}
            setShapRankMax={setShapRankMax}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          <main className="flex-1 overflow-auto">
            <GapDashboard
              features={filteredFeatures}
              onFilterToExplorer={handleFilterToExplorer}
            />
          </main>
        </div>
      )}

      {activeTab === 'summary' && (
        <div className="flex">
          <TaxonomySidebar
            taxonomy={taxonomy}
            filters={filters}
            toggleFilter={toggleFilter}
            setShapRankMax={setShapRankMax}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          <main className="flex-1 overflow-auto">
            <SummaryView features={features || []} />
          </main>
        </div>
      )}

      {activeTab === 'definitions' && (
        <main className="overflow-auto">
          <CreditDefinitions />
        </main>
      )}

      {/* Feature Detail Drawer */}
      {selectedFeature && (
        <FeatureDetail
          feature={selectedFeature}
          onClose={() => setSelectedFeature(null)}
        />
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors',
        active ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
