import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { commitmentId, userId } = await request.json();

    if (!commitmentId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get commitment details
    const { data: commitment, error: commitmentError } = await supabase
      .from("commitments")
      .select("*")
      .eq("id", commitmentId)
      .eq("user_id", userId)
      .single();

    if (commitmentError || !commitment) {
      console.error("Commitment error:", commitmentError);
      return NextResponse.json(
        { error: "Commitment not found" },
        { status: 404 }
      );
    }

    // Get user details
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("name")
      .eq("id", commitment.user_id)
      .single();

    if (userError || !userData) {
      console.error("User error:", userError);
      console.error("User ID:", commitment.user_id);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (commitment.verification_mode !== "buddy") {
      return NextResponse.json(
        { error: "This commitment does not use buddy verification" },
        { status: 400 }
      );
    }

    if (!commitment.buddy_email) {
      return NextResponse.json(
        { error: "No buddy email specified" },
        { status: 400 }
      );
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days to verify

    // Create verification record
    const { error: verificationError } = await supabase
      .from("buddy_verifications")
      .insert([{
        commitment_id: commitmentId,
        user_id: userId,
        buddy_email: commitment.buddy_email,
        verification_token: verificationToken,
        status: "pending",
        expires_at: expiresAt.toISOString(),
      }]);

    if (verificationError) {
      console.error("Error creating verification record:", verificationError);
      return NextResponse.json(
        { error: "Failed to create verification request" },
        { status: 500 }
      );
    }

    // Send email to buddy
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verificationUrl = `${appUrl}/verify-buddy/${verificationToken}`;

    const userName = userData.name;

    try {
      await resend.emails.send({
        from: "Uphold <onboarding@resend.dev>", // In production, use your domain
        to: commitment.buddy_email,
        subject: `${userName} needs you to verify their commitment`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Buddy Verification Request</h2>
            <p>Hi there!</p>
            <p><strong>${userName}</strong> has completed their commitment on Uphold and needs you to verify it.</p>

            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Commitment:</strong> ${commitment.intention}</p>
              <p style="margin: 5px 0;"><strong>Goal:</strong> ${commitment.outcome}</p>
            </div>

            <p>Please click the button below to confirm whether ${userName} completed this commitment:</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Commitment
              </a>
            </div>

            <p style="color: #666; font-size: 14px;">
              This link will expire in 7 days. If you didn't expect this email, you can safely ignore it.
            </p>

            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              Or copy and paste this URL into your browser:<br>
              ${verificationUrl}
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // Don't fail the request if email fails - verification is still created
    }

    return NextResponse.json({
      success: true,
      message: "Verification request sent to buddy",
    });
  } catch (error: any) {
    console.error("Request buddy verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to request verification" },
      { status: 500 }
    );
  }
}
