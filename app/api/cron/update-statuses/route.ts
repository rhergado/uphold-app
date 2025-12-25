import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * Cron job endpoint to automatically update commitment statuses
 * Runs periodically to check for expired commitments and mark them as failed
 *
 * This endpoint should be called by Vercel Cron or similar scheduler
 */
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron (optional but recommended)
    const authHeader = request.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date().toISOString();
    let updatedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // 1. Find all active one-time commitments that are past their due date
    const { data: expiredOneTime, error: oneTimeError } = await supabase
      .from("commitments")
      .select("id, user_id, stake, charity")
      .eq("status", "active")
      .eq("commitment_type", "one-time")
      .lt("due_date", now);

    if (oneTimeError) {
      console.error("Error fetching expired one-time commitments:", oneTimeError);
      errors.push(`One-time query error: ${oneTimeError.message}`);
    }

    // 2. Find all active periodic commitments that are past their end date
    const { data: expiredPeriodic, error: periodicError } = await supabase
      .from("commitments")
      .select("id, user_id, stake, charity, start_date, duration_weeks")
      .eq("status", "active")
      .eq("commitment_type", "periodic");

    if (periodicError) {
      console.error("Error fetching periodic commitments:", periodicError);
      errors.push(`Periodic query error: ${periodicError.message}`);
    }

    // Filter periodic commitments that are past end date and don't meet 80% threshold
    const expiredPeriodicFiltered = [];
    if (expiredPeriodic) {
      for (const commitment of expiredPeriodic) {
        if (!commitment.start_date || !commitment.duration_weeks) continue;

        // Calculate end date
        const startDate = new Date(commitment.start_date);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + (commitment.duration_weeks * 7));

        // Check if past end date
        if (endDate < new Date()) {
          // Check completion rate
          const { data: checkIns } = await supabase
            .from("check_ins")
            .select("id, check_in_date")
            .eq("commitment_id", commitment.id);

          // Calculate total expected instances
          const { data: allCheckIns } = await supabase
            .from("check_ins")
            .select("id")
            .eq("commitment_id", commitment.id);

          const completedCount = checkIns?.filter(c => c.check_in_date).length || 0;
          const totalCount = allCheckIns?.length || 0;
          const completionRate = totalCount > 0 ? completedCount / totalCount : 0;

          // If less than 80% completed, mark as failed
          if (completionRate < 0.8) {
            expiredPeriodicFiltered.push(commitment);
          } else {
            // Mark as completed (they met the 80% threshold)
            const { error: updateError } = await supabase
              .from("commitments")
              .update({ status: "completed" })
              .eq("id", commitment.id);

            if (!updateError) {
              updatedCount++;

              // Process refund for successful periodic commitment
              try {
                await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/process-refund`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    commitmentId: commitment.id,
                    userId: commitment.user_id,
                  }),
                });
              } catch (refundError) {
                console.error(`Refund failed for commitment ${commitment.id}:`, refundError);
                errors.push(`Refund failed for ${commitment.id}`);
              }
            }
          }
        }
      }
    }

    // 3. Combine all expired commitments
    const allExpired = [...(expiredOneTime || []), ...expiredPeriodicFiltered];

    // 4. Mark each as failed and trigger donation
    for (const commitment of allExpired) {
      // Update status to failed
      const { error: updateError } = await supabase
        .from("commitments")
        .update({ status: "failed" })
        .eq("id", commitment.id);

      if (updateError) {
        console.error(`Failed to update commitment ${commitment.id}:`, updateError);
        errors.push(`Update failed for ${commitment.id}: ${updateError.message}`);
        failedCount++;
        continue;
      }

      updatedCount++;

      // Trigger donation process
      try {
        const donationResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/process-donation`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            commitmentId: commitment.id,
            userId: commitment.user_id,
            charity: commitment.charity,
          }),
        });

        if (!donationResponse.ok) {
          const errorData = await donationResponse.json();
          console.error(`Donation failed for commitment ${commitment.id}:`, errorData);
          errors.push(`Donation failed for ${commitment.id}: ${errorData.error || 'Unknown error'}`);
        }
      } catch (donationError) {
        console.error(`Donation request failed for commitment ${commitment.id}:`, donationError);
        errors.push(`Donation request failed for ${commitment.id}`);
      }
    }

    // 5. Return summary
    return NextResponse.json({
      success: true,
      message: "Status update completed",
      timestamp: now,
      stats: {
        checked: (expiredOneTime?.length || 0) + (expiredPeriodic?.length || 0),
        updated: updatedCount,
        failed: failedCount,
        errors: errors.length,
      },
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error: any) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update statuses",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
