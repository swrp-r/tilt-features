# Alternative Ways to Connect Google Sheets

## Option 1: Published CSV (Simplest - 2 minutes)

This is the easiest method - no Apps Script needed!

### Setup Steps:

1. **In your Google Sheet:**
   - Click **File → Share → Publish to web**
   - Select the specific sheet tab (e.g., "Features")
   - Choose **Comma-separated values (.csv)**
   - Click **Publish**
   - **Copy the URL** (looks like: `https://docs.google.com/spreadsheets/d/e/.../pub?gid=0&single=true&output=csv`)

2. **Add to GitHub:**
   - Go to: https://github.com/swrp-r/tilt-features/settings/secrets/actions
   - Add secret:
     - Name: `VITE_GSHEET_CSV_URL`
     - Value: The published CSV URL

3. **I'll update the code** to fetch and parse CSV instead of JSON

### Pros:
- ✅ Super simple (no Apps Script)
- ✅ Built-in Google Sheets feature
- ✅ Updates automatically when sheet changes

### Cons:
- ⚠️ CSV parsing needed (I'll add this)
- ⚠️ Anyone with URL can download your data

---

## Option 2: Google Sheets API (Public Sheet)

Use Google's official API with a public sheet.

### Setup Steps:

1. **Make your sheet public:**
   - Click **Share** button
   - Change "Restricted" to **Anyone with the link**
   - Set to "Viewer"

2. **Get your Spreadsheet ID:**
   - From the URL: `https://docs.google.com/spreadsheets/d/`**`SPREADSHEET_ID`**`/edit`
   - Example: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

3. **Get your Sheet GID:**
   - Click on the sheet tab at the bottom
   - Look at URL: `gid=`**`123456789`**
   - Or use `0` for the first sheet

4. **Add to GitHub:**
   - Go to: https://github.com/swrp-r/tilt-features/settings/secrets/actions
   - Add secret:
     - Name: `VITE_GSHEET_ID`
     - Value: Your spreadsheet ID (just the ID, not the full URL)

5. **I'll update the code** to use the Sheets API

### The API URL format:
```
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/gviz/tq?tqx=out:json&sheet=Features
```

### Pros:
- ✅ Official Google API
- ✅ No Apps Script needed
- ✅ Reliable and fast

### Cons:
- ⚠️ Sheet must be public
- ⚠️ Slightly different response format (I'll handle this)

---

## Option 3: Automated GitHub Sync (Most Robust)

Set up a GitHub Action that syncs from Google Sheets every hour.

### Setup Steps:

1. **Make sheet public** (same as Option 2)

2. **I'll create a GitHub Action** that:
   - Runs every hour (or on manual trigger)
   - Fetches data from Google Sheets
   - Converts to JSON
   - Commits to repo if changed
   - Triggers automatic deployment

### Pros:
- ✅ Data stored in repo (version control)
- ✅ Works even if Google Sheets is down
- ✅ Can review changes before they go live

### Cons:
- ⚠️ Delayed updates (hourly sync)
- ⚠️ More complex setup

---

## Which Should You Choose?

**For quick setup:** → **Option 1 (Published CSV)**
**For reliability:** → **Option 2 (Sheets API)**
**For version control:** → **Option 3 (GitHub Sync)**

Let me know which one you prefer and I'll implement it!

---

## Current Fallback

Remember: The app already has a fallback! If any of these fail, it uses the static `public/data/features.json` file.
