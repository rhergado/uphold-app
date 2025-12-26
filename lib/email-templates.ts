/**
 * Email Templates for Uphold
 *
 * These templates use Resend's HTML email format
 */

interface DonationReceiptEmailParams {
  userName: string;
  commitmentIntention: string;
  donationAmount: number;
  charityName: string;
  originalStake: number;
  receiptUrl: string;
  batchId: string;
  donationDate: string;
}

export function getDonationReceiptEmail(params: DonationReceiptEmailParams) {
  const { userName, commitmentIntention, donationAmount, charityName, originalStake, receiptUrl, batchId, donationDate } = params;

  return {
    subject: `Your ${donationAmount.toFixed(2)} donation receipt - ${charityName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Donation Receipt - Uphold</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <!-- Header -->
  <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #2563eb;">
    <h1 style="font-size: 32px; font-weight: 300; margin: 0;">
      Up<span style="font-weight: 700;">hold</span>
    </h1>
    <p style="color: #666; margin: 5px 0 0 0;">Keep your word.</p>
  </div>

  <!-- Main Content -->
  <div style="background: #fef2f2; padding: 30px; border-radius: 8px; margin-bottom: 20px; border: 2px solid #fca5a5;">
    <h2 style="color: #dc2626; margin-top: 0;">Donation Receipt</h2>
    <p style="font-size: 16px; margin-bottom: 20px;">
      Hi ${userName},
    </p>
    <p style="font-size: 16px; margin-bottom: 20px;">
      As discussed when you created your commitment, since you didn't complete your goal on time, your stake has been donated to charity on your behalf.
    </p>
    <p style="font-size: 16px; margin-bottom: 20px;">
      Here are the details of your donation:
    </p>

    <!-- Donation Details -->
    <div style="background: white; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 0; color: #666;">Your Commitment:</td>
          <td style="padding: 12px 0; text-align: right; font-weight: 600;">${commitmentIntention}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 0; color: #666;">Original Stake:</td>
          <td style="padding: 12px 0; text-align: right; font-weight: 600;">$${originalStake.toFixed(2)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 0; color: #666;">Donation Amount:</td>
          <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #10b981;">$${donationAmount.toFixed(2)} (75%)</td>
        </tr>
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 0; color: #666;">Charity:</td>
          <td style="padding: 12px 0; text-align: right; font-weight: 600;">${charityName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 0; color: #666;">Donation Date:</td>
          <td style="padding: 12px 0; text-align: right; font-weight: 600;">${donationDate}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; color: #666;">Batch ID:</td>
          <td style="padding: 12px 0; text-align: right; font-weight: 600; font-family: monospace;">${batchId}</td>
        </tr>
      </table>
    </div>

    <!-- Receipt Link -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="${receiptUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
        View Official Receipt
      </a>
    </div>

    <p style="font-size: 14px; color: #666; margin-top: 20px;">
      This receipt serves as official documentation of your donation made through Uphold. The charity has received your contribution and provided the receipt above.
    </p>
  </div>

  <!-- What Happened Section -->
  <div style="background: #f1f5f9; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
    <h3 style="margin-top: 0; font-size: 18px; color: #334155;">What happened?</h3>
    <p style="font-size: 14px; margin-bottom: 12px;">
      When you created your commitment, you agreed that if you didn't complete your goal by the deadline, your stake would be donated to ${charityName}.
    </p>
    <p style="font-size: 14px; margin-bottom: 12px;">
      <strong>Breakdown:</strong>
    </p>
    <ul style="font-size: 14px; color: #475569; margin: 0; padding-left: 20px;">
      <li>Original stake: $${originalStake.toFixed(2)}</li>
      <li>Donated to ${charityName}: $${donationAmount.toFixed(2)} (75%)</li>
      <li>Platform fee: $${(originalStake * 0.25).toFixed(2)} (25%)</li>
    </ul>
  </div>

  <!-- Encouragement Section -->
  <div style="background: #f0fdf4; padding: 20px; border-radius: 6px; margin-bottom: 20px; border: 1px solid #86efac;">
    <h3 style="margin-top: 0; font-size: 18px; color: #059669;">Don't give up!</h3>
    <p style="font-size: 14px; margin-bottom: 12px;">
      While you didn't complete this goal on time, your stake still made a positive impact by supporting ${charityName}.
    </p>
    <p style="font-size: 14px; margin-bottom: 0;">
      Ready to try again? Create a new commitment and use the accountability system to help you succeed this time!
    </p>
  </div>

  <!-- Footer -->
  <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px;">
    <p>Questions? Reply to this email or contact us at support@uphold.com</p>
    <p style="margin-top: 10px;">
      <a href="https://uphold.com/terms" style="color: #2563eb; text-decoration: none;">Terms</a> •
      <a href="https://uphold.com/privacy" style="color: #2563eb; text-decoration: none;">Privacy</a> •
      <a href="https://uphold.com/refund-policy" style="color: #2563eb; text-decoration: none;">Refund Policy</a>
    </p>
    <p style="margin-top: 15px; color: #999;">
      © 2025 Uphold. All rights reserved.
    </p>
  </div>

</body>
</html>
    `,
  };
}

