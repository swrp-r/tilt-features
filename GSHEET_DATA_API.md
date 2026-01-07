# Google Sheets Data API Setup

This guide sets up a Google Apps Script to serve feature data from your Google Sheet.

## 1. Share Your Sheet with the Service Account

Add `marketmap-sheets-access@slackstack.iam.gserviceaccount.com` as a **Viewer** to your Google Sheet.

## 2. Create Apps Script

1. In your Google Sheet, go to **Extensions → Apps Script**
2. Delete any existing code and paste the following:

```javascript
// Code.gs - Serves feature data as JSON

const SHEET_NAME = 'Features'; // Change to your sheet name
const CACHE_TIME = 300; // 5 minutes

function doGet(e) {
  try {
    // Check cache first
    const cache = CacheService.getScriptCache();
    const cached = cache.get('features_json');

    if (cached) {
      return ContentService
        .createTextOutput(cached)
        .setMimeType(ContentService.MimeType.JSON);
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Sheet not found: ' + SHEET_NAME }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    // Convert to array of objects
    const features = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const feature = { id: i };

      for (let j = 0; j < headers.length; j++) {
        const key = headers[j].toString().toLowerCase().replace(/\s+/g, '_');
        let value = row[j];

        // Handle empty values
        if (value === '' || value === null || value === undefined) {
          value = null;
        }
        // Convert numbers
        else if (typeof value === 'number') {
          // Keep as number
        }
        // Convert strings
        else {
          value = value.toString().trim();
          if (value === '') value = null;
        }

        feature[key] = value;
      }

      // Only include rows with a feature_name
      if (feature.feature_name) {
        features.push(feature);
      }
    }

    const jsonOutput = JSON.stringify(features);

    // Cache the result
    cache.put('features_json', jsonOutput, CACHE_TIME);

    return ContentService
      .createTextOutput(jsonOutput)
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Clear cache manually if needed
function clearCache() {
  CacheService.getScriptCache().remove('features_json');
  Logger.log('Cache cleared');
}
```

## 3. Deploy as Web App

1. Click **Deploy → New deployment**
2. Click the gear icon and choose **Web app**
3. Configure:
   - **Description**: Tilt Features Data API
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Click **Deploy**
5. **Copy the Web App URL**

## 4. Configure the App

### For GitHub Actions (Production)

Add a repository secret:
- Name: `VITE_GSHEET_API_URL`
- Value: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`

Update `.github/workflows/deploy.yml`:
```yaml
- name: Build
  run: npm run build
  env:
    VITE_GSHEET_API_URL: ${{ secrets.VITE_GSHEET_API_URL }}
```

### For Local Development

Create `.env` file:
```
VITE_GSHEET_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

## 5. Expected Sheet Columns

Your Google Sheet should have these columns (header row):

| Column | Description |
|--------|-------------|
| model_name | Model name (e.g., "Boron", "Beryllium_1") |
| user_type | User segment |
| geo | Geography (e.g., "US", "MX", "PH", "India") |
| product_business | Product (e.g., "Core-CA", "Cash loans") |
| feature_name | Feature identifier |
| description | Feature description |
| primary_category | Main category (e.g., "Cash Flow", "Device Data") |
| feature_type | Type within category |
| feature_subtype | Subtype |
| feature_l3 | L3 classification |
| top_20_50 | Top ranking flag |
| shap_rank | SHAP importance rank |

## 6. Updating Data

When you update the Google Sheet:
1. Changes appear automatically (within 5 min cache)
2. Or run `clearCache()` in Apps Script to force refresh

## Troubleshooting

- **CORS errors**: Make sure "Who has access" is set to "Anyone"
- **Empty data**: Check SHEET_NAME matches your sheet tab name
- **Stale data**: Run `clearCache()` in Apps Script
