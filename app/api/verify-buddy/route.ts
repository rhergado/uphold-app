import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { token, approved, rejectionReason } = await request.json();

    if (!token || approved === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get verification record
    const { data: verification, error: verificationError } = await supabase
      .from("buddy_verifications")
      .select("*")
      .eq("verification_token", token)
      .single();

    if (verificationError || !verification) {
      return NextResponse.json(
        { error: "Invalid verification token" },
        { status: 404 }
      );
    }

    // Check if already verified
    if (verification.status !== "pending") {
      return NextResponse.json(
        { error: "This verification has already been processed" },
        { status: 400 }
      );
    }

    // Check if expired
    if (new Date(verification.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "This verification link has expired" },
        { status: 400 }
      );
    }

    // Update verification status
    const newStatus = approved ? "approved" : "rejected";
    const { error: updateError } = await supabase
      .from("buddy_verifications")
      .update({
        status: newStatus,
        verified_at: new Date().toISOString(),
        rejection_reason: rejectionReason || null,
      })
      .eq("id", verification.id);

    if (updateError) {
      console.error("Error updating verification:", updateError);
      return NextResponse.json(
        { error: "Failed to update verification" },
        { status: 500 }
      );
    }

    // If approved, mark commitment as completed and process refund
    if (approved) {
      const { error: commitmentError } = await supabase
        .from("commitments")
        .update({ status: "completed" })
        .eq("id", verification.commitment_id);

      if (commitmentError) {
        console.error("Error updating commitment:", commitmentError);
      }

      // Process refund
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/process-refund`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            commitmentId: verification.commitment_id,
            userId: verification.user_id,
          }),
        });
      } catch (refundError) {
        console.error("Refund processing error:", refundError);
      }
    }

    return NextResponse.json({
      success: true,
      approved,
      message: approved
        ? "Commitment verified successfully!"
        : "Verification declined",
    });
  } catch (error: any) {
    console.error("Verify buddy error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process verification" },
      { status: 500 }
    );
  }
}
