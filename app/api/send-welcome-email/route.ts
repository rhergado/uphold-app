import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/resend";

/**
 * WELCOME EMAIL API
 *
 * Sends a welcome email to new users after signup
 * Called from the signup flow after successful account creation
 */
export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Welcome email template
    const welcomeEmail = {
      subject: "Welcome to Uphold - Let's Make Your First Commitment!",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Uphold</title>
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
    <h2 style="color: #10b981; margin-top: 0;">🎉 Welcome to Uphold!</h2>
    <p style="font-size: 16px; margin-bottom: 20px;">
      Hi ${name},
    </p>
    <p style="font-size: 16px; margin-bottom: 20px;">
      Thanks for joining Uphold! You've just taken the first step toward making commitments that stick.
    </p>
    <p style="font-size: 16px; margin-bottom: 20px;">
      We're here to help you follow through on your goals by adding real accountability - with stakes that actually matter.
    </p>
  </div>

  <!-- How It Works -->
  <div style="background: #f8fafc; padding: 25px; border-radius: 6px; margin-bottom: 20px;">
    <h3 style="margin-top: 0; color: #1f2937;">How Uphold Works</h3>

    <div style="margin: 15px 0;">
      <p style="margin: 0; font-weight: 600; color: #2563eb;">1️⃣ Make a Commitment</p>
      <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
        Choose a goal, set a deadline, and put real money on the line ($15-$150).
      </p>
    </div>

    <div style="margin: 15px 0;">
      <p style="margin: 0; font-weight: 600; color: #2563eb;">2️⃣ Follow Through</p>
      <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
        Complete your commitment before the deadline and you're accountable.
      </p>
    </div>

    <div style="margin: 15px 0;">
      <p style="margin: 0; font-weight: 600; color: #2563eb;">3️⃣ Get Your Money Back</p>
      <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
        Succeed? Get your stake back minus a flat $4.95 platform fee.<br>
        Fail? 70% goes to your chosen charity, 30% platform fee.
      </p>
    </div>
  </div>

  <!-- Pricing Breakdown -->
  <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 20px;">
    <h3 style="margin-top: 0; color: #1e40af;">💰 Our Pricing</h3>
    <p style="margin: 10px 0; font-size: 14px;">
      <strong style="color: #10b981;">If you succeed:</strong> Flat $4.95 platform fee (you get the rest back)
    </p>
    <p style="margin: 10px 0; font-size: 14px;">
      <strong style="color: #f59e0b;">If you fail:</strong> 30% platform fee, 70% donated to charity
    </p>
    <p style="margin: 10px 0; font-size: 12px; color: #666;">
      Stakes range from $15 to $150. The higher the stakes, the stronger the accountability.
    </p>
  </div>

  <!-- CTA Button -->
  <div style="text-align: center; margin: 30px 0;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://uphold.app'}/test-create"
       style="display: inline-block; background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
      Make Your First Commitment
    </a>
  </div>

  <!-- Tips Section -->
  <div style="background: #fffbeb; padding: 20px; border-radius: 6px; margin-bottom: 20px; border: 1px solid #fde047;">
    <h3 style="margin-top: 0; color: #92400e;">💡 Pro Tips</h3>
    <ul style="margin: 10px 0; padding-left: 20px; font-size: 14px; color: #78350f;">
      <li style="margin-bottom: 8px;">Start with a meaningful but achievable goal</li>
      <li style="margin-bottom: 8px;">Choose a stake amount that motivates you without causing stress</li>
      <li style="margin-bottom: 8px;">Pick a charity you care about - it makes the accountability real</li>
      <li>Set realistic deadlines that challenge you but are achievable</li>
    </ul>
  </div>

  <!-- Footer -->
  <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px;">
    <p>Questions? Reply to this email and we'll help!</p>
    <p style="margin-top: 10px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://uphold.app'}/how-it-works" style="color: #2563eb;">How It Works</a> •
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://uphold.app'}/terms" style="color: #2563eb;">Terms</a> •
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://uphold.app'}/privacy" style="color: #2563eb;">Privacy</a>
    </p>
    <p style="margin-top: 15px; color: #999;">
      © 2025 Uphold. All rights reserved.
    </p>
  </div>

</body>
</html>
      `,
    };

    // Send the email
    await sendEmail({
      to: email,
      subject: welcomeEmail.subject,
      html: welcomeEmail.html,
    });

    return NextResponse.json({
      success: true,
      message: "Welcome email sent successfully",
    });
  } catch (error: any) {
    console.error("Welcome email error:", error);

    // Don't fail the signup if email fails, just log it
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to send welcome email",
        note: "Email failure doesn't affect account creation"
      },
      { status: 200 } // Return 200 so signup flow doesn't fail
    );
  }
}
