import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCharityById } from "@/lib/charities";

/**
 * SIMULATED DONATION PROCESSING (MVP/Testing Mode)
 *
 * This endpoint simulates donation processing by marking payments as "donated"
 * without actually transferring funds to charities.
 *
 * For production with real donations, you would:
 * 1. Use Stripe Connect to transfer funds to charity Stripe accounts
 * 2. Or integrate with charity-specific payment APIs
 * 3. Store actual transaction IDs and receipts
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

    // Get charity details for logging
    const charityInfo = getCharityById(charity);
    const charityName = charityInfo?.displayName || charity;

    // SIMULATED DONATION: Mark as donated without actual transfer
    console.log(`[SIMULATED] Processing donation:
      Charity: ${charityName}
      Amount: $${donationAmount.toFixed(2)} (75% of $${payment.amount.toFixed(2)})
      Platform Fee: $${platformFee.toFixed(2)} (25%)
      User: ${userId}
      Commitment: ${commitmentId}
      Status: SIMULATED (no real money transferred)`);

    // Update payment record to mark as donated
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
      simulated: true, // Flag to indicate this is a test/simulated donation
      donationAmount: donationAmount,
      platformFee: platformFee,
      originalAmount: payment.amount,
      charity: charity,
      charityName: charityName,
      message: `[SIMULATED] Donation of $${donationAmount.toFixed(2)} to ${charityName} processed successfully`,
    });
  } catch (error: any) {
    console.error("Donation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process donation" },
      { status: 500 }
    );
  }
}
