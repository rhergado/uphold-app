# Uphold - Project Status Document

**Last Updated**: December 25, 2025 - New Pricing Model Implementation
**Next.js Version**: 15.3.0 (downgraded from 16.1.1 due to Turbopack crashes)
**Dev Server**: http://192.168.12.111:3002 (for mobile testing)

---

## 🎯 Project Overview

Uphold is a commitment-based accountability app that helps users follow through on their goals by putting money at stake. If users fail to complete their commitments, their stake is donated to charity.

**Core Concept**: Loss aversion psychology - users are more motivated to avoid losing money than to gain something of equal value.

---

## ✅ What's Been Built (Updated Dec 24 - Evening)

### 1. **Database & Backend** (COMPLETED)
- **Database**: Supabase (PostgreSQL)
- **Configuration**: `lib/supabase.ts`
- **Environment Variables**: `.env.local` with Supabase credentials
- **RLS Status**: Disabled for development (will need to enable for production)

#### Database Tables Created:
1. **users** - User accounts
   - Columns: id (UUID), name, email, password_hash, created_at
2. **commitments** - User commitments
   - Columns: id, user_id, type, intention, outcome, stake, verification_mode, buddy_email, charity_id, is_public, due_date, schedule, status, payment_intent_id, **platform_fee_amount**, **charity_donation_amount**, **refund_amount**, created_at, updated_at
   - **NEW (Dec 25)**: Added fee tracking columns for new pricing model
3. **check_ins** - Progress tracking for periodic commitments
   - Columns: id, commitment_id, user_id, due_date, completed_at, status, created_at
4. **buddy_verifications** - Buddy verification requests and responses
   - Columns: id, commitment_id, user_id, buddy_email, verification_token, status, verified_at, rejection_reason, expires_at, created_at

### 2. **Authentication System** (COMPLETED)
- **File**: `lib/auth-context.tsx`
- **Type**: Supabase database authentication
- **Features**:
  - Sign up with name, email, password (stored in database)
  - Login with email, password
  - Logout functionality
  - Session persistence across page refreshes
  - User data stored in Supabase users table
  - Password hashing with bcrypt

**How it works**:
- Users stored in Supabase `users` table
- Passwords hashed with bcrypt before storage
- Session managed via React Context and localStorage
- Authentication APIs: `/api/signup`, `/api/login`

### 3. **Payment Integration with Stripe** (COMPLETED)
- **Service**: Stripe (Test mode)
- **Configuration**: `lib/stripe.ts`
- **Environment Variables**:
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
- **Features**:
  - Payment intents creation for commitment stakes
  - Stripe checkout integration
  - Payment success/cancel flows
  - Refund processing for successful commitments
  - Test mode: Stakes of exactly $5 skip payment (for development)

#### Payment Flow:
1. User creates commitment → redirected to `/payment/[id]`
2. Stripe payment intent created with stake amount
3. User completes payment
4. On success → redirected to `/payment/success`
5. Payment intent ID stored in commitments table
6. When commitment succeeds → refund processed via Stripe API

**Files**:
- `app/payment/[id]/page.tsx` - Payment page with Stripe Elements
- `app/payment/success/page.tsx` - Success page with 5s countdown
- `app/api/create-payment-intent/route.ts` - Creates Stripe payment intent and calculates fees
- `app/api/process-refund/route.ts` - Processes 95% refund for successful commitments
- `app/api/process-donation/route.ts` - Processes 75% charity donation for failed commitments

### 3.5. **NEW: Platform Pricing Model** (COMPLETED - Dec 25, 2025)
**Implemented a revenue-generating fee structure:**

#### **Pricing Structure:**
- **Success (commitment completed)**:
  - User gets back: **95%** of stake
  - Platform fee: **5%**
  - Charity donation: **0%**

- **Failure (commitment missed)**:
  - User gets back: **0%**
  - Platform fee: **25%**
  - Charity donation: **75%**

#### **Example Calculations:**
| Stake Amount | Success Refund | Success Fee | Failure Donation | Failure Fee |
|--------------|----------------|-------------|------------------|-------------|
| $5.00        | $4.75          | $0.25       | $3.75            | $1.25       |
| $20.00       | $19.00         | $1.00       | $15.00           | $5.00       |
| $100.00      | $95.00         | $5.00       | $75.00           | $25.00      |