interface PaymentConfirmationEmailParams {
  userName: string;
  commitmentIntention: string;
  stake: number;
  deadline: string;
  stripeTransactionId: string;
  commitmentId: string;
}

export function getPaymentConfirmationEmail(params: PaymentConfirmationEmailParams) {
  const { userName, commitmentIntention, stake, deadline, stripeTransactionId, commitmentId } = params;
  const platformFee = stake * 0.05;
  const potentialRefund = stake * 0.95;

  return {
    subject: `Payment Confirmed: Your ${stake.toFixed(2)} commitment is active`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Confirmed - Uphold</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <!-- Header -->
  <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #2563eb;">
    <h1 style="font-size: 32px; font-weight: 300; margin: 0;">
      Up<span style="font-weight: 700;">hold</span>
    </h1>
    <p style="color: #666; margin: 5px 0 0 0;">Keep your word.</p>
  </div>

  <!-- Main Content -->
  <div style="background: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
    <h2 style="color: #10b981; margin-top: 0;">✓ Payment Confirmed!</h2>
    <p style="font-size: 16px; margin-bottom: 20px;">
      Hi ${userName},
    </p>
    <p style="font-size: 16px; margin-bottom: 20px;">
      Your payment of <strong>$${stake.toFixed(2)}</strong> has been successfully processed. Your commitment is now active!
    </p>

    <!-- Commitment Details -->
    <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #1f2937;">Your Commitment</h3>
      <p style="margin: 10px 0;"><strong>Goal:</strong> ${commitmentIntention}</p>
      <p style="margin: 10px 0;"><strong>Deadline:</strong> ${deadline}</p>
      <p style="margin: 10px 0;"><strong>Stake:</strong> $${stake.toFixed(2)}</p>
    </div>

    <!-- Payment Details -->
    <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #1f2937;">Payment Details</h3>
      <p style="margin: 10px 0; font-family: monospace; font-size: 14px; color: #666;">
        Transaction ID: ${stripeTransactionId}
      </p>
      <p style="margin: 10px 0; font-size: 12px; color: #666;">
        Processed securely by Stripe
      </p>
    </div>

    <!-- What Happens Next -->
    <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #1e40af;">What Happens Next?</h3>
      <p style="margin: 10px 0; font-size: 14px;">
        <strong style="color: #10b981;">If you succeed:</strong> You'll get $${potentialRefund.toFixed(2)} refunded (95% of your stake). We keep $${platformFee.toFixed(2)} as a platform fee.
      </p>
      <p style="margin: 10px 0; font-size: 14px;">
        <strong style="color: #f59e0b;">If you don't complete it:</strong> 75% ($${(stake * 0.75).toFixed(2)}) goes to your chosen charity. We keep 25% ($${(stake * 0.25).toFixed(2)}) as a platform fee.
      </p>
    </div>
  </div>

  <!-- CTA Button -->
  <div style="text-align: center; margin: 30px 0;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://uphold.app'}/commitment/${commitmentId}"
       style="display: inline-block; background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600;">
      View Your Commitment
    </a>
  </div>

  <!-- Footer -->
  <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px;">
    <p>You're receiving this email because you created a commitment on Uphold.</p>
    <p style="margin-top: 10px;">
      Questions? Reply to this email or visit our
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://uphold.app'}/how-it-works" style="color: #2563eb;">Help Center</a>
    </p>
  </div>

</body>
</html>
    `,
  };
}

interface RefundProcessedEmailParams {
  userName: string;
  commitmentIntention: string;
  originalStake: number;
  refundAmount: number;
  platformFee: number;
  refundId: string;
}

export function getRefundProcessedEmail(params: RefundProcessedEmailParams) {
  const { userName, commitmentIntention, originalStake, refundAmount, platformFee, refundId } = params;

  return {
    subject: `Congratulations! Your $${refundAmount.toFixed(2)} refund is being processed`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Refund Processed - Uphold</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <!-- Header -->
  <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #2563eb;">
    <h1 style="font-size: 32px; font-weight: 300; margin: 0;">
      Up<span style="font-weight: 700;">hold</span>
    </h1>
    <p style="color: #666; margin: 5px 0 0 0;">Keep your word.</p>
  </div>

  <!-- Main Content -->
  <div style="background: #f0fdf4; padding: 30px; border-radius: 8px; margin-bottom: 20px; border: 2px solid #10b981;">
    <h2 style="color: #10b981; margin-top: 0;">🎉 Congratulations! You Did It!</h2>
    <p style="font-size: 16px; margin-bottom: 20px;">
      Hi ${userName},
    </p>
    <p style="font-size: 16px; margin-bottom: 20px;">
      You successfully completed your commitment: <strong>"${commitmentIntention}"</strong>
    </p>
    <p style="font-size: 16px; margin-bottom: 20px;">
      Your refund of <strong>$${refundAmount.toFixed(2)}</strong> has been processed and will appear in your account within 5-10 business days.
    </p>

    <!-- Refund Breakdown -->
    <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #1f2937;">Refund Breakdown</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Original Stake:</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">$${originalStake.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Platform Fee (5%):</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: #666;">-$${platformFee.toFixed(2)}</td>
        </tr>
        <tr style="background: #f0fdf4;">
          <td style="padding: 12px 8px; font-weight: 700; color: #10b981;">Refund Amount (95%):</td>
          <td style="padding: 12px 8px; text-align: right; font-weight: 700; font-size: 18px; color: #10b981;">$${refundAmount.toFixed(2)}</td>
        </tr>
      </table>
      <p style="margin: 15px 0 0 0; font-size: 12px; color: #666; font-family: monospace;">
        Refund ID: ${refundId}
      </p>
    </div>

    <!-- Timeline -->
    <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #1e40af;">When Will I Get My Money?</h3>
      <p style="margin: 5px 0; font-size: 14px;">
        ✓ Your refund was processed immediately by Stripe
      </p>
      <p style="margin: 5px 0; font-size: 14px;">
        ⏱ It typically takes 5-10 business days for your bank to credit your account
      </p>
      <p style="margin: 5px 0; font-size: 14px;">
        📧 You'll see "UPHOLD REFUND" on your credit card statement
      </p>
    </div>
  </div>

  <!-- Encouragement -->
  <div style="text-align: center; background: #f8fafc; padding: 25px; border-radius: 6px; margin: 20px 0;">
    <p style="font-size: 16px; color: #1f2937; margin: 0 0 15px 0;">
      <strong>Way to go!</strong> You held yourself accountable and followed through.
    </p>
    <p style="font-size: 14px; color: #666; margin: 0;">
      Ready for your next challenge?
    </p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://uphold.app'}/test-create"
       style="display: inline-block; background: #2563eb; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 15px;">
      Create New Commitment
    </a>
  </div>

  <!-- Footer -->
  <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px;">
    <p>Questions about your refund? Reply to this email and we'll help.</p>
  </div>

</body>
</html>
    `,
  };
}

