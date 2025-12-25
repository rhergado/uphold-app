"use client";

import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-4">
            <h1 className="text-2xl font-light tracking-tight text-neutral-800">
              Up<span className="font-bold">hold</span>
            </h1>
          </Link>
          <h2 className="text-3xl font-semibold text-neutral-900 mb-3">
            How it Works
          </h2>
          <p className="text-base text-gray-600">
            Put your money where your mouth is
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8 mb-10">
          {/* Step 1 */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
                1
              </div>
              <h3 className="text-xl font-semibold text-neutral-900">
                Make a Commitment
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed text-sm">
              Set a goal you want to achieve - whether it's a one-time task or a recurring habit.
              Be specific about what you'll do and when you'll do it.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
                2
              </div>
              <h3 className="text-xl font-semibold text-neutral-900">
                Put Money at Stake
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed text-sm">
              Choose an amount that matters to you. This isn't a bet - it's a powerful motivator.
              The higher the stakes, the stronger your commitment.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
                3
              </div>
              <h3 className="text-xl font-semibold text-neutral-900">
                Choose Your Verification
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed text-sm mb-3">
              Decide how you'll prove you completed your commitment:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-700">
                <span className="font-semibold">Integrity Mode:</span> Self-verify on your honor
              </li>
              <li className="text-gray-700">
                <span className="font-semibold">Buddy Verification:</span> Have a trusted friend confirm
              </li>
              <li className="text-gray-700">
                <span className="font-semibold">App Verification:</span> Submit proof for review
              </li>
            </ul>
          </div>

          {/* Step 4 */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
                4
              </div>
              <h3 className="text-xl font-semibold text-neutral-900">
                Complete Your Goal
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed text-sm">
              Follow through on your commitment before the deadline. For periodic commitments,
              you need to complete at least 80% of instances to succeed.
            </p>
          </div>

          {/* Step 5 */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
                5
              </div>
              <h3 className="text-xl font-semibold text-neutral-900">
                Get Your Money Back
              </h3>
            </div>
            <p className="text-sm text-gray-700 mb-2">
              <span className="font-semibold text-green-700">✓ Success:</span> Your stake is returned in full
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-red-700">✗ Failure:</span> Your stake is donated to charity
            </p>
          </div>
        </div>

        {/* Why it Works */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-neutral-900 mb-3">
            💡 Why It Works
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            Loss aversion is one of the most powerful psychological motivators. Studies show that
            people are roughly twice as motivated to avoid losing something as they are to gain something
            of equal value.
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            By putting real money on the line, you tap into this powerful force. Your commitment
            becomes more than just words - it becomes a binding agreement with yourself.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4">
          <Link
            href="/sign-up"
            className="block w-full py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Get Started
          </Link>
          <Link href="/" className="block text-gray-600 hover:text-blue-600 transition-colors text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