#### **Database Changes:**
- Added 3 new columns to `commitments` table:
  - `platform_fee_amount` (DECIMAL) - Stores actual fee collected (5% or 25%)
  - `charity_donation_amount` (DECIMAL) - Stores actual charity donation (0% or 75%)
  - `refund_amount` (DECIMAL) - Stores actual refund to user (95% or 0%)
- Migration file: `database_migrations/add_fee_columns.sql`

#### **API Updates:**
1. **`/api/create-payment-intent`** - Calculates and returns fee breakdown
2. **`/api/process-refund`** - Refunds 95%, keeps 5% platform fee, updates commitment
3. **`/api/process-donation`** - Donates 75% to charity, keeps 25% platform fee, updates commitment

#### **UI Updates:**
1. **Create Commitment Form** (`app/test-create/page.tsx`):
   - Collapsible "Show fees" button (black text)
   - Real-time fee preview updates as user types stake amount
   - Shows both success and failure scenarios

2. **Commitment Detail Page** (`app/commitment/[id]/page.tsx`):
   - **Active commitments**: Collapsible fee breakdown showing potential outcomes
   - **Completed commitments**: Green box showing actual refund and platform fee
   - **Failed commitments**: Orange box showing actual charity donation and platform fee
   - Success alert message includes detailed breakdown

**Files Modified:**
- `app/api/create-payment-intent/route.ts` - Fee calculation
- `app/api/process-refund/route.ts` - 95% refund logic
- `app/api/process-donation/route.ts` - 75% donation logic
- `app/commitment/[id]/page.tsx` - Fee breakdown UI
- `app/test-create/page.tsx` - Fee preview UI
- `database_migrations/add_fee_columns.sql` - Database schema

### 4. **Commitment Tracking System** (COMPLETED)
- **For Periodic Commitments**: Automatic check-in generation
- **Check-in Logic**:
  - System generates check-ins based on schedule (daily/weekly/monthly)
  - Users mark check-ins as complete
  - 80% completion rule: If user completes 80%+ of check-ins, commitment succeeds
- **Status Updates**:
  - Automatic status changes based on deadlines and completion
  - Active → Completed (success) or Failed (missed deadline/verification)

**Files**:
- `app/api/create-commitment/route.ts` - Creates commitment and check-ins
- `app/api/complete-check-in/route.ts` - Marks check-in as complete
- `app/api/update-commitment-statuses/route.ts` - Automatic status updates (cron job)

### 5. **Buddy Verification System** (COMPLETED)
- **Email Service**: Resend API
- **Environment Variable**: `RESEND_API_KEY`
- **Features**:
  - User requests buddy verification
  - System generates secure token (crypto.randomBytes)
  - Email sent to buddy with verification link
  - Buddy clicks link → sees commitment details
  - Buddy approves or rejects with optional reason
  - Verification expires after 7 days
  - On approval: commitment marked as completed, refund processed
  - On rejection: commitment marked as failed

**Flow**:
1. User clicks "Request Buddy Verification" on commitment page
2. API generates token, creates verification record
3. Email sent to buddy_email with link: `/verify-buddy/[token]`
4. Buddy sees commitment details and approve/reject buttons
5. Buddy's decision updates verification status
6. System processes refund or marks as failed

**Files**:
- `app/api/request-buddy-verification/route.ts` - Creates verification request and sends email
- `app/api/verify-buddy/route.ts` - Processes buddy's approval/rejection
- `app/verify-buddy/[token]/page.tsx` - Buddy verification page
- `app/commitment/[id]/page.tsx` - Updated to handle buddy verification requests

**Email Template**:
- Clean HTML email with commitment details
- Blue CTA button "Verify Commitment"
- 7-day expiration notice
- Copy-paste URL fallback

### 6. **Pages - Authentication**

#### **Landing Page** (`app/page.tsx`)
- Logo: "Uphold" with custom font size (3.9rem)
- Tagline: "Stand by your decisions"
- Three buttons: Sign Up, Log In, How it Works
- Auto-redirects logged-in users to dashboard

#### **Sign Up Page** (`app/sign-up/page.tsx`)
- Fields: Full Name, Email, Password (min 8 chars)
- Validates email format and password length
- On success: Creates account → auto-login → redirect to dashboard
- Shows "Creating Account..." during submission

#### **Login Page** (`app/sign-in/page.tsx`)
- Fields: Email, Password
- "Remember me" checkbox (not functional yet)
- "Forgot password" link (not implemented)
- On success: Login → redirect to dashboard
- Shows "Logging In..." during submission

