import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * ADMIN API: Mark donations as manually processed
 *
 * This endpoint allows admins to:
 * 1. Mark a batch of donations as processed
 * 2. Store the batch ID for grouping
 * 3. Add receipt URL for transparency
 * 4. Add admin notes
 *
 * Called when admin uploads receipt after manually donating to charity
 */
export async function POST(request: NextRequest) {
  try {
    const {
      paymentIds,
      adminEmail,
      batchId,
      receiptUrl,
      notes
    } = await request.json();

    if (!paymentIds || !Array.isArray(paymentIds) || paymentIds.length === 0) {
      return NextResponse.json(
        { error: "paymentIds array is required" },
        { status: 400 }
      );
    }

    if (!adminEmail) {
      return NextResponse.json(
        { error: "adminEmail is required" },
        { status: 400 }
      );
    }

    // Verify admin status (check if user is in admins table)
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

    // Get all payments to verify they exist and are in donated status
    const { data: payments, error: fetchError } = await supabase
      .from("payments")
      .select("id, commitment_id, user_id, amount, donation_charity, donation_processed_at")
      .in("id", paymentIds);

    if (fetchError) {
      console.error("Error fetching payments:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch payment records" },
        { status: 500 }
      );
    }

    if (!payments || payments.length === 0) {
      return NextResponse.json(
        { error: "No matching payment records found" },
        { status: 404 }
      );
    }

    // Check if any are already processed
    const alreadyProcessed = payments.filter(p => p.donation_processed_at !== null);
    if (alreadyProcessed.length > 0) {
      return NextResponse.json(
        {
          error: `${alreadyProcessed.length} donation(s) already processed`,
          alreadyProcessedIds: alreadyProcessed.map(p => p.id)
        },
        { status: 400 }
      );
    }

    // Update all payments with processing details
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        donation_processed_at: new Date().toISOString(),
        donation_processed_by: adminEmail,
        donation_batch_id: batchId || null,
        donation_receipt_url: receiptUrl || null,
        donation_notes: notes || null,
      })
      .in("id", paymentIds);

    if (updateError) {
      console.error("Failed to update payment records:", updateError);
      return NextResponse.json(
        { error: "Failed to update payment records" },
        { status: 500 }
      );
    }

    console.log(`[ADMIN] ${adminEmail} marked ${paymentIds.length} donations as processed`);
    console.log(`  Batch ID: ${batchId || "none"}`);
    console.log(`  Receipt URL: ${receiptUrl || "none"}`);

    return NextResponse.json({
      success: true,
      processedCount: paymentIds.length,
      batchId: batchId,
      adminEmail: adminEmail,
      message: `Successfully marked ${paymentIds.length} donation(s) as processed`,
    });
  } catch (error: any) {
    console.error("Mark donations processed error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to mark donations as processed" },
      { status: 500 }
    );
  }
}
