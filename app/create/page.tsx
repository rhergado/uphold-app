"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
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

type VerificationMode = "integrity" | "buddy" | "app";

const commitmentSchema = z.object({
  intention: z.string().min(3, "Intention must be at least 3 characters"),
  outcome: z.string().min(10, "Outcome must be at least 10 characters"),
  dueDate: z.string().min(1, "Due date is required").refine((date) => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  }, "Due date must be today or in the future"),
  dueTime: z.string().min(1, "Time is required"),
  stake: z.coerce.number().min(5, "Stake must be at least $5"),
  verificationMode: z.enum(["integrity", "buddy", "app"]),
  buddyEmail: z.string().email("Invalid email").optional().or(z.literal("")),
}).refine((data) => {
  if (data.verificationMode === "buddy") {
    return data.buddyEmail && data.buddyEmail.length > 0;
  }
  return true;
}, {
  message: "Buddy email is required for buddy verification",
  path: ["buddyEmail"],
});

type CommitmentFormData = z.infer<typeof commitmentSchema>;

export default function CreatePage() {
  const [verificationMode, setVerificationMode] = useState<VerificationMode>("integrity");
  const [submittedData, setSubmittedData] = useState<CommitmentFormData | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CommitmentFormData>({
    resolver: zodResolver(commitmentSchema),
    defaultValues: {
      verificationMode: "integrity",
    },
  });

  const onSubmit = (data: CommitmentFormData) => {
    console.log("Form submitted:", data);
    setSubmittedData(data);
  };

  const handleVerificationChange = (mode: VerificationMode) => {
    setVerificationMode(mode);
    setValue("verificationMode", mode);
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

  // Show summary if form has been submitted
  if (submittedData) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-md mx-auto px-5 py-6">
          {/* Header */}
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              COMMITMENT CREATED
            </p>
            <h1 className="text-2xl font-semibold text-neutral-950">
              Your commitment is locked
            </h1>
          </div>

          {/* Summary Card */}
          <Card className="p-6 rounded-2xl border border-gray-200 shadow-sm space-y-1.5">
            {/* Intention */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                INTENTION
              </p>
              <p className="text-base text-neutral-950 font-medium">
                {submittedData.intention}
              </p>
            </div>

            <Separator />

            {/* Proof */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                PROOF
              </p>
              <p className="text-sm text-neutral-700">
                {submittedData.outcome}
              </p>
            </div>

            <Separator />

            {/* Due Date & Time */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                DUE
              </p>
              <p className="text-base text-neutral-950 font-medium">
                {formatDate(submittedData.dueDate)} at {formatTime(submittedData.dueTime)}
              </p>
            </div>

            <Separator />

            {/* Stake */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                AT STAKE
              </p>
              <p className="text-2xl text-neutral-950 font-bold">
                ${submittedData.stake}
              </p>
            </div>

            <Separator />

            {/* Verification */}
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
            </div>
          </Card>

          {/* Action Button */}
          <div className="mt-6">
            <Button
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
        {/* Header */}
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
            STEP 1 OF 4
          </p>
          <Progress value={25} className="h-1 mb-4" />
          <h1 className="text-2xl font-semibold text-neutral-950">
            What's your intention?
          </h1>
        </div>

        {/* Form Card */}
        <Card className="p-6 rounded-2xl border border-gray-200 shadow-sm">
          <form id="commitment-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Intention Input */}
            <div className="space-y-2">
              <label
                htmlFor="intention"
                className="text-sm font-medium text-neutral-900"
              >
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

            {/* Outcome Textarea */}
            <div className="space-y-2">
              <label
                htmlFor="outcome"
                className="text-sm font-medium text-neutral-900"
              >
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

            {/* Due Date & Time */}
            <div className="space-y-2">
              <label
                htmlFor="dueDate"
                className="text-sm font-medium text-neutral-900"
              >
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

            {/* Stake Input */}
            <div className="space-y-2">
              <label
                htmlFor="stake"
                className="text-sm font-medium text-neutral-900"
              >
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
                  Minimum $5. You'll lose this if you don't follow through.
                </p>
              )}
            </div>

            <Separator className="my-6" />

            {/* Verification Mode */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-neutral-900">
                How will you verify?
              </label>

              {/* Integrity Mode */}
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

              {/* Buddy Mode */}
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

              {/* App Verification */}
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

              {/* Conditional Buddy Email */}
              {verificationMode === "buddy" && (
                <div className="space-y-2 pt-2">
                  <label
                    htmlFor="buddyEmail"
                    className="text-sm font-medium text-neutral-900"
                  >
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

              {/* Conditional App Verification Instructions */}
              {verificationMode === "app" && (
                <div className="space-y-2 pt-2">
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                    <p className="text-xs text-blue-900">
                      After your deadline, you'll be prompted to submit proof (like a photo of a plane ticket, screenshot, etc.). Our team will review and verify within 24 hours.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </form>
        </Card>
      </div>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-4">
        <div className="max-w-md mx-auto">
          <Button type="submit" form="commitment-form" className="w-full" size="lg">
            Continue
          </Button>
        </div>
      </div>
    </main>
  );
}
