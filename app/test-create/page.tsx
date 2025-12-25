"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

type VerificationMode = "integrity" | "buddy" | "app";
type CommitmentType = "one-time" | "periodic";

const commitmentSchema = z.object({
  commitmentType: z.enum(["one-time", "periodic"]),
  intention: z.string().min(3, "Intention must be at least 3 characters"),
  outcome: z.string().min(10, "Outcome must be at least 10 characters"),
  dueDate: z.string().optional(),
  dueTime: z.string().min(1, "Time is required"),
  stake: z.coerce.number().min(5, "Stake must be at least $5"),
  verificationMode: z.enum(["integrity", "buddy", "app"]),
  buddyEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  charity: z.string().min(1, "Please select a charity"),
  isPublic: z.boolean().default(false),
  daysOfWeek: z.array(z.number()).optional(),
  durationWeeks: z.coerce.number().optional(),
  startDate: z.string().optional(),
}).refine((data) => {
  if (data.verificationMode === "buddy") {
    return data.buddyEmail && data.buddyEmail.length > 0;
  }
  return true;
}, {
  message: "Buddy email is required for buddy verification",
  path: ["buddyEmail"],
}).refine((data) => {
  if (data.commitmentType === "one-time") {
    return data.dueDate && data.dueDate.length > 0;
  }
  return true;
}, {
  message: "Due date is required",
  path: ["dueDate"],
}).refine((data) => {
  if (data.commitmentType === "one-time" && data.dueDate) {
    const selectedDate = new Date(data.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  }
  return true;
}, {
  message: "Due date must be today or in the future",
  path: ["dueDate"],
}).refine((data) => {
  if (data.commitmentType === "periodic") {
    return data.daysOfWeek && data.daysOfWeek.length > 0;
  }
  return true;
}, {
  message: "Select at least one day for periodic commitments",
  path: ["daysOfWeek"],
}).refine((data) => {
  if (data.commitmentType === "periodic") {
    return data.durationWeeks && data.durationWeeks > 0;
  }
  return true;
}, {
  message: "Duration is required for periodic commitments",
  path: ["durationWeeks"],
}).refine((data) => {
  if (data.commitmentType === "periodic") {
    return data.startDate && data.startDate.length > 0;
  }
  return true;
}, {
  message: "Start date is required for periodic commitments",
  path: ["startDate"],
});

type CommitmentFormData = z.infer<typeof commitmentSchema>;

export default function TestCreatePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [verificationMode, setVerificationMode] = useState<VerificationMode>("integrity");
  const [commitmentType, setCommitmentType] = useState<CommitmentType>("one-time");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [submittedData, setSubmittedData] = useState<CommitmentFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeeBreakdown, setShowFeeBreakdown] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CommitmentFormData>({
    resolver: zodResolver(commitmentSchema),
    defaultValues: {
      commitmentType: "one-time",
      verificationMode: "integrity",
      daysOfWeek: [],
      isPublic: false,
    },
  });

  // Watch the stake amount for real-time fee calculation
  const stakeAmount = watch("stake") || 0;

  const onSubmit = async (data: CommitmentFormData) => {
    if (!user) {
      alert("You must be logged in to create a commitment");
      router.push("/sign-in");
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate due_date based on commitment type
      let dueDate;
      if (data.commitmentType === "one-time") {
        dueDate = `${data.dueDate}T${data.dueTime}:00`;
      } else {
        // For periodic, use the end date
        const start = new Date(data.startDate!);
        const end = new Date(start);
        end.setDate(end.getDate() + (data.durationWeeks! * 7));
        dueDate = end.toISOString();
      }

      // Prepare commitment data
      const commitmentData = {
        user_id: user.id,
        commitment_type: data.commitmentType,
        intention: data.intention,
        outcome: data.outcome,
        due_date: dueDate,
        stake: data.stake,
        verification_mode: data.verificationMode,
        buddy_email: data.buddyEmail || null,
        charity: data.charity,
        is_public: data.isPublic,
        status: "active",
        // Periodic-specific fields
        days_of_week: data.daysOfWeek || null,
        duration_weeks: data.durationWeeks || null,
        start_date: data.startDate || null,
        due_time: data.dueTime,
      };

      // Insert into Supabase
      const { data: insertedCommitment, error } = await supabase
        .from("commitments")
        .insert([commitmentData])
        .select()
        .single();

      if (error) {
        console.error("Error creating commitment:", error);
        alert(`Error creating commitment: ${error.message}`);
        setIsSubmitting(false);
        return;
      }

      console.log("Commitment created successfully:", insertedCommitment);

      // Test mode: Skip payment for stakes of $5 (for testing purposes)
      if (data.stake === 5) {
        alert("Test mode: Payment skipped. Commitment created!");
        router.push("/dashboard");
      } else {
        // Redirect to payment page
        router.push(`/payment/${insertedCommitment.id}`);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationChange = (mode: VerificationMode) => {
    setVerificationMode(mode);
    setValue("verificationMode", mode);
  };

  const handleCommitmentTypeChange = (type: CommitmentType) => {
    setCommitmentType(type);
    setValue("commitmentType", type);
  };

  const handleDayToggle = (day: number) => {
    const newDays = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day].sort();
    setSelectedDays(newDays);
    setValue("daysOfWeek", newDays);
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

  const getVerificationLabel = (mode: VerificationMode) => {
    switch (mode) {
      case "integrity":
        return "Integrity mode";
      case "buddy":
        return "Buddy verification";
      case "app":
        return "App verification";
    }
  };

  if (submittedData) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-md mx-auto px-5 py-6">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              COMMITMENT CREATED (TEST MODE)
            </p>
            <h1 className="text-2xl font-semibold text-neutral-950">
              Your commitment is locked
            </h1>
          </div>

          <Card className="p-6 rounded-2xl border border-gray-200 shadow-sm space-y-1.5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                INTENTION
              </p>
              <p className="text-base text-neutral-950 font-medium">
                {submittedData.intention}
              </p>
            </div>

            <Separator />

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                PROOF
              </p>
              <p className="text-sm text-neutral-700">
                {submittedData.outcome}
              </p>
            </div>

            <Separator />

            {submittedData.commitmentType === "one-time" && submittedData.dueDate && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  DUE
                </p>
                <p className="text-base text-neutral-950 font-medium">
                  {formatDate(submittedData.dueDate)} at {formatTime(submittedData.dueTime)}
                </p>
              </div>
            )}

            {submittedData.commitmentType === "periodic" && submittedData.daysOfWeek && submittedData.durationWeeks && submittedData.startDate && (
              <>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                    SCHEDULE
                  </p>
                  <p className="text-base text-neutral-950 font-medium">
                    {(() => {
                      const instances = calculateInstances(submittedData.startDate, submittedData.daysOfWeek, submittedData.durationWeeks);
                      const requiredCompletions = Math.ceil(instances.length * 0.8);
                      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                      const selectedDayNames = submittedData.daysOfWeek.map(d => dayNames[d]).join(", ");
                      return (
                        <>
                          <span>{selectedDayNames} at {formatTime(submittedData.dueTime)}</span>
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
                    {formatDate(submittedData.startDate)} - {(() => {
                      const start = new Date(submittedData.startDate!);
                      const end = new Date(start);
                      end.setDate(end.getDate() + (submittedData.durationWeeks! * 7));
                      return formatDate(end.toISOString().split('T')[0]);
                    })()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {submittedData.durationWeeks} weeks
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
                ${submittedData.stake}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {submittedData.commitmentType === "periodic" ? "Returned if you complete 80%+" : "Returned if completed"}
              </p>
            </div>

            <Separator />

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                IF FAILED
              </p>
              <p className="text-base text-neutral-950 font-medium">
                Donated to {submittedData.charity.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </p>
            </div>

            <Separator />

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                VERIFICATION
              </p>
              <p className="text-base text-neutral-950 font-medium">
                {getVerificationLabel(submittedData.verificationMode)}
              </p>
              {submittedData.verificationMode === "buddy" && submittedData.buddyEmail && (
                <p className="text-sm text-gray-500 mt-1">
                  Buddy: {submittedData.buddyEmail}
                </p>
              )}
              {submittedData.commitmentType === "periodic" && (
                <p className="text-sm text-gray-500 mt-1">
                  Each instance requires separate verification
                </p>
              )}
            </div>
          </Card>

          <div className="mt-6 space-y-3">
            <Button
              className="w-full"
              size="lg"
              onClick={() => router.push("/dashboard")}
            >
              Go to Dashboard
            </Button>
            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={() => setSubmittedData(null)}
            >
              Create Another Commitment
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pb-24">
      <div className="max-w-md mx-auto px-5 py-6">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
            TEST MODE - NO AUTH
          </p>
          <Progress value={25} className="h-1 mb-4" />
          <h1 className="text-2xl font-semibold text-neutral-950">
            What's your intention?
          </h1>
        </div>

        <Card className="p-6 rounded-2xl border border-gray-200 shadow-sm">
          <form id="commitment-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-neutral-900">
                Commitment Type
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleCommitmentTypeChange("one-time")}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${
                    commitmentType === "one-time"
                      ? "border-blue-600 bg-blue-50 text-blue-900"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  One-time
                </button>
                <button
                  type="button"
                  onClick={() => handleCommitmentTypeChange("periodic")}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${
                    commitmentType === "periodic"
                      ? "border-blue-600 bg-blue-50 text-blue-900"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Periodic
                </button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <label htmlFor="intention" className="text-sm font-medium text-neutral-900">
                I will...
              </label>
              <Input
                id="intention"
                type="text"
                placeholder="e.g., Write 1,000 words"
                className="text-base"
                {...register("intention")}
              />
              {errors.intention && (
                <p className="text-xs text-red-600">{errors.intention.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="outcome" className="text-sm font-medium text-neutral-900">
                How will you prove it?
              </label>
              <Textarea
                id="outcome"
                placeholder="e.g., I'll send a screenshot of my word count"
                className="text-base min-h-[100px] resize-none"
                {...register("outcome")}
              />
              {errors.outcome ? (
                <p className="text-xs text-red-600">{errors.outcome.message}</p>
              ) : (
                <p className="text-xs text-gray-500">
                  Describe the evidence you'll provide.
                </p>
              )}
            </div>

            {commitmentType === "one-time" && (
              <div className="space-y-2">
                <label htmlFor="dueDate" className="text-sm font-medium text-neutral-900">
                  Due date & time
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input
                      id="dueDate"
                      type="date"
                      className="text-base"
                      {...register("dueDate")}
                    />
                    {errors.dueDate && (
                      <p className="text-xs text-red-600 mt-1">{errors.dueDate.message}</p>
                    )}
                  </div>
                  <div>
                    <Input
                      id="dueTime"
                      type="time"
                      className="text-base"
                      {...register("dueTime")}
                    />
                    {errors.dueTime && (
                      <p className="text-xs text-red-600 mt-1">{errors.dueTime.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {commitmentType === "periodic" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-900">
                    Which days?
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleDayToggle(index)}
                        className={`py-2 px-1 rounded-lg border-2 text-xs font-medium transition-colors ${
                          selectedDays.includes(index)
                            ? "border-blue-600 bg-blue-50 text-blue-900"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  {errors.daysOfWeek && (
                    <p className="text-xs text-red-600">{errors.daysOfWeek.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label htmlFor="startDate" className="text-sm font-medium text-neutral-900">
                      Start date
                    </label>
                    <Input
                      id="startDate"
                      type="date"
                      className="text-base"
                      {...register("startDate")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="durationWeeks" className="text-sm font-medium text-neutral-900">
                      Duration (weeks)
                    </label>
                    <Input
                      id="durationWeeks"
                      type="number"
                      min="1"
                      placeholder="8"
                      className="text-base"
                      {...register("durationWeeks")}
                    />
                    {errors.durationWeeks && (
                      <p className="text-xs text-red-600 mt-1">{errors.durationWeeks.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="dueTime" className="text-sm font-medium text-neutral-900">
                    Time of day
                  </label>
                  <Input
                    id="dueTime"
                    type="time"
                    className="text-base"
                    {...register("dueTime")}
                  />
                  {errors.dueTime && (
                    <p className="text-xs text-red-600 mt-1">{errors.dueTime.message}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    All instances will be due at this time
                  </p>
                </div>
              </>
            )}

            <div className="space-y-2">
              <label htmlFor="stake" className="text-sm font-medium text-neutral-900">
                What's at stake?
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-base">
                  $
                </span>
                <Input
                  id="stake"
                  type="number"
                  min="5"
                  placeholder="25"
                  className="text-base pl-8"
                  {...register("stake")}
                />
              </div>
              {errors.stake ? (
                <p className="text-xs text-red-600">{errors.stake.message}</p>
              ) : (
                <p className="text-xs text-gray-500">
                  Minimum $5. {commitmentType === "periodic" ? "Returned if you complete 80%+ of instances." : "You'll lose this if you don't follow through."}
                </p>
              )}

              {/* Fee breakdown preview - collapsible */}
              {stakeAmount >= 5 && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setShowFeeBreakdown(!showFeeBreakdown)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {showFeeBreakdown ? "Hide fees" : "Show fees"}
                  </button>

                  {showFeeBreakdown && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                        Fee Breakdown
                      </p>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">If you succeed:</span>
                          <span className="text-green-600 font-medium">
                            ${(stakeAmount * 0.95).toFixed(2)} back
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 pl-2">
                          • Platform fee (5%): ${(stakeAmount * 0.05).toFixed(2)}
                        </div>
                        <div className="border-t border-gray-200 pt-1.5 flex justify-between">
                          <span className="text-gray-600">If you fail:</span>
                          <span className="text-orange-600 font-medium">
                            ${(stakeAmount * 0.75).toFixed(2)} to charity
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 pl-2">
                          • Platform fee (25%): ${(stakeAmount * 0.25).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="charity" className="text-sm font-medium text-neutral-900">
                If you fail, donate to:
              </label>
              <select
                id="charity"
                className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                {...register("charity")}
              >
                <option value="">Select a charity...</option>
                <option value="red-cross">Red Cross</option>
                <option value="doctors-without-borders">Doctors Without Borders</option>
                <option value="unicef">UNICEF</option>
                <option value="world-wildlife-fund">World Wildlife Fund</option>
                <option value="habitat-for-humanity">Habitat for Humanity</option>
                <option value="feeding-america">Feeding America</option>
              </select>
              {errors.charity && (
                <p className="text-xs text-red-600">{errors.charity.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Your stake will be donated here if you {commitmentType === "periodic" ? "don't reach 80% completion" : "fail to complete your commitment"}.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-gray-50">
                <div className="flex-1">
                  <label htmlFor="isPublic" className="text-sm font-medium text-neutral-900 cursor-pointer">
                    Share with community
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Make this commitment visible to others in the community feed for motivation and accountability
                  </p>
                </div>
                <Switch
                  id="isPublic"
                  onCheckedChange={(checked) => setValue("isPublic", checked)}
                  defaultChecked={false}
                />
              </div>
              <p className="text-xs text-gray-500">
                Private by default. Only you and your buddy (if selected) can see private commitments.
              </p>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <label className="text-sm font-medium text-neutral-900">
                How will you verify?
              </label>

              <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-gray-200 bg-gray-50">
                <div className="flex-1">
                  <div className="font-medium text-neutral-900 text-sm mb-1">
                    Integrity mode
                  </div>
                  <p className="text-xs text-gray-500">
                    Self-verify on your honor. No external proof required.
                  </p>
                </div>
                <Switch
                  checked={verificationMode === "integrity"}
                  onCheckedChange={() => handleVerificationChange("integrity")}
                />
              </div>

              <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-gray-200 bg-gray-50">
                <div className="flex-1">
                  <div className="font-medium text-neutral-900 text-sm mb-1">
                    Buddy verification
                  </div>
                  <p className="text-xs text-gray-500">
                    A trusted friend confirms you completed it.
                  </p>
                </div>
                <Switch
                  checked={verificationMode === "buddy"}
                  onCheckedChange={() => handleVerificationChange("buddy")}
                />
              </div>

              <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-gray-200 bg-gray-50">
                <div className="flex-1">
                  <div className="font-medium text-neutral-900 text-sm mb-1">
                    App verification
                  </div>
                  <p className="text-xs text-gray-500">
                    Submit proof (photo, screenshot, etc.) for review.
                  </p>
                </div>
                <Switch
                  checked={verificationMode === "app"}
                  onCheckedChange={() => handleVerificationChange("app")}
                />
              </div>

              {verificationMode === "buddy" && (
                <div className="space-y-2 pt-2">
                  <label htmlFor="buddyEmail" className="text-sm font-medium text-neutral-900">
                    Buddy's email
                  </label>
                  <Input
                    id="buddyEmail"
                    type="email"
                    placeholder="friend@example.com"
                    className="text-base"
                    {...register("buddyEmail")}
                  />
                  {errors.buddyEmail ? (
                    <p className="text-xs text-red-600">{errors.buddyEmail.message}</p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      They'll receive a verification request when your deadline arrives.
                    </p>
                  )}
                </div>
              )}

              {verificationMode === "app" && (
                <div className="space-y-2 pt-2">
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                    <p className="text-xs text-blue-900">
                      {commitmentType === "periodic"
                        ? "After each occurrence, you'll be prompted to submit proof (like a photo or screenshot). Our team will review and verify within 24 hours."
                        : "After your deadline, you'll be prompted to submit proof (like a photo of a plane ticket, screenshot, etc.). Our team will review and verify within 24 hours."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </form>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-4">
        <div className="max-w-md mx-auto flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="flex-1"
            size="lg"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="commitment-form"
            className="flex-1"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Continue"}
          </Button>
        </div>
      </div>
    </main>
  );
}
