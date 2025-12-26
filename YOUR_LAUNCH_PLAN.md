# 🎯 Your Week-Long Launch Plan

**Goal:** Launch Uphold by end of this week
**Budget:** $0 (Free tier everything)
**Users:** Solo launch (just you testing)

---

## Day 1 (Today): Database Setup ✅

### Morning (30 min)

**1. Run Database Migration**
1. Go to: https://wqijjyxcykuezpxcplvf.supabase.co
2. Click "SQL Editor"
3. Paste and run:
```sql
-- Add donation tracking columns
ALTER TABLE payments
ADD COLUMN donation_processed_at TIMESTAMP,
ADD COLUMN donation_processed_by VARCHAR(255),
ADD COLUMN donation_batch_id VARCHAR(100),
ADD COLUMN donation_receipt_url TEXT,
ADD COLUMN donation_notes TEXT;

-- Create indexes
CREATE INDEX idx_payments_donation_status ON payments(status, donation_processed_at);
CREATE INDEX idx_payments_donation_batch ON payments(donation_batch_id);
```

**2. Set Admin Account**
```sql
-- Make yourself admin
UPDATE users SET is_admin = TRUE
WHERE email = 'robert.her.delgado@gmail.com';

-- Add to admins table
INSERT INTO admins (email, is_active)
VALUES ('robert.her.delgado@gmail.com', TRUE)
ON CONFLICT (email) DO NOTHING;
```

**3. Verify**
- Log out of app
- Log back in
- Should see orange "Admin" button

---

## Day 2: Local Testing ✅

### Morning (1 hour)

**Test Success Flow ($0.07 stake):**
1. Create new test user account
2. Create commitment with $0.07 stake
3. Alert should say "🎯 Test mode activated!"
4. Commitment appears in dashboard immediately
5. Mark as complete
6. See success message with refund breakdown

**Test Failure Flow:**
1. Create another $0.07 commitment
2. Let it "fail" (manually or wait)
3. Go to `/admin/donations`
4. Should see in "Pending" tab

**Test Admin Donation Processing:**
1. Select the failed donation
2. Click "Mark as Processed"
3. Enter:
   - Batch ID: `TEST-2025-12`
   - Receipt URL: `https://example.com/receipt.pdf`
4. Click "Mark as Processed & Send Receipts"
5. Check your email for receipt
6. Verify email looks good

### Afternoon (1 hour)

**Test on Mobile:**
1. Access http://192.168.12.111:3002 on your phone
2. Sign up
3. Create commitment with $0.07
4. Verify everything works
5. Check admin dashboard on mobile

**If anything breaks:** Fix it now before deploying

---

## Day 3: Push to GitHub ✅

### 30 minutes

```bash
# In your project folder
git init
git add .
git commit -m "Launch ready: Manual donations + Stripe payments + $0.07 cheat code"

# Create repo on github.com
# Then:
git remote add origin https://github.com/YOUR_USERNAME/uphold.git
git branch -M main
git push -u origin main
```

---

## Day 4: Deploy to Vercel ✅

### Morning (1 hour)

**1. Deploy (15 min)**
1. Go to https://vercel.com
2. Sign up with GitHub
3. Import your `uphold` repo
4. Click "Deploy"
5. Wait for build

**2. Add Environment Variables (15 min)**

In Vercel Project Settings → Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL=https://wqijjyxcykuezpxcplvf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxaWpqeXhjeWt1ZXpweGNwbHZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MTI3NjgsImV4cCI6MjA4MjE4ODc2OH0.ecBiPPX83GZQQjyYi0cxbeMAg7fZTc1pUPqajwBSE5M
STRIPE_SECRET_KEY=sk_test_51Si4yx0uu1nwle1isrw2afkR7LA0JItCs6LKn2E8NdhoDl8DPAQ2zarGj0ZnMaThWTtLdXRuQOBLRElN0mT1tl9500M4Z4ZmoE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51Si4yx0uu1nwle1i7ilxXIArB7RRIbRSKPmFXcL0iiHDBft4hyOfcD1VOCTAhPsk1jL4COv82J6wknHr5MAkKalP00a2PbrKav
RESEND_API_KEY=re_5AK4eX2A_65HUu9ZQBr41mbhJjhCbjVQa
CRON_SECRET=uphold_cron_secret_key_2025
NEXT_PUBLIC_APP_URL=https://your-actual-vercel-url.vercel.app
```

**3. Redeploy (5 min)**
- Go to Deployments → Redeploy
- Wait for new deployment

**4. Test Live Site (25 min)**
- Visit your Vercel URL
- Sign up with your email
- Create $0.07 commitment
- Test everything again on live site
- Test admin dashboard

---

## Day 5: Final Testing & Launch ✅

### Morning (2 hours)

**Run Full Checklist:**
Go through `PRE_LAUNCH_CHECKLIST.md` step by step

**Key things to verify:**
- ✅ Sign up works
- ✅ $0.07 test mode works
- ✅ Admin dashboard accessible
- ✅ Donation processing works
- ✅ Emails send correctly
- ✅ Mobile works
- ✅ No console errors

### Afternoon: YOU'RE LIVE! 🎉

**Your app is now deployed at:** `https://uphold-xxxxx.vercel.app`

