"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const commitmentId = searchParams.get("commitment_id");
  const [commitmentTitle, setCommitmentTitle] = useState("");
  const [stakeAmount, setStakeAmount] = useState(0);
  const [charityName, setCharityName] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const fetchCommitment = async () => {
      if (!commitmentId) {
        console.log("No commitment ID provided");
        setLoading(false);
        return;
      }

      console.log("Fetching commitment with ID:", commitmentId);

      try {
        const { data, error } = await supabase
          .from("commitments")
          .select("title, stake_amount, charity_name")
          .eq("id", commitmentId)
          .single();

        if (error) {
          console.error("Error fetching commitment:", error);
          setLoading(false);
          return;
        }

        console.log("Commitment data fetched:", data);
        setCommitmentTitle(data?.title || "Your commitment");
        setStakeAmount(data?.stake_amount || 0);
        setCharityName(data?.charity_name || "charity");
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch commitment:", error);
        setLoading(false);
      }
    };

    fetchCommitment();

    // Send payment confirmation email
    const sendConfirmationEmail = async () => {
      if (!commitmentId) return;

      const storedUser = localStorage.getItem("uphold_user");
      if (!storedUser) return;

      const user = JSON.parse(storedUser);

      try {
        await fetch("/api/send-payment-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            commitmentId: commitmentId,
            userId: user.id,
          }),
        });
      } catch (error) {
        console.error("Failed to send payment confirmation email:", error);
      }
    };

    sendConfirmationEmail();
  }, [commitmentId]);

  const handleGiveWord = async () => {
    if (!commitmentId) {
      console.error("No commitment ID - cannot confirm");
      return;
    }

    console.log("Confirming commitment:", commitmentId);
    setConfirming(true);

    try {
      const response = await fetch("/api/confirm-commitment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commitmentId }),
      });

      console.log("Confirm response status:", response.status);
      const responseData = await response.json();
      console.log("Confirm response data:", responseData);

      if (response.ok) {
        console.log("Commitment confirmed successfully, redirecting to dashboard");
        // Redirect to dashboard after confirmation
        window.location.href = "/dashboard";
      } else {
        console.error("Failed to confirm commitment:", responseData);
        alert("Failed to confirm commitment. Please try again.");
        setConfirming(false);
      }
    } catch (error) {
      console.error("Error confirming commitment:", error);
      alert("An error occurred. Please try again.");
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f8f7f4] px-6">
        <Card className="max-w-md w-full p-8 text-center">
          <p className="text-gray-600">Loading...</p>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f8f7f4] px-6">
      <Card className="max-w-lg w-full p-12 text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-neutral-900 mb-6">
            This is now a promise.
          </h1>

          {commitmentTitle && (
            <div className="mb-6 p-4 bg-neutral-50 rounded-lg">
              <p className="text-sm text-neutral-600 mb-2">You committed to:</p>
              <p className="text-xl font-medium text-neutral-900">
                "{commitmentTitle}"
              </p>
            </div>
          )}

          <p className="text-lg text-neutral-700 leading-relaxed mb-6">
            This is more than a transaction.
            <br />
            It's your word.
          </p>

          {stakeAmount > 0 && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-sm font-medium text-red-900">
                If you don't follow through, ${stakeAmount.toFixed(2)} will be donated to {charityName}.
              </p>
            </div>
          )}
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={handleGiveWord}
          disabled={confirming}
        >
          {confirming ? "Confirming..." : "I give my word"}
        </Button>
      </Card>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-[#f8f7f4] px-6">
        <Card className="max-w-md w-full p-8 text-center">
          <p className="text-gray-600">Loading...</p>
        </Card>
      </main>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
