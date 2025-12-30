# 📋 Manual Charity Donation Processing Guide

**Last Updated:** December 25, 2025
**Feature:** Admin-driven manual charity donation workflow
**Purpose:** Process charity donations from failed commitments when admin is ready, then auto-send receipts to users

---

## Overview

Uphold uses a **manual donation processing workflow** where:
1. Users who fail commitments have their stakes automatically marked for donation (75% to charity, 25% platform fee)
2. Donations remain in "pending" status until admin manually processes them
3. Admin processes donations whenever they feel like it (no fixed schedule)
4. When admin uploads charity receipt, affected users automatically receive email with receipt link

---

## Quick Start Guide for Admins

### Step 1: View Pending Donations
1. Go to [/admin/donations](/admin/donations)
2. Click "Pending" tab to see donations awaiting processing
3. Donations are grouped by charity with totals

### Step 2: Select Donations to Process
- **Individual selection:** Click checkboxes next to specific donations
- **Select all for one charity:** Click "Select All" button in charity group header
- **Select everything:** Click "Select All" checkbox in top action bar

### Step 3: Manually Make Charity Donation
- Export CSV of selected donations for your records (optional)
- Go to charity website and make donation manually
- Save/upload the charity receipt to Google Drive or similar

### Step 4: Mark as Processed
1. Click "Mark as Processed (X)" button
2. Enter **Batch ID** (e.g., "2025-12-monthly" or "Red-Cross-Dec-2025")
3. Enter **Receipt URL** (link to uploaded charity receipt)
4. Add optional notes
5. Click "Mark as Processed & Send Receipts"

### Step 5: Automatic Receipt Emails
- System automatically sends personalized receipt email to each affected user
- Email includes donation details, charity receipt link, and encouragement
- Users see breakdown of their failed commitment

---

## Database Schema

### Payments Table - New Columns

The migration `database_migrations/add_donation_tracking.sql` adds these columns:

```sql
-- Tracks manual donation processing
donation_processed_at TIMESTAMP        -- When admin processed donation
donation_processed_by VARCHAR(255)     -- Admin email who processed
donation_batch_id VARCHAR(100)         -- Batch ID for grouping
donation_receipt_url TEXT              -- URL to charity receipt
donation_notes TEXT                    -- Admin notes
```

**Query Examples:**

```sql
-- Find pending donations (not yet processed by admin)
SELECT * FROM payments
WHERE status = 'donated'
  AND donation_processed_at IS NULL;

-- Find donations processed in a specific batch
SELECT * FROM payments
WHERE donation_batch_id = '2025-12-monthly';

-- Find all donations processed by a specific admin
SELECT * FROM payments
WHERE donation_processed_by = 'admin@uphold.com';
```

---

## API Endpoints

### 1. GET /api/admin/pending-donations

**Purpose:** Fetch all failed commitments and their donation status

**Headers:**
```json
{
  "x-user-id": "user_abc123"
}
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "donations": [
    {
      "id": "commitment_123",
      "payment_id": "payment_456",
      "user_id": "user_789",
      "user_email": "user@example.com",
      "goal": "Exercise 5 days a week",
      "stake": 10.00,
      "charity": "american-red-cross",
      "charity_donation_amount": 7.50,
      "platform_fee_amount": 2.50,
      "status": "failed",
      "due_date": "2025-12-20T00:00:00Z",
      "failed_at": "2025-12-15T10:30:00Z",
      "donation_processed_at": null,
      "donation_batch_id": null,
      "donation_receipt_url": null
    }
  ]
}
```

---

### 2. POST /api/admin/mark-donations-processed

**Purpose:** Mark selected donations as manually processed by admin

**Request Body:**
```json
{
  "paymentIds": ["payment_123", "payment_456", "payment_789"],
  "adminEmail": "admin@uphold.com",
  "batchId": "2025-12-monthly",
  "receiptUrl": "https://drive.google.com/file/d/abc123/view",
  "notes": "Donated via Red Cross website, confirmation #12345"
}
```

**Response:**
```json
{
  "success": true,
  "processedCount": 3,
  "batchId": "2025-12-monthly",
  "adminEmail": "admin@uphold.com",
  "message": "Successfully marked 3 donation(s) as processed"
}
```

**Database Changes:**
- Sets `donation_processed_at` to current timestamp
- Sets `donation_processed_by` to admin email
- Sets `donation_batch_id`, `donation_receipt_url`, `donation_notes`

---

### 3. POST /api/admin/send-donation-receipts

