# Google Apps Script Setup for Change Proposals

This guide explains how to set up the Google Apps Script backend that receives change proposals from the Feature Taxonomy Viewer.

## 1. Create a Google Sheet

1. Create a new Google Sheet (or use an existing one)
2. Rename the first sheet to `Change_Requests`
3. Add these column headers in row 1:
   - A: `request_id`
   - B: `timestamp`
   - C: `feature_id`
   - D: `feature_name`
   - E: `field_changed`
   - F: `old_value`
   - G: `new_value`
   - H: `proposer_name`
   - I: `proposer_email`
   - J: `comment`
   - K: `status`
   - L: `reviewer_notes`
   - M: `reviewed_at`

## 2. Create Apps Script

1. In your Google Sheet, go to **Extensions → Apps Script**
2. Delete any existing code and paste the following:

```javascript
// Code.gs

const SHEET_NAME = 'Change_Requests';

function doGet(e) {
  return ContentService.createTextOutput('Feature Taxonomy Change Request API - Use POST to submit changes');
}

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Sheet not found' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const data = JSON.parse(e.postData.contents);

    // Validate required fields
    const required = ['feature_id', 'feature_name', 'field_changed', 'proposer_name'];
    for (const field of required) {
      if (!data[field]) {
        return ContentService
          .createTextOutput(JSON.stringify({ error: `Missing required field: ${field}` }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    // Generate UUID
    const uuid = Utilities.getUuid();

    // Append row with all data
    sheet.appendRow([
      uuid,                              // request_id
      new Date().toISOString(),          // timestamp
      data.feature_id,                   // feature_id
      data.feature_name,                 // feature_name
      data.field_changed,                // field_changed
      data.old_value || '',              // old_value
      data.new_value || '',              // new_value
      data.proposer_name,                // proposer_name
      data.proposer_email || '',         // proposer_email
      data.comment || '',                // comment
      'pending',                         // status
      '',                                // reviewer_notes
      ''                                 // reviewed_at
    ]);

    // Log for debugging
    console.log(`New change proposal received: ${uuid} for feature ${data.feature_name}`);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, request_id: uuid }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error processing request:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Optional: Function to get pending proposals count
function getPendingCount() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const pending = data.filter(row => row[10] === 'pending').length;
  return pending;
}
```

## 3. Deploy as Web App

1. Click **Deploy → New deployment**
2. Click the gear icon next to "Select type" and choose **Web app**
3. Configure:
   - **Description**: Feature Taxonomy Change Requests
   - **Execute as**: Me
   - **Who has access**: Anyone (important for the form to work without auth)
4. Click **Deploy**
5. Authorize the app when prompted (click through the warnings)
6. **Copy the Web App URL** - you'll need this for the frontend

## 4. Configure the Frontend

### Option A: Environment Variable (Recommended for local development)

Create a `.env` file in the project root:

```
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

### Option B: Edit vite.config.ts (For production)

Update the `define` section in `vite.config.ts`:

```typescript
define: {
  __BASE_URL__: JSON.stringify('/feature-taxonomy-viewer/'),
  __APPS_SCRIPT_URL__: JSON.stringify('https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'),
},
```

## 5. Review Workflow

When you receive change proposals:

1. Open the Google Sheet
2. Filter column K (`status`) for "pending"
3. Review each proposal:
   - Check the reason in column J (`comment`)
   - Decide if the change makes sense
4. Update the status:
   - Change column K to `approved` or `rejected`
   - Add notes in column L (`reviewer_notes`)
   - Add timestamp in column M (`reviewed_at`)
5. If approved, manually update the feature in the main Features sheet or source Excel

## Tips

- Set up **conditional formatting** on the status column for visual clarity
- Create a **pivot table** to see proposals by status
- Set up **email notifications** using Apps Script triggers for new proposals
- Keep the **source Excel** as the master and periodically re-export to JSON
