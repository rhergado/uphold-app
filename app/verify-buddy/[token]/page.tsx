"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";

export default function VerifyBuddyPage() {
  const params = useParams();
  const [verification, setVerification] = useState<any>(null);
  const [commitment, setCommitment] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (params.token) {
      fetchVerification();
    }
  }, [params.token]);

  const fetchVerification = async () => {
    try {
      // Get verification with commitment and user details
      const { data: verificationData, error: verificationError } = await supabase
        .from("buddy_verifications")
        .select("*")
        .eq("verification_token", params.token)
        .single();

      if (verificationError || !verificationData) {
        setResult({ success: false, message: "Invalid verification link" });
        setLoading(false);
        return;
      }

      setVerification(verificationData);

      // Get commitment details
      const { data: commitmentData } = await supabase
        .from("commitments")
        .select("*")
        .eq("id", verificationData.commitment_id)
        .single();

      setCommitment(commitmentData);

      // Get user details
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", verificationData.user_id)
        .single();

      setUser(userData);
    } catch (error) {
      console.error("Error fetching verification:", error);
      setResult({ success: false, message: "Failed to load verification" });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/verify-buddy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: params.token,
          approved: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult({ success: true, message: "Commitment verified successfully! Your friend will get their money back." });
      } else {
        setResult({ success: false, message: data.error || "Failed to verify commitment" });
      }
    } catch (error) {
      setResult({ success: false, message: "An error occurred. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/verify-buddy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: params.token,
          approved: false,
          rejectionReason,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult({ success: true, message: "Verification declined. Your friend has been notified." });
      } else {
        setResult({ success: false, message: data.error || "Failed to process rejection" });
      }
    } catch (error) {
      setResult({ success: false, message: "An error occurred. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f8f7f4]">
        <div className="text-neutral-600">Loading...</div>
      </main>
    );
  }

  if (result) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f8f7f4] px-6">
        <Card className="max-w-md w-full p-8 text-center">
          <div className={`w-16 h-16 ${result.success ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
            {result.success ? (
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <h1 className="text-2xl font-semibold text-neutral-900 mb-4">
            {result.success ? "Thank You!" : "Error"}
          </h1>
          <p className="text-gray-600">{result.message}</p>
        </Card>
      </main>
    );
  }

  if (!verification || !commitment || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f8f7f4] px-6">
        <Card className="max-w-md w-full p-8 text-center">
          <h1 className="text-2xl font-semibold text-neutral-900 mb-4">Invalid Link</h1>
          <p className="text-gray-600">This verification link is invalid or has expired.</p>
        </Card>
      </main>
    );
  }

  if (verification.status !== "pending") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f8f7f4] px-6">
        <Card className="max-w-md w-full p-8 text-center">
          <h1 className="text-2xl font-semibold text-neutral-900 mb-4">Already Processed</h1>
          <p className="text-gray-600">
            This verification has already been {verification.status}.
          </p>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f7f4] py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          <h1 className="text-3xl font-light text-neutral-800 mb-2">
            Buddy Verification
          </h1>
          <p className="text-sm text-gray-600 mb-8">
            {user.name} needs you to verify their commitment
          </p>

          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">
              Commitment Details
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Commitment</p>
                <p className="text-neutral-900">{commitment.intention}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Goal</p>
                <p className="text-neutral-900">{commitment.outcome}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Stake Amount</p>
                <p className="text-neutral-900 font-medium">${commitment.stake}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-blue-900">
              <strong>{user.name}</strong> is asking you to confirm they completed this commitment.
              If you approve, they will get their ${commitment.stake} stake refunded.
              If you decline, the money will be donated to charity.
            </p>
          </div>

          {!showRejectForm ? (
            <div className="space-y-3">
              <Button
                onClick={handleApprove}
                disabled={submitting}
                className="w-full"
                size="lg"
              >
                {submitting ? "Processing..." : "✓ Yes, They Completed It"}
              </Button>
              <Button
                onClick={() => setShowRejectForm(true)}
                variant="outline"
                className="w-full"
                size="lg"
              >
                ✗ No, They Didn't Complete It
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Please explain why (optional)
                </label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., They didn't provide proof, I don't think they actually did it..."
                  rows={4}
                  className="w-full"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleReject}
                  disabled={submitting}
                  variant="destructive"
                  className="flex-1"
                  size="lg"
                >
                  {submitting ? "Processing..." : "Decline Verification"}
                </Button>
                <Button
                  onClick={() => setShowRejectForm(false)}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
