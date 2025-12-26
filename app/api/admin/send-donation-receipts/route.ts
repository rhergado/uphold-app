import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";
import { getDonationReceiptEmail } from "@/lib/email-templates";
import { getCharityById } from "@/lib/charities";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * ADMIN API: Send donation receipt emails to users
 *
 * This endpoint:
 * 1. Takes a batch ID or array of payment IDs
 * 2. Fetches user and commitment details for each donation
 * 3. Sends personalized donation receipt emails with charity receipt link
 * 4. Uses email template from lib/email-templates.ts
 *
 * Called after admin uploads receipt and marks donations as processed
 */
export async function POST(request: NextRequest) {
  try {
    const {
      batchId,
      paymentIds,
      adminEmail
    } = await request.json();

    if (!adminEmail) {
      return NextResponse.json(
        { error: "adminEmail is required" },
        { status: 400 }
      );
    }

    if (!batchId && (!paymentIds || !Array.isArray(paymentIds) || paymentIds.length === 0)) {
      return NextResponse.json(
        { error: "Either batchId or paymentIds array is required" },
        { status: 400 }
      );
    }

    // Verify admin status
    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("*")
      .eq("email", adminEmail)
      .eq("is_active", true)
      .single();

    if (adminError || !admin) {
      console.error("Unauthorized admin attempt:", adminEmail);
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    // Build query to fetch payments
    let query = supabase
      .from("payments")
      .select(`
        id,
        amount,
        donation_amount,
        donation_charity,
        donation_date,
        donation_batch_id,
        donation_receipt_url,
        donation_processed_at,
        commitment_id,
        user_id
      `)
      .eq("status", "donated")
      .not("donation_processed_at", "is", null); // Only processed donations

    // Filter by batch ID or payment IDs
    if (batchId) {
      query = query.eq("donation_batch_id", batchId);
    } else {
      query = query.in("id", paymentIds!);
    }

    const { data: payments, error: fetchError } = await query;

    if (fetchError) {
      console.error("Error fetching payments:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch payment records" },
        { status: 500 }
      );
    }

    if (!payments || payments.length === 0) {
      return NextResponse.json(
        { error: "No matching processed donation records found" },
        { status: 404 }
      );
    }

    // Verify all have receipt URLs
    const missingReceipts = payments.filter(p => !p.donation_receipt_url);
    if (missingReceipts.length > 0) {
      return NextResponse.json(
        {
          error: `${missingReceipts.length} donation(s) missing receipt URL`,
          missingReceiptIds: missingReceipts.map(p => p.id)
        },
        { status: 400 }
      );
    }

    // Fetch user and commitment details for each payment
    const emailPromises = payments.map(async (payment) => {
      try {
        // Get user details
        const { data: user, error: userError } = await supabase
          .from("users")
          .select("email, full_name")
          .eq("id", payment.user_id)
          .single();

        if (userError || !user) {
          console.error(`Failed to fetch user for payment ${payment.id}:`, userError);
          return {
            success: false,
            paymentId: payment.id,
            error: "User not found"
          };
        }

        // Get commitment details
        const { data: commitment, error: commitmentError } = await supabase
          .from("commitments")
          .select("intention")
          .eq("id", payment.commitment_id)
          .single();

        if (commitmentError || !commitment) {
          console.error(`Failed to fetch commitment for payment ${payment.id}:`, commitmentError);
          return {
            success: false,
            paymentId: payment.id,
            error: "Commitment not found"
          };
        }

        // Get charity name
        const charityInfo = getCharityById(payment.donation_charity);
        const charityName = charityInfo?.displayName || payment.donation_charity;

        // Format donation date
        const donationDate = new Date(payment.donation_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        });

        // Generate email
        const emailTemplate = getDonationReceiptEmail({
          userName: user.full_name || user.email.split("@")[0],
          commitmentIntention: commitment.intention,
          donationAmount: payment.donation_amount,
          charityName: charityName,
          originalStake: payment.amount,
          receiptUrl: payment.donation_receipt_url,
          batchId: payment.donation_batch_id || "N/A",
          donationDate: donationDate
        });

        // Send email via Resend
        const { data: emailData, error: emailError } = await resend.emails.send({
          from: "Uphold <onboarding@resend.dev>", // Using Resend's test domain (free tier)
          to: user.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
        });

        if (emailError) {
          console.error(`Failed to send email for payment ${payment.id}:`, emailError);
          return {
            success: false,
            paymentId: payment.id,
            userEmail: user.email,
            error: emailError.message
          };
        }

        console.log(`[EMAIL SENT] Donation receipt to ${user.email} for payment ${payment.id}`);
        return {
          success: true,
          paymentId: payment.id,
          userEmail: user.email,
          emailId: emailData?.id
        };
      } catch (err: any) {
        console.error(`Error processing payment ${payment.id}:`, err);
        return {
          success: false,
          paymentId: payment.id,
          error: err.message
        };
      }
    });

    // Wait for all emails to send
    const results = await Promise.all(emailPromises);

    // Summarize results
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    const failures = results.filter(r => !r.success);

    console.log(`[ADMIN] ${adminEmail} sent ${successCount} donation receipt emails (${failureCount} failed)`);

    return NextResponse.json({
      success: true,
      totalProcessed: results.length,
      successCount: successCount,
      failureCount: failureCount,
      failures: failures,
      message: `Successfully sent ${successCount} donation receipt email(s)${failureCount > 0 ? ` (${failureCount} failed)` : ""}`,
    });
  } catch (error: any) {
    console.error("Send donation receipts error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send donation receipts" },
      { status: 500 }
    );
  }
}
