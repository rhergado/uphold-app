"use client";

import Link from "next/link";

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-5 py-12">
        {/* Header */}
        <div className="mb-10">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-2xl font-light tracking-tight text-neutral-800">
              Up<span className="font-bold">hold</span>
            </h1>
          </Link>
          <h2 className="text-3xl font-semibold text-neutral-900 mb-2">
            Refund Policy
          </h2>
          <p className="text-sm text-gray-600">
            Last Updated: December 25, 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-gray max-w-none">
          <p className="text-base text-gray-700 leading-relaxed mb-6">
            This Refund Policy explains how refunds work on Uphold and what to expect when you complete or fail a commitment.
          </p>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">How Refunds Work</h3>
            <p className="text-gray-700 leading-relaxed">
              Uphold is designed around the principle of commitment accountability. When you create a commitment, you stake money that is immediately charged to your payment method. The outcome depends on whether you complete your commitment:
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">Successful Completion</h3>
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-4">
              <h4 className="text-lg font-semibold text-green-900 mb-3">✓ You Complete Your Commitment</h4>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-green-800">Refund Amount:</p>
                  <p className="text-green-700">You receive 95% of your original stake back</p>
                </div>
                <div>
                  <p className="font-semibold text-green-800">Platform Fee:</p>
                  <p className="text-green-700">We keep 5% to cover payment processing and platform costs</p>
                </div>
                <div>
                  <p className="font-semibold text-green-800">Processing Time:</p>
                  <p className="text-green-700">Refund processed immediately; appears in your account within 5-10 business days</p>
                </div>
                <div>
                  <p className="font-semibold text-green-800">Refund Method:</p>
                  <p className="text-green-700">Automatically refunded to your original payment method</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-green-300">
                <p className="text-sm text-green-800 font-semibold mb-2">Example:</p>
                <p className="text-sm text-green-700">
                  Stake $20 → Complete commitment → Receive $19.00 refund (95%) → $1.00 platform fee (5%)
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">Failed Completion</h3>
            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6 mb-4">
              <h4 className="text-lg font-semibold text-orange-900 mb-3">✗ You Don't Complete Your Commitment</h4>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-orange-800">Charity Donation:</p>
                  <p className="text-orange-700">75% of your stake is donated to your chosen charity</p>
                </div>
                <div>
                  <p className="font-semibold text-orange-800">Platform Fee:</p>
                  <p className="text-orange-700">We keep 25% to cover payment processing and platform costs</p>
                </div>
                <div>
                  <p className="font-semibold text-orange-800">Refund Amount:</p>
                  <p className="text-orange-700">No refund - this is the consequence of not completing your commitment</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-orange-300">
                <p className="text-sm text-orange-800 font-semibold mb-2">Example:</p>
                <p className="text-sm text-orange-700">
                  Stake $20 → Miss deadline → $15.00 to charity (75%) → $5.00 platform fee (25%) → $0 refund
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">Refund Timeline</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
              <ol className="space-y-3 text-gray-700">
                <li><strong className="text-blue-900">Step 1:</strong> You mark your commitment as complete</li>
                <li><strong className="text-blue-900">Step 2:</strong> Our system verifies completion (based on your chosen verification method)</li>
                <li><strong className="text-blue-900">Step 3:</strong> Refund is immediately triggered through Stripe</li>
                <li><strong className="text-blue-900">Step 4:</strong> You receive email confirmation with transaction ID</li>
                <li><strong className="text-blue-900">Step 5:</strong> Refund appears in your account within 5-10 business days</li>
              </ol>
            </div>
            <p className="text-sm text-gray-600 mt-3 italic">
              Note: The exact timing depends on your bank's processing schedule. Most refunds appear within 5-7 business days.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">No-Refund Policy</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              <strong>Commitments are binding.</strong> Once a commitment is created and payment is processed, you cannot:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Cancel the commitment and get a full refund</li>
              <li>Change the verification method after payment</li>
              <li>Modify the deadline or goal significantly</li>
              <li>Request a refund because you "changed your mind"</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              This policy is essential to the effectiveness of Uphold. Accountability only works when commitments are binding.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">Extenuating Circumstances</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              We understand that life happens. In rare cases of genuine extenuating circumstances, we may issue a full refund at our sole discretion:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Documented medical emergencies requiring hospitalization</li>
              <li>Natural disasters or force majeure events</li>
              <li>Death of the account holder or immediate family member</li>
              <li>Technical errors on our platform that prevented completion</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              To request a review, email <a href="mailto:support@uphold.app" className="text-blue-600 hover:underline">support@uphold.app</a> with documentation within 7 days of the commitment deadline.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">Periodic Commitments</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              For periodic commitments (daily, weekly, monthly):
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>You must complete at least 80% of check-ins to succeed</li>
              <li>If you hit 80%+, you get the 95% refund</li>
              <li>If you complete less than 80%, the stake goes to charity (no refund)</li>
              <li>Check-ins are evaluated at the end of your commitment period</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">Disputed Charges</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              If you dispute a charge with your bank or credit card company (chargeback):
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Please contact us first - we can usually resolve issues quickly</li>
              <li>Chargebacks may result in account suspension</li>
              <li>We will provide documentation showing that the charge was authorized and legitimate</li>
              <li>Chargeback fees ($15-25) will be deducted from any future refunds</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">Platform Fee Justification</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Our platform fees cover:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Payment Processing:</strong> Stripe charges 2.9% + $0.30 per transaction</li>
              <li><strong>Infrastructure:</strong> Database hosting, email delivery, server costs</li>
              <li><strong>Development:</strong> Ongoing platform improvements and maintenance</li>
              <li><strong>Support:</strong> Customer service and technical assistance</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              <strong>Our fee model aligns with your success:</strong> We make less when you fail (25%) than when you succeed (5%), so we're genuinely rooting for you to complete your commitments!
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">Tax Deductions</h3>
            <p className="text-gray-700 leading-relaxed">
              If your commitment fails and money is donated to charity, you may request a donation receipt for tax purposes. The donation is made in your name to the charity you selected. Contact <a href="mailto:support@uphold.app" className="text-blue-600 hover:underline">support@uphold.app</a> to request a receipt.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">Contact Us</h3>
            <p className="text-gray-700 leading-relaxed">
              Questions about refunds? We're here to help:
            </p>
            <p className="text-gray-700 leading-relaxed mt-2">
              Email: <a href="mailto:support@uphold.app" className="text-blue-600 hover:underline">support@uphold.app</a><br />
              Typical response time: Within 24 hours
            </p>
          </section>
        </div>

        {/* Back Link */}
        <div className="mt-12 pt-6 border-t border-gray-200">
          <Link href="/" className="text-blue-600 hover:underline text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
