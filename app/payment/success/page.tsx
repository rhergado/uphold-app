"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const commitmentId = searchParams.get("commitment_id");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Send payment confirmation email
    const sendConfirmationEmail = async () => {
      if (!commitmentId) return;

      // Get user ID from localStorage (auth context)
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
        // Don't fail the page if email fails
      }
    };

    sendConfirmationEmail();

    let timer: NodeJS.Timeout;

    const startCountdown = () => {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Use replace instead of push to avoid the error
            window.location.href = "/dashboard";
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    startCountdown();

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [commitmentId]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f8f7f4] px-6">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600">
            Your commitment is now active. Your stake is securely held and will be returned when you complete your commitment.
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/dashboard" className="block">
            <Button className="w-full" size="lg">
              Go to Dashboard
            </Button>
          </Link>
          {commitmentId && (
            <Link href={`/commitment/${commitmentId}`} className="block">
              <Button variant="outline" className="w-full" size="lg">
                View Commitment
              </Button>
            </Link>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Redirecting to dashboard in {countdown} seconds...
        </p>
      </Card>
    </main>
  );
}
