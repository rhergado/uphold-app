import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { amount, userId, commitmentId } = await request.json();

    if (!amount || !userId || !commitmentId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate fee breakdown based on flat fee pricing model
    // Success: Flat $4.95 platform fee, remainder refunded
    // Failure: 30% platform fee, 70% donated to charity
    const successFee = 4.95;
    const successRefund = amount - 4.95;
    const failureFee = amount * 0.30;
    const failureDonation = amount * 0.70;

    // 🎯 CHEAT CODE: $5.55 triggers simulated payment (for testing without real Stripe charges)
    const isTestMode = amount === 5.55;

    let paymentIntent;

    if (isTestMode) {
      // SIMULATED MODE: Create fake payment intent for testing
      console.log("[SIMULATED PAYMENT] Cheat code activated with $5.55 stake");
      paymentIntent = {
        id: `test_pi_${Date.now()}`,
        client_secret: `test_secret_${Date.now()}`,
      };
    } else {
      // REAL MODE: Create actual PaymentIntent with Stripe
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert dollars to cents
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          userId,
          commitmentId,
        },
      });
    }

    // Update commitment with fee calculations
    const { error: commitmentError } = await supabase
      .from("commitments")
      .update({
        payment_intent_id: paymentIntent.id,
        // Store the potential amounts (actual amounts set when commitment completes/fails)
        platform_fee_amount: 0, // Will be set to successFee or failureFee when resolved
        refund_amount: 0, // Will be set to successRefund when successful
        charity_donation_amount: 0, // Will be set to failureDonation when failed
      })
      .eq("id", commitmentId);

    if (commitmentError) {
      console.error("Commitment update error:", commitmentError);
      return NextResponse.json(
        { error: "Failed to update commitment" },
        { status: 500 }
      );
    }

    // Create payment record in database
    const { error: dbError } = await supabase
      .from("payments")
      .insert([{
        commitment_id: commitmentId,
        user_id: userId,
        amount: amount,
        currency: "usd",
        stripe_payment_intent_id: paymentIntent.id,
        status: isTestMode ? "succeeded" : "pending", // Auto-succeed test payments
      }]);

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to create payment record" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      isTestMode, // Tell the frontend this is test mode
      feeBreakdown: {
        stake: amount,
        success: {
          platformFee: successFee,
          refundToUser: successRefund,
        },
        failure: {
          platformFee: failureFee,
          charityDonation: failureDonation,
        },
      },
    });
  } catch (error: any) {
    console.error("Payment intent creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
