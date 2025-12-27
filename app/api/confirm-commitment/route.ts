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

    // Update the commitment with word_confirmed_at timestamp
    const { data, error } = await supabase
      .from("commitments")
      .update({
        word_confirmed_at: new Date().toISOString(),
      })
      .eq("id", commitmentId)
      .select()
      .single();

    if (error) {
      console.error("Error confirming commitment:", error);
      return NextResponse.json(
        { error: "Failed to confirm commitment" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
