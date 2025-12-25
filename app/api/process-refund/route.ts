import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { commitmentId, userId } = await request.json();

    if (!commitmentId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get payment record
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("commitment_id", commitmentId)
      .eq("user_id", userId)
      .eq("status", "succeeded")
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: "Payment not found or already processed" },
        { status: 404 }
      );
    }

    // Calculate amounts based on new pricing model
    // Success: 5% platform fee, 95% refunded to user
    const platformFee = payment.amount * 0.05;
    const refundAmount = payment.amount * 0.95;

    // Create partial refund with Stripe (95% of original amount)
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripe_payment_intent_id,
      amount: Math.round(refundAmount * 100), // Convert to cents
    });

    // Update payment record
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        status: "refunded",
        refund_amount: refundAmount,
        refund_date: new Date().toISOString(),
      })
      .eq("id", payment.id);

    if (updateError) {
      console.error("Failed to update payment record:", updateError);
      return NextResponse.json(
        { error: "Failed to update payment record" },
        { status: 500 }
      );
    }

    // Update commitment with fee breakdown
    const { error: commitmentError } = await supabase
      .from("commitments")
      .update({
        platform_fee_amount: platformFee,
        refund_amount: refundAmount,
        charity_donation_amount: 0,
      })
      .eq("id", commitmentId);

    if (commitmentError) {
      console.error("Failed to update commitment:", commitmentError);
    }

    return NextResponse.json({
      success: true,
      refundId: refund.id,
      refundAmount: refundAmount,
      platformFee: platformFee,
      originalAmount: payment.amount,
    });
  } catch (error: any) {
    console.error("Refund error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process refund" },
      { status: 500 }
    );
  }
}
