import { useMemo } from 'react';
import type { Feature } from '@/types/feature';
import {
  BRAINSTORM_SECTIONS,
  MANIPULATION_RISK,
  GEO_ORDER,
  CATEGORY_ORDER,
  type BrainstormCategory,
} from '@/data/brainstorm-mapping';

export interface GeoMatrix {
  geo: string;
  categories: Record<string, number>;
  total: number;
}

export interface BrainstormCategoryResult extends BrainstormCategory {
  current: number;
  byGeo: Record<string, number>;
}

export interface BrainstormSectionResult {
  id: string;
  label: string;
  categories: BrainstormCategoryResult[];
  total: number;
}

export interface RiskDistribution {
  level: string;
  label: string;
  color: string;
  count: number;
  percentage: number;
}

export function useGapAnalysis(features: Feature[] | undefined) {
  // Geo x Category matrix
  const geoMatrix = useMemo<GeoMatrix[]>(() => {
    if (!features) return [];

    const matrix: Record<string, Record<string, number>> = {};

    // Initialize matrix
    for (const geo of GEO_ORDER) {
      matrix[geo] = {};
      for (const cat of CATEGORY_ORDER) {
        matrix[geo][cat] = 0;
      }
    }

    // Count features
    for (const f of features) {
      if (matrix[f.geo] && matrix[f.geo][f.primary_category] !== undefined) {
        matrix[f.geo][f.primary_category]++;
      }
    }

    return GEO_ORDER.map((geo) => ({
      geo,
      categories: matrix[geo],
      total: Object.values(matrix[geo]).reduce((a, b) => a + b, 0),
    }));
  }, [features]);

  // Maximum count for heatmap scaling
  const maxCount = useMemo(() => {
    let max = 0;
    for (const row of geoMatrix) {
      for (const count of Object.values(row.categories)) {
        if (count > max) max = count;
      }
    }
    return max;
  }, [geoMatrix]);

  // Brainstorm section results
  const brainstormResults = useMemo<BrainstormSectionResult[]>(() => {
    if (!features) return [];

    return BRAINSTORM_SECTIONS.map((section) => {
      const categoryResults = section.categories.map((cat) => {
        const byGeo: Record<string, number> = {};
        for (const geo of GEO_ORDER) {
          byGeo[geo] = 0;
        }

        let total = 0;

        for (const f of features) {
          let matches = false;

          // Check primary_category match
          if (cat.taxonomyMatch.primary_category?.includes(f.primary_category)) {
            matches = true;
          }

          // Check feature_type match
          if (cat.taxonomyMatch.feature_type?.includes(f.feature_type)) {
            matches = true;
          }

          // Check feature_subtype match
          if (cat.taxonomyMatch.feature_subtype?.some((st) => f.feature_subtype?.includes(st))) {
            matches = true;
          }

          if (matches) {
            total++;
            byGeo[f.geo]++;
          }
        }

        return {
          ...cat,
          current: total,
          byGeo,
        };
      });

      return {
        id: section.id,
        label: section.label,
        categories: categoryResults,
        total: categoryResults.reduce((sum, c) => sum + c.current, 0),
      };
    });
  }, [features]);

  // Risk distribution
  const riskDistribution = useMemo<RiskDistribution[]>(() => {
    if (!features) return [];

    const counts: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
    };

    for (const f of features) {
      if (MANIPULATION_RISK.low.categories.includes(f.primary_category)) {
        counts.low++;
      } else if (MANIPULATION_RISK.medium.categories.includes(f.primary_category)) {
        counts.medium++;
      } else if (MANIPULATION_RISK.high.categories.includes(f.primary_category)) {
        counts.high++;
      }
    }

    const total = features.length;

    return [
      {
        level: 'low',
        label: MANIPULATION_RISK.low.label,
        color: MANIPULATION_RISK.low.color,
        count: counts.low,
        percentage: total > 0 ? Math.round((counts.low / total) * 100) : 0,
      },
      {
        level: 'medium',
        label: MANIPULATION_RISK.medium.label,
        color: MANIPULATION_RISK.medium.color,
        count: counts.medium,
        percentage: total > 0 ? Math.round((counts.medium / total) * 100) : 0,
      },
      {
        level: 'high',
        label: MANIPULATION_RISK.high.label,
        color: MANIPULATION_RISK.high.color,
        count: counts.high,
        percentage: total > 0 ? Math.round((counts.high / total) * 100) : 0,
      },
    ];
  }, [features]);

  // Find gaps (cells with 0 or very few features)
  const gaps = useMemo(() => {
    const result: Array<{ geo: string; category: string; count: number }> = [];

    for (const row of geoMatrix) {
      for (const [category, count] of Object.entries(row.categories)) {
        if (count < 10) {
          result.push({ geo: row.geo, category, count });
        }
      }
    }

    return result.sort((a, b) => a.count - b.count);
  }, [geoMatrix]);

  return {
    geoMatrix,
    maxCount,
    brainstormResults,
    riskDistribution,
    gaps,
  };
}
