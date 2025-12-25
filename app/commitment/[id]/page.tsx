"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

interface Commitment {
  id: string;
  intention: string;
  outcome: string;
  commitment_type: string;
  due_date: string;
  stake: number;
  charity: string;
  status: string;
  verification_mode: string;
  days_of_week: number[] | null;
  duration_weeks: number | null;
  start_date: string | null;
  due_time: string;
  is_public: boolean;
  buddy_email: string | null;
  created_at: string;
}

interface CheckIn {
  id: string;
  commitment_id: string;
  user_id: string;
  check_in_date: string;
  check_in_time: string;
  completed_at: string;
  created_at: string;
}

export default function CommitmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [commitment, setCommitment] = useState<Commitment | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [checkInLoading, setCheckInLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/sign-in");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && params.id) {
      fetchCommitment();
      fetchCheckIns();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, params.id]);

  const fetchCommitment = async () => {
    if (!user || !params.id) return;

    try {
      const { data, error } = await supabase
        .from("commitments")
        .select("*")
        .eq("id", params.id)
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching commitment:", error);
        alert("Commitment not found");
        router.push("/dashboard");
        return;
      }

      setCommitment(data);
    } catch (error) {
      console.error("Unexpected error:", error);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchCheckIns = async () => {
    if (!user || !params.id) return;

    try {
      const { data, error } = await supabase
        .from("check_ins")
        .select("*")
        .eq("commitment_id", params.id)
        .eq("user_id", user.id)
        .order("check_in_date", { ascending: true });

      if (error) {
        console.error("Error fetching check-ins:", error);
        return;
      }

      setCheckIns(data || []);
    } catch (error) {
      console.error("Unexpected error fetching check-ins:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatCharity = (charity: string) => {
    return charity.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const getVerificationLabel = (mode: string) => {
    switch (mode) {
      case "integrity":
        return "Integrity mode";
      case "buddy":
        return "Buddy verification";
      case "app":
        return "App verification";
      default:
        return mode;
    }
  };

  const getDaysUntil = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const calculateInstances = (startDate: string, daysOfWeek: number[], weeks: number) => {
    const instances: Date[] = [];
    const start = new Date(startDate);
    const endDate = new Date(start);
    endDate.setDate(endDate.getDate() + (weeks * 7));

    let current = new Date(start);
    while (current <= endDate) {
      if (daysOfWeek.includes(current.getDay())) {
        instances.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }
    return instances;
  };

  const handleDelete = async () => {
    if (!commitment) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this commitment? This action cannot be undone."
    );

    if (!confirmDelete) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("commitments")
        .delete()
        .eq("id", commitment.id)
        .eq("user_id", user!.id);

      if (error) {
        console.error("Error deleting commitment:", error);
        alert("Failed to delete commitment. Please try again.");
        return;
      }

      alert("Commitment deleted successfully");
      router.push("/dashboard");
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestBuddyVerification = async () => {
    if (!commitment) return;

    const confirmRequest = window.confirm(
      `Request verification from ${commitment.buddy_email}? They will receive an email.`
    );

    if (!confirmRequest) return;

    setActionLoading(true);
    try {
      const response = await fetch("/api/request-buddy-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commitmentId: commitment.id,
          userId: user!.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Verification request sent to ${commitment.buddy_email}! They have 7 days to respond.`);
        router.push("/dashboard");
      } else {
        alert(data.error || "Failed to send verification request");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!commitment) return;

    // For buddy verification, redirect to request buddy verification
    if (commitment.verification_mode === "buddy") {
      await handleRequestBuddyVerification();
      return;
    }

    const confirmComplete = window.confirm(
      "Mark this commitment as complete? Your stake will be returned."
    );

    if (!confirmComplete) return;

    setActionLoading(true);
    try {
      // Update commitment status
      const { error } = await supabase
        .from("commitments")
        .update({ status: "completed" })
        .eq("id", commitment.id)
        .eq("user_id", user!.id);

      if (error) {
        console.error("Error updating commitment:", error);
        alert("Failed to mark commitment as complete. Please try again.");
        setActionLoading(false);
        return;
      }

      // Process refund
      const refundResponse = await fetch("/api/process-refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commitmentId: commitment.id,
          userId: user!.id,
        }),
      });

      const refundData = await refundResponse.json();

      if (!refundResponse.ok || refundData.error) {
        console.error("Refund error:", refundData.error);
        alert("Commitment marked complete, but refund processing failed. Please contact support.");
        setActionLoading(false);
        return;
      }

      alert(`Congratulations! Commitment marked as complete. Your stake of $${refundData.amount} has been refunded.`);
      router.push("/dashboard");
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckIn = async (instanceDate: Date) => {
    if (!commitment || !user) return;

    const dateStr = instanceDate.toISOString().split('T')[0];
    setCheckInLoading(dateStr);

    try {
      const { error } = await supabase
        .from("check_ins")
        .insert([{
          commitment_id: commitment.id,
          user_id: user.id,
          check_in_date: dateStr,
          check_in_time: commitment.due_time
        }]);

      if (error) {
        console.error("Error checking in:", error);
        alert("Failed to check in. Please try again.");
        return;
      }

      // Refresh check-ins
      await fetchCheckIns();
      alert("Checked in successfully!");
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setCheckInLoading(null);
    }
  };

  const handleUndoCheckIn = async (checkInId: string) => {
    setCheckInLoading(checkInId);

    try {
      const { error } = await supabase
        .from("check_ins")
        .delete()
        .eq("id", checkInId)
        .eq("user_id", user!.id);

      if (error) {
        console.error("Error undoing check-in:", error);
        alert("Failed to undo check-in. Please try again.");
        return;
      }

      // Refresh check-ins
      await fetchCheckIns();
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setCheckInLoading(null);
    }
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-neutral-600">Loading...</div>
      </main>
    );
  }

  if (!commitment) {
    return null;
  }

  const getStatusBadge = () => {
    switch (commitment.status) {
      case "active":
        return <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full">Active</span>;
      case "completed":
        return <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full">Completed</span>;
      case "failed":
        return <span className="text-xs bg-red-100 text-red-800 px-3 py-1 rounded-full">Failed</span>;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                ← Back
              </Button>
            </Link>
            <h1 className="text-xl font-light tracking-tight text-neutral-800">
              Up<span className="font-bold">hold</span>
            </h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-5 py-8">
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                COMMITMENT DETAILS
              </p>
              <h2 className="text-2xl font-semibold text-neutral-950">
                {commitment.intention}
              </h2>
            </div>
            {getStatusBadge()}
          </div>
        </div>

        <Card className="p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              PROOF
            </p>
            <p className="text-sm text-neutral-700">
              {commitment.outcome}
            </p>
          </div>

          <Separator />

          {commitment.commitment_type === "one-time" ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                DUE
              </p>
              <p className="text-base text-neutral-950 font-medium">
                {formatDate(commitment.due_date)} at {formatTime(commitment.due_time)}
              </p>
              {commitment.status === "active" && (
                <p className="text-sm text-gray-600 mt-1">
                  {getDaysUntil(commitment.due_date)} days remaining
                </p>
              )}
            </div>
          ) : (
            <>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  SCHEDULE
                </p>
                <p className="text-base text-neutral-950 font-medium">
                  {(() => {
                    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                    const selectedDayNames = commitment.days_of_week?.map(d => dayNames[d]).join(", ");
                    const instances = calculateInstances(
                      commitment.start_date!,
                      commitment.days_of_week!,
                      commitment.duration_weeks!
                    );
                    const requiredCompletions = Math.ceil(instances.length * 0.8);
                    return (
                      <>
                        <span>{selectedDayNames} at {formatTime(commitment.due_time)}</span>
                        <br />
                        <span className="text-sm text-gray-600">
                          {instances.length} instances • Complete {requiredCompletions} ({Math.round((requiredCompletions / instances.length) * 100)}%) to succeed
                        </span>
                      </>
                    );
                  })()}
                </p>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  DURATION
                </p>
                <p className="text-base text-neutral-950 font-medium">
                  {formatDate(commitment.start_date!)} - {(() => {
                    const start = new Date(commitment.start_date!);
                    const end = new Date(start);
                    end.setDate(end.getDate() + (commitment.duration_weeks! * 7));
                    return formatDate(end.toISOString().split('T')[0]);
                  })()}
                </p>
                <p className="text-sm text-gray-600">
                  {commitment.duration_weeks} weeks
                </p>
              </div>
            </>
          )}

          <Separator />

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              AT STAKE
            </p>
            <p className="text-2xl text-neutral-950 font-bold">
              ${commitment.stake}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {commitment.commitment_type === "periodic" ? "Returned if you complete 80%+" : "Returned if completed"}
            </p>
          </div>

          <Separator />

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              IF FAILED
            </p>
            <p className="text-base text-neutral-950 font-medium">
              Donated to {formatCharity(commitment.charity)}
            </p>
          </div>

          <Separator />

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              VERIFICATION
            </p>
            <p className="text-base text-neutral-950 font-medium">
              {getVerificationLabel(commitment.verification_mode)}
            </p>
            {commitment.verification_mode === "buddy" && commitment.buddy_email && (
              <p className="text-sm text-gray-500 mt-1">
                Buddy: {commitment.buddy_email}
              </p>
            )}
            {commitment.commitment_type === "periodic" && (
              <p className="text-sm text-gray-500 mt-1">
                Each instance requires separate verification
              </p>
            )}
          </div>

          <Separator />

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              VISIBILITY
            </p>
            <p className="text-base text-neutral-950 font-medium">
              {commitment.is_public ? "Public" : "Private"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {commitment.is_public
                ? "Visible in the community feed"
                : "Only visible to you" + (commitment.buddy_email ? " and your buddy" : "")}
            </p>
          </div>

          <Separator />

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              CREATED
            </p>
            <p className="text-base text-neutral-950 font-medium">
              {formatDate(commitment.created_at)}
            </p>
          </div>
        </Card>

        {/* Check-in Section for Periodic Commitments */}
        {commitment.commitment_type === "periodic" && commitment.status === "active" && (
          <Card className="mt-6 p-6 rounded-2xl border border-gray-200 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4">
              CHECK-IN PROGRESS
            </p>
            {(() => {
              const instances = calculateInstances(
                commitment.start_date!,
                commitment.days_of_week!,
                commitment.duration_weeks!
              );
              const requiredCompletions = Math.ceil(instances.length * 0.8);
              const completedCount = checkIns.length;
              const progressPercent = Math.round((completedCount / instances.length) * 100);
              const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

              return (
                <>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">
                        {completedCount} / {instances.length} completed
                      </span>
                      <span className="text-sm font-medium text-neutral-950">
                        {progressPercent}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          completedCount >= requiredCompletions
                            ? "bg-green-500"
                            : "bg-blue-500"
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Need {requiredCompletions} to succeed ({Math.round((requiredCompletions / instances.length) * 100)}%)
                    </p>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {instances.map((instance, idx) => {
                      const dateStr = instance.toISOString().split('T')[0];
                      const checkIn = checkIns.find(c => c.check_in_date === dateStr);
                      const isToday = new Date().toDateString() === instance.toDateString();
                      const isPast = instance < new Date() && !isToday;

                      return (
                        <div
                          key={idx}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            checkIn
                              ? "bg-green-50 border-green-200"
                              : isToday
                              ? "bg-blue-50 border-blue-200"
                              : isPast
                              ? "bg-red-50 border-red-200"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div>
                            <p className="text-sm font-medium text-neutral-950">
                              {dayNames[instance.getDay()]}, {formatDate(dateStr)}
                            </p>
                            <p className="text-xs text-gray-600">
                              {formatTime(commitment.due_time)}
                              {isToday && " • Today"}
                            </p>
                          </div>
                          {checkIn ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUndoCheckIn(checkIn.id)}
                              disabled={checkInLoading === checkIn.id}
                              className="text-green-700 hover:text-green-800"
                            >
                              ✓ Checked In
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCheckIn(instance)}
                              disabled={checkInLoading === dateStr}
                            >
                              {checkInLoading === dateStr ? "..." : "Check In"}
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </Card>
        )}

        {commitment.status === "active" && (
          <div className="mt-6 space-y-3">
            <Button
              className="w-full"
              size="lg"
              onClick={handleMarkComplete}
              disabled={actionLoading}
            >
              {actionLoading
                ? "Processing..."
                : commitment.verification_mode === "buddy"
                  ? "Request Buddy Verification"
                  : "Mark as Complete"}
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                size="lg"
                disabled={actionLoading}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-red-600 hover:text-red-700"
                size="lg"
                onClick={handleDelete}
                disabled={actionLoading}
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </Button>
            </div>
            <Link href="/dashboard" className="block">
              <Button
                variant="ghost"
                className="w-full"
                size="lg"
                disabled={actionLoading}
              >
                Cancel
              </Button>
            </Link>
          </div>
        )}

        {commitment.status !== "active" && (
          <div className="mt-6">
            <Link href="/dashboard" className="block">
              <Button
                variant="outline"
                className="w-full"
                size="lg"
              >
                Back to Dashboard
              </Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
