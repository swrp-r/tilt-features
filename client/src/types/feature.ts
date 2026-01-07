export interface Feature {
  id: number;
  model_name: string;
  user_type: string;
  geo: string;
  product_business: string;
  feature_name: string;
  description: string;
  primary_category: string;
  feature_type: string;
  feature_subtype: string;
  feature_l3: string;
  top_20_50: string;
  shap_rank: number;
}

export interface FilterState {
  model_name: string[];
  user_type: string[];
  geo: string[];
  product_business: string[];
  primary_category: string[];
  feature_type: string[];
  feature_subtype: string[];
  feature_l3: string[];
  top_20_50: string[];
  shap_rank_max: number | null; // null means no filter
  search: string;
}

export interface TaxonomyNode {
  name: string;
  count: number;
  children?: TaxonomyNode[];
}

export interface ChangeProposal {
  feature_id: string;
  feature_name: string;
  field_changed: string;
  old_value: string;
  new_value: string;
  proposer_name: string;
  proposer_email: string;
  comment: string;
}

export const FILTER_KEYS = [
  'model_name',
  'user_type',
  'geo',
  'product_business',
  'primary_category',
  'feature_type',
  'feature_subtype',
  'feature_l3',
  'top_20_50',
] as const;

export type FilterKey = typeof FILTER_KEYS[number];

export const FILTER_LABELS: Record<FilterKey, string> = {
  model_name: 'Model',
  user_type: 'User Type',
  geo: 'Geo',
  product_business: 'Product',
  primary_category: 'Category',
  feature_type: 'Type',
  feature_subtype: 'Subtype',
  feature_l3: 'L3',
  top_20_50: 'Top Rank',
};
