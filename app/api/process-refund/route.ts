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

    // Create refund with Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripe_payment_intent_id,
      amount: Math.round(payment.amount * 100), // Convert to cents
    });

    // Update payment record
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        status: "refunded",
        refund_amount: payment.amount,
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

    return NextResponse.json({
      success: true,
      refundId: refund.id,
      amount: payment.amount,
    });
  } catch (error: any) {
    console.error("Refund error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process refund" },
      { status: 500 }
    );
  }
}
