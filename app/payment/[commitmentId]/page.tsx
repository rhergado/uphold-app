"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm({ commitmentId, amount }: { commitmentId: string; amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || "An error occurred");
      setProcessing(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success?commitment_id=${commitmentId}`,
      },
    });

    if (confirmError) {
      setError(confirmError.message || "Payment failed");
      setProcessing(false);
    }
  };

  const successRefund = amount * 0.95;
  const successFee = amount * 0.05;
  const failureDonation = amount * 0.75;
  const failureFee = amount * 0.25;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* What You're Paying For */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-5">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          What You're Paying For
        </h4>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Your Stake:</span>
            <span className="text-2xl font-bold text-gray-900">${amount.toFixed(2)}</span>
          </div>

          <div className="border-t border-gray-200 pt-3 space-y-2">
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="text-xs font-semibold text-green-800 mb-1">If You Complete Your Commitment:</p>
              <div className="flex justify-between text-sm">
                <span className="text-green-700">You Get Back:</span>
                <span className="font-semibold text-green-800">${successRefund.toFixed(2)} (95%)</span>
              </div>
              <div className="flex justify-between text-xs text-green-600 mt-1">
                <span>Platform Fee:</span>
                <span>-${successFee.toFixed(2)} (5%)</span>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded p-3">
              <p className="text-xs font-semibold text-orange-800 mb-1">If You Don't Complete It:</p>
              <div className="flex justify-between text-sm">
                <span className="text-orange-700">Goes to Charity:</span>
                <span className="font-semibold text-orange-800">${failureDonation.toFixed(2)} (75%)</span>
              </div>
              <div className="flex justify-between text-xs text-orange-600 mt-1">
                <span>Platform Fee:</span>
                <span>-${failureFee.toFixed(2)} (25%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Badge */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="font-semibold text-blue-900 text-sm">100% Secure Checkout</h4>
            <p className="text-xs text-blue-800 mt-1">
              Powered by Stripe. Your payment information is encrypted and never stored on our servers.
            </p>
          </div>
        </div>
      </div>

      <PaymentElement />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full"
        size="lg"
      >
        {processing ? "Processing..." : `Complete Payment · $${amount.toFixed(2)}`}
      </Button>

      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        <span>Secure SSL encrypted payment</span>
      </div>
    </form>
  );
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [commitment, setCommitment] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/sign-in");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && params.commitmentId) {
      fetchCommitmentAndCreatePaymentIntent();
    }
  }, [user, params.commitmentId]);

  const fetchCommitmentAndCreatePaymentIntent = async () => {
    if (!user || !params.commitmentId) return;

    try {
      // Fetch commitment
      const { data: commitmentData, error: commitmentError } = await supabase
        .from("commitments")
        .select("*")
        .eq("id", params.commitmentId)
        .eq("user_id", user.id)
        .single();

      if (commitmentError || !commitmentData) {
        console.error("Commitment not found:", commitmentError);
        router.push("/dashboard");
        return;
      }

      setCommitment(commitmentData);

      // Create payment intent
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: commitmentData.stake,
          userId: user.id,
          commitmentId: params.commitmentId,
        }),
      });

      const data = await response.json();

      if (data.error) {
        console.error("Payment intent error:", data.error);
        alert("Failed to initialize payment. Please try again.");
        return;
      }

      // 🎯 CHEAT CODE: If test mode, skip payment page and go straight to dashboard
      if (data.isTestMode) {
        console.log("[CHEAT CODE] Test mode detected - skipping payment page");
        alert("🎯 Test mode! Payment simulated instantly. Redirecting to dashboard...");
        router.push("/dashboard");
        return;
      }

      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error("Error:", error);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-neutral-600">Loading...</div>
      </main>
    );
  }

  if (!user || !commitment) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f8f7f4] py-8">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">← Back to Dashboard</Button>
          </Link>
          <h1 className="text-3xl font-light text-neutral-800 mt-4 mb-2">
            Secure Your Commitment
          </h1>
          <p className="text-sm text-gray-600">
            Complete payment to activate your commitment
          </p>
        </div>

        {/* Commitment Summary */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            {commitment.intention}
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Outcome:</span>
              <span className="text-neutral-800">{commitment.outcome}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Charity:</span>
              <span className="text-neutral-800 capitalize">
                {commitment.charity.split('-').join(' ')}
              </span>
            </div>
          </div>
        </Card>

        {/* Payment Form */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-neutral-900 mb-6">
            Payment Details
          </h3>
          {clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                },
              }}
            >
              <CheckoutForm commitmentId={params.commitmentId as string} amount={commitment.stake} />
            </Elements>
          )}
        </Card>
      </div>
    </main>
  );
}