**What to do next:**
1. Share link with yourself
2. Test as a real user
3. Monitor for any issues
4. Celebrate! 🎊

---

## Post-Launch Week 1

### Things to Monitor Daily:

**Vercel:**
- Check deployment logs
- Monitor for errors
- Check bandwidth usage

**Supabase:**
- Check for database errors
- Monitor API usage
- Verify data looks correct

**Resend:**
- Check email delivery
- Monitor daily usage (100/day limit)
- Check spam folder

### When to Activate Stripe Production:

**Don't rush!** Stay in test mode until:
- You've tested everything thoroughly with $0.07
- You have real users interested
- You're confident everything works
- You're ready to handle real money

**Then:**
1. Complete Stripe business verification (takes 1-2 days)
2. Get production API keys
3. Update Vercel environment variables
4. Test with real $5 payment yourself first
5. Enable for users

---

## Troubleshooting Quick Reference

### App not loading
1. Check Vercel deployment logs
2. Verify environment variables are set
3. Try redeploying

### Can't log in as admin
1. Check Supabase: `SELECT * FROM users WHERE email = 'robert.her.delgado@gmail.com'`
2. Verify `is_admin = TRUE`
3. Verify exists in `admins` table
4. Clear browser cache, try again

### Emails not sending
1. Check Resend dashboard
2. Verify API key is correct
3. Check daily limit (100/day)
4. Verify "from" address is `onboarding@resend.dev`

### Database errors
1. Check Supabase logs
2. Verify migration ran successfully
3. Check table structure matches expected

---

## Your Free Tier Status

**Current Usage:**
- **Vercel:** 0% (just deployed)
- **Supabase:** Minimal (just testing)
- **Resend:** ~5 emails sent (testing)
- **Stripe:** Test mode, $0

**Limits:**
- **Vercel:** 100 GB/month bandwidth (plenty)
- **Supabase:** 500 MB database, 2 GB bandwidth (plenty)
- **Resend:** 100 emails/day, 3,000/month (enough for manual donations)
- **Stripe:** Unlimited in test mode

**You're good for months of testing!** 🚀

---

## Next Session Checklist

**If you start a new coding session, remember:**

1. ✅ Database migration already run
2. ✅ Admin account already set
3. ✅ Already deployed to Vercel
4. ✅ Environment variables already set
5. ✅ Resend already configured

**Just test and iterate!**

---

## When You're Ready to Scale

**If you get 10+ real users:**

1. **Activate Stripe Production**
   - Complete business verification
   - Update to production keys
   - Test with real $5 payment

2. **Consider Custom Domain**
   - Buy domain (e.g., uphold.com)
   - Add to Vercel (still free)
   - Configure email from your domain

3. **Monitor Closely**
   - Check errors daily
   - Respond to user issues quickly
   - Keep database backups

4. **Optional Upgrades** (when revenue justifies):
   - Vercel Pro: $20/month (better performance)
   - Resend paid plan: $20/month (unlimited emails)
   - Sentry: $26/month (error monitoring)

**But for now: FREE TIER IS PERFECT!** 🎯

---

## Summary: Your To-Do This Week

**Day 1 (30 min):** Run database migration, set admin
**Day 2 (2 hours):** Local testing
**Day 3 (30 min):** Push to GitHub
**Day 4 (1 hour):** Deploy to Vercel, test live
**Day 5 (2 hours):** Final testing, LAUNCH! 🚀

**Total Time:** ~6 hours spread over 5 days

**You got this!** 💪
