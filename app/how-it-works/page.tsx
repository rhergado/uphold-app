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
                <span className="font-semibold">Buddy Verification:</span> Have a trusted friend verify and confirm
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
                What Happens to Your Money
              </h3>
            </div>
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm font-semibold text-green-800 mb-1">
                  ✓ If You Succeed:
                </p>
                <p className="text-sm text-green-700">
                  You get your full stake back minus a $4.95 platform fee.
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Example: $20 stake → $15.05 refunded, $4.95 platform fee
                </p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm font-semibold text-orange-800 mb-1">
                  ✗ If You Don't Complete It:
                </p>
                <p className="text-sm text-orange-700">
                  70% goes to your chosen charity. We keep 30% as a platform fee.
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  Example: $20 stake → $14.00 to charity, $6.00 platform fee
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust & Security */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 text-center">
            🔒 Your Money is Secure
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                <span className="text-blue-600 text-xs">✓</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Powered by Stripe</p>
                <p className="text-gray-600">All payments processed securely through Stripe, trusted by millions of businesses worldwide</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                <span className="text-blue-600 text-xs">✓</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Transparent Fees</p>
                <p className="text-gray-600">You see exactly where every dollar goes before you commit</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                <span className="text-blue-600 text-xs">✓</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Automatic Refunds</p>
                <p className="text-gray-600">When you succeed, your refund is processed immediately - no waiting, no hassle</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                <span className="text-blue-600 text-xs">✓</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Real Charity Donations</p>
                <p className="text-gray-600">Choose from vetted charities: Doctors Without Borders, UNICEF, or Best Friends Animal Society</p>
              </div>
            </div>
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

        {/* FAQ */}
        <div className="mb-10">
          <h3 className="text-2xl font-semibold text-neutral-900 mb-6 text-center">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            <details className="bg-gray-50 rounded-lg p-4 cursor-pointer">
              <summary className="font-semibold text-gray-900 text-sm">
                Is my money safe?
              </summary>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Yes. All payments are processed through Stripe, one of the world's most trusted payment processors.
                We never store your payment information. When you create a commitment, Stripe charges your card immediately.
                When you succeed, Stripe processes your refund directly back to your original payment method.
              </p>
            </details>

            <details className="bg-gray-50 rounded-lg p-4 cursor-pointer">
              <summary className="font-semibold text-gray-900 text-sm">
                How do I know my refund will actually be processed?
              </summary>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Refunds are automatic. When you mark a commitment as complete, our system immediately triggers a Stripe refund.
                You'll receive an email confirmation with your Stripe transaction ID. Refunds typically appear in your account within 5-10 business days,
                depending on your bank.
              </p>
            </details>

            <details className="bg-gray-50 rounded-lg p-4 cursor-pointer">
              <summary className="font-semibold text-gray-900 text-sm">
                Do charity donations actually happen?
              </summary>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Yes. When a commitment fails, 75% of your stake goes directly to the charity you selected (Doctors Without Borders, UNICEF, or Best Friends Animal Society).
                All donations are processed through verified charity accounts. You can request a donation receipt for tax purposes.
              </p>
            </details>

            <details className="bg-gray-50 rounded-lg p-4 cursor-pointer">
              <summary className="font-semibold text-gray-900 text-sm">
                Why do you charge platform fees?
              </summary>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Platform fees cover our operating costs: Stripe payment processing fees (2.9% + $0.30 per transaction),
                server hosting, email delivery, and ongoing development. Our fee model encourages you to succeed - we make less when you fail,
                so we're genuinely rooting for you!
              </p>
            </details>

            <details className="bg-gray-50 rounded-lg p-4 cursor-pointer">
              <summary className="font-semibold text-gray-900 text-sm">
                Can I get a full refund if I change my mind?
              </summary>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Commitments are binding once payment is made - that's what makes them effective! However, if you have extenuating circumstances
                (medical emergency, natural disaster, etc.), please contact support and we'll review your case individually.
              </p>
            </details>

            <details className="bg-gray-50 rounded-lg p-4 cursor-pointer">
              <summary className="font-semibold text-gray-900 text-sm">
                What payment methods do you accept?
              </summary>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                We accept all major credit and debit cards (Visa, Mastercard, American Express, Discover) through Stripe.
                We do not currently accept PayPal, Venmo, or cryptocurrency.
              </p>
            </details>
          </div>
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

        {/* Footer Links */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
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
