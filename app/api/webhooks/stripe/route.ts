import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
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
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      // Update payment status in database
      const { error } = await supabase
        .from("payments")
        .update({
          status: "succeeded",
          stripe_payment_method_id: paymentIntent.payment_method as string,
        })
        .eq("stripe_payment_intent_id", paymentIntent.id);

      if (error) {
        console.error("Failed to update payment status:", error);
      }
      break;

    case "payment_intent.payment_failed":
      const failedIntent = event.data.object as Stripe.PaymentIntent;

      await supabase
        .from("payments")
        .update({ status: "failed" })
        .eq("stripe_payment_intent_id", failedIntent.id);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
