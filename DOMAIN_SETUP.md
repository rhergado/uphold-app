# Domain Setup Guide

**Domain:** upholdmygoal.com
**Brand Name:** Uphold
**Registrar:** (Where you purchased it)

---

## When to Set Up the Domain

**Wait until after initial launch!** Use the free Vercel subdomain first:
- Test everything on `uphold-xxxxx.vercel.app`
- Verify all features work in production
- Then add your custom domain

---

## Step 1: Add Domain to Vercel (When Ready)

### In Vercel Dashboard:

1. Go to your project → Settings → Domains
2. Add domain: `upholdmygoal.com`
3. Also add: `www.upholdmygoal.com` (optional, will redirect to main)

### Vercel will give you DNS records to add:

**A Record:**
```
Type: A
Name: @
Value: 76.76.21.21
```

**CNAME Record (for www):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## Step 2: Configure DNS at Your Registrar

Go to your domain registrar (GoDaddy, Namecheap, Google Domains, etc.):

1. Find DNS settings
2. Add the A record Vercel provided
3. Add the CNAME record for www (optional)
4. Save changes

**DNS propagation takes 5 minutes to 48 hours** (usually ~30 minutes)

---

## Step 3: Update Environment Variables

Once domain is connected, update in Vercel:

```bash
NEXT_PUBLIC_APP_URL=https://upholdmygoal.com
```

Redeploy after updating.

---

## Step 4: Set Up Custom Email Domain with Resend

### Current Setup:
- Using `onboarding@resend.dev` (free tier test domain)
- Limited to 100 emails/day

### With Custom Domain:
- Use `hello@upholdmygoal.com` or `support@upholdmygoal.com`
- Looks more professional
- Higher sending limits with paid plan

### Steps:

1. Go to Resend Dashboard → Domains
2. Click "Add Domain"
3. Enter: `upholdmygoal.com`
4. Resend will give you DNS records to add:
   - SPF record
   - DKIM records
   - DMARC record

5. Add these records at your domain registrar
6. Wait for verification (~10 minutes)

7. Update code to use new email address:
   - `app/api/admin/send-donation-receipts/route.ts`
   - Change from: `"Uphold <onboarding@resend.dev>"`
   - To: `"Uphold <hello@upholdmygoal.com>"`

---

## Step 5: SSL Certificate

**Good news:** Vercel automatically provides free SSL certificates!
- No setup needed
- Auto-renews
- Works immediately after DNS propagation

Your site will be `https://upholdmygoal.com` automatically.

---

## DNS Records Summary

When everything is set up, your DNS should have:

### From Vercel (for website):
```
A     @     76.76.21.21
CNAME www   cname.vercel-dns.com
```

### From Resend (for email):
```
TXT   @     v=spf1 include:resend.com ~all
TXT   resend._domainkey   [DKIM key from Resend]
TXT   _dmarc   v=DMARC1; p=none; ...
```

---

## Testing Your Domain

After DNS propagates:

1. **Test website:** Visit https://upholdmygoal.com
2. **Test www redirect:** Visit https://www.upholdmygoal.com
3. **Test email sending:** Create a failed commitment, process donation, check receipt email
4. **Check SSL:** Look for padlock icon in browser

---

## Troubleshooting

### Domain not working after 24 hours?
- Double-check DNS records at registrar
- Use https://dnschecker.org to verify propagation
- Make sure no conflicting records exist

### Email not sending?
- Verify domain in Resend dashboard shows "Verified"
- Check SPF/DKIM/DMARC records are correct
- Send test email from Resend dashboard

### SSL certificate issues?
- Vercel handles this automatically
- If issues, go to Vercel → Domains → click "Renew Certificate"

---

## Current Status

- [x] Domain purchased: upholdmygoal.com
- [ ] Added to Vercel
- [ ] DNS configured
- [ ] Domain verified and working
- [ ] Custom email configured with Resend
- [ ] Environment variables updated
- [ ] Code updated with new email address

---

## Cost Breakdown

**Current (Free Tier):**
- Domain: ~$12/year (one-time purchase)
- Vercel hosting: $0
- Vercel SSL: $0 (included)
- Email sending: $0 (using test domain)

**When You Need More:**
- Resend paid plan: $20/month (for custom email + unlimited sends)
- Vercel Pro: $20/month (if you need more bandwidth)

---

## Notes

- **Brand Name:** Always "Uphold" in UI, emails, marketing
- **Domain:** upholdmygoal.com for SEO and clarity
- **Email:** hello@upholdmygoal.com (professional)
- **Tagline ideas:**
  - "Uphold - Hold yourself accountable"
  - "Uphold your commitments"
  - "Make it happen with Uphold"

---

## Quick Commands for Later

**Update email in code:**
```bash
# Find all instances of onboarding@resend.dev
grep -r "onboarding@resend.dev" app/
```

**Update environment variable:**
```bash
# In Vercel dashboard or .env.local
NEXT_PUBLIC_APP_URL=https://upholdmygoal.com
```

---

**Don't do any of this yet!** Wait until after your initial testing and launch on the Vercel subdomain. This is just for reference when you're ready.
