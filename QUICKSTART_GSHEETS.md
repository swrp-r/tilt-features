# Quick Setup: Google Sheets Integration

## 3-Step Setup (10 minutes)

### Step 1: Prepare Your Google Sheet

1. **Import your data** into Google Sheets
   - You can import `features_for_gsheets.csv`
   - Or paste your data directly

2. **Name the sheet tab** (default: `Features`)

3. **Verify columns** match these names:
   ```
   model_name, user_type, geo, product_business, feature_name,
   description, primary_category, feature_type, feature_subtype,
   feature_l3, top_20_50, shap_rank
   ```

### Step 2: Deploy Apps Script

1. In your Google Sheet, go to **Extensions → Apps Script**

2. **Delete any existing code** and paste this:

```javascript
const SHEET_NAME = 'Features'; // Change if your tab has a different name
const CACHE_TIME = 300; // 5 minutes

function doGet(e) {
  try {
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
    const features = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const feature = { id: i };

      for (let j = 0; j < headers.length; j++) {
        const key = headers[j].toString().toLowerCase().replace(/\s+/g, '_');
        let value = row[j];

        if (value === '' || value === null || value === undefined) {
          value = null;
        } else if (typeof value !== 'number') {
          value = value.toString().trim();
          if (value === '') value = null;
        }

        feature[key] = value;
      }

      if (feature.feature_name) {
        features.push(feature);
      }
    }

    const jsonOutput = JSON.stringify(features);
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

function clearCache() {
  CacheService.getScriptCache().remove('features_json');
  Logger.log('Cache cleared');
}
```

3. **Deploy:**
   - Click **Deploy → New deployment**
   - Choose **Web app**
   - Set **Execute as:** Me
   - Set **Who has access:** Anyone
   - Click **Deploy**
   - Click through the authorization prompts

4. **Copy the Web App URL** (looks like: `https://script.google.com/macros/s/ABC123.../exec`)

### Step 3: Add to GitHub

1. Go to your repository: **https://github.com/swrp-r/tilt-features/settings/secrets/actions**

2. Click **New repository secret**

3. Add:
   - **Name:** `VITE_GSHEET_API_URL`
   - **Value:** The Web App URL you copied (paste the full URL)

4. Click **Add secret**

5. **Push any change to trigger rebuild** (or manually trigger workflow)

That's it! Your app will now load data from Google Sheets.

## How It Works

- **Google Sheets:** Your source of truth, edit anytime
- **Apps Script:** Converts sheet data to JSON format
- **GitHub Actions:** Builds app with the API URL
- **Live Site:** Fetches data from your sheet (cached for 5 min)

## Updating Data

Just edit your Google Sheet! Changes appear within 5 minutes (or run `clearCache()` in Apps Script to force refresh).

## Fallback

If Google Sheets is unavailable, the app automatically falls back to the static `features.json` file.

## Testing Locally

Create `.env` file in project root:
```
VITE_GSHEET_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

Then run: `npm run dev`

## Troubleshooting

**Problem:** App still shows old data
**Solution:** Run `clearCache()` in Apps Script editor

**Problem:** CORS errors
**Solution:** Make sure "Who has access" is set to "Anyone"

**Problem:** Empty data
**Solution:** Check `SHEET_NAME` matches your sheet tab name

**Problem:** Sheet data doesn't match
**Solution:** Verify column headers match expected names (lowercase with underscores)
