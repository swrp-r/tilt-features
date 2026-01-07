import { useMemo } from 'react';
import type { Feature, TaxonomyNode } from '@/types/feature';

export function useTaxonomy(features: Feature[] | undefined) {
  return useMemo(() => {
    if (!features || features.length === 0) {
      return {
        byCategory: [] as TaxonomyNode[],
        byGeo: [] as TaxonomyNode[],
        byProduct: [] as TaxonomyNode[],
        byModel: [] as TaxonomyNode[],
        byModelGrouped: [] as TaxonomyNode[],
        byTopRank: [] as TaxonomyNode[],
        shapRange: { min: 1, max: 250 },
      };
    }

    // Build category hierarchy
    const categoryMap = new Map<string, Map<string, Map<string, number>>>();

    for (const feature of features) {
      const cat = feature.primary_category || 'Unknown';
      const type = feature.feature_type || 'Unknown';
      const subtype = feature.feature_subtype || 'Unknown';

      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, new Map());
      }
      const typeMap = categoryMap.get(cat)!;

      if (!typeMap.has(type)) {
        typeMap.set(type, new Map());
      }
      const subtypeMap = typeMap.get(type)!;

      subtypeMap.set(subtype, (subtypeMap.get(subtype) || 0) + 1);
    }

    const byCategory: TaxonomyNode[] = Array.from(categoryMap.entries())
      .map(([catName, typeMap]) => {
        const typeNodes: TaxonomyNode[] = Array.from(typeMap.entries())
          .map(([typeName, subtypeMap]) => {
            const subtypeNodes: TaxonomyNode[] = Array.from(subtypeMap.entries())
              .map(([subtypeName, count]) => ({
                name: subtypeName,
                count,
              }))
              .sort((a, b) => b.count - a.count);

            return {
              name: typeName,
              count: subtypeNodes.reduce((sum, n) => sum + n.count, 0),
              children: subtypeNodes,
            };
          })
          .sort((a, b) => b.count - a.count);

        return {
          name: catName,
          count: typeNodes.reduce((sum, n) => sum + n.count, 0),
          children: typeNodes,
        };
      })
      .sort((a, b) => b.count - a.count);

    // Build geo counts
    const geoMap = new Map<string, number>();
    for (const feature of features) {
      const geo = feature.geo || 'Unknown';
      geoMap.set(geo, (geoMap.get(geo) || 0) + 1);
    }
    const byGeo: TaxonomyNode[] = Array.from(geoMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Build product counts
    const productMap = new Map<string, number>();
    for (const feature of features) {
      const product = feature.product_business || 'Unknown';
      productMap.set(product, (productMap.get(product) || 0) + 1);
    }
    const byProduct: TaxonomyNode[] = Array.from(productMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Build model counts grouped by market (geo) → product → model
    const modelHierarchy = new Map<string, Map<string, Map<string, number>>>();
    for (const feature of features) {
      const geo = feature.geo || 'Unknown';
      const product = feature.product_business || 'Unknown';
      const model = feature.model_name || 'Unknown';

      if (!modelHierarchy.has(geo)) {
        modelHierarchy.set(geo, new Map());
      }
      const productMap = modelHierarchy.get(geo)!;

      if (!productMap.has(product)) {
        productMap.set(product, new Map());
      }
      const modelMap = productMap.get(product)!;
      modelMap.set(model, (modelMap.get(model) || 0) + 1);
    }

    const byModelGrouped: TaxonomyNode[] = Array.from(modelHierarchy.entries())
      .map(([geoName, productMap]) => {
        const productNodes: TaxonomyNode[] = Array.from(productMap.entries())
          .map(([productName, modelMap]) => {
            const modelNodes: TaxonomyNode[] = Array.from(modelMap.entries())
              .map(([modelName, count]) => ({ name: modelName, count }))
              .sort((a, b) => b.count - a.count);
            return {
              name: productName,
              count: modelNodes.reduce((sum, n) => sum + n.count, 0),
              children: modelNodes,
            };
          })
          .sort((a, b) => b.count - a.count);
        return {
          name: geoName,
          count: productNodes.reduce((sum, n) => sum + n.count, 0),
          children: productNodes,
        };
      })
      .sort((a, b) => b.count - a.count);

    // Flat model list for backward compatibility
    const modelMap = new Map<string, number>();
    for (const feature of features) {
      const model = feature.model_name || 'Unknown';
      modelMap.set(model, (modelMap.get(model) || 0) + 1);
    }
    const byModel: TaxonomyNode[] = Array.from(modelMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Build top ranking counts
    const topRankMap = new Map<string, number>();
    for (const feature of features) {
      const rank = feature.top_20_50;
      if (rank) {
        topRankMap.set(rank, (topRankMap.get(rank) || 0) + 1);
      }
    }
    const byTopRank: TaxonomyNode[] = Array.from(topRankMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Calculate SHAP range
    const shapValues = features
      .map(f => f.shap_rank)
      .filter((v): v is number => typeof v === 'number' && !isNaN(v));
    const shapRange = shapValues.length > 0
      ? { min: Math.min(...shapValues), max: Math.max(...shapValues) }
      : { min: 1, max: 250 };

    return { byCategory, byGeo, byProduct, byModel, byModelGrouped, byTopRank, shapRange };
  }, [features]);
}
