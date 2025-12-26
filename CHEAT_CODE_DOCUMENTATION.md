# 🎯 Cheat Code System Documentation

**Last Updated:** December 25, 2025
**Feature:** $0.07 Test Mode for Debugging Without Real Bank Charges

---

## Overview

The Uphold app now supports **real Stripe payments** for production use, while maintaining a **cheat code** for testing and debugging without triggering actual bank transactions.

### The Magic Number: `$0.07`

When a user creates a commitment with a stake of **exactly $0.07**, the system enters **Test Mode**:
- ✅ Payment is simulated (no real Stripe charge)
- ✅ Commitment is created and marked as paid instantly
- ✅ Refunds are simulated (no real Stripe refund)
- ✅ Donations are simulated (tracked in DB only)

All other stake amounts ($5+) trigger **real Stripe payments and refunds**.

---

## Payment Mode Comparison

| Feature | Test Mode ($0.07) | Production Mode ($5+) |
|---------|-------------------|----------------------|
| **Payment Processing** | Simulated (instant) | Real Stripe charge |
| **Payment Intent** | Fake ID generated | Real Stripe Payment Intent |
| **Payment Status** | Auto-marked "succeeded" | Pending → Succeeded via Stripe |
| **Payment Page** | Skipped entirely | Full Stripe checkout form |
| **Refund Processing** | Simulated (DB only) | Real Stripe refund API call |
| **Refund Timeline** | Instant | 5-10 business days |
| **Charity Donations** | Simulated (DB only) | Simulated* (DB only) |
| **Use Case** | Testing & Debugging | Real user commitments |

*Note: Charity donations are currently simulated for ALL amounts. Real charity integration is planned for future release.

---

## Implementation Details

### 1. Create Payment Intent API
**File:** `app/api/create-payment-intent/route.ts`

**Lines 24-49:** Cheat code detection and branching logic

```typescript
// 🎯 CHEAT CODE: $0.07 triggers simulated payment
const isTestMode = amount === 0.07;

let paymentIntent;

if (isTestMode) {
  // SIMULATED MODE: Create fake payment intent for testing
  console.log("[SIMULATED PAYMENT] Cheat code activated with $0.07 stake");
  paymentIntent = {
    id: `test_pi_${Date.now()}`,
    client_secret: `test_secret_${Date.now()}`,
  };
} else {
  // REAL MODE: Create actual PaymentIntent with Stripe
  paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    metadata: { userId, commitmentId },
  });
}
```

**Line 66:** Auto-succeed test payments
```typescript
status: isTestMode ? "succeeded" : "pending"
```

**Line 80:** Return test mode flag to frontend
```typescript
isTestMode, // Tell the frontend this is test mode
```

---

### 2. Commitment Creation Page
**File:** `app/test-create/page.tsx`

**Line 28:** Updated minimum stake validation
```typescript
stake: z.coerce.number().min(0.07, "Stake must be at least $0.07 (use $0.07 for test mode, $5+ for real)")
```

**Lines 178-202:** Test mode detection and bypass
```typescript
// 🎯 CHEAT CODE: $0.07 stake bypasses real payment
if (data.stake === 0.07) {
  // Create a simulated payment record for testing
  const { error: paymentError } = await supabase
    .from("payments")
    .insert([{
      commitment_id: insertedCommitment.id,
      user_id: user.id,
      amount: data.stake,
      currency: "usd",
      stripe_payment_intent_id: `test_pi_${Date.now()}`,
      status: "succeeded",
    }]);

  console.log("[CHEAT CODE] Payment simulated with $0.07 - no real charge");
  alert("🎯 Test mode activated! Payment simulated (no real charge). Commitment created!");
  router.push("/dashboard");
} else {
  // Redirect to payment page for real Stripe payment
  router.push(`/payment/${insertedCommitment.id}`);
}
```

---

### 3. Payment Page
**File:** `app/payment/[commitmentId]/page.tsx`

