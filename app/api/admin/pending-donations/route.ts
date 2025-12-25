import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * Admin endpoint to fetch all failed commitments that need charity donations processed
 *
 * Security: In production, this should be protected with admin authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - No user ID provided" },
        { status: 401 }
      );
    }

    // Verify user is admin
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", userId)
      .single();

    if (userError || !userData || !userData.is_admin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // Fetch all failed commitments with user details
    const { data: failedCommitments, error } = await supabase
      .from("commitments")
      .select(`
        id,
        user_id,
        intention,
        stake,
        charity,
        charity_donation_amount,
        platform_fee_amount,
        status,
        due_date,
        created_at,
        users!inner(email)
      `)
      .eq("status", "failed")
      .order("due_date", { ascending: true });

    if (error) {
      console.error("Error fetching failed commitments:", error);
      return NextResponse.json(
        { error: "Failed to fetch pending donations" },
        { status: 500 }
      );
    }

    // Transform data to include user email
    const donations = failedCommitments.map((commitment: any) => ({
      id: commitment.id,
      user_id: commitment.user_id,
      user_email: commitment.users?.email || "unknown@email.com",
      goal: commitment.intention,
      stake: commitment.stake,
      charity: commitment.charity,
      charity_donation_amount: commitment.charity_donation_amount || commitment.stake * 0.75,
      platform_fee_amount: commitment.platform_fee_amount || commitment.stake * 0.25,
      status: commitment.status,
      due_date: commitment.due_date,
      failed_at: commitment.created_at, // You might want to add a specific failed_at timestamp
    }));

    return NextResponse.json({
      success: true,
      count: donations.length,
      donations,
    });

  } catch (error: any) {
    console.error("Admin pending donations error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