**Purpose:** Send donation receipt emails to users for processed donations

**Request Body (Option 1 - by payment IDs):**
```json
{
  "paymentIds": ["payment_123", "payment_456"],
  "adminEmail": "admin@uphold.com"
}
```

**Request Body (Option 2 - by batch ID):**
```json
{
  "batchId": "2025-12-monthly",
  "adminEmail": "admin@uphold.com"
}
```

**Response:**
```json
{
  "success": true,
  "totalProcessed": 3,
  "successCount": 3,
  "failureCount": 0,
  "failures": [],
  "message": "Successfully sent 3 donation receipt email(s)"
}
```

**Email Template Used:** `getDonationReceiptEmail()` from [lib/email-templates.ts](lib/email-templates.ts)

---

## Email Template

The donation receipt email includes:

**Subject:** `Your $7.50 donation receipt - American Red Cross`

**Content:**
- Header with Uphold branding
- Donation details table:
  - Original commitment
  - Original stake
  - Donation amount (75%)
  - Charity name
  - Donation date
  - Batch ID
- **"View Official Receipt" button** (links to uploaded receipt URL)
- Explanation of what happened
- Breakdown of fees
- Encouragement to try again

**Design:** Professional HTML email with inline styles for compatibility

---

## Admin Dashboard Features

### Pending vs Processed Tabs
- **Pending:** Shows donations not yet processed by admin (default view)
- **Processed:** Shows historical donations with batch IDs and receipt links

### Summary Cards
- **Total Donations:** Sum of all donation amounts
- **Platform Fees:** Sum of all platform fees (25%)
- **Charities:** Count of unique charities

### Grouping by Charity
- Donations automatically grouped by charity
- Each group shows count and total amount
- "Select All" button for each charity group

### Batch Selection
- Checkboxes for individual selection
- "Select All" for entire list
- Selection counter in action bar

### Export to CSV
- Downloads selected donations as CSV
- Includes: User Email, Goal, Charity, Amounts, Dates
- Filename: `donations-pending-2025-12-25.csv`

### Batch Processing Modal
- Input fields for Batch ID, Receipt URL, Notes
- Validation: Batch ID and Receipt URL required
- Processing indicator during API calls
- Auto-refreshes list after processing

---

## Workflow Example

### Scenario: Admin processes December monthly donations

**December 25, 2025:**

1. **Admin reviews pending donations**
   - Goes to `/admin/donations`
   - Sees 15 pending donations totaling $112.50
   - 3 charities: Red Cross ($75), ASPCA ($22.50), St. Jude ($15)

2. **Admin decides to process Red Cross donations**
   - Clicks "Select All" for Red Cross group (10 donations)
   - Exports CSV for records

3. **Admin makes manual donation**
   - Goes to RedCross.org
   - Donates $75 via their website
   - Receives confirmation email with receipt
   - Uploads receipt PDF to Google Drive
   - Gets shareable link: `https://drive.google.com/file/d/xyz789/view`

4. **Admin marks as processed**
   - Clicks "Mark as Processed (10)" button
   - Enters:
     - Batch ID: `Red-Cross-Dec-2025`
     - Receipt URL: `https://drive.google.com/file/d/xyz789/view`
     - Notes: `Donated via RedCross.org, confirmation #ABC123456`
   - Clicks "Mark as Processed & Send Receipts"

5. **System sends receipt emails**
   - Automatically sends 10 personalized emails
   - Each user gets:
     - Their specific commitment details
     - Link to charity receipt
     - Encouragement to try again

6. **Result**
   - 10 donations move to "Processed" tab
   - 5 donations remain in "Pending" (other charities)
   - Users receive transparency and closure

---

## Best Practices

### For Admins

**Batch Processing:**
- Group donations by charity to minimize donation fees
- Process monthly or when total reaches meaningful amount
- Use consistent batch ID format (e.g., `CharityName-Month-Year`)

**Receipt Storage:**
- Upload charity receipts to Google Drive
- Set link sharing to "Anyone with link can view"
- Keep organized folder structure (e.g., `/Charity Receipts/2025/December/`)

**Batch ID Naming:**
- Include charity and date: `Red-Cross-Dec-2025`
- Or use time period: `2025-12-monthly`
- Keep consistent format for easy searching

**Notes Field:**
- Include charity confirmation number
- Note donation method (website, check, wire)
- Add any special circumstances

### For Users

**What to Expect:**
- If you fail a commitment, 75% goes to your chosen charity
- You won't receive receipt immediately
- Admin processes donations on their schedule
- **When admin uploads receipt, you get email automatically**
- Email includes link to official charity receipt

