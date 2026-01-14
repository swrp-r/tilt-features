# Feature Taxonomy Viewer

A web application for exploring and managing ML model feature taxonomies. Built with React, TypeScript, and Tailwind CSS. Deployed on GitHub Pages.

## Features

- **Explore 2,086 ML features** across 4 geographies (India, MX, PH, US)
- **Multi-dimensional filtering** by Category, Type, Subtype, L3, Geography, and Product
- **Full-text search** across feature names and descriptions
- **Taxonomy tree** with hierarchical counts
- **Gap Analysis** to identify missing features across markets and products
- **Summary Dashboard** with category distribution and taxonomy hierarchy

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
feature-taxonomy-viewer/
├── client/
│   ├── index.html
│   └── src/
│       ├── App.tsx              # Main app component
│       ├── components/
│       │   ├── Header.tsx       # Top header with stats
│       │   ├── filters/         # Filter UI components
│       │   ├── features/        # Feature table & detail
│       │   ├── taxonomy/        # Sidebar tree
│       │   ├── gaps/            # Gap analysis dashboard
│       │   ├── summary/         # Summary view
│       │   └── definitions/     # Credit definitions
│       ├── hooks/               # React hooks
│       ├── lib/                 # Utilities
│       └── types/               # TypeScript types
├── public/
│   └── data/
│       └── features.json        # Feature data (2,086 records)
├── .github/workflows/
│   └── deploy.yml               # GitHub Pages deployment
└── GSHEET_DATA_API.md           # Google Sheets data integration
```

## Data Schema

Each feature has:
- `id` - Unique identifier
- `geo` - Geography (India, MX, PH, US)
- `product_business` - Product line
- `feature_name` - Technical feature name
- `description` - Human-readable description
- `primary_category` - Top-level category (6 categories)
- `feature_type` - Type classification (14 types)
- `feature_subtype` - Subtype (54 subtypes)
- `feature_l3` - Granular category (93 L3 values)

## Data Source

The app supports two data sources:
- **Static JSON** (default): Features loaded from `public/data/features.json`
- **Google Sheets** (optional): Live data from a Google Sheet via Apps Script

See `GSHEET_DATA_API.md` for Google Sheets integration setup.

## Deployment

### GitHub Pages (Automatic)

Push to `main` branch triggers automatic deployment via GitHub Actions.

### Manual Build

```bash
npm run build
cp -r public/data dist/
# Upload dist/ to any static hosting
```

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **TanStack Query** for data fetching
- **Lucide React** for icons

## License

MIT
