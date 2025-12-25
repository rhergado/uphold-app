import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * This endpoint marks a payment as donated to charity.
 * In a real implementation, this would integrate with charity payment APIs.
 * For MVP, we're tracking the donation intent in the database.
 */
export async function POST(request: NextRequest) {
  try {
    const { commitmentId, userId, charity } = await request.json();

    if (!commitmentId || !userId || !charity) {
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
    // Failure: 25% platform fee, 75% donated to charity
    const platformFee = payment.amount * 0.25;
    const donationAmount = payment.amount * 0.75;

    // Update payment record to mark as donated
    // In production, you would:
    // 1. Create a transfer to the charity via Stripe Connect (75% of stake)
    // 2. Or integrate with charity payment API
    // 3. Then update the record with the transaction details
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        status: "donated",
        donation_amount: donationAmount,
        donation_date: new Date().toISOString(),
        donation_charity: charity,
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
        charity_donation_amount: donationAmount,
        refund_amount: 0,
      })
      .eq("id", commitmentId);

    if (commitmentError) {
      console.error("Failed to update commitment:", commitmentError);
    }

    return NextResponse.json({
      success: true,
      donationAmount: donationAmount,
      platformFee: platformFee,
      originalAmount: payment.amount,
      charity: charity,
    });
  } catch (error: any) {
    console.error("Donation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process donation" },
      { status: 500 }
    );
  }
}