interface CommitmentReminderEmailParams {
  userName: string;
  commitmentIntention: string;
  deadline: string;
  daysLeft: number;
  commitmentId: string;
  stake: number;
}

export function getCommitmentReminderEmail(params: CommitmentReminderEmailParams) {
  const { userName, commitmentIntention, deadline, daysLeft, commitmentId, stake } = params;

  const urgencyLevel = daysLeft <= 1 ? 'high' : daysLeft <= 3 ? 'medium' : 'low';
  const urgencyColor = urgencyLevel === 'high' ? '#dc2626' : urgencyLevel === 'medium' ? '#f59e0b' : '#3b82f6';
  const urgencyBg = urgencyLevel === 'high' ? '#fef2f2' : urgencyLevel === 'medium' ? '#fffbeb' : '#eff6ff';

  return {
    subject: `Reminder: ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left for your commitment`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Commitment Reminder - Uphold</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <!-- Header -->
  <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #2563eb;">
    <h1 style="font-size: 32px; font-weight: 300; margin: 0;">
      Up<span style="font-weight: 700;">hold</span>
    </h1>
    <p style="color: #666; margin: 5px 0 0 0;">Keep your word.</p>
  </div>

  <!-- Main Content -->
  <div style="background: ${urgencyBg}; padding: 30px; border-radius: 8px; margin-bottom: 20px; border: 2px solid ${urgencyColor};">
    <h2 style="color: ${urgencyColor}; margin-top: 0;">⏰ Time Check: ${daysLeft} Day${daysLeft !== 1 ? 's' : ''} Left</h2>
    <p style="font-size: 16px; margin-bottom: 20px;">
      Hi ${userName},
    </p>
    <p style="font-size: 16px; margin-bottom: 20px;">
      This is a friendly reminder about your commitment. The deadline is approaching!
    </p>

    <!-- Commitment Details -->
    <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #1f2937;">Your Commitment</h3>
      <p style="margin: 10px 0; font-size: 18px; font-weight: 600; color: #1f2937;">
        "${commitmentIntention}"
      </p>
      <p style="margin: 15px 0; padding-top: 15px; border-top: 1px solid #e5e7eb;">
        <strong>Deadline:</strong> ${deadline}
      </p>
      <p style="margin: 10px 0;">
        <strong>At Stake:</strong> $${stake.toFixed(2)}
      </p>
      <p style="margin: 10px 0; color: ${urgencyColor}; font-weight: 600; font-size: 24px;">
        ${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining
      </p>
    </div>

    <!-- What's at Stake -->
    <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #1f2937;">What's at Stake?</h3>
      <div style="padding: 12px; background: #f0fdf4; border-radius: 6px; margin: 10px 0;">
        <p style="margin: 0; font-size: 14px;">
          <strong style="color: #10b981;">Complete it:</strong> Get $${(stake * 0.95).toFixed(2)} refunded
        </p>
      </div>
      <div style="padding: 12px; background: #fef2f2; border-radius: 6px; margin: 10px 0;">
        <p style="margin: 0; font-size: 14px;">
          <strong style="color: #dc2626;">Miss it:</strong> $${(stake * 0.75).toFixed(2)} donated to charity
        </p>
      </div>
    </div>

    ${urgencyLevel === 'high' ? `
    <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #991b1b; font-weight: 600;">
        ⚠️ URGENT: Less than 24 hours remaining! Complete your commitment now to get your refund.
      </p>
    </div>
    ` : ''}
  </div>

  <!-- CTA Button -->
  <div style="text-align: center; margin: 30px 0;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://uphold.app'}/commitment/${commitmentId}"
       style="display: inline-block; background: ${urgencyColor}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
      Mark as Complete
    </a>
  </div>

  <!-- Motivation -->
  <div style="text-align: center; background: #f8fafc; padding: 20px; border-radius: 6px;">
    <p style="font-size: 14px; color: #666; margin: 0; font-style: italic;">
      "The secret of getting ahead is getting started." - Mark Twain
    </p>
  </div>

  <!-- Footer -->
  <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px;">
    <p>You're receiving this reminder because you have an active commitment on Uphold.</p>
    <p style="margin-top: 10px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://uphold.app'}/dashboard" style="color: #2563eb;">View All Commitments</a>
    </p>
  </div>

</body>
</html>
    `,
  };
}
