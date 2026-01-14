# Private Google Sheets Setup (Enterprise-Grade)

## Why Apps Script is Actually Secure

The Apps Script approach I provided is secure because:
- ✅ **Your sheet stays PRIVATE** (never shared publicly)
- ✅ Script runs with YOUR permissions (sees your private sheets)
- ✅ Only the JSON endpoint is public (not the sheet itself)
- ✅ No one can access your actual Google Sheet

## Troubleshooting Apps Script

What specifically went wrong? Common issues:

### Issue 1: "Authorization Required" Error
**Solution:**
1. In Apps Script editor, click **Run** (play button) on the `doGet` function
2. Click **Review permissions**
3. Click **Advanced** → **Go to [Project name] (unsafe)**
4. Click **Allow**

### Issue 2: Deployed URL Returns Error
**Test the URL:**
- Open the Web App URL in your browser
- You should see JSON output with your features
- If you see an error, check the error message

**Common fixes:**
- Make sure `SHEET_NAME = 'Features'` matches your actual tab name
- Check that your first row has column headers
- Verify you deployed as "Execute as: Me" and "Anyone can access"

### Issue 3: CORS Errors in the App
**Solution:**
The Apps Script automatically handles CORS, but make sure:
- "Who has access" is set to **Anyone** (this just means anyone can call the API endpoint, NOT that they can see your sheet)

---

## Option 2: Service Account (Most Secure & Professional)

This is the enterprise approach - no public Apps Script deployment.

### What You Need:
- Google Cloud Project (free)
- Service Account credentials
- Share sheet with service account email only

### Setup Steps:

#### Step 1: Create Service Account

1. **Go to Google Cloud Console:**
   - https://console.cloud.google.com/

2. **Create a new project** (or use existing)

3. **Enable Google Sheets API:**
   - Go to **APIs & Services → Library**
   - Search "Google Sheets API"
   - Click **Enable**

4. **Create Service Account:**
   - Go to **IAM & Admin → Service Accounts**
   - Click **Create Service Account**
   - Name: `tilt-features-viewer`
   - Click **Create and Continue**
   - Skip role assignment (click **Continue**)
   - Click **Done**

5. **Create Key:**
   - Click on the service account you just created
   - Go to **Keys** tab
   - Click **Add Key → Create new key**
   - Choose **JSON**
   - Click **Create**
   - **Save the JSON file** (this is your credentials)

6. **Copy the service account email:**
   - Looks like: `tilt-features-viewer@project-name.iam.gserviceaccount.com`

#### Step 2: Share Sheet with Service Account

1. **Open your Google Sheet**

2. **Click Share button**

3. **Add the service account email** (the one you copied)
   - Set permission to **Viewer**
   - Uncheck "Notify people"
   - Click **Share**

**Important:** Your sheet is now ONLY shared with:
- You (owner)
- The service account (which only you control)
- Any specific team members you explicitly add

#### Step 3: Add Credentials to GitHub

1. **Open the JSON credentials file** you downloaded

2. **Copy the ENTIRE contents** of the file

3. **Go to GitHub:**
   - https://github.com/swrp-r/tilt-features/settings/secrets/actions

4. **Add TWO secrets:**

   **Secret 1:**
   - Name: `GOOGLE_SERVICE_ACCOUNT_KEY`
   - Value: Paste the entire JSON content

   **Secret 2:**
   - Name: `VITE_GSHEET_ID`
   - Value: Your spreadsheet ID (from the URL)
     - Example: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

#### Step 4: Update Build Process

I'll need to update the code to:
1. Use the service account credentials during build
2. Fetch data from Sheets API at build time
3. Generate the static JSON file with your private data

This means:
- ✅ Sheet stays completely private
- ✅ Data is fetched securely during GitHub Actions build
- ✅ Published site contains static JSON (fast, no API calls)
- ✅ No credentials exposed to browsers

---

## Comparison

| Method | Sheet Privacy | Setup Time | Best For |
|--------|---------------|------------|----------|
| **Apps Script** | Private (only endpoint is public) | 5 min | Quick setup, real-time data |
| **Service Account** | Fully Private | 15 min | Enterprise, build-time data |

---

## My Recommendation

**Try Apps Script first:**
- Tell me exactly what error you're seeing
- It's actually secure (your sheet stays private)
- Easiest to set up

**If you need fully private endpoint too:**
- Use Service Account method
- I'll update the build process to fetch data at deploy time
- Sheet + endpoint both stay private

---

## Which do you prefer?

1. **Fix the Apps Script issue** (tell me what error you got)
2. **Set up Service Account** (I'll implement the build-time fetch)
3. **Something else?**
