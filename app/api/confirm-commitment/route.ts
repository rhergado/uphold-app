import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { commitmentId } = await request.json();

    if (!commitmentId) {
      return NextResponse.json(
        { error: "Commitment ID is required" },
        { status: 400 }
      );
    }

    console.log("Confirming commitment ID:", commitmentId);

    // Verify commitment exists
    const { data: commitment, error: fetchError } = await supabase
      .from("commitments")
      .select("id")
      .eq("id", commitmentId)
      .single();

    if (fetchError || !commitment) {
      console.error("Commitment not found:", fetchError);
      return NextResponse.json(
        { error: "Commitment not found" },
        { status: 404 }
      );
    }

    // TODO: Add word_confirmed_at timestamp once database migration is run
    // For now, just verify commitment exists and return success
    console.log("Commitment confirmed successfully:", commitmentId);

    return NextResponse.json({
      success: true,
      commitmentId: commitment.id,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
