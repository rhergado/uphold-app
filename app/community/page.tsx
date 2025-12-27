"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { isAdminEmail } from "@/lib/admin-config";

// Dummy community data
const communityCommitments = [
  {
    id: "c1",
    user: {
      name: "Sarah M.",
      avatar: "SM",
      color: "bg-purple-500",
    },
    intention: "Run 5K every morning",
    outcome: "Train for upcoming marathon and improve cardiovascular health",
    type: "periodic",
    schedule: "Every day at 6:30 AM",
    progress: "21/30 completed (70%)",
    stake: 100,
    charity: "Medical Research Fund",
    daysLeft: 9,
    postedDate: "2 weeks ago",
  },
  {
    id: "c2",
    user: {
      name: "James K.",
      avatar: "JK",
      color: "bg-blue-500",
    },
    intention: "Launch side project",
    outcome: "Build and deploy my SaaS product to get first 10 paying customers",
    type: "one-time",
    dueDate: "Jan 15, 2026",
    stake: 200,
    charity: "Education for All",
    daysLeft: 24,
    postedDate: "5 days ago",
  },
  {
    id: "c3",
    user: {
      name: "Maria G.",
      avatar: "MG",
      color: "bg-green-500",
    },
    intention: "Meditate daily",
    outcome: "Establish mindfulness practice for better mental clarity and stress management",
    type: "periodic",
    schedule: "Every day at 7:00 PM",
    progress: "14/21 completed (67%)",
    stake: 50,
    charity: "Mental Health Support",
    daysLeft: 7,
    postedDate: "1 week ago",
  },
  {
    id: "c4",
    user: {
      name: "Alex T.",
      avatar: "AT",
      color: "bg-orange-500",
    },
    intention: "Write 1000 words daily",
    outcome: "Complete first draft of my novel",
    type: "periodic",
    schedule: "Every day at 8:00 AM",
    progress: "45/60 completed (75%)",
    stake: 150,
    charity: "Education for All",
    daysLeft: 15,
    postedDate: "3 weeks ago",
  },
  {
    id: "c5",
    user: {
      name: "Chen W.",
      avatar: "CW",
      color: "bg-pink-500",
    },
    intention: "Complete AWS certification",
    outcome: "Pass AWS Solutions Architect exam and advance my career",
    type: "one-time",
    dueDate: "Jan 30, 2026",
    stake: 120,
    charity: "Technology Education Fund",
    daysLeft: 39,
    postedDate: "4 days ago",
  },
  {
    id: "c6",
    user: {
      name: "Lisa R.",
      avatar: "LR",
      color: "bg-indigo-500",
    },
    intention: "No sugar for 30 days",
    outcome: "Reset my relationship with sugar and improve energy levels",
    type: "periodic",
    schedule: "Daily commitment",
    progress: "18/30 completed (60%)",
    stake: 80,
    charity: "Medical Research Fund",
    daysLeft: 12,
    postedDate: "2 weeks ago",
  },
  {
    id: "c7",
    user: {
      name: "David P.",
      avatar: "DP",
      color: "bg-yellow-600",
    },
    intention: "Learn Spanish",
    outcome: "Complete Duolingo Spanish course and hold basic conversation",
    type: "periodic",
    schedule: "Mon, Wed, Fri at 9:00 PM",
    progress: "28/36 completed (78%)",
    stake: 90,
    charity: "Education for All",
    daysLeft: 8,
    postedDate: "1 month ago",
  },
  {
    id: "c8",
    user: {
      name: "Emma S.",
      avatar: "ES",
      color: "bg-red-500",
    },
    intention: "Publish YouTube video weekly",
    outcome: "Grow my channel to 1000 subscribers",
    type: "periodic",
    schedule: "Every Sunday at 12:00 PM",
    progress: "6/8 completed (75%)",
    stake: 100,
    charity: "Arts & Culture Fund",
    daysLeft: 14,
    postedDate: "6 days ago",
  },
];

export default function CommunityPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/sign-in");
    }
  }, [user, isLoading, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Get first name only
  const firstName = user?.name.split(" ")[0] || "";

  if (isLoading) {
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
                + New
              </Button>
            </Link>
            <Link href="/dashboard" className="flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className={`font-normal text-xs px-3 py-2 ${pathname === '/dashboard' ? 'bg-gray-100' : ''}`}
              >
                Dashboard
              </Button>
            </Link>
            <Link href="/community" className="flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className={`font-normal text-xs px-3 py-2 ${pathname === '/community' ? 'bg-gray-100' : ''}`}
              >
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
            Community Feed
          </h2>
          <p className="text-sm text-gray-600">
            See what others are committing to and get inspired
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="font-normal">
            All
          </Button>
          <Button variant="ghost" size="sm" className="font-normal text-gray-600">
            Fitness
          </Button>
          <Button variant="ghost" size="sm" className="font-normal text-gray-600">
            Career
          </Button>
          <Button variant="ghost" size="sm" className="font-normal text-gray-600">
            Learning
          </Button>
          <Button variant="ghost" size="sm" className="font-normal text-gray-600">
            Health
          </Button>
          <Button variant="ghost" size="sm" className="font-normal text-gray-600">
            Creative
          </Button>
        </div>

        {/* Community Feed */}
        <div className="space-y-4">
          {communityCommitments.map((commitment) => (
            <div
              key={commitment.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* User Avatar */}
                <div
                  className={`${commitment.user.color} w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}
                >
                  {commitment.user.avatar}
                </div>

                {/* Content */}
                <div className="flex-1">
                  {/* User Info & Time */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-neutral-900">
                        {commitment.user.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {commitment.postedDate}
                      </p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full">
                      Active
                    </span>
                  </div>

                  {/* Commitment Details */}
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                      {commitment.intention}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {commitment.outcome}
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
                    {commitment.type === "periodic" ? (
                      <>
                        <div>
                          <span className="text-gray-500 block text-xs">Schedule</span>
                          <span className="text-neutral-800 font-medium">
                            {commitment.schedule}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-xs">Progress</span>
                          <span className="text-neutral-800 font-medium">
                            {commitment.progress}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div>
                        <span className="text-gray-500 block text-xs">Due Date</span>
                        <span className="text-neutral-800 font-medium">
                          {commitment.dueDate}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500 block text-xs">Stake</span>
                      <span className="text-neutral-800 font-medium">
                        ${commitment.stake}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">Charity</span>
                      <span className="text-neutral-800 font-medium">
                        {commitment.charity}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-3 border-t border-gray-100">
                    <Button variant="ghost" size="sm" className="text-gray-600 font-normal">
                      Cheer
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-600 font-normal">
                      Comment
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-8 text-center">
          <Button variant="outline" className="font-normal">
            Load More
          </Button>
        </div>

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