#### **How It Works Page** (`app/how-it-works/page.tsx`)
- Mobile-optimized card layout
- 5 steps explaining the commitment process
- "Why It Works" section with psychology explanation
- CTA button to sign up

### 7. **Protected Pages** (Require Login)

#### **Dashboard** (`app/dashboard/page.tsx`)
- **Mobile-optimized header**:
  - Two-row layout
  - Top: "Uphold" logo + "Hi, [FirstName]"
  - Bottom: Navigation (+ New, Dashboard, Community, Logout)
- **Content**: Shows REAL commitment data from database
  - Active commitments (fetched from Supabase)
  - Completed commitments
  - Failed commitments
  - Each card shows: intention, outcome, stake, deadline, status
- **Features**:
  - Redirects to login if not authenticated
  - Logout button returns to home page
  - Click on commitment → view details page

#### **Community Page** (`app/community/page.tsx`)
- **Same mobile-optimized header as dashboard**
- **Content**: Shows dummy community commitments (8 examples)
- **Features**:
  - User avatars with colored backgrounds
  - Progress tracking for periodic commitments
  - Days left indicators
  - Posted date timestamps
  - "Load More" button (not functional)

#### **Create Commitment Page** (`app/test-create/page.tsx`)
- **Full commitment creation form** with validation
- **Fields**:
  - Commitment type: One-time or Periodic
  - Intention (what you'll do)
  - Outcome (why it matters)
  - Due date/time (for one-time) OR schedule (for periodic)
  - Stake amount (minimum $5)
  - Verification mode: Integrity, Buddy, or App
  - Buddy email (if buddy verification selected)
  - Charity selection
  - Public/Private toggle
- **Bottom buttons**:
  - Cancel (returns to dashboard)
  - Continue (submits form)
- **Validation**: Uses Zod schema for form validation
- **Flow**:
  - Form submission → Creates commitment in database
  - If stake = $5 (test mode) → Skip payment, go to dashboard
  - If stake > $5 → Redirect to payment page
  - After payment → Commitment becomes active

#### **Commitment Detail Page** (`app/commitment/[id]/page.tsx`)
- **Shows full commitment details**:
  - Intention, outcome, stake, deadline, status
  - Verification mode and buddy email (if applicable)
  - Charity information
  - Check-ins list (for periodic commitments)
- **Actions based on status**:
  - Active + One-time → "Mark as Complete" button
  - Active + Periodic → Check-in list with complete buttons
  - Active + Buddy verification → "Request Buddy Verification" button
  - Completed → Show success message
  - Failed → Show failure message
- **Features**:
  - Real-time check-in completion
  - Progress tracking for periodic commitments
  - Buddy verification request flow

### 8. **API Routes Created**

All API routes in `app/api/`:
1. **signup** - Create new user account with bcrypt password hashing
2. **login** - Authenticate user and return user data
3. **create-commitment** - Create commitment and generate check-ins
4. **create-payment-intent** - Create Stripe payment intent for stake, calculate fee breakdown
5. **process-refund** - Process 95% Stripe refund for successful commitments (5% platform fee)
6. **process-donation** - Process 75% charity donation for failed commitments (25% platform fee)
7. **complete-check-in** - Mark check-in as complete
8. **cron/update-statuses** - Automatic status updates (cron job, runs every 4 hours)
9. **request-buddy-verification** - Send buddy verification email
10. **verify-buddy** - Process buddy's approval/rejection
11. **admin/pending-donations** - Fetch all failed commitments for admin review (⚠️ no auth yet)

### 9. **UI Components & Styling**

#### **Mobile-First Design**
- All pages optimized for mobile (tested on 192.168.12.111:3000)
- Responsive headers with compact navigation
- No horizontal scrolling required

#### **Design System**
- **Colors**: Blue primary (#2563eb), neutral grays, white backgrounds
- **Typography**:
  - Logo: Light weight with bold "hold"
  - Headers: Semibold, various sizes
  - Body: Regular weight, good readability
- **Components**: Using shadcn/ui components (Button, Card, Input, etc.)

### 10. **Technical Stack**

#### **Framework & Libraries**
```json
{
  "next": "15.3.0",
  "react": "19.2.3",
  "react-hook-form": "^7.69.0",
  "zod": "^4.2.1",
  "tailwindcss": "^4",
  "@supabase/supabase-js": "^2.49.1",
  "stripe": "^17.5.0",
  "@stripe/stripe-js": "^5.2.0",
  "@stripe/react-stripe-js": "^3.2.0",
  "bcryptjs": "^2.4.3",
  "resend": "^5.2.0"
}
```

#### **Why Next.js 15.3.0?**
- Originally used 16.1.1
- Turbopack had fatal crashes: "Failed to write app endpoint /page"
- Downgraded to 15.3.0 which is stable
- Note: 15.3.0 has CVE-2025-66478 security warning (need to upgrade to patched version later)

#### **File Structure**
```
app/
├── page.tsx                           # Landing page
├── layout.tsx                         # Root layout with Providers
├── sign-up/page.tsx                  # Sign up form
├── sign-in/page.tsx                  # Login form
├── how-it-works/page.tsx             # Info page
├── dashboard/page.tsx                # User dashboard (protected)
├── community/page.tsx                # Community feed (protected)
├── test-create/page.tsx              # Create commitment (protected)
├── commitment/[id]/page.tsx          # Commitment details (protected)
├── payment/[id]/page.tsx             # Stripe payment page
├── payment/success/page.tsx          # Payment success page
├── verify-buddy/[token]/page.tsx     # Buddy verification page
├── nav/page.tsx                      # Navigation test page
└── test-mobile/page.tsx              # Mobile test page

app/api/
├── signup/route.ts                   # User registration
├── login/route.ts                    # User login
├── create-commitment/route.ts        # Create commitment
├── create-payment-intent/route.ts    # Stripe payment intent + fee calculation
├── process-refund/route.ts           # Stripe 95% refund (5% platform fee)
├── process-donation/route.ts         # 75% charity donation (25% platform fee)
├── complete-check-in/route.ts        # Complete check-in
├── update-commitment-statuses/route.ts # Status updates (cron)
├── request-buddy-verification/route.ts # Send buddy email
└── verify-buddy/route.ts             # Process buddy response

database_migrations/
└── add_fee_columns.sql               # Fee tracking columns migration

components/
├── providers.tsx                      # Auth + Stripe providers
└── ui/                                # shadcn/ui components

lib/
├── auth-context.tsx                   # Authentication logic
├── supabase.ts                        # Supabase client
└── stripe.ts                          # Stripe client

middleware.ts                          # Simplified (allows all routes)
```

---

## 🚧 What's NOT Built Yet

### 1. **Backend & Database**
- ❌ No database (PostgreSQL, MongoDB, etc.)
- ❌ No API endpoints
- ❌ No server-side data persistence
- ❌ Commitments are not saved anywhere
- ❌ User data only in localStorage (lost if browser cache cleared)

### 2. **Payment Integration**
- ❌ No Stripe/payment gateway integration
- ❌ Can't actually charge users for stakes
- ❌ No refund system for successful commitments
- ❌ No charity donation system for failed commitments

### 3. **Verification System**
- ❌ Integrity mode verification (self-check)
- ❌ Buddy verification (email invites, approval system)
- ❌ App verification (photo upload, admin review)
- ❌ Photo/proof upload functionality

### 4. **Commitment Tracking**
- ❌ Progress tracking for periodic commitments
- ❌ Reminders/notifications system
- ❌ Calendar integration
- ❌ Check-in functionality
- ❌ Success/failure determination logic
- ❌ 80% completion rule for periodic commitments

### 5. **Dashboard Functionality**
- ❌ Real commitment data (currently dummy data)
- ❌ Filter/sort commitments
- ❌ Search functionality
- ❌ Edit/delete commitments
- ❌ Commitment details modal/page

### 6. **Community Features**
- ❌ Real community feed
- ❌ User profiles
- ❌ Following/followers
- ❌ Comments on commitments
- ❌ Likes/reactions
- ❌ Privacy settings

### 7. **User Account**
- ❌ Profile page
- ❌ Settings page
- ❌ Email verification
- ❌ Password reset functionality
- ❌ Change email/password
- ❌ Delete account

### 8. **Security**
- ⚠️ Passwords stored in plain text
- ⚠️ No encryption
- ⚠️ No rate limiting
- ⚠️ No CSRF protection
- ⚠️ No input sanitization

### 9. **Mobile App**
- ❌ No PWA manifest (has placeholder)
- ❌ No service worker
- ❌ No offline functionality
- ❌ No push notifications

---

## 🐛 Known Issues

### 1. **Turbopack Crashes** (FIXED)
- **Issue**: Next.js 16.1.1 Turbopack had fatal error
- **Solution**: Downgraded to Next.js 15.3.0
- **Status**: ✅ Fixed, server runs stable

### 2. **Duplicate Routes** (FIXED)
- **Issue**: Clerk routes conflicted with custom auth pages
- **Solution**: Removed `app/sign-in/[[...sign-in]]` and `app/sign-up/[[...sign-up]]`
- **Status**: ✅ Fixed

### 3. **Mobile Header Overflow** (FIXED)
- **Issue**: Dashboard/Community headers had buttons overflowing on mobile
- **Solution**: Two-row layout with compact buttons
- **Status**: ✅ Fixed

### 4. **Security Vulnerabilities** (OPEN)
- **Issue**: CVE-2025-66478 in Next.js 15.3.0
- **Action Needed**: Upgrade to patched Next.js version
- **Status**: ⚠️ Known issue, needs fixing

---

## 🎨 UI/UX Decisions Made

1. **Logo**: "Uphold" with "hold" in bold, custom 3.9rem font size
2. **Tagline**: "Stand by your decisions"
3. **Mobile-first**: All designs optimized for mobile viewport
4. **Navigation**: Compact two-row header with "+ New" as primary action
5. **User greeting**: Shows first name only (not full name)
6. **Button text**: "Sign Up" (not "Get Started") for clarity
7. **Create page**: Cancel + Continue buttons side-by-side at bottom

---

## 🔧 Technical Decisions

1. **Auth Method**: Client-side localStorage (temporary, needs backend)
2. **Form Validation**: Zod + react-hook-form
3. **Styling**: Tailwind CSS v4
4. **Components**: shadcn/ui component library
5. **State Management**: React Context API (AuthContext)
6. **Routing**: Next.js App Router
7. **Mobile Testing**: Local network IP (192.168.12.111:3000)

---

## 📝 Next Steps (Priority Order)

### High Priority
1. **Set up database** (Supabase, PostgreSQL, or MongoDB)
2. **Create API routes** for CRUD operations
3. **Implement real data persistence** for commitments
4. **Add password encryption** (bcrypt)
5. **Build commitment creation flow** (save to database)
6. **Implement verification check-in system**

### Medium Priority
7. **Payment integration** (Stripe)
8. **Email verification** system
9. **Commitment tracking logic** (progress, success/failure)
10. **Reminders/notifications** system
11. **User profile page**
12. **Settings page**

### Low Priority
13. **Community interactions** (comments, likes)
14. **Advanced filtering/sorting**
15. **Analytics dashboard**
16. **Mobile PWA features**

---

## 🎯 Current User Flow

1. User visits landing page (/)
2. Clicks "Sign Up"
3. Fills form (name, email, password)
4. Account created → auto-login → redirected to /dashboard
5. Sees dummy commitments
6. Clicks "+ New" button
7. Fills create commitment form
8. Clicks "Continue"
9. Form validates
10. **❌ STOPS HERE** - no database to save to

---

---

## 🆕 Recent Changes (December 25, 2025)

### Platform Pricing Model Implementation
**What Changed:**
- Implemented revenue-generating fee structure
- Success: 5% platform fee, 95% refunded to user
- Failure: 25% platform fee, 75% donated to charity

**Database:**
- Added 3 fee tracking columns to `commitments` table
- Migration: `database_migrations/add_fee_columns.sql`
- Run SQL migration in Supabase dashboard

**Backend:**
- Updated `/api/create-payment-intent` to calculate fees
- Updated `/api/process-refund` for 95% refund (5% fee)
- Updated `/api/process-donation` for 75% charity (25% fee)

**Frontend:**
- Create form: Collapsible "Show fees" button with real-time preview
- Commitment details: Fee breakdown for active/completed/failed commitments
- Success alerts now include detailed fee breakdown

**Git Commits:**
- `84e922f` - Backup before pricing model implementation
- `d61c433` - feat: make fee breakdown collapsible
- `6db8f95` - style: change fees button color to gray
- `e5c5211` - style: change fees button to black

### Automatic Commitment Status Updates (Cron Job)
**What Changed:**
- Implemented automated cron job to check and update commitment statuses every 4 hours
- Automatically marks expired commitments as failed
- Triggers charity donations for failed commitments
- Triggers refunds for successful periodic commitments (80%+ completion)

**Backend:**
- Created `/api/cron/update-statuses` endpoint with Bearer token authentication
- Added `vercel.json` configuration for Vercel Cron (runs every 4 hours)
- Added `CRON_SECRET` environment variable for security
- Handles both one-time and periodic commitment expiration logic

**Features:**
- One-time commitments: Marked as failed when `due_date` passes
- Periodic commitments: Checks 80% completion threshold at end date
- Automatic refund processing for successful commitments
- Automatic donation processing for failed commitments
- Detailed error logging and reporting

**Files:**
- `app/api/cron/update-statuses/route.ts` - Cron endpoint
- `vercel.json` - Cron schedule configuration
- `.env.local` - Added CRON_SECRET

**How to Test:**
```bash
curl -H "Authorization: Bearer uphold_cron_secret_key_2025" http://localhost:3000/api/cron/update-statuses
```

### Manual Donation Administration System
**What Changed:**
- Built admin dashboard for reviewing and processing pending charity donations
- Manual batch donation system (MVP approach - faster than full charity API integration)
- Admin can review failed commitments and trigger donations individually or in bulk

**Backend:**
- Created `/api/admin/pending-donations` endpoint to fetch all failed commitments
- Returns commitment details with user info, charity, and donation amounts
- Integrates with existing `/api/process-donation` endpoint

**Frontend:**
- Created admin dashboard at `/admin/donations`
- Table view showing all pending donations with details
- Individual "Process" button for each donation
- "Process All Donations" batch button
- Real-time loading states and error handling
- Added "Admin" link to dashboard navigation (orange color for visibility)

**Features:**
- View all failed commitments pending donation
- See user email, goal, charity, donation amount, platform fee
- Process donations one-by-one or in bulk
- Automatic removal from list after processing
- Error alerts for failed donation processing

**Files:**
- `app/admin/donations/page.tsx` - Admin dashboard page
- `app/api/admin/pending-donations/route.ts` - Fetch pending donations API
- `app/dashboard/page.tsx` - Added Admin navigation link

**Security Note:**
- ⚠️ Currently NO authentication on admin endpoints
- TODO: Add admin role check before production deployment
- Placeholder comment in code: "TODO: Add admin authentication check here"

**How to Access:**
1. Navigate to dashboard after login
2. Click "Admin" button in navigation (orange text)
3. View all pending donations
4. Click "Process" on individual items or "Process All Donations" for batch

**Git Commits:**
- `3a1c35a` - feat: implement automatic commitment status updates with cron job

---

## 💡 Important Notes for Next Session

### Pricing Model
- **Success**: User gets 95%, platform keeps 5%
- **Failure**: Charity gets 75%, platform keeps 25%
- Fee breakdown shown via collapsible "Show fees" button
- Actual amounts stored in database after completion/failure

### Authentication
- User data is in localStorage, check with: `localStorage.getItem('uphold_user')`
- Users list: `localStorage.getItem('uphold_users')`
- To test: Sign up with any email/password, it will work

### Mobile Testing
- Dev server runs on: `npm run dev -- -H 0.0.0.0`
- Access from mobile: http://192.168.12.111:3000
- IP might change if network changes

### Middleware
- Currently disabled (allows all routes)
- File: `middleware.ts` - just returns `NextResponse.next()`
- Will need to re-enable for production

### Clerk Integration
- Was initially using Clerk for auth
- Removed because it blocked mobile access
- All Clerk code removed from layout.tsx

### Form Validation
- Create commitment form has full Zod schema
- Validates: dates, times, emails, numbers, required fields
- Schema in: `app/test-create/page.tsx` (lines 18-83)

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Run dev server (for mobile testing)
npm run dev -- -H 0.0.0.0

# Access on PC
http://localhost:3000

# Access on mobile (same network)
http://192.168.12.111:3000
```

---

## 📂 Key Files to Check

1. **Authentication**: `lib/auth-context.tsx`
2. **Dashboard**: `app/dashboard/page.tsx`
3. **Create Form**: `app/test-create/page.tsx`
4. **Providers**: `components/providers.tsx`
5. **Package versions**: `package.json`

---

## 🎓 What to Tell Claude Next Time

**Quick version**:
> "I'm continuing the Uphold app. Read PROJECT_STATUS.md in the root folder to understand where we left off."

**With context**:
> "We're building Uphold - a commitment accountability app. Check PROJECT_STATUS.md for full details. Currently have auth + UI working with localStorage. Need to add database and payment integration next."

---

**End of Status Document**
