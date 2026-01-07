// Brainstorm Framework Mapping
// Maps current taxonomy to the feature brainstorming framework

export interface BrainstormCategory {
  id: string;
  label: string;
  planned: number | null;
  description: string;
  taxonomyMatch: {
    primary_category?: string[];
    feature_type?: string[];
    feature_subtype?: string[];
  };
}

export interface BrainstormSection {
  id: string;
  label: string;
  categories: BrainstormCategory[];
}

export const BRAINSTORM_SECTIONS: BrainstormSection[] = [
  {
    id: 'internal',
    label: 'Internal Data',
    categories: [
      {
        id: 'loans',
        label: 'Loans',
        planned: 30,
        description: 'Loan amounts, counts, tenure, time sequence',
        taxonomyMatch: {
          feature_type: ['Credit/Loan History'],
        },
      },
      {
        id: 'repayment',
        label: 'Repayment',
        planned: 50,
        description: 'Repayment amounts, rates, days since repay',
        taxonomyMatch: {
          feature_subtype: ['Collections, Recoveries, Repayments', 'Payment Behavior', 'Repayment Metrics'],
        },
      },
      {
        id: 'applications',
        label: 'Applications',
        planned: 50,
        description: 'Application counts, desired amounts, timing',
        taxonomyMatch: {
          feature_type: ['Loan Application'],
          feature_subtype: ['Application Timing', 'Application Counts'],
        },
      },
      {
        id: 'collections',
        label: 'Collections',
        planned: 10,
        description: 'Call results, PTP, connect rates',
        taxonomyMatch: {
          feature_subtype: ['Collections, Recoveries, Repayments'],
        },
      },
      {
        id: 'app_install',
        label: 'App Installation',
        planned: 30,
        description: 'App types, popularity, blacklist, install timing',
        taxonomyMatch: {
          feature_type: ['App Ecosystem'],
        },
      },
      {
        id: 'user_profile',
        label: 'User Profile',
        planned: 10,
        description: 'Age, ID type, income, gender, education',
        taxonomyMatch: {
          primary_category: ['User-Reported Data'],
          feature_type: ['Questionnaire', 'KYC/Identity'],
        },
      },
      {
        id: 'device_behavior',
        label: 'Device & App Behavior',
        planned: 10,
        description: 'Login times, password changes, IP counts',
        taxonomyMatch: {
          feature_type: ['Device Hardware and Network', 'User Engagement'],
        },
      },
      {
        id: 'marketing',
        label: 'Marketing/Acquisition',
        planned: 5,
        description: 'Channels, referral tiers',
        taxonomyMatch: {
          feature_type: ['Acquisition Channel'],
        },
      },
    ],
  },
  {
    id: 'sms',
    label: 'SMS Data',
    categories: [
      {
        id: 'sms_all',
        label: 'SMS Features',
        planned: 100,
        description: 'Overdue, due reminders, inquiries, transactions',
        taxonomyMatch: {
          feature_type: ['SMS'],
        },
      },
    ],
  },
  {
    id: 'external',
    label: 'External Data',
    categories: [
      {
        id: 'bureau',
        label: 'Bureau',
        planned: null,
        description: 'Credit bureau data (CIBI, Experian, etc.)',
        taxonomyMatch: {
          primary_category: ['Bureau'],
        },
      },
      {
        id: 'cashflow',
        label: 'Cash Flow (Bank)',
        planned: null,
        description: 'Bank transaction data (Plaid, etc.)',
        taxonomyMatch: {
          primary_category: ['Cash Flow'],
        },
      },
    ],
  },
];

// Manipulation risk mapping
export const MANIPULATION_RISK = {
  low: {
    label: 'Low (Third-Party)',
    color: '#10b981',
    categories: ['Bureau', 'Cash Flow'],
  },
  medium: {
    label: 'Medium (On-Us)',
    color: '#f59e0b',
    categories: ['Device Data', 'Loan Activity'],
  },
  high: {
    label: 'High (Self-Reported)',
    color: '#ef4444',
    categories: ['User-Reported Data', 'Platform Data'],
  },
};

// Known gaps - factual data about missing features
export interface KnownGap {
  id: string;
  geo: string | 'All';
  category: string;
  current: number;
  description: string;
}

export const KNOWN_GAPS: KnownGap[] = [
  {
    id: 'ph_bureau',
    geo: 'PH',
    category: 'Bureau',
    current: 0,
    description: 'No bureau features - CIBI/LenderLink not integrated',
  },
  {
    id: 'india_cashflow',
    geo: 'India',
    category: 'Cash Flow',
    current: 4,
    description: 'Minimal bank data - mostly bureau-focused',
  },
  {
    id: 'ph_sms',
    geo: 'PH',
    category: 'SMS',
    current: 0,
    description: 'No SMS features in production',
  },
  {
    id: 'us_sms',
    geo: 'US',
    category: 'SMS',
    current: 0,
    description: 'No SMS features in production',
  },
  {
    id: 'mx_bureau',
    geo: 'MX',
    category: 'Bureau',
    current: 15,
    description: 'Limited bureau coverage',
  },
  {
    id: 'lenderlink',
    geo: 'All',
    category: 'LenderLink',
    current: 0,
    description: 'LenderLink features not tagged in taxonomy',
  },
];

// Geography order for consistent display
export const GEO_ORDER = ['India', 'MX', 'PH', 'US'];

// Category order for heatmap
export const CATEGORY_ORDER = [
  'Bureau',
  'Cash Flow',
  'Device Data',
  'Loan Activity',
  'Platform Data',
  'User-Reported Data',
];
