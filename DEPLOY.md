# 🚀 Deploy to Vercel (Free)

**Time Required:** 15 minutes
**Cost:** $0 (Free tier)

---

## Quick Deploy Steps

### 1. Push to GitHub (5 min)

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Create commit
git commit -m "Ready for launch - Manual donation processing + Stripe payments"

# Create GitHub repo and push
# Go to github.com → New Repository → "uphold"
# Then:
git remote add origin https://github.com/YOUR_USERNAME/uphold.git
git branch -M main
git push -u origin main
```

---

### 2. Deploy to Vercel (5 min)

1. Go to https://vercel.com
2. Sign up with GitHub (free)
3. Click "Import Project"
4. Select your `uphold` repo
5. Configure:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (leave default)
   - **Build Command:** `next build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)

6. Click "Deploy" (don't add env vars yet)
7. Wait ~2 minutes for build

---

### 3. Add Environment Variables (5 min)

After first deploy:

1. Go to Project Settings → Environment Variables
2. Add these (copy from `.env.local`):

```bash
# Required for Production
NEXT_PUBLIC_SUPABASE_URL=https://wqijjyxcykuezpxcplvf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxaWpqeXhjeWt1ZXpweGNwbHZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MTI3NjgsImV4cCI6MjA4MjE4ODc2OH0.ecBiPPX83GZQQjyYi0cxbeMAg7fZTc1pUPqajwBSE5M
STRIPE_SECRET_KEY=sk_test_51Si4yx0uu1nwle1isrw2afkR7LA0JItCs6LKn2E8NdhoDl8DPAQ2zarGj0ZnMaThWTtLdXRuQOBLRElN0mT1tl9500M4Z4ZmoE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51Si4yx0uu1nwle1i7ilxXIArB7RRIbRSKPmFXcL0iiHDBft4hyOfcD1VOCTAhPsk1jL4COv82J6wknHr5MAkKalP00a2PbrKav
RESEND_API_KEY=re_5AK4eX2A_65HUu9ZQBr41mbhJjhCbjVQa
CRON_SECRET=uphold_cron_secret_key_2025
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**IMPORTANT:** Update `NEXT_PUBLIC_APP_URL` with your actual Vercel URL after deploy!

3. Click "Save"
4. Go to Deployments tab
5. Click "Redeploy" → "Redeploy" (to apply env vars)

---

## Your App is Live! 🎉

**URL:** `https://uphold-xxxxx.vercel.app` (Vercel provides this)

---

## First Things to Test

1. **Visit your URL**
2. **Sign up** with your email
3. **Create commitment** with $0.07 stake
4. **Verify** test mode works
5. **Check admin dashboard** at `/admin/donations`

---

## Common Issues & Fixes

### Build Failed
**Problem:** TypeScript errors or missing dependencies
**Fix:**
```bash
npm run build
# Fix any errors shown
git add .
git commit -m "Fix build errors"
git push
```

### Environment Variables Not Working
**Problem:** App can't connect to Supabase/Stripe
**Fix:**
- Double-check all env vars copied correctly
- Redeploy after adding env vars
- Check Vercel deployment logs

### "Module not found" Error
**Problem:** Missing dependency
**Fix:**
```bash
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

---

## Post-Deploy Updates

**To update your live site:**

```bash
# Make changes locally
# Test with: npm run dev

# When ready:
git add .
git commit -m "Your update message"
git push

# Vercel auto-deploys! Wait ~2 min
```

---

## Free Tier Limits

**Vercel:**
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Custom domain (optional)

**What happens if you exceed?**
- Nothing! Vercel just stops serving until next month
- Very unlikely with MVP traffic

---

## When to Upgrade to Stripe Production

**Stay in test mode until:**
- You have 5+ users interested
- You've tested full flow with $0.07
- You're ready to handle real money

**Then:**
1. Complete Stripe business verification
2. Get production API keys
3. Update env vars in Vercel
4. Test with real $5 payment yourself
5. Enable for users

---

## Monitoring Your App

**Vercel Dashboard:**
- View deployment logs
- See bandwidth usage
- Monitor errors

**Supabase Dashboard:**
- View database records
- Monitor API usage
- Check logs

**Resend Dashboard:**
- View sent emails
- Check delivery status
- Monitor usage (100/day limit)

---

## Quick Reference

**Your Live URLs:**
- **App:** `https://uphold-xxxxx.vercel.app`
- **Admin:** `https://uphold-xxxxx.vercel.app/admin/donations`
- **Supabase:** https://wqijjyxcykuezpxcplvf.supabase.co
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Resend Dashboard:** https://resend.com/emails

---

## Emergency Rollback

**If something breaks:**

1. Go to Vercel → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"
4. Your app is back to working state

---

**That's it! Your app is deployed and ready to use.** 🚀
