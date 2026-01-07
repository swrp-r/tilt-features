import { cn } from '@/lib/utils';

const DEFINITIONS = [
  { term: 'Market', desc: 'The country/region: US, Mexico, Philippines, India' },
  { term: 'Product', desc: "What's offered in a market: Cash Advance, Thrive, Credit Card" },
  { term: 'Credit Policy (CP)', desc: 'The decisioning rules. Uses ML scores + thresholds + business rules to make the final decision. The policy decides, not the model.' },
  { term: 'ML Model', desc: 'Scoring engine that outputs a risk score (0 to 1). Lower = better risk.' },
  { term: 'Feature', desc: 'Data input to ML models: bank data (Plaid), credit bureau, device signals, platform behavior.' },
];

const HIERARCHY = [
  { label: 'Market', items: ['US', 'Mexico', 'Philippines', 'India (Nira)'], color: '#e91e63' },
  { label: 'Product', items: ['Cash Advance', 'Thrive', 'Credit Card', 'Bullet Loans (MX)', 'Cashloan (PH)', 'Term Loans (Nira)'], color: '#ff9800' },
  { label: 'Credit Policy', items: ['CP 56, 57, 58 (US CA)', 'Taurus CP (Thrive)', 'Nira CP'], color: '#9c27b0' },
  { label: 'ML Model', items: ['Boron, Beryllium (US CA)', 'Taurus (Thrive)', 'Durango, Ensenada (MX)', 'Cebu, Baguio, Davao (PH)', 'Nira V3'], color: '#2196f3' },
  { label: 'Features', items: ['Cash Flow (696)', 'Device (479)', 'Loan Activity (449)', 'Bureau (286)', 'User-Reported (103)', 'Platform (73)'], color: '#4caf50' },
];

const FLOW_STEPS = [
  { title: '1. User Request', desc: 'Eligibility check triggered', highlight: false },
  { title: '2. Feature Extraction', desc: 'Pull data from Plaid, Bureau, Device', highlight: false },
  { title: '3. ML Scoring', desc: 'Boron V3 + Beryllium V5', highlight: true },
  { title: '4. Credit Policy', desc: 'Apply rules + thresholds', highlight: true },
  { title: '5. Decision', desc: 'Approve/Decline + Offer Amount', highlight: false },
];

const USER_SEGMENTATION = [
  { product: 'US Cash Advance', newUser: 'Boron + Beryllium (same)', existing: 'Boron + Beryllium (same)', notes: 'User tenure handled by Credit Policy thresholds, not separate models' },
  { product: 'Thrive', newUser: 'Taurus AD (Approve/Decline)', existing: 'Taurus PQ (Prequalification)', notes: 'Two sub-models within Taurus for different decisioning stages' },
  { product: 'Philippines', newUser: 'Cebu (new user)', existing: 'Baguio (repeat user)', notes: 'Davao used for all Cashloan users' },
  { product: 'India (Nira)', newUser: 'V3-Fresh', existing: 'V3-Repeat', notes: 'Separate models by user type' },
  { product: 'Mexico', newUser: 'Durango, Ensenada (all)', existing: 'Durango, Ensenada (all)', notes: 'Same models for all user types' },
];

const DOC_COLUMNS = [
  { key: 'models', label: 'ML Models', desc: 'Model names, versions, and purposes documented' },
  { key: 'features', label: 'Features', desc: 'Feature inventory with taxonomy classification' },
  { key: 'cp', label: 'CP Spec', desc: 'Credit Policy specification with thresholds, rules, offer matrix' },
  { key: 'dbt', label: 'DBT Tables', desc: 'Analytics data dictionaries (ca_core, ca_credit_details, etc.)' },
  { key: 'mapping', label: 'Model→CP', desc: 'Which model version maps to which Credit Policy' },
  { key: 'timeline', label: 'Timeline', desc: 'Historical evolution of models and policies' },
];

