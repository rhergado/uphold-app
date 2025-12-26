import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/resend";
import { getPaymentConfirmationEmail } from "@/lib/email-templates";

/**
 * STRIPE WEBHOOK HANDLER
 *
 * Handles Stripe webhook events, specifically payment confirmations
 * Documentation: https://stripe.com/docs/webhooks
 */

// Disable body parsing for webhook validation
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      console.log(`[Webhook] Payment succeeded: ${paymentIntent.id}`);

      // Update payment status in database
      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .update({ status: "succeeded" })
        .eq("stripe_payment_intent_id", paymentIntent.id)
        .select()
        .single();

      if (paymentError || !payment) {
        console.error("Failed to update payment:", paymentError);
        break;
      }

      // Get commitment and user details for email
      const { data: commitment, error: commitmentError } = await supabase
        .from("commitments")
        .select("*, charity:charity_id(*)")
        .eq("id", payment.commitment_id)
        .single();

      if (commitmentError || !commitment) {
        console.error("Failed to fetch commitment:", commitmentError);
        break;
      }

      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", payment.user_id)
        .single();

      if (userError || !user) {
        console.error("Failed to fetch user:", userError);
        break;
      }

      // Send payment confirmation email
      try {
        const emailTemplate = getPaymentConfirmationEmail({
          userName: user.full_name || user.email.split("@")[0],
          commitmentIntention: commitment.intention,
          stake: payment.amount,
          deadline: new Date(commitment.due_date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          stripeTransactionId: paymentIntent.id,
          commitmentId: commitment.id,
        });

        await sendEmail({
          to: user.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
        });

        console.log(`[Webhook] Payment confirmation email sent to ${user.email}`);
      } catch (emailError) {
        console.error("Failed to send payment confirmation email:", emailError);
        // Don't fail the webhook if email fails
      }

      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      console.log(`[Webhook] Payment failed: ${paymentIntent.id}`);

      // Update payment status
      await supabase
        .from("payments")
        .update({ status: "failed" })
        .eq("stripe_payment_intent_id", paymentIntent.id);

      break;
    }

    default:
      console.log(`[Webhook] Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
