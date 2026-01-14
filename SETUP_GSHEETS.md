# Google Sheets Integration Setup Guide

## Current Status

The app is **currently using static JSON** (`public/data/features.json`) for data. The Google Sheets integration is built into the code but not configured.

## What Needs to Be Done

To switch from static JSON to live Google Sheets data:

### 1. Create the Data Sheet

Create a Google Sheet with your feature data. Required columns:
- `model_name`
- `user_type`
- `geo`
- `product_business`
- `feature_name`
- `description`
- `primary_category`
- `feature_type`
- `feature_subtype`
- `feature_l3`
- `top_20_50`
- `shap_rank`

**Tip:** You can import your existing `features_for_gsheets.csv` into a Google Sheet.

### 2. Create Apps Script for Data API

1. Open your Google Sheet
2. Go to **Extensions → Apps Script**
3. Replace the code with the script from `GSHEET_DATA_API.md` (lines 14-96)
4. Update `SHEET_NAME` constant to match your sheet tab name (default: `'Features'`)
5. **Deploy as Web App:**
   - Click **Deploy → New deployment**
   - Choose **Web app**
   - Set **Execute as:** Me
   - Set **Who has access:** Anyone
   - Click **Deploy**
   - **Copy the Web App URL** (looks like: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`)

### 3. Create Apps Script for Change Proposals

1. In the same Google Sheet (or different), create a new tab called `Change_Requests`
2. Add column headers (see `GOOGLE_APPS_SCRIPT.md` lines 10-22)
3. Create a new Apps Script deployment for change requests:
   - Use the script from `GOOGLE_APPS_SCRIPT.md` (lines 29-102)
   - Deploy as Web App (same process as above)
   - **Copy this second Web App URL**

### 4. Configure GitHub Repository Secrets

Add these secrets to your GitHub repository:

1. Go to https://github.com/swrp-r/tilt-features/settings/secrets/actions
2. Click **New repository secret**
3. Add:
   - Name: `VITE_GSHEET_API_URL`
   - Value: Your data API URL from Step 2
4. Add another:
   - Name: `VITE_APPS_SCRIPT_URL`
   - Value: Your change proposals API URL from Step 3

### 5. Verify Deployment

The next time you push to `main`, GitHub Actions will:
1. Build the app with the Google Sheets API URLs
2. The app will fetch data from your Google Sheet instead of the static JSON
3. Change proposals will be logged to your `Change_Requests` sheet

## For Local Development

Create a `.env` file in the project root:

```env
VITE_GSHEET_API_URL=https://script.google.com/macros/s/YOUR_DATA_SCRIPT_ID/exec
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_CHANGES_SCRIPT_ID/exec
```

Then run `npm run dev` to test locally with live Google Sheets data.

## Data Update Workflow

Once set up:

1. **Update data:** Edit the Google Sheet → Changes appear in 5 minutes (or run `clearCache()` in Apps Script)
2. **Review proposals:** Check the `Change_Requests` tab → Approve/reject changes → Manually update the main sheet

## Current Fallback Behavior

The app has fallback logic:
- If `VITE_GSHEET_API_URL` is configured → Fetch from Google Sheets
- If that fails or is not configured → Load from `public/data/features.json`

So even after setting this up, if Google Sheets fails, users will see the static data.

## Excel Integration Alternative

If you prefer to work in Excel:

1. Keep the Excel file (`features_for_gsheets.csv`) as the source of truth
2. Import/paste into Google Sheets when you want to update the live site
3. Or write a script to sync Excel → Google Sheets automatically

## Testing Checklist

- [ ] Data API returns JSON array of features
- [ ] App loads and displays features from Google Sheets
- [ ] Change proposal form submits successfully
- [ ] Proposals appear in `Change_Requests` sheet
- [ ] Static JSON fallback works if Sheets is unavailable
