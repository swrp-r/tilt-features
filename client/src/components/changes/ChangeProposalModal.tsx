import { useState } from 'react';
import { X, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import type { Feature } from '@/types/feature';

interface ChangeProposalModalProps {
  feature: Feature;
  onClose: () => void;
}

const CHANGEABLE_FIELDS = [
  { key: 'primary_category', label: 'Primary Category' },
  { key: 'feature_type', label: 'Feature Type' },
  { key: 'feature_subtype', label: 'Feature Subtype' },
  { key: 'feature_l3', label: 'Feature L3' },
] as const;

type FieldKey = typeof CHANGEABLE_FIELDS[number]['key'] | 'comment_only';
type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

declare const __APPS_SCRIPT_URL__: string | undefined;
const APPS_SCRIPT_URL = typeof __APPS_SCRIPT_URL__ !== 'undefined' ? __APPS_SCRIPT_URL__ : '';

export function ChangeProposalModal({ feature, onClose }: ChangeProposalModalProps) {
  const [selectedField, setSelectedField] = useState<FieldKey>('primary_category');
  const [newValue, setNewValue] = useState('');
  const [proposerName, setProposerName] = useState('');
  const [proposerEmail, setProposerEmail] = useState('');
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const currentValue = selectedField !== 'comment_only' ? (feature[selectedField] as string) || '' : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!proposerName.trim()) {
      setErrorMessage('Please enter your name');
      setStatus('error');
      return;
    }

    if (selectedField !== 'comment_only' && !newValue.trim()) {
      setErrorMessage('Please enter a new value');
      setStatus('error');
      return;
    }

    if (!comment.trim()) {
      setErrorMessage('Please provide a reason');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    const payload = {
      feature_id: feature.id,
      feature_name: feature.feature_name,
      field_changed: selectedField,
      old_value: currentValue,
      new_value: selectedField === 'comment_only' ? '' : newValue,
      proposer_name: proposerName,
      proposer_email: proposerEmail,
      comment: comment,
    };

    try {
      if (!APPS_SCRIPT_URL) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Change proposal (simulated):', payload);
        setStatus('success');
        return;
      }

      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMessage('Failed to submit. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <>
        <div onClick={onClose} className="fixed inset-0 bg-black/30 z-50" />
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-xl z-50 p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Proposal Submitted!</h3>
          <p className="text-sm text-gray-500 mb-6">Your change proposal has been logged for review.</p>
          <button onClick={onClose} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            Done
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/30 z-50" />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-lg shadow-xl z-50 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <h2 className="font-semibold text-gray-900">Propose a Change</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Feature Reference */}
          <div className="bg-gray-100 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Feature</div>
            <div className="font-mono text-sm text-gray-900">{feature.feature_name}</div>
          </div>

          {/* Field Selection */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">What would you like to change?</label>
            <div className="grid grid-cols-2 gap-2">
              {CHANGEABLE_FIELDS.map((field) => (
                <button
                  key={field.key}
                  type="button"
                  onClick={() => setSelectedField(field.key)}
                  className={`px-3 py-2 text-sm rounded-lg border text-left ${
                    selectedField === field.key
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {field.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSelectedField('comment_only')}
                className={`px-3 py-2 text-sm rounded-lg border text-left col-span-2 ${
                  selectedField === 'comment_only'
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Add comment only (no change)
              </button>
            </div>
          </div>

          {/* Current & New Value */}
          {selectedField !== 'comment_only' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Current Value</label>
                <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600">
                  {currentValue || <span className="italic text-gray-400">(empty)</span>}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Proposed Value</label>
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Enter new value"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Proposer Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Your Name *</label>
              <input
                type="text"
                value={proposerName}
                onChange={(e) => setProposerName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Your Email</label>
              <input
                type="email"
                value={proposerEmail}
                onChange={(e) => setProposerEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">Reason for Change *</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Explain why this change should be made..."
              required
              rows={3}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Error Message */}
          {status === 'error' && errorMessage && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              {errorMessage}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Proposal
              </>
            )}
          </button>
        </form>
      </div>
    </>
  );
}
