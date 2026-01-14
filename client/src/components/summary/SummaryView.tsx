import { useMemo, useState } from 'react';
import { ChevronRight, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Feature } from '@/types/feature';

interface SummaryViewProps {
  features: Feature[];
}

const COLORS: Record<string, string> = {
  'Cash Flow': '#10b981',
  'Device Data': '#8b5cf6',
  'Loan Activity': '#ec4899',
  'Bureau': '#f59e0b',
  'User-Reported Data': '#f97316',
  'Platform Data': '#06b6d4',
};

interface TreeNode {
  name: string;
  count: number;
  pct: number;
  color?: string;
  children?: TreeNode[];
  byGeo: Record<string, number>;
  byProduct: Record<string, number>;
}

interface CategoryBreakdown {
  name: string;
  color: string;
  total: number;
  byGeo: { name: string; count: number }[];
  byModel: { name: string; count: number }[];
  byProduct: { name: string; count: number }[];
}

export function SummaryView({ features }: SummaryViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { kpis, categoryBar, tree, categoryBreakdowns, allGeos, allProducts } = useMemo(() => {
    if (!features.length) return { kpis: null, categoryBar: [], tree: [], categoryBreakdowns: new Map(), allGeos: [], allProducts: [] };

    // KPIs
    const models = new Set(features.map(f => f.model_name).filter(Boolean));
    const geos = new Set(features.map(f => f.geo).filter(Boolean));
    const categories = new Set(features.map(f => f.primary_category).filter(Boolean));
    const products = new Set(features.map(f => f.product_business).filter(Boolean));
    const topFeatures = features.filter(f => f.top_20_50).length;

    const allGeos = Array.from(geos).sort();
    const allProducts = Array.from(products).sort();

    const kpis = {
      total: features.length,
      models: models.size,
      geos: geos.size,
      categories: categories.size,
      topPct: Math.round((topFeatures / features.length) * 100),
    };

    // Category distribution bar
    const catCounts = new Map<string, number>();
    for (const f of features) {
      if (f.primary_category) {
        catCounts.set(f.primary_category, (catCounts.get(f.primary_category) || 0) + 1);
      }
    }
    const categoryBar = Array.from(catCounts.entries())
      .map(([name, count]) => ({
        name,
        count,
        pct: (count / features.length) * 100,
        color: COLORS[name] || '#6b7280',
      }))
      .sort((a, b) => b.count - a.count);

    // Build category breakdowns for drill-down
    const categoryBreakdowns = new Map<string, CategoryBreakdown>();
    for (const cat of categoryBar) {
      const catFeatures = features.filter(f => f.primary_category === cat.name);

      const geoMap = new Map<string, number>();
      const modelMap = new Map<string, number>();
      const productMap = new Map<string, number>();

      for (const f of catFeatures) {
        if (f.geo) geoMap.set(f.geo, (geoMap.get(f.geo) || 0) + 1);
        if (f.model_name) modelMap.set(f.model_name, (modelMap.get(f.model_name) || 0) + 1);
        if (f.product_business) productMap.set(f.product_business, (productMap.get(f.product_business) || 0) + 1);
      }

      categoryBreakdowns.set(cat.name, {
        name: cat.name,
        color: cat.color,
        total: cat.count,
        byGeo: Array.from(geoMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
        byModel: Array.from(modelMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
        byProduct: Array.from(productMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
      });
    }

    // Helper to count by geo/product for a set of features
    const countByDimension = (feats: Feature[]) => {
      const byGeo: Record<string, number> = {};
      const byProduct: Record<string, number> = {};
      for (const f of feats) {
        if (f.geo) byGeo[f.geo] = (byGeo[f.geo] || 0) + 1;
        if (f.product_business) byProduct[f.product_business] = (byProduct[f.product_business] || 0) + 1;
      }
      return { byGeo, byProduct };
    };

    // Build hierarchical tree: Category → Type → Subtype → L3
    const tree: TreeNode[] = [];

    // Group features by category
    const catGroups = new Map<string, Feature[]>();
    for (const f of features) {
      const cat = f.primary_category || 'Unknown';
      if (!catGroups.has(cat)) catGroups.set(cat, []);
      catGroups.get(cat)!.push(f);
    }

    for (const [catName, catFeatures] of Array.from(catGroups.entries()).sort((a, b) => b[1].length - a[1].length)) {
      const catDims = countByDimension(catFeatures);

      // Group by type
      const typeGroups = new Map<string, Feature[]>();
      for (const f of catFeatures) {
        const type = f.feature_type || 'Unknown';
        if (!typeGroups.has(type)) typeGroups.set(type, []);
        typeGroups.get(type)!.push(f);
      }

      const typeNodes: TreeNode[] = [];
      for (const [typeName, typeFeatures] of Array.from(typeGroups.entries()).sort((a, b) => b[1].length - a[1].length)) {
        const typeDims = countByDimension(typeFeatures);

        // Group by subtype
        const subtypeGroups = new Map<string, Feature[]>();
        for (const f of typeFeatures) {
          const subtype = f.feature_subtype || 'Unknown';
          if (!subtypeGroups.has(subtype)) subtypeGroups.set(subtype, []);
          subtypeGroups.get(subtype)!.push(f);
        }

        const subtypeNodes: TreeNode[] = [];
        for (const [subtypeName, subtypeFeatures] of Array.from(subtypeGroups.entries()).sort((a, b) => b[1].length - a[1].length)) {
          const subtypeDims = countByDimension(subtypeFeatures);

          // Group by L3
          const l3Groups = new Map<string, Feature[]>();
          for (const f of subtypeFeatures) {
            const l3 = f.feature_l3 || 'Unknown';
            if (!l3Groups.has(l3)) l3Groups.set(l3, []);
            l3Groups.get(l3)!.push(f);
          }

          const l3Nodes: TreeNode[] = [];
          for (const [l3Name, l3Features] of Array.from(l3Groups.entries()).sort((a, b) => b[1].length - a[1].length)) {
            const l3Dims = countByDimension(l3Features);
            l3Nodes.push({
              name: l3Name,
              count: l3Features.length,
              pct: (l3Features.length / features.length) * 100,
              byGeo: l3Dims.byGeo,
              byProduct: l3Dims.byProduct,
            });
          }

          subtypeNodes.push({
            name: subtypeName,
            count: subtypeFeatures.length,
            pct: (subtypeFeatures.length / features.length) * 100,
            byGeo: subtypeDims.byGeo,
            byProduct: subtypeDims.byProduct,
            children: l3Nodes.length > 1 || l3Nodes[0]?.name !== 'Unknown' ? l3Nodes : undefined,
          });
        }

        typeNodes.push({
          name: typeName,
          count: typeFeatures.length,
          pct: (typeFeatures.length / features.length) * 100,
          byGeo: typeDims.byGeo,
          byProduct: typeDims.byProduct,
          children: subtypeNodes.length > 1 || subtypeNodes[0]?.name !== 'Unknown' ? subtypeNodes : undefined,
        });
      }

      tree.push({
        name: catName,
        count: catFeatures.length,
        pct: (catFeatures.length / features.length) * 100,
        color: COLORS[catName] || '#6b7280',
        byGeo: catDims.byGeo,
        byProduct: catDims.byProduct,
        children: typeNodes,
      });
    }

    return { kpis, categoryBar, tree, categoryBreakdowns, allGeos, allProducts };
  }, [features]);

  const selectedBreakdown = selectedCategory ? categoryBreakdowns.get(selectedCategory) : null;

  if (!kpis) {
    return <div className="p-8 text-center text-gray-500">No data</div>;
  }

  return (
    <div className="p-4 space-y-4 h-[calc(100vh-140px)] overflow-auto">
      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-3">
        <KpiCard label="Total Features" value={kpis.total} />
        <KpiCard label="Models" value={kpis.models} />
        <KpiCard label="Geographies" value={kpis.geos} />
        <KpiCard label="Categories" value={kpis.categories} />
        <KpiCard label="Top Ranked" value={`${kpis.topPct}%`} />
      </div>

      {/* Category Distribution Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="text-xs font-medium text-gray-600 mb-2">
          Category Distribution
          <span className="text-gray-400 ml-2 font-normal">Click to drill down</span>
        </div>
        <div className="h-8 flex rounded overflow-hidden cursor-pointer">
          {categoryBar.map((cat) => (
            <div
              key={cat.name}
              style={{ width: `${cat.pct}%`, backgroundColor: cat.color }}
              className={cn(
                'relative group transition-all',
                selectedCategory === cat.name ? 'ring-2 ring-offset-1 ring-gray-800' : 'hover:opacity-80'
              )}
              title={`${cat.name}: ${cat.count} (${cat.pct.toFixed(1)}%)`}
              onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
            >
              {cat.pct > 8 && (
                <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium truncate px-1">
                  {cat.name.split(' ')[0]}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 mt-2">
          {categoryBar.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
              className={cn(
                'flex items-center gap-1.5 text-xs px-2 py-1 rounded transition-colors',
                selectedCategory === cat.name ? 'bg-gray-100 ring-1 ring-gray-300' : 'hover:bg-gray-50'
              )}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
              <span className="text-gray-600">{cat.name}</span>
              <span className="text-gray-400 font-mono">{cat.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Drill-down Panel */}
      {selectedBreakdown && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden" style={{ borderLeftWidth: 4, borderLeftColor: selectedBreakdown.color }}>
          <div className="px-3 py-2 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedBreakdown.color }} />
              <span className="text-sm font-medium text-gray-900">{selectedBreakdown.name}</span>
              <span className="text-xs text-gray-500">{selectedBreakdown.total} features</span>
            </div>
            <button onClick={() => setSelectedCategory(null)} className="p-1 hover:bg-gray-200 rounded">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="grid grid-cols-3 divide-x divide-gray-200">
            <BreakdownColumn title="By Geography" items={selectedBreakdown.byGeo} total={selectedBreakdown.total} color={selectedBreakdown.color} />
            <BreakdownColumn title="By Model" items={selectedBreakdown.byModel} total={selectedBreakdown.total} color={selectedBreakdown.color} />
            <BreakdownColumn title="By Product" items={selectedBreakdown.byProduct} total={selectedBreakdown.total} color={selectedBreakdown.color} />
          </div>
        </div>
      )}

      {/* Hierarchical Tree */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-200 bg-gray-50 flex items-center">
          <span className="text-sm font-medium text-gray-900">Taxonomy Hierarchy</span>
          <span className="text-xs text-gray-500 ml-2">Category → Type → Subtype → L3</span>
        </div>
        {/* Column Headers - Scrollable */}
        <div className="overflow-x-auto border-b border-gray-200">
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-[10px] font-medium text-gray-500 uppercase min-w-max">
            <div className="w-3.5 flex-shrink-0"></div>
            <div className="w-2.5 flex-shrink-0"></div>
            <div className="w-[250px] flex-shrink-0">Name</div>
            <div className="w-28 text-center flex-shrink-0">Total</div>
            <div className="bg-blue-50 rounded px-1 py-0.5 flex-shrink-0">
              <div className="text-blue-600 text-center mb-0.5">Markets</div>
              <div className="flex gap-px">
                {allGeos.map(geo => (
                  <div key={geo} className="w-12 text-center text-blue-500" title={geo}>{geo}</div>
                ))}
              </div>
            </div>
            <div className="bg-amber-50 rounded px-1 py-0.5 flex-shrink-0">
              <div className="text-amber-600 text-center mb-0.5">Products</div>
              <div className="flex gap-px">
                {allProducts.map(prod => (
                  <div key={prod} className="w-24 text-center text-amber-500 leading-tight" title={prod}>
                    {prod.split('-').map((part, i) => (
                      <div key={i}>{part}</div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="p-2 max-h-[calc(100vh-500px)] overflow-auto">
          {tree.map((cat) => (
            <TreeNodeRow key={cat.name} node={cat} depth={0} total={features.length} allGeos={allGeos} allProducts={allProducts} />
          ))}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      <div className="text-2xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function BreakdownColumn({ title, items, total, color }: { title: string; items: { name: string; count: number }[]; total: number; color: string }) {
  return (
    <div className="p-3">
      <div className="text-xs font-medium text-gray-500 mb-2">{title}</div>
      <div className="space-y-1.5">
        {items.map((item) => {
          const pct = (item.count / total) * 100;
          return (
            <div key={item.name} className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-xs mb-0.5">
                  <span className="text-gray-700 truncate">{item.name}</span>
                  <span className="text-gray-500 font-mono ml-2">{item.count}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
              </div>
              <span className="text-[10px] text-gray-400 font-mono w-10 text-right">{pct.toFixed(0)}%</span>
            </div>
          );
        })}
        {items.length === 0 && <div className="text-xs text-gray-400">No data</div>}
      </div>
    </div>
  );
}

function TreeNodeRow({ node, depth, total, allGeos, allProducts }: { node: TreeNode; depth: number; total: number; allGeos: string[]; allProducts: string[] }) {
  const [expanded, setExpanded] = useState(depth <= 1); // Expand Category and Type by default
  const hasChildren = node.children && node.children.length > 0;
  const barWidth = Math.max(2, (node.count / total) * 100);

  // Different background shades by depth
  const depthStyles = {
    0: 'bg-gray-100 font-semibold border-l-4',
    1: 'bg-gray-50 font-medium border-l-2',
    2: 'bg-white',
    3: 'bg-white',
  };
  const depthBorderColor = node.color || '#9ca3af';

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 py-1.5 px-1 rounded-sm hover:bg-blue-50 cursor-pointer mb-0.5 min-w-max',
          depthStyles[depth as keyof typeof depthStyles] || 'bg-white'
        )}
        style={{
          paddingLeft: `${depth * 16 + 4}px`,
          borderLeftColor: depth <= 1 ? depthBorderColor : undefined,
        }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          )
        ) : (
          <span className="w-3.5 flex-shrink-0" />
        )}

        {node.color && (
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: node.color }} />
        )}

        <span
          className={cn(
            'w-[250px] flex-shrink-0 truncate text-sm',
            depth === 0 ? 'text-gray-900' : depth === 1 ? 'text-gray-800' : depth === 2 ? 'text-gray-700' : 'text-gray-600'
          )}
          title={node.name}
        >
          {node.name}
        </span>

        {/* Total with mini bar */}
        <div className="w-28 flex-shrink-0 flex items-center gap-1">
          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${barWidth}%`,
                backgroundColor: node.color || (depth === 0 ? '#3b82f6' : depth === 1 ? '#60a5fa' : depth === 2 ? '#93c5fd' : '#bfdbfe'),
              }}
            />
          </div>
          <span className={cn(
            'font-mono w-8 text-right',
            depth === 0 ? 'text-sm text-gray-900 font-semibold' : depth === 1 ? 'text-xs text-gray-700 font-medium' : 'text-xs text-gray-500'
          )}>{node.count}</span>
          <span className={cn(
            'font-mono w-12 text-right',
            depth === 0 ? 'text-xs text-gray-600' : 'text-[10px] text-gray-400'
          )}>{node.pct.toFixed(1)}%</span>
        </div>

        {/* Geo columns - blue tint */}
        <div className={cn('flex gap-px rounded px-1 flex-shrink-0', depth === 0 ? 'bg-blue-100' : depth === 1 ? 'bg-blue-50' : '')}>
          {allGeos.map(geo => (
            <div key={geo} className={cn(
              'w-12 text-center font-mono',
              depth === 0 ? 'text-sm font-semibold' : depth === 1 ? 'text-xs font-medium' : 'text-xs',
              node.byGeo[geo] ? (depth === 0 ? 'text-blue-700' : 'text-blue-600') : 'text-gray-300'
            )}>
              {node.byGeo[geo] || '-'}
            </div>
          ))}
        </div>

        {/* Product columns - amber tint */}
        <div className={cn('flex gap-px rounded px-1 flex-shrink-0', depth === 0 ? 'bg-amber-100' : depth === 1 ? 'bg-amber-50' : '')}>
          {allProducts.map(prod => (
            <div key={prod} className={cn(
              'w-24 text-center font-mono',
              depth === 0 ? 'text-sm font-semibold' : depth === 1 ? 'text-xs font-medium' : 'text-xs',
              node.byProduct[prod] ? (depth === 0 ? 'text-amber-700' : 'text-amber-600') : 'text-gray-300'
            )}>
              {node.byProduct[prod] || '-'}
            </div>
          ))}
        </div>
      </div>

      {expanded && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <TreeNodeRow key={child.name} node={child} depth={depth + 1} total={total} allGeos={allGeos} allProducts={allProducts} />
          ))}
        </div>
      )}
    </div>
  );
}
