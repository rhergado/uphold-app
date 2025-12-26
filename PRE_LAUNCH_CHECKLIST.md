# 🚀 Pre-Launch Testing Checklist

**Target Launch:** This Week
**Mode:** Free tier, solo launch, test mode

---

## ✅ Database Setup

- [ ] Run migration in Supabase SQL Editor
  ```sql
  -- Copy from database_migrations/add_donation_tracking.sql
  ```
- [ ] Set admin account
  ```sql
  UPDATE users SET is_admin = TRUE WHERE email = 'robert.her.delgado@gmail.com';
  INSERT INTO admins (email, is_active) VALUES ('robert.her.delgado@gmail.com', TRUE);
  ```
- [ ] Verify admin access: Log out, log back in, see "Admin" button

---

## ✅ Core User Flow ($0.07 Test Mode)

- [ ] Sign up new account (use temp email)
- [ ] Create commitment with $0.07 stake
- [ ] Verify alert: "🎯 Test mode activated!"
- [ ] See commitment in dashboard as "Active"
- [ ] No payment page appeared (skipped)

---

## ✅ Success Path

- [ ] Mark commitment as complete
- [ ] See success alert with fee breakdown
- [ ] Verify status changed to "Completed"
- [ ] Check console: `[SIMULATED] Processing test refund`

---

## ✅ Failure Path

- [ ] Create commitment with $0.07 stake
- [ ] Wait for deadline to pass (or manually set past date in DB)
- [ ] System auto-marks as failed
- [ ] Go to `/admin/donations`
- [ ] See donation in "Pending" tab

---

## ✅ Admin Donation Processing

- [ ] Select pending donation
- [ ] Click "Mark as Processed"
- [ ] Enter batch ID: "TEST-2025-12"
- [ ] Enter receipt URL: "https://example.com/receipt.pdf"
- [ ] Click "Mark as Processed & Send Receipts"
- [ ] Check Resend dashboard for sent email
- [ ] Check your email inbox for receipt
- [ ] Verify email looks good (subject, content, receipt link)
- [ ] Switch to "Processed" tab
- [ ] Verify donation appears with batch ID

---

## ✅ Mobile Testing

- [ ] Access http://192.168.12.111:3002 on phone
- [ ] Sign up on mobile
- [ ] Create commitment on mobile
- [ ] Verify payment flow works
- [ ] Dashboard looks good
- [ ] All buttons clickable

---

## ✅ Security Basics

- [ ] Try accessing `/admin/donations` as non-admin → Should redirect
- [ ] Try accessing admin APIs without admin → Should return 403
- [ ] Passwords are hashed (check in Supabase users table)

---

## ✅ Deploy to Vercel

### Prepare Environment Variables

Create `.env.production` or configure in Vercel dashboard:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://wqijjyxcykuezpxcplvf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
STRIPE_SECRET_KEY=sk_test_51Si4yx... (keep test for now)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51Si4yx...
RESEND_API_KEY=re_5AK4eX2A_65HUu9ZQBr41mbhJjhCbjVQa
CRON_SECRET=uphold_cron_secret_key_2025
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Deploy Steps

- [ ] Push code to GitHub repo
- [ ] Connect to Vercel
- [ ] Add environment variables
- [ ] Deploy
- [ ] Test deployed site with $0.07 commitment
- [ ] Verify admin dashboard works

---

## ✅ Post-Launch Monitoring

- [ ] Share link with yourself, test as real user
- [ ] Monitor Vercel logs for errors
- [ ] Monitor Supabase for database errors
- [ ] Monitor Resend for email delivery

---

## 🚫 NOT Required for Launch (Can Wait)

- ❌ Row Level Security (RLS) - Can add later
- ❌ Production Stripe keys - Test mode fine for now
- ❌ Custom domain - Vercel subdomain works
- ❌ Error monitoring (Sentry) - Nice to have
- ❌ Email verification - Not critical for MVP
- ❌ Password reset - Can add later
- ❌ Rate limiting - Low traffic, not urgent
- ❌ Analytics - Can add later

---

## 💰 Free Tier Limits

**Vercel Free Tier:**
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Good for MVP

**Supabase Free Tier:**
- ✅ 500 MB database
- ✅ 2 GB bandwidth
- ✅ 50,000 monthly active users
- ✅ More than enough for launch

**Resend Free Tier:**
- ✅ 100 emails/day
- ✅ 3,000 emails/month
- ⚠️ Limited to 1 email per second
- ✅ Perfect for MVP with manual donations

**Stripe Test Mode:**
- ✅ Completely free
- ✅ Unlimited test transactions
- ✅ No real money processed
- ⚠️ Need to activate for real payments later

---

## 🎯 Launch Day Plan

1. **Morning:** Final testing with checklist above
2. **Afternoon:** Deploy to Vercel
3. **Evening:** Test deployed site, fix any issues
4. **Done!** App is live

---

## 🔄 When You Get First Real User

**Then you'll need to:**
1. Activate Stripe account (verify business)
2. Update to production Stripe keys
3. Test real $5+ payment yourself first
4. Monitor for issues

**Until then:** Keep test mode, use $0.07 for all testing

---

## 📞 Support Resources

**If something breaks:**
- Check Vercel deployment logs
- Check Supabase logs
- Check browser console
- Check Resend dashboard

**Quick fixes:**
- Redeploy on Vercel
- Clear browser cache
- Check environment variables

---

**Current Status:** Ready to test and deploy! 🚀
