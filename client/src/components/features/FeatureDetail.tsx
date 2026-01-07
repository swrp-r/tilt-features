import { motion } from 'framer-motion';
import { X, Copy, Edit3, Check } from 'lucide-react';
import { useState } from 'react';
import type { Feature } from '@/types/feature';

interface FeatureDetailProps {
  feature: Feature;
  onClose: () => void;
  onProposeChange: () => void;
}

export function FeatureDetail({ feature, onClose, onProposeChange }: FeatureDetailProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = Object.entries(feature)
      .map(([k, v]) => `${k}: ${v || 'N/A'}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fields = [
    { label: 'Model', value: feature.model_name },
    { label: 'User Type', value: feature.user_type },
    { label: 'Geo', value: feature.geo },
    { label: 'Product', value: feature.product_business },
    { label: 'Feature Name', value: feature.feature_name, mono: true },
    { label: 'Description', value: feature.description },
    { label: 'Primary Category', value: feature.primary_category, highlight: true },
    { label: 'Feature Type', value: feature.feature_type },
    { label: 'Feature Subtype', value: feature.feature_subtype },
    { label: 'Feature L3', value: feature.feature_l3 },
    { label: 'Top 20/50', value: feature.top_20_50 },
    { label: 'SHAP Rank', value: feature.shap_rank },
  ];

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/30 z-50"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-gray-200 z-50 overflow-y-auto shadow-xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Feature Details</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {fields.map((field) => (
            <div key={field.label} className="flex justify-between items-start gap-4 py-2 border-b border-gray-100">
              <span className="text-xs text-gray-500 uppercase tracking-wide min-w-24">
                {field.label}
              </span>
              <span className={`text-sm text-right ${field.mono ? 'font-mono' : ''} ${field.highlight ? 'font-semibold text-blue-600' : 'text-gray-900'}`}>
                {field.value || <span className="text-gray-400">-</span>}
              </span>
            </div>
          ))}

          {/* Propose Change Button */}
          <button
            onClick={onProposeChange}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Propose a Change
          </button>

          <p className="text-xs text-center text-gray-500">
            Propose reclassification or add comments for review.
          </p>
        </div>
      </motion.div>
    </>
  );
}