const DOC_AVAILABILITY = [
  { market: 'US', product: 'Cash Advance', models: 'yes', features: 'yes', cp: 'yes', dbt: 'yes', mapping: 'yes', timeline: 'yes' },
  { market: 'US', product: 'Thrive', models: 'yes', features: 'yes', cp: 'partial', dbt: 'no', mapping: 'partial', timeline: 'no' },
  { market: 'US', product: 'Credit Card', models: 'yes', features: 'yes', cp: 'no', dbt: 'no', mapping: 'no', timeline: 'no' },
  { market: 'Mexico', product: 'Bullet Loans', models: 'yes', features: 'yes', cp: 'no', dbt: 'partial', mapping: 'no', timeline: 'no' },
  { market: 'Philippines', product: 'Cashloan', models: 'yes', features: 'yes', cp: 'no', dbt: 'no', mapping: 'no', timeline: 'no' },
  { market: 'India', product: 'Term Loans', models: 'yes', features: 'yes', cp: 'no', dbt: 'no', mapping: 'no', timeline: 'no' },
];

export function CreditDefinitions() {
  return (
    <div className="p-4 space-y-4 h-[calc(100vh-140px)] overflow-auto">
      <div className="text-center mb-6">
        <h1 className="text-lg font-bold text-gray-900">Credit Decisioning Taxonomy</h1>
        <p className="text-xs text-gray-500">How underwriting works: Markets, Products, Policies, Models, Features</p>
      </div>

      {/* Definitions */}
      <Section title="Definitions">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {DEFINITIONS.map((def) => (
            <div key={def.term} className="bg-gray-50 p-3 rounded-lg border-l-3 border-l-blue-400" style={{ borderLeftWidth: 3, borderLeftColor: '#4fc3f7' }}>
              <div className="font-semibold text-gray-900 text-sm mb-1">{def.term}</div>
              <div className="text-xs text-gray-600">{def.desc}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Hierarchy */}
      <Section title="Hierarchy: Market → Product → Policy → Model → Features">
        <div className="space-y-2">
          {HIERARCHY.map((row) => (
            <div key={row.label} className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-0">
              <div className="w-24 text-xs font-semibold text-gray-500 uppercase">{row.label}</div>
              <div className="flex flex-wrap gap-2 flex-1">
                {row.items.map((item) => (
                  <span
                    key={item}
                    className="px-2 py-1 text-xs bg-gray-100 rounded"
                    style={{ borderLeft: `3px solid ${row.color}` }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Flow */}
      <Section title="How Decisioning Works (US Cash Advance - CP 58)">
        <div className="flex items-center justify-between gap-2 mb-4 overflow-x-auto py-2">
          {FLOW_STEPS.map((step, i) => (
            <div key={step.title} className="flex items-center gap-2">
              <div
                className={cn(
                  'px-3 py-2 rounded-lg text-center min-w-24',
                  step.highlight ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                )}
              >
                <div className="text-xs font-semibold text-gray-900">{step.title}</div>
                <div className="text-[10px] text-gray-500">{step.desc}</div>
              </div>
              {i < FLOW_STEPS.length - 1 && <span className="text-blue-400 text-lg">→</span>}
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-4 text-xs">
          <h4 className="font-semibold text-blue-600 mb-2">Step-by-Step (from CP 58 Specification)</h4>
          <ol className="space-y-2 list-decimal list-inside text-gray-700">
            <li><strong>Extract ML Scores:</strong> Query <code className="bg-gray-200 px-1 rounded">UserCreditVariableMlScore</code> for bo_v3_score and be_v5_score</li>
            <li><strong>Calculate Ensemble:</strong> <code className="bg-gray-200 px-1 rounded">ensembled_score = (bo_v3 × 0.6) + (be_v5 × 0.4)</code></li>
            <li><strong>Apply AD Rules:</strong> Check thresholds (Boron &lt; 0.25, Beryllium &lt; 0.27, balance &gt; -350)</li>
            <li><strong>Determine Offer:</strong> Map ensembled_score to offer amount using Offer Matrix</li>
            <li><strong>Apply Adjustments:</strong> Paycheck capping, drift policy, min value upgrades</li>
            <li><strong>Final Decision:</strong> Store in UserCashAdvanceEligibility table</li>
          </ol>
        </div>

        <Note>
          <strong>Key Insight:</strong> The ML Model (Boron, Beryllium) just produces a score. The Credit Policy (CP 58) interprets that score using thresholds, business rules, and the Offer Matrix to make the actual decision.
        </Note>
      </Section>

      {/* User Segmentation */}
      <Section title="New User vs Existing User Models">
        <p className="text-xs text-gray-500 mb-3">Many products have separate models for new (fresh) users vs repeat (existing) users.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-3 py-2 text-left font-semibold text-gray-600">Product</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-600">New User Model</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-600">Existing/Repeat Model</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-600">Notes</th>
              </tr>
            </thead>
            <tbody>
              {USER_SEGMENTATION.map((row) => (
                <tr key={row.product} className="border-b border-gray-100">
                  <td className="px-3 py-2 font-medium text-gray-900">{row.product}</td>
                  <td className="px-3 py-2 text-gray-700">{row.newUser}</td>
                  <td className="px-3 py-2 text-gray-700">{row.existing}</td>
                  <td className="px-3 py-2 text-gray-500">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Note>
          <strong>Pattern:</strong> US Cash Advance uses the same model for all users but applies different thresholds in Credit Policy. International markets (PH, Nira) tend to have separate models by user segment.
        </Note>
      </Section>

      {/* Documentation Availability */}
      <Section title="Documentation Availability by Market & Product">
        {/* Column Legend */}
        <div className="mb-4 grid grid-cols-2 md:grid-cols-3 gap-2">
          {DOC_COLUMNS.map((col) => (
            <div key={col.key} className="text-xs bg-gray-50 rounded p-2">
              <span className="font-semibold text-gray-700">{col.label}:</span>
              <span className="text-gray-500 ml-1">{col.desc}</span>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-3 py-2 text-left font-semibold text-gray-600">Market</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-600">Product</th>
                {DOC_COLUMNS.map((col) => (
                  <th key={col.key} className="px-3 py-2 text-center font-semibold text-gray-600" title={col.desc}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DOC_AVAILABILITY.map((row, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="px-3 py-2 font-medium text-gray-900">{row.market}</td>
                  <td className="px-3 py-2 text-gray-700">{row.product}</td>
                  <td className="px-3 py-2 text-center"><StatusBadge status={row.models} /></td>
                  <td className="px-3 py-2 text-center"><StatusBadge status={row.features} /></td>
                  <td className="px-3 py-2 text-center"><StatusBadge status={row.cp} /></td>
                  <td className="px-3 py-2 text-center"><StatusBadge status={row.dbt} /></td>
                  <td className="px-3 py-2 text-center"><StatusBadge status={row.mapping} /></td>
                  <td className="px-3 py-2 text-center"><StatusBadge status={row.timeline} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="text-green-600">✓</span> Available</span>
          <span className="flex items-center gap-1"><span className="text-amber-500">~</span> Partial</span>
          <span className="flex items-center gap-1"><span className="text-gray-300">—</span> Not available</span>
        </div>

        <Note>
          <strong>Key files:</strong> CP 56/57/58 specifications (US Cash Advance), Feature Comparison sheets, Credit & ML chronicles, All ML models at Empower. International markets have feature inventories but lack CP specifications and DBT analytics layer.
        </Note>
      </Section>

      <div className="text-center text-xs text-gray-400 pt-4">
        Based on documentation in modelfeatures/base
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 p-3 bg-amber-50 border-l-3 rounded text-xs text-amber-800" style={{ borderLeftWidth: 3, borderLeftColor: '#f59e0b' }}>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'yes') return <span className="text-green-600 font-medium">✓</span>;
  if (status === 'partial') return <span className="text-amber-500 font-medium">~</span>;
  return <span className="text-gray-300">—</span>;
}