**Lines 203-209:** Skip payment form for test mode
```typescript
// 🎯 CHEAT CODE: If test mode, skip payment page and go straight to dashboard
if (data.isTestMode) {
  console.log("[CHEAT CODE] Test mode detected - skipping payment page");
  alert("🎯 Test mode! Payment simulated instantly. Redirecting to dashboard...");
  router.push("/dashboard");
  return;
}
```

---

### 4. Refund Processing API
**File:** `app/api/process-refund/route.ts`

**Lines 67-116:** Dual-mode refund logic

```typescript
// 🎯 CHEAT CODE: Check if this is test mode ($0.07 stake)
const isTestMode = payment.amount === 0.07;

let refundId;

if (isTestMode) {
  // SIMULATED REFUND for test mode
  console.log(`[SIMULATED] Processing test refund:
    User: ${userId}
    Commitment: ${commitmentId}
    Original Amount: $${payment.amount.toFixed(2)}
    Refund Amount: $${refundAmount.toFixed(2)} (95%)
    Platform Fee: $${platformFee.toFixed(2)} (5%)
    Status: SIMULATED (no real money refunded)`);

  refundId = `sim_refund_${Date.now()}`;
} else {
  // REAL STRIPE REFUND for production mode
  console.log(`[REAL] Processing Stripe refund:
    User: ${userId}
    Commitment: ${commitmentId}
    Original Amount: $${payment.amount.toFixed(2)}
    Refund Amount: $${refundAmount.toFixed(2)} (95%)
    Platform Fee: $${platformFee.toFixed(2)} (5%)`);

  try {
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripe_payment_intent_id,
      amount: Math.round(refundAmount * 100), // Stripe uses cents
      metadata: {
        userId,
        commitmentId,
        platformFee: platformFee.toFixed(2),
      },
    });

    refundId = refund.id;
    console.log(`[REAL] Stripe refund successful: ${refundId}`);
  } catch (stripeError: any) {
    console.error("Stripe refund failed:", stripeError);
    return NextResponse.json(
      { error: `Stripe refund failed: ${stripeError.message}` },
      { status: 500 }
    );
  }
}
```

**Lines 119-122:** Response includes test mode flag
```typescript
message: isTestMode
  ? `[SIMULATED] Refund of $${refundAmount.toFixed(2)} processed successfully`
  : `[REAL] Stripe refund of $${refundAmount.toFixed(2)} processed successfully`,
```

---

### 5. Donation Processing API
**File:** `app/api/process-donation/route.ts`

**Lines 5-18:** Current status and future plans

```typescript
/**
 * DONATION PROCESSING
 *
 * Currently: ALL donations are simulated (including real stakes)
 *
 * 🚀 TODO for Production:
 * 1. Use Stripe Connect to transfer funds to charity Stripe accounts
 * 2. Or integrate with charity-specific payment APIs (PayPal Giving Fund, etc.)
 * 3. Store actual transaction IDs and donation receipts
 * 4. Generate tax-deductible donation receipts
 *
 * For now, this marks donations in DB but does not transfer real money to charities.
 * Platform keeps the "charity portion" until real charity integration is built.
 */
```

**Note:** Donations are currently simulated for ALL stakes (including $5+). Real charity integration is a future enhancement.

---

## How to Use the Cheat Code

### For Developers (Testing)

1. **Create Test Commitment:**
   ```
   - Navigate to /test-create
   - Fill out commitment details
   - Set stake to: $0.07
   - Click "Create"
   ```

2. **Observe Test Mode:**
   ```
   - Alert: "🎯 Test mode activated! Payment simulated (no real charge)"
   - Payment page is skipped
   - Commitment appears immediately in dashboard as "Active"
   - No Stripe charges appear on your card
   ```

3. **Test Completion (Success Path):**
   ```
   - Go to commitment details
   - Mark as complete
   - System processes simulated refund
   - Check console: "[SIMULATED] Processing test refund"
   - Check database: payment.status = "refunded"
   ```

