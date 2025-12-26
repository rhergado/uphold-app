"use client";

import Link from "next/link";

export default function TermsOfServicePage() {
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
            Terms of Service
          </h2>
          <p className="text-sm text-gray-600">
            Last Updated: December 25, 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-gray max-w-none">
          <p className="text-base text-gray-700 leading-relaxed mb-6">
            Welcome to Uphold. By using our service, you agree to these Terms of Service. Please read them carefully.
          </p>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">1. Service Description</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Uphold is a commitment accountability platform that allows users to set personal goals and put money at stake to increase motivation. When you create a commitment:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>You pay a stake amount that is charged immediately via Stripe</li>
              <li>If you complete your commitment, you receive a 95% refund; we keep 5% as a platform fee</li>
              <li>If you fail to complete your commitment, 75% is donated to your chosen charity; we keep 25% as a platform fee</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">2. User Accounts</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              You must create an account to use Uphold. You are responsible for:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and truthful information</li>
              <li>Notifying us immediately of any unauthorized access</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">3. Commitments and Payments</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              <strong>Binding Nature:</strong> Once a commitment is created and payment is processed, it becomes binding. You cannot cancel a commitment or receive a full refund except in extraordinary circumstances (medical emergencies, natural disasters) at our sole discretion.
            </p>
            <p className="text-gray-700 leading-relaxed mb-3">
              <strong>Payment Processing:</strong> All payments are processed through Stripe. By making a payment, you agree to Stripe's Terms of Service. We do not store your payment information.
            </p>
            <p className="text-gray-700 leading-relaxed mb-3">
              <strong>Refund Timeline:</strong> Refunds for successful commitments are processed immediately but may take 5-10 business days to appear in your account, depending on your bank.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">4. Verification Methods</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              We offer three verification methods:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Integrity Mode:</strong> You self-certify completion on your honor</li>
              <li><strong>Buddy Verification:</strong> A friend or accountability partner confirms completion</li>
              <li><strong>App Verification:</strong> You submit proof for our team to review</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              You are responsible for selecting an appropriate verification method. We reserve the right to reject verification if we detect fraud or abuse.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">5. Prohibited Conduct</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              You may not:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Use the service for any illegal purpose</li>
              <li>Create fraudulent commitments with no intention to complete them</li>
              <li>Abuse the verification system</li>
              <li>Attempt to game or exploit the platform for financial gain</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Interfere with or disrupt the service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">6. Charity Donations</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              When a commitment fails, 75% of the stake is donated to the charity you selected. We work with verified charitable organizations:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Doctors Without Borders (Médecins Sans Frontières)</li>
              <li>UNICEF</li>
              <li>Best Friends Animal Society</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Donations are final and cannot be reversed. You may request a donation receipt for tax purposes.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">7. Platform Fees</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Our platform fees are:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Successful Completion:</strong> 5% of stake amount</li>
              <li><strong>Failed Completion:</strong> 25% of stake amount</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              These fees cover payment processing (Stripe charges 2.9% + $0.30 per transaction), infrastructure costs, and ongoing development. Platform fees are non-refundable.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">8. Disclaimer of Warranties</h3>
            <p className="text-gray-700 leading-relaxed">
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. We do not guarantee that the service will be uninterrupted, secure, or error-free. We are not responsible for user-generated content or third-party services (including Stripe and charity organizations).
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">9. Limitation of Liability</h3>
            <p className="text-gray-700 leading-relaxed">
              To the maximum extent permitted by law, Uphold shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues. Our total liability shall not exceed the amount you paid to us in the past 12 months.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">10. Changes to Terms</h3>
            <p className="text-gray-700 leading-relaxed">
              We may modify these Terms at any time. We will notify users of material changes via email. Continued use of the service after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">11. Termination</h3>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to suspend or terminate your account at any time for violation of these Terms. You may delete your account at any time, but active commitments remain binding.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">12. Governing Law</h3>
            <p className="text-gray-700 leading-relaxed">
              These Terms are governed by the laws of [Your Jurisdiction]. Any disputes shall be resolved in the courts of [Your Jurisdiction].
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">13. Contact Us</h3>
            <p className="text-gray-700 leading-relaxed">
              If you have questions about these Terms, please contact us at:
            </p>
            <p className="text-gray-700 leading-relaxed mt-2">
              Email: <a href="mailto:support@uphold.app" className="text-blue-600 hover:underline">support@uphold.app</a>
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
