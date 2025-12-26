import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/resend";
import { getRefundProcessedEmail } from "@/lib/email-templates";

/**
 * REFUND PROCESSED EMAIL API
 *
 * Sends refund confirmation email after successful commitment completion
 * Called from process-refund API after refund is processed
 */
export async function POST(request: NextRequest) {
  try {
    const { commitmentId, userId } = await request.json();

    if (!commitmentId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get commitment details
    const { data: commitment, error: commitmentError } = await supabase
      .from("commitments")
      .select("*")
      .eq("id", commitmentId)
      .eq("user_id", userId)
      .single();

    if (commitmentError || !commitment) {
      console.error("Failed to fetch commitment:", commitmentError);
      return NextResponse.json(
        { error: "Commitment not found" },
        { status: 404 }
      );
    }

    // Get user details
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      console.error("Failed to fetch user:", userError);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get payment details
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("commitment_id", commitmentId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (paymentError || !payment) {
      console.error("Failed to fetch payment:", paymentError);
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Calculate refund details
    const originalStake = payment.amount;
    const platformFee = commitment.platform_fee_amount || 4.95;
    const refundAmount = commitment.refund_amount || (originalStake - platformFee);
    const refundId = payment.stripe_refund_id || `simulated_refund_${Date.now()}`;

    // Send refund processed email
    const emailTemplate = getRefundProcessedEmail({
      userName: user.full_name || user.email.split("@")[0],
      commitmentIntention: commitment.intention,
      originalStake: originalStake,
      refundAmount: refundAmount,
      platformFee: platformFee,
      refundId: refundId,
    });

    await sendEmail({
      to: user.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    console.log(`[Email] Refund confirmation sent to ${user.email}`);

    return NextResponse.json({
      success: true,
      message: "Refund confirmation email sent successfully",
    });
  } catch (error: any) {
    console.error("Refund confirmation email error:", error);

    // Don't fail the refund flow if email fails
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to send refund confirmation email",
        note: "Email failure doesn't affect refund"
      },
      { status: 200 } // Return 200 so refund flow doesn't fail
    );
  }
}