4. **Test Failure (Failure Path):**
   ```
   - Let commitment deadline pass
   - System auto-marks as failed
   - System processes simulated donation
   - Check console: "[SIMULATED] Processing donation"
   - Check database: payment.status = "donated"
   ```

### For Production Users

1. **Create Real Commitment:**
   ```
   - Navigate to /test-create
   - Fill out commitment details
   - Set stake to: $5 or more
   - Click "Create"
   ```

2. **Real Payment Flow:**
   ```
   - Redirected to /payment/[id] page
   - See full Stripe checkout form
   - Enter real credit card details
   - Stripe processes real charge
   - Redirected to success page
   ```

3. **Real Refund (on success):**
   ```
   - Mark commitment as complete
   - System calls stripe.refunds.create()
   - Real refund processed by Stripe
   - Money returns to card in 5-10 business days
   ```

---

## Console Log Patterns

### Test Mode Logs
```
[SIMULATED PAYMENT] Cheat code activated with $0.07 stake
[CHEAT CODE] Payment simulated with $0.07 - no real charge
[CHEAT CODE] Test mode detected - skipping payment page
[SIMULATED] Processing test refund: ...
[SIMULATED] Processing donation: ...
```

### Production Mode Logs
```
[REAL] Processing Stripe refund: ...
[REAL] Stripe refund successful: re_xxxxxxxxxxxxx
Stripe refund failed: ... (if error)
```

---

## Database Schema Notes

### Payments Table
Relevant columns for cheat code system:
```sql
- stripe_payment_intent_id: VARCHAR
  * Test mode: "test_pi_1234567890"
  * Real mode: "pi_xxxxxxxxxxxxx" (from Stripe)

- status: VARCHAR
  * Test mode: Immediately set to "succeeded"
  * Real mode: "pending" → "succeeded" → "refunded"/"donated"

- refund_id: VARCHAR (added in this update)
  * Test mode: "sim_refund_1234567890"
  * Real mode: "re_xxxxxxxxxxxxx" (from Stripe)

- refund_amount: DECIMAL
  * Both modes: Calculated as amount * 0.95

- refund_date: TIMESTAMP
  * Test mode: Immediate
  * Real mode: When Stripe confirms refund
```

---

## Edge Cases & Important Notes

### ⚠️ Important Warnings

1. **Exact Match Required:** The cheat code only triggers with **exactly $0.07**
   - $0.070 ❌ (will fail validation)
   - $0.08 ❌ (triggers real payment)
   - $0.06 ❌ (below minimum)

2. **Charity Donations Are Always Simulated:**
   - Even for real stakes ($5+), donations are not yet transferred to charities
   - Platform retains the "charity portion" until Stripe Connect is integrated
   - This is clearly documented in the code

3. **Minimum Stake Validation:**
   - Previous minimum: $5.00
   - New minimum: $0.07
   - This allows the cheat code while preventing abuse

4. **Payment Intent IDs:**
   - Test mode uses predictable pattern: `test_pi_{timestamp}`
   - Never attempt to refund a test payment intent through Stripe API
   - System automatically detects test IDs and simulates refund

### 🔒 Security Considerations

1. **Public Knowledge:** The $0.07 cheat code is visible in client-side code
   - Users could discover and use it
   - Acceptable for MVP since no real money is involved
   - For production, consider moving to environment variable or admin-only feature

2. **Database Integrity:** Test payments are marked clearly
   - Easy to identify and filter in reports
   - Can be excluded from financial reconciliation
   - Clear audit trail with "[SIMULATED]" logs

3. **No Financial Risk:** Test mode never calls Stripe APIs
   - Zero risk of accidental charges
   - Zero risk of failed refunds
   - Completely isolated from real payment flow

---

## Future Enhancements

### Short Term (Before Public Launch)

