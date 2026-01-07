import { useState, useMemo, useCallback } from 'react';
import type { Feature, FilterState, FilterKey } from '@/types/feature';

const initialFilters: FilterState = {
  model_name: [],
  user_type: [],
  geo: [],
  product_business: [],
  primary_category: [],
  feature_type: [],
  feature_subtype: [],
  feature_l3: [],
  top_20_50: [],
  shap_rank_max: null,
  search: '',
};

export function useFilters(features: Feature[] | undefined) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const toggleFilter = useCallback((key: FilterKey, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value],
    }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search }));
  }, []);

  const setShapRankMax = useCallback((shap_rank_max: number | null) => {
    setFilters(prev => ({ ...prev, shap_rank_max }));
  }, []);

  const clearFilter = useCallback((key: FilterKey) => {
    setFilters(prev => ({ ...prev, [key]: [] }));
  }, []);

  const clearShapFilter = useCallback(() => {
    setFilters(prev => ({ ...prev, shap_rank_max: null }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const activeFilterCount = useMemo(() => {
    return (
      filters.model_name.length +
      filters.user_type.length +
      filters.geo.length +
      filters.product_business.length +
      filters.primary_category.length +
      filters.feature_type.length +
      filters.feature_subtype.length +
      filters.feature_l3.length +
      filters.top_20_50.length +
      (filters.shap_rank_max !== null ? 1 : 0) +
      (filters.search ? 1 : 0)
    );
  }, [filters]);

  const filteredFeatures = useMemo(() => {
    if (!features) return [];

    return features.filter(feature => {
      if (filters.model_name.length && !filters.model_name.includes(feature.model_name)) return false;
      if (filters.user_type.length && !filters.user_type.includes(feature.user_type)) return false;
      if (filters.geo.length && !filters.geo.includes(feature.geo)) return false;
      if (filters.product_business.length && !filters.product_business.includes(feature.product_business)) return false;
      if (filters.primary_category.length && !filters.primary_category.includes(feature.primary_category)) return false;
      if (filters.feature_type.length && !filters.feature_type.includes(feature.feature_type)) return false;
      if (filters.feature_subtype.length && !filters.feature_subtype.includes(feature.feature_subtype)) return false;
      if (filters.feature_l3.length && !filters.feature_l3.includes(feature.feature_l3)) return false;
      if (filters.top_20_50.length && !filters.top_20_50.includes(feature.top_20_50)) return false;

      // SHAP rank filter - show features with rank <= max (lower is better)
      if (filters.shap_rank_max !== null) {
        if (!feature.shap_rank || feature.shap_rank > filters.shap_rank_max) return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesName = feature.feature_name?.toLowerCase().includes(searchLower);
        const matchesDesc = feature.description?.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesDesc) return false;
      }

      return true;
    });
  }, [features, filters]);

  return {
    filters,
    filteredFeatures,
    toggleFilter,
    setSearch,
    setShapRankMax,
    clearFilter,
    clearShapFilter,
    clearAllFilters,
    activeFilterCount,
  };
}
