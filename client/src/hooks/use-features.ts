import { useQuery } from '@tanstack/react-query';
import type { Feature } from '@/types/feature';

declare const __BASE_URL__: string;
declare const __GSHEET_API_URL__: string;

const BASE_URL = typeof __BASE_URL__ !== 'undefined' ? __BASE_URL__ : '/tilt-features/';
const GSHEET_API_URL = typeof __GSHEET_API_URL__ !== 'undefined' ? __GSHEET_API_URL__ : '';

export function useFeatures() {
  return useQuery({
    queryKey: ['features'],
    queryFn: async (): Promise<Feature[]> => {
      // Try Google Sheets API first if configured
      if (GSHEET_API_URL) {
        try {
          const response = await fetch(GSHEET_API_URL);
          if (response.ok) {
            const data = await response.json();
            // Handle both direct array and { data: [...] } formats
            return Array.isArray(data) ? data : data.data || data.features || [];
          }
        } catch (e) {
          console.warn('Failed to fetch from Google Sheets, falling back to static data:', e);
        }
      }

      // Fallback to static JSON
      const response = await fetch(`${BASE_URL}data/features.json`);
      if (!response.ok) {
        throw new Error('Failed to load features');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useFilterOptions(features: Feature[] | undefined) {
  if (!features) {
    return {
      model_name: [],
      user_type: [],
      geo: [],
      product_business: [],
      primary_category: [],
      feature_type: [],
      feature_subtype: [],
      feature_l3: [],
      top_20_50: [],
    };
  }

  const getUnique = (key: keyof Feature) =>
    [...new Set(features.map(f => f[key]).filter(Boolean))].sort() as string[];

  return {
    model_name: getUnique('model_name'),
    user_type: getUnique('user_type'),
    geo: getUnique('geo'),
    product_business: getUnique('product_business'),
    primary_category: getUnique('primary_category'),
    feature_type: getUnique('feature_type'),
    feature_subtype: getUnique('feature_subtype'),
    feature_l3: getUnique('feature_l3'),
    top_20_50: getUnique('top_20_50'),
  };
}