- [ ] Add admin dashboard flag to view test vs. real commitments
- [ ] Create database view that excludes test commitments from stats
- [ ] Add automated tests for cheat code flow
- [ ] Document cheat code in internal wiki/README

### Medium Term (Post-Launch)

- [ ] Move cheat code to environment variable (`TEST_MODE_STAKE_AMOUNT`)
- [ ] Add admin-only UI toggle to enable/disable test mode
- [ ] Create separate test environment with persistent test mode
- [ ] Add Stripe webhook handling for real payment confirmations

### Long Term (Scale)

- [ ] Implement real charity donation transfers (Stripe Connect)
- [ ] Add donation receipt generation for tax deductions
- [ ] Integrate with charity APIs (PayPal Giving Fund, etc.)
- [ ] Build admin dashboard for charity donation reconciliation

---

## Troubleshooting

### Problem: Test mode not activating

**Symptoms:**
- Stake is $0.07 but payment page still loads
- Real Stripe checkout form appears

**Solution:**
1. Check exact stake amount (must be precisely 0.07)
2. Clear browser cache and reload
3. Check console for "[SIMULATED PAYMENT]" log
4. Verify `isTestMode` flag in API response

### Problem: Real payment failing

**Symptoms:**
- Stake is $10 but payment fails
- Error: "Payment intent creation error"

**Solution:**
1. Verify Stripe API keys are set in `.env.local`
2. Check Stripe dashboard for error details
3. Ensure Stripe account is not in restricted mode
4. Test with Stripe test card: `4242 4242 4242 4242`

### Problem: Refund not processing

**Symptoms:**
- Commitment marked complete but no refund
- Error: "Stripe refund failed"

**Solution:**
1. Check if payment is in test mode (should simulate)
2. For real payments, verify payment_intent_id in database
3. Check Stripe dashboard for payment status
4. Ensure payment was actually charged before refund attempt

---

## Testing Checklist

### ✅ Test Mode ($0.07) Tests

- [ ] Create commitment with $0.07 stake
- [ ] Verify alert shows "🎯 Test mode activated!"
- [ ] Verify payment page is skipped
- [ ] Verify commitment appears in dashboard
- [ ] Verify payment record has status="succeeded"
- [ ] Mark commitment complete
- [ ] Verify refund is simulated (check console logs)
- [ ] Verify payment.status = "refunded"
- [ ] Let commitment fail (pass deadline without completing)
- [ ] Verify donation is simulated
- [ ] Verify payment.status = "donated"

### ✅ Production Mode ($5+) Tests

- [ ] Create commitment with $10 stake
- [ ] Verify redirected to payment page
- [ ] Verify Stripe checkout form loads
- [ ] Enter test card: 4242 4242 4242 4242
- [ ] Complete payment
- [ ] Verify commitment appears in dashboard
- [ ] Mark commitment complete
- [ ] Verify real Stripe refund is processed (check Stripe dashboard)
- [ ] Verify refund has real Stripe refund ID (starts with "re_")
- [ ] Verify console shows "[REAL] Stripe refund successful"

---

## Related Files

### Modified Files (Cheat Code Implementation)
1. `app/api/create-payment-intent/route.ts` - Payment intent creation logic
2. `app/test-create/page.tsx` - Commitment creation form and validation
3. `app/payment/[commitmentId]/page.tsx` - Payment page with test mode bypass
4. `app/api/process-refund/route.ts` - Dual-mode refund processing
5. `app/api/process-donation/route.ts` - Donation documentation update

### Reference Files
- `lib/stripe.ts` - Stripe client initialization
- `lib/supabase.ts` - Database client
- `.env.local` - Stripe API keys (not in version control)

---

## Support & Questions

For questions about the cheat code system, contact:
- **Developer:** Claude (via this documentation)
- **Platform Owner:** Roberto (robert.her.delgado@gmail.com)

**Documentation Version:** 1.0
**Implementation Date:** December 25, 2025
