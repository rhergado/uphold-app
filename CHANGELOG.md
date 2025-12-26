# Changelog

All notable changes to the Uphold project.

---

## [2025-12-25] - Pre-Launch Bug Fixes & Cheat Code Update

### Changed
- **Cheat code updated from $0.07 to $5.55** to avoid conflicts with minimum $5 stake validation
  - Updated `app/api/create-payment-intent/route.ts` - Line 25: Detection logic now checks for `amount === 5.55`
  - Updated `app/test-create/page.tsx` - Line 180: Bypass logic now checks for `data.stake === 5.55`
  - Updated `app/test-create/page.tsx` - Line 29: Validation message updated to mention $5.55 test mode
  - Updated `app/api/process-refund/route.ts` - Line 68: Test mode detection now checks for `amount === 5.55`

### Fixed
- **HTML5 form validation blocking $5.55 decimal input**
  - Added `step="0.01"` to stake input field in `app/test-create/page.tsx` (Line 639)
  - This allows browser to accept decimal values like $5.55 instead of integer-only validation

- **Supabase query ambiguity in admin donations endpoint**
  - Fixed `app/api/admin/pending-donations/route.ts` (Lines 51-57)
  - Specified exact foreign key relationship: `payments!payments_commitment_id_fkey!inner`
  - Resolved PGRST201 error caused by multiple relationships between commitments and payments tables

- **Missing Next.js Link import**
  - Added `import Link from "next/link";` to `app/test-create/page.tsx` (Line 7)
  - Fixed runtime error: "Link is not defined"

### Database
- ✅ Migration `add_donation_tracking.sql` confirmed as already run successfully
  - Columns: `donation_processed_at`, `donation_processed_by`, `donation_batch_id`, `donation_receipt_url`, `donation_notes`
  - Indexes created for performance

- ✅ Created `admins` table in Supabase
  ```sql
  CREATE TABLE IF NOT EXISTS admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  ```

- ✅ Set admin access for robert.her.delgado@gmail.com
  - Updated `users` table: `is_admin = TRUE`
  - Inserted into `admins` table

### Testing
- ✅ $5.55 cheat code successfully tested and working
  - Creates simulated payment without real Stripe charge
  - Commitment appears in dashboard immediately
  - Shows "🎯 Test mode activated!" alert

- ✅ Admin dashboard now loading without errors
  - `/admin/donations` endpoint returning proper data
  - No more Supabase relationship ambiguity errors

---

## [Previous] - Initial MVP Features

### Added
- Manual charity donation processing system
- Multi-admin support with role-based access
- Email receipts via Resend (using `onboarding@resend.dev` for free tier)
- Stripe test mode integration for real payment flow
- Test mode cheat code for development without charges
- Admin dashboard for donation tracking and processing
- Commitment creation with periodic and one-time options
- Buddy verification, integrity mode, and app verification
- Fee breakdown system (5% success fee, 25% failure fee)
- Charity selection with multiple organizations

### Tech Stack
- Next.js 15.3.0 (App Router)
- Supabase (PostgreSQL database)
- Stripe (Test mode)
- Resend (Email service)
- TypeScript + Zod validation
- Tailwind CSS + shadcn/ui components

---

## Next Steps (Launch Week)

### Day 1 (Today) ✅
- [x] Database migration
- [x] Admin account setup
- [x] Fix admin dashboard errors
- [x] Fix cheat code validation
- [x] Test $5.55 commitment creation
- [ ] Test success flow (mark complete)
- [ ] Test failure flow (admin donations)

### Day 2 - Full Local Testing
- [ ] Test complete workflow with $5.55
- [ ] Test admin donation processing
- [ ] Test email receipts
- [ ] Test on mobile device

### Day 3 - Push to GitHub
- [ ] Create repository
- [ ] Push all code
- [ ] Verify .gitignore excludes .env.local

### Day 4 - Deploy to Vercel
- [ ] Import GitHub repo to Vercel
- [ ] Configure environment variables
- [ ] Test live deployment

### Day 5 - Final Testing & Launch
- [ ] Complete pre-launch checklist
- [ ] Final testing on production URL
- [ ] Go live! 🚀

---

## Known Issues & Limitations

### Current Limitations
- Staying in Stripe test mode until real users onboard
- Using Resend free tier (`onboarding@resend.dev`) - 100 emails/day limit
- Manual charity donation processing (no automated transfers yet)
- Solo testing only (no beta testers yet)

### Future Enhancements (Post-Launch)
- Activate Stripe production mode when ready
- Set up custom domain
- Automate charity donations with Stripe Connect
- Add automated email reminders for upcoming deadlines
- Implement community feed for public commitments
- Add analytics dashboard for admins

---

## Bug Fixes Applied

### Browser Validation Issues
**Problem:** HTML input with `type="number"` defaulting to `step="1"`, rejecting decimal values
**Solution:** Added explicit `step="0.01"` attribute to allow currency decimals

### Supabase Relationship Ambiguity
**Problem:** Multiple foreign keys between commitments and payments tables causing query errors
**Solution:** Use explicit relationship syntax: `payments!payments_commitment_id_fkey!inner`

### Runtime Import Errors
**Problem:** Next.js Link component used without import
**Solution:** Added `import Link from "next/link";` at top of file

---

## Version Notes

**Current Version:** MVP Pre-Launch (Free Tier)
**Target Launch:** End of this week
**Environment:** Development + Test Mode
**Cost:** $0 (all free tier services)
