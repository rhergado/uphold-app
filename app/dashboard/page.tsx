"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { isAdminEmail } from "@/lib/admin-config";

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

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkInCounts, setCheckInCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/sign-in");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      fetchCommitments();
    }
  }, [user]);

  const fetchCommitments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("commitments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching commitments:", error);
        return;
      }

      setCommitments(data || []);

      // Fetch check-in counts for periodic commitments
      await fetchCheckInCounts(data || []);

      // Check for overdue commitments and update their status
      await updateOverdueCommitments(data || []);
    } catch (error) {
      console.error("Unexpected error fetching commitments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCheckInCounts = async (commitments: Commitment[]) => {
    if (!user) return;

    const periodicCommitments = commitments.filter(c => c.commitment_type === "periodic" && c.status === "active");
    const counts: Record<string, number> = {};

    for (const commitment of periodicCommitments) {
      try {
        const { data, error } = await supabase
          .from("check_ins")
          .select("*")
          .eq("commitment_id", commitment.id)
          .eq("user_id", user.id);

        if (!error && data) {
          counts[commitment.id] = data.length;
        }
      } catch (error) {
        console.error("Error fetching check-in count:", error);
      }
    }

    setCheckInCounts(counts);
  };

  const updateOverdueCommitments = async (commitments: Commitment[]) => {
    if (!user) return;

    const now = new Date();
    const updates: Promise<any>[] = [];

    for (const commitment of commitments) {
      // Only check active commitments
      if (commitment.status !== "active") continue;

      // For one-time commitments, check if due_date has passed
      if (commitment.commitment_type === "one-time") {
        // Combine due_date and due_time into a single datetime
        const dueDateTime = new Date(`${commitment.due_date}T${commitment.due_time}`);

        if (dueDateTime < now) {
          // Mark as failed and process donation
          updates.push(
            (async () => {
              await supabase
                .from("commitments")
                .update({ status: "failed" })
                .eq("id", commitment.id)
                .eq("user_id", user.id);

              // Process donation to charity
              await fetch("/api/process-donation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  commitmentId: commitment.id,
                  userId: user.id,
                  charity: commitment.charity,
                }),
              }).catch(err => console.error("Donation processing error:", err));
            })()
          );
        }
      }

      // For periodic commitments, check if end date has passed
      if (commitment.commitment_type === "periodic" && commitment.start_date && commitment.duration_weeks) {
        const startDate = new Date(commitment.start_date);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + (commitment.duration_weeks * 7));

        if (endDate < now) {
          // Check if they met the 80% threshold
          const { data: checkIns, error } = await supabase
            .from("check_ins")
            .select("*")
            .eq("commitment_id", commitment.id)
            .eq("user_id", user.id);

          if (error) {
            console.error("Error fetching check-ins for periodic commitment:", error);
            continue;
          }

          // Calculate total expected instances
          const daysOfWeek = commitment.days_of_week || [];
          const totalInstances = daysOfWeek.length * commitment.duration_weeks;
          const completedInstances = checkIns?.length || 0;
          const completionRate = totalInstances > 0 ? completedInstances / totalInstances : 0;

          // Mark as completed if 80%+ or failed if less
          const newStatus = completionRate >= 0.8 ? "completed" : "failed";

          updates.push(
            (async () => {
              await supabase
                .from("commitments")
                .update({ status: newStatus })
                .eq("id", commitment.id)
                .eq("user_id", user.id);

              // Process refund for completion or donation for failure
              if (newStatus === "completed") {
                await fetch("/api/process-refund", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    commitmentId: commitment.id,
                    userId: user.id,
                  }),
                }).catch(err => console.error("Refund processing error:", err));
              } else {
                await fetch("/api/process-donation", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    commitmentId: commitment.id,
                    userId: user.id,
                    charity: commitment.charity,
                  }),
                }).catch(err => console.error("Donation processing error:", err));
              }
            })()
          );
        }
      }
    }

    // Execute all updates
    if (updates.length > 0) {
      try {
        await Promise.all(updates);
        // Refetch commitments to get updated statuses
        const { data, error } = await supabase
          .from("commitments")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setCommitments(data);
        }
      } catch (error) {
        console.error("Error updating overdue commitments:", error);
      }
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Get first name only
  const firstName = user?.name.split(" ")[0] || "";

  // Filter commitments by status
  const activeCommitments = commitments.filter(c => c.status === "active");
  const completedCommitments = commitments.filter(c => c.status === "completed");
  const failedCommitments = commitments.filter(c => c.status === "failed");

  // Helper functions
  const formatDate = (dateString: string) => {
    // Parse date as local timezone by appending 'T00:00:00'
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const formatTimestamp = (timestamp: string) => {
    // Parse ISO timestamp directly
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
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

  const getTimeUntil = (commitment: Commitment) => {
    // Safety check for missing due_date or due_time
    if (!commitment.due_date || !commitment.due_time) {
      return { value: 0, unit: 'days' };
    }

    // Combine due_date and due_time for accurate calculation
    const due = new Date(`${commitment.due_date}T${commitment.due_time}`);
    const now = new Date();
    const diffMs = due.getTime() - now.getTime();

    // Return hours if less than 24 hours, otherwise days
    const hours = diffMs / (1000 * 60 * 60);
    if (hours < 24 && hours > 0) {
      return { value: Math.ceil(hours), unit: 'hours' };
    }
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return { value: days > 0 ? days : 0, unit: 'days' };
  };

  const getDaysUntil = (commitment: Commitment) => {
    return getTimeUntil(commitment).value;
  };

  const getUrgencyColor = (commitment: Commitment) => {
    const time = getTimeUntil(commitment);
    if (time.unit === 'hours') return "text-red-600 font-semibold";
    if (time.value <= 1) return "text-red-600 font-semibold";
    if (time.value <= 3) return "text-orange-600 font-medium";
    if (time.value <= 7) return "text-yellow-600";
    return "text-neutral-800";
  };

  const getUrgencyBadge = (commitment: Commitment) => {
    const time = getTimeUntil(commitment);
    if (time.value <= 0) return <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full ml-2">Overdue</span>;
    if (time.unit === 'hours') return <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full ml-2">Due Today</span>;
    if (time.value === 1) return <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full ml-2">Due Tomorrow</span>;
    if (time.value <= 3) return <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full ml-2">Due Soon</span>;
    return null;
  };

  if (isLoading || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-neutral-600">Loading...</div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f8f7f4]">
      {/* Header - Mobile Optimized */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          {/* Top row: Logo and Welcome */}
          <div className="flex items-center justify-between mb-3">
            <Link href="/dashboard">
              <h1 className="text-xl font-light tracking-tight text-neutral-800">
                Up<span className="font-bold">hold</span>
              </h1>
            </Link>
            <span className="text-sm text-gray-600">Hi, {firstName}</span>
          </div>

          {/* Bottom row: Navigation buttons */}
          <nav className="flex items-center gap-2 overflow-x-auto">
            <Link href="/test-create" className="flex-shrink-0">
              <Button size="sm" className="font-normal text-xs px-3 py-2">
                + New Goal
              </Button>
            </Link>
            <Link href="/dashboard" className="flex-shrink-0">
              <Button variant="ghost" size="sm" className="font-normal text-xs px-3 py-2">
                Dashboard
              </Button>
            </Link>
            <Link href="/community" className="flex-shrink-0">
              <Button variant="ghost" size="sm" className="font-normal text-xs px-3 py-2">
                Community
              </Button>
            </Link>
            {user?.is_admin && isAdminEmail(user?.email) && (
              <Link href="/admin/donations" className="flex-shrink-0">
                <Button variant="ghost" size="sm" className="font-normal text-xs px-3 py-2 text-orange-600">
                  Admin
                </Button>
              </Link>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="font-normal text-xs px-3 py-2 flex-shrink-0"
            >
              Logout
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-light text-neutral-800 mb-2">
            Your Commitments
          </h2>
          <p className="text-sm text-gray-600">
            Track your progress and stay accountable
          </p>
        </div>

        {/* Active Commitments */}
        <section className="mb-12">
          <h3 className="text-xl font-medium text-neutral-800 mb-4">
            Active ({activeCommitments.length})
          </h3>
          {activeCommitments.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-500 mb-4">No active commitments yet</p>
              <Link href="/test-create">
                <Button>Create Your First Commitment</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeCommitments.map((commitment) => (
                <div
                  key={commitment.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-neutral-900">
                        {commitment.intention}
                      </h4>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {commitment.outcome}
                    </p>
                    <p className="text-xs text-neutral-500 italic">
                      You gave your word on {formatTimestamp(commitment.created_at)}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    {commitment.commitment_type === "periodic" ? (
                      <>
                        <div>
                          <span className="text-gray-500">Type:</span>{" "}
                          <span className="text-neutral-800">Periodic ({commitment.duration_weeks} weeks)</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Time:</span>{" "}
                          <span className="text-neutral-800">{formatTime(commitment.due_time)}</span>
                        </div>
                        {(() => {
                          const daysOfWeek = commitment.days_of_week || [];
                          const totalInstances = daysOfWeek.length * (commitment.duration_weeks || 0);
                          const completedInstances = checkInCounts[commitment.id] || 0;
                          const progressPercent = totalInstances > 0 ? Math.round((completedInstances / totalInstances) * 100) : 0;
                          const requiredCompletions = Math.ceil(totalInstances * 0.8);

                          return (
                            <div className="pt-2">
                              <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
                                <span>Progress: {completedInstances}/{totalInstances}</span>
                                <span>{progressPercent}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    completedInstances >= requiredCompletions ? "bg-green-500" : "bg-blue-500"
                                  }`}
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                            </div>
                          );
                        })()}
                      </>
                    ) : (
                      <>
                        <div>
                          <span className="text-gray-500">Due:</span>{" "}
                          <span className="text-neutral-800">{formatDate(commitment.due_date)}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-500">Days left:</span>{" "}
                          <span className={getUrgencyColor(commitment)}>
                            {getDaysUntil(commitment)}
                          </span>
                          {getUrgencyBadge(commitment)}
                        </div>
                      </>
                    )}
                    <div>
                      <span className="text-gray-500">Stake:</span>{" "}
                      <span className="text-neutral-800 font-medium">${commitment.stake}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Charity:</span>{" "}
                      <span className="text-neutral-800">{formatCharity(commitment.charity)}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Link href={`/commitment/${commitment.id}`} className="block">
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Completed Commitments */}
        {completedCommitments.length > 0 && (
          <section className="mb-12">
            <h3 className="text-xl font-medium text-neutral-800 mb-4">
              Completed ({completedCommitments.length})
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedCommitments.map((commitment) => (
                <div
                  key={commitment.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-neutral-900">
                        {commitment.intention}
                      </h4>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Success
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {commitment.outcome}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Stake:</span>{" "}
                      <span className="text-neutral-800 font-medium">${commitment.stake}</span>
                    </div>
                    <div className="text-green-700 font-medium">
                      Stake returned!
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Link href={`/commitment/${commitment.id}`} className="block">
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Failed Commitments */}
        {failedCommitments.length > 0 && (
          <section>
            <h3 className="text-xl font-medium text-neutral-800 mb-4">
              Failed ({failedCommitments.length})
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {failedCommitments.map((commitment) => (
                <div
                  key={commitment.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow opacity-75"
                >
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-neutral-900">
                        {commitment.intention}
                      </h4>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                        Failed
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {commitment.outcome}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Stake:</span>{" "}
                      <span className="text-neutral-800 font-medium">${commitment.stake}</span>
                    </div>
                    <div className="text-red-700 font-medium">
                      Donated to {formatCharity(commitment.charity)}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Link href={`/commitment/${commitment.id}`} className="block">
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
          <Link href="/terms" className="hover:text-blue-600 transition-colors">
            Terms of Service
          </Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-blue-600 transition-colors">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href="/refund-policy" className="hover:text-blue-600 transition-colors">
            Refund Policy
          </Link>
        </div>
      </div>
    </main>
  );
}
