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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">Stake Amount</p>
        <p className="text-2xl font-bold text-neutral-900">${amount.toFixed(2)}</p>
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
        {processing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Your stake will be held securely and returned when you complete your commitment.
        If you fail, it will be donated to your selected charity.
      </p>
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
