import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";

/**
 * REAL REFUND PROCESSING (Production Mode)
 *
 * 🎯 CHEAT CODE: Stakes of $5.55 are still simulated (no real Stripe refund)
 * All other amounts process real Stripe refunds
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

    // Get payment record - first try to find with "succeeded" status
    let { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("commitment_id", commitmentId)
      .eq("user_id", userId)
      .eq("status", "succeeded")
      .single();

    // If not found with "succeeded", try to find ANY payment for this commitment
    if (paymentError || !payment) {
      const { data: anyPayment, error: anyError } = await supabase
        .from("payments")
        .select("*")
        .eq("commitment_id", commitmentId)
        .eq("user_id", userId)
        .single();

      if (anyError || !anyPayment) {
        console.error("No payment found for commitment:", commitmentId);
        return NextResponse.json(
          { error: "Payment not found or already processed" },
          { status: 404 }
        );
      }

      // Check if already refunded
      if (anyPayment.status === "refunded") {
        console.log("Payment already refunded:", anyPayment.id);
        return NextResponse.json(
          { error: "This payment has already been refunded" },
          { status: 400 }
        );
      }

      // Use this payment anyway (might be a different status due to previous error)
      payment = anyPayment;
      console.log(`Found payment with status "${payment.status}", processing refund anyway`);
    }

    // Calculate amounts based on new pricing model
    // Success: 5% platform fee, 95% refunded to user
    const platformFee = payment.amount * 0.05;
    const refundAmount = payment.amount * 0.95;

    // 🎯 CHEAT CODE: Check if this is test mode ($5.55 stake)
    const isTestMode = payment.amount === 5.55;

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

    // Update payment record
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        status: "refunded",
        refund_amount: refundAmount,
        refund_date: new Date().toISOString(),
        refund_id: refundId,
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
      simulated: isTestMode, // Flag to indicate if this is a test/simulated refund
      refundId: refundId,
      refundAmount: refundAmount,
      platformFee: platformFee,
      originalAmount: payment.amount,
      message: isTestMode
        ? `[SIMULATED] Refund of $${refundAmount.toFixed(2)} processed successfully`
        : `[REAL] Stripe refund of $${refundAmount.toFixed(2)} processed successfully`,
    });
  } catch (error: any) {
    console.error("Refund error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process refund" },
      { status: 500 }
    );
  }
}