---

## Testing

### Testing Cheat Code Flow

1. **Create test commitment with $0.07 stake**
   - Uses simulated payment (no real charge)
   - Can mark as failed to generate donation

2. **Process test donation**
   - Select in admin dashboard
   - Use test batch ID: `TEST-2025-12`
   - Use test receipt URL: `https://example.com/test-receipt.pdf`
   - Verify email sends correctly

3. **Check processed view**
   - Switch to "Processed" tab
   - Verify batch ID and receipt link appear
   - Click receipt link to test URL

### Production Testing

1. **Real commitment fails**
   - Wait for commitment deadline to pass
   - System auto-marks as failed
   - Payment status changes to "donated"
   - Appears in "Pending" tab

2. **Admin processes for real**
   - Makes actual donation to charity
   - Uploads real receipt
   - Marks as processed with real batch ID
   - User receives real email

---

## Database Migration

**Run this migration before using the feature:**

```bash
psql -h your-db-host -U postgres -d uphold < database_migrations/add_donation_tracking.sql
```

**Or via Supabase SQL Editor:**
- Copy contents of `database_migrations/add_donation_tracking.sql`
- Paste into Supabase SQL Editor
- Run query

**Verify migration:**
```sql
-- Check new columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'payments'
  AND column_name LIKE 'donation%';
```

---

## File Reference

### API Routes
- [app/api/admin/pending-donations/route.ts](app/api/admin/pending-donations/route.ts) - Fetch donations
- [app/api/admin/mark-donations-processed/route.ts](app/api/admin/mark-donations-processed/route.ts) - Mark as processed
- [app/api/admin/send-donation-receipts/route.ts](app/api/admin/send-donation-receipts/route.ts) - Send receipt emails
- [app/api/process-donation/route.ts](app/api/process-donation/route.ts) - Auto-mark failed commitments

### Frontend
- [app/admin/donations/page.tsx](app/admin/donations/page.tsx) - Admin dashboard UI

### Libraries
- [lib/email-templates.ts](lib/email-templates.ts) - Email templates (includes `getDonationReceiptEmail()`)
- [lib/charities.ts](lib/charities.ts) - Charity metadata

### Database
- [database_migrations/add_donation_tracking.sql](database_migrations/add_donation_tracking.sql) - Schema changes

---

## Security Notes

### Admin Authentication
- All endpoints verify `is_admin` flag on user
- Endpoints check admin email against `admins` table
- Only active admins can process donations

### Receipt URL Validation
- URLs must be provided before marking as processed
- Users can only see receipt URL (cannot edit)
- Receipt URLs are logged with admin email

### Audit Trail
- All processing tracked with:
  - Admin email
  - Timestamp
  - Batch ID
  - Notes
- Cannot be modified after processing

---

## Frequently Asked Questions

### Q: How often should I process donations?
**A:** Whenever you feel like it. There's no fixed schedule. Process when:
- Total amount reaches a meaningful threshold ($50+)
- End of month for clean record-keeping
- Enough donations to one charity to minimize fees

### Q: What if I forget to upload receipt?
**A:** The system requires receipt URL before marking as processed. Modal won't submit without it.

### Q: Can I process donations for different charities at once?
**A:** Yes, but you'll need separate charity receipts. Better to process one charity at a time.

### Q: What if user email bounces?
**A:** Email failures are logged in API response. Check console or logs. User won't get receipt but donation is still processed.

### Q: Can I undo processing?
**A:** Not through UI. Would require direct database edit to set `donation_processed_at` back to NULL. Generally not recommended - add notes instead.

### Q: Where should I store receipts?
**A:** Google Drive (recommended), Dropbox, or any file hosting with shareable links. Make sure link doesn't expire.

---

## Future Enhancements

### Potential Improvements
- [ ] Automated charity donation via Stripe Connect
- [ ] Integration with charity APIs (PayPal Giving Fund)
- [ ] Scheduled batch processing (auto-process monthly)
- [ ] Receipt upload directly in UI (file storage)
- [ ] Analytics dashboard for donation impact
- [ ] Tax-deductible receipt generation
- [ ] User notification when donations pending (transparency)

---

## Support

For questions about manual donation processing:
- **Email:** support@upholdmyword.org
- **Documentation:** This file + `CHEAT_CODE_DOCUMENTATION.md`
- **Code Reference:** See "File Reference" section above

---

**Documentation Version:** 1.0
**Last Reviewed:** December 25, 2025
