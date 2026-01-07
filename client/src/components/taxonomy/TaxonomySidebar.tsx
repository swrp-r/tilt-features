import { useState } from 'react';
import { ChevronRight, ChevronDown, PanelLeftClose, PanelLeft, Layers, MapPin, Package, Database, Check, Star, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaxonomyNode, FilterState, FilterKey } from '@/types/feature';

interface TaxonomySidebarProps {
  taxonomy: {
    byCategory: TaxonomyNode[];
    byGeo: TaxonomyNode[];
    byProduct: TaxonomyNode[];
    byModel: TaxonomyNode[];
    byModelGrouped: TaxonomyNode[];
    byTopRank: TaxonomyNode[];
    shapRange: { min: number; max: number };
  };
  filters: FilterState;
  toggleFilter: (key: FilterKey, value: string) => void;
  setShapRankMax: (value: number | null) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Cash Flow': '#10b981',
  'Device Data': '#8b5cf6',
  'Loan Activity': '#ec4899',
  'Bureau': '#f59e0b',
  'User-Reported Data': '#f97316',
  'Platform Data': '#06b6d4',
};

export function TaxonomySidebar({
  taxonomy,
  filters,
  toggleFilter,
  setShapRankMax,
  collapsed,
  onToggleCollapse,
}: TaxonomySidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleExpand = (name: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(name)) {
      newExpanded.delete(name);
    } else {
      newExpanded.add(name);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <aside
      className={cn(
        'flex-shrink-0 border-r border-gray-200 bg-gray-50 overflow-hidden transition-all duration-200',
        collapsed ? 'w-10' : 'w-52'
      )}
    >
      <div className="p-2 border-b border-gray-200 flex justify-end">
        <button
          onClick={onToggleCollapse}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded"
        >
          {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {!collapsed && (
        <div className="p-2 space-y-3 overflow-y-auto h-[calc(100vh-140px)] text-xs">
          {/* Category Section */}
          <Section icon={Layers} title="Category">
            {taxonomy.byCategory.map((cat) => {
              const color = CATEGORY_COLORS[cat.name] || '#6b7280';
              const isExpanded = expandedCategories.has(cat.name);
              const isActive = filters.primary_category.includes(cat.name);

              return (
                <div key={cat.name}>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleExpand(cat.name)}
                      className="p-0.5 hover:bg-gray-200 rounded"
                    >
                      {cat.children?.length ? (
                        isExpanded ? <ChevronDown className="w-3 h-3 text-gray-400" /> : <ChevronRight className="w-3 h-3 text-gray-400" />
                      ) : <span className="w-3" />}
                    </button>
                    <button
                      onClick={() => toggleFilter('primary_category', cat.name)}
                      className={cn(
                        'flex items-center gap-1.5 flex-1 px-1.5 py-1 rounded text-left hover:bg-gray-200',
                        isActive && 'bg-blue-100'
                      )}
                    >
                      <Checkbox checked={isActive} color={color} />
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      <span className={cn('flex-1 truncate', isActive ? 'text-blue-700' : 'text-gray-700')}>{cat.name}</span>
                      <span className="text-gray-400 font-mono">{cat.count}</span>
                    </button>
                  </div>

                  {isExpanded && cat.children && (
                    <div className="ml-5 pl-2 border-l border-gray-200 mt-0.5">
                      {cat.children.map((type) => (
                        <CheckboxItem
                          key={type.name}
                          name={type.name}
                          count={type.count}
                          isActive={filters.feature_type.includes(type.name)}
                          onClick={() => toggleFilter('feature_type', type.name)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </Section>

          {/* Model Section - Grouped by Market → Product → Model */}
          <Section icon={Database} title="Market / Product / Model">
            {taxonomy.byModelGrouped.map((market) => {
              const marketExpanded = expandedCategories.has(`market-${market.name}`);
              return (
                <div key={market.name}>
                  {/* Market Level */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleExpand(`market-${market.name}`)}
                      className="p-0.5 hover:bg-gray-200 rounded"
                    >
                      {market.children?.length ? (
                        marketExpanded ? <ChevronDown className="w-3 h-3 text-gray-400" /> : <ChevronRight className="w-3 h-3 text-gray-400" />
                      ) : <span className="w-3" />}
                    </button>
                    <div className="flex items-center gap-1.5 flex-1 px-1.5 py-1 text-gray-700 font-medium">
                      <MapPin className="w-3 h-3 text-gray-500" />
                      <span className="flex-1">{market.name}</span>
                      <span className="text-gray-400 font-mono text-[10px]">{market.count}</span>
                    </div>
                  </div>

                  {/* Product Level */}
                  {marketExpanded && market.children && (
                    <div className="ml-4 pl-2 border-l border-gray-200 mt-0.5">
                      {market.children.map((product) => {
                        const productExpanded = expandedCategories.has(`product-${market.name}-${product.name}`);
                        return (
                          <div key={product.name}>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => toggleExpand(`product-${market.name}-${product.name}`)}
                                className="p-0.5 hover:bg-gray-200 rounded"
                              >
                                {product.children?.length ? (
                                  productExpanded ? <ChevronDown className="w-3 h-3 text-gray-400" /> : <ChevronRight className="w-3 h-3 text-gray-400" />
                                ) : <span className="w-3" />}
                              </button>
                              <div className="flex items-center gap-1.5 flex-1 px-1.5 py-0.5 text-gray-600">
                                <Package className="w-3 h-3 text-gray-400" />
                                <span className="flex-1 truncate">{product.name}</span>
                                <span className="text-gray-400 font-mono text-[10px]">{product.count}</span>
                              </div>
                            </div>

                            {/* Model Level */}
                            {productExpanded && product.children && (
                              <div className="ml-4 pl-2 border-l border-gray-200 mt-0.5">
                                {product.children.map((model) => (
                                  <CheckboxItem
                                    key={model.name}
                                    name={model.name}
                                    count={model.count}
                                    isActive={filters.model_name.includes(model.name)}
                                    onClick={() => toggleFilter('model_name', model.name)}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </Section>

          {/* Geography Section */}
          <Section icon={MapPin} title="Geo">
            {taxonomy.byGeo.map((geo) => (
              <CheckboxItem
                key={geo.name}
                name={geo.name}
                count={geo.count}
                isActive={filters.geo.includes(geo.name)}
                onClick={() => toggleFilter('geo', geo.name)}
              />
            ))}
          </Section>

          {/* Products Section */}
          <Section icon={Package} title="Product">
            {taxonomy.byProduct.map((product) => (
              <CheckboxItem
                key={product.name}
                name={product.name}
                count={product.count}
                isActive={filters.product_business.includes(product.name)}
                onClick={() => toggleFilter('product_business', product.name)}
              />
            ))}
          </Section>

          {/* Divider */}
          <div className="border-t border-gray-200 pt-2" />

          {/* SHAP Rank Slider */}
          <Section icon={TrendingUp} title="SHAP Rank">
            <ShapSlider
              min={taxonomy.shapRange.min}
              max={taxonomy.shapRange.max}
              value={filters.shap_rank_max}
              onChange={setShapRankMax}
            />
          </Section>

          {/* Top Rank Section */}
          {taxonomy.byTopRank.length > 0 && (
            <Section icon={Star} title="Top Rank">
              {taxonomy.byTopRank.map((rank) => (
                <CheckboxItem
                  key={rank.name}
                  name={rank.name}
                  count={rank.count}
                  isActive={filters.top_20_50.includes(rank.name)}
                  onClick={() => toggleFilter('top_20_50', rank.name)}
                />
              ))}
            </Section>
          )}
        </div>
      )}
    </aside>
  );
}

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1 text-gray-500 uppercase tracking-wide font-medium text-[10px]">
        <Icon className="w-3 h-3" />
        {title}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function Checkbox({ checked, color }: { checked: boolean; color?: string }) {
  return (
    <div
      className={cn(
        'w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0',
        checked ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'
      )}
      style={checked && color ? { backgroundColor: color, borderColor: color } : undefined}
    >
      {checked && <Check className="w-2.5 h-2.5 text-white" />}
    </div>
  );
}

function CheckboxItem({ name, count, isActive, onClick }: { name: string; count: number; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-1.5 px-1.5 py-1 rounded text-left hover:bg-gray-200',
        isActive && 'bg-blue-100'
      )}
    >
      <Checkbox checked={isActive} />
      <span className={cn('flex-1 truncate', isActive ? 'text-blue-700' : 'text-gray-700')}>{name}</span>
      <span className="text-gray-400 font-mono">{count}</span>
    </button>
  );
}

function ShapSlider({ min, max, value, onChange }: { min: number; max: number; value: number | null; onChange: (v: number | null) => void }) {
  const [localValue, setLocalValue] = useState(value ?? max);
  const isActive = value !== null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = parseInt(e.target.value);
    setLocalValue(newVal);
    onChange(newVal);
  };

  const handleClear = () => {
    setLocalValue(max);
    onChange(null);
  };

  return (
    <div className="space-y-1.5 px-1">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-gray-500">Top</span>
        <span className={cn('font-mono', isActive ? 'text-blue-600 font-medium' : 'text-gray-400')}>
          {isActive ? `≤ ${value}` : 'All'}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={localValue}
        onChange={handleChange}
        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
      <div className="flex items-center justify-between text-[10px] text-gray-400">
        <span>{min}</span>
        <span>{max}</span>
      </div>
      {isActive && (
        <button
          onClick={handleClear}
          className="w-full text-[10px] text-blue-600 hover:text-blue-800 py-0.5"
        >
          Clear filter
        </button>
      )}
    </div>
  );
}
