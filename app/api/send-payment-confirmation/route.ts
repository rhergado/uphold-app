import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/resend";
import { getPaymentConfirmationEmail } from "@/lib/email-templates";

/**
 * PAYMENT CONFIRMATION EMAIL API
 *
 * Sends payment confirmation email after successful payment
 * Called as fallback when webhook isn't available
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

    // Format deadline
    const deadline = new Date(commitment.due_date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Send payment confirmation email
    const emailTemplate = getPaymentConfirmationEmail({
      userName: user.full_name || user.email.split("@")[0],
      commitmentIntention: commitment.intention,
      stake: payment.amount,
      deadline: deadline,
      stripeTransactionId: payment.stripe_payment_intent_id,
      commitmentId: commitment.id,
    });

    await sendEmail({
      to: user.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    console.log(`[Email] Payment confirmation sent to ${user.email}`);

    return NextResponse.json({
      success: true,
      message: "Payment confirmation email sent successfully",
    });
  } catch (error: any) {
    console.error("Payment confirmation email error:", error);

    // Don't fail the payment flow if email fails
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to send payment confirmation email",
        note: "Email failure doesn't affect payment"
      },
      { status: 200 } // Return 200 so payment flow doesn't fail
    );
  }
}
