"use client";

import Link from "next/link";

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h2>
          <p className="text-sm text-gray-600">
            Last Updated: December 25, 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-gray max-w-none">
          <p className="text-base text-gray-700 leading-relaxed mb-6">
            At Uphold, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information.
          </p>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">1. Information We Collect</h3>

            <h4 className="text-lg font-semibold text-neutral-800 mb-2 mt-4">Information You Provide</h4>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Account Information:</strong> Name, email address, and password (encrypted)</li>
              <li><strong>Commitment Details:</strong> Your goals, deadlines, and verification preferences</li>
              <li><strong>Payment Information:</strong> Processed and stored by Stripe (we never see or store your full card details)</li>
              <li><strong>Communications:</strong> Messages you send us for support or feedback</li>
            </ul>

            <h4 className="text-lg font-semibold text-neutral-800 mb-2 mt-4">Information Collected Automatically</h4>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent on the platform</li>
              <li><strong>Device Information:</strong> Browser type, operating system, IP address</li>
              <li><strong>Cookies:</strong> Session cookies for authentication and functionality</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">2. How We Use Your Information</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              We use your information to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Provide and maintain the Uphold service</li>
              <li>Process your commitments and payments</li>
              <li>Send transactional emails (payment confirmations, refund notifications, reminders)</li>
              <li>Respond to your support requests</li>
              <li>Improve and optimize the platform</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">3. How We Share Your Information</h3>

            <h4 className="text-lg font-semibold text-neutral-800 mb-2 mt-4">We Share Information With:</h4>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Stripe:</strong> For payment processing (subject to Stripe's Privacy Policy)</li>
              <li><strong>Charity Organizations:</strong> Donor name and donation amount when you fail a commitment (for tax receipts)</li>
              <li><strong>Email Service (Resend):</strong> To send transactional emails</li>
              <li><strong>Buddy Verifiers:</strong> If you choose buddy verification, your commitment details are shared with the email address you provide</li>
            </ul>

            <h4 className="text-lg font-semibold text-neutral-800 mb-2 mt-4">We Never:</h4>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Sell your personal information to third parties</li>
              <li>Share your data with advertisers</li>
              <li>Use your data for purposes other than providing the service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">4. Data Security</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              We implement security measures to protect your information:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Passwords are hashed using bcrypt</li>
              <li>All data transmission is encrypted using SSL/TLS</li>
              <li>Payment information is handled exclusively by Stripe (PCI DSS compliant)</li>
              <li>Database access is restricted and monitored</li>
              <li>Regular security audits and updates</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">5. Data Retention</h3>
            <p className="text-gray-700 leading-relaxed">
              We retain your information for as long as your account is active or as needed to provide services. If you delete your account, we will delete your personal information within 30 days, except:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
              <li>Financial records (required by law for 7 years)</li>
              <li>Transaction history for completed commitments</li>
              <li>Information needed to comply with legal obligations or resolve disputes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">6. Your Privacy Rights</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correct:</strong> Update inaccurate information in your account settings</li>
              <li><strong>Delete:</strong> Request deletion of your account and data</li>
              <li><strong>Export:</strong> Download your commitment history and data</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing emails (we don't send these yet)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              To exercise these rights, email us at <a href="mailto:privacy@uphold.app" className="text-blue-600 hover:underline">privacy@uphold.app</a>
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">7. Cookies and Tracking</h3>
            <p className="text-gray-700 leading-relaxed">
              We use essential cookies for:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
              <li>Authentication (keeping you logged in)</li>
              <li>Session management</li>
              <li>Security and fraud prevention</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              We do not currently use third-party analytics or advertising cookies. You can disable cookies in your browser settings, but this may limit functionality.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">8. Third-Party Services</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Our service integrates with:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Stripe:</strong> Payment processing - <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Stripe Privacy Policy</a></li>
              <li><strong>Supabase:</strong> Database hosting - <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase Privacy Policy</a></li>
              <li><strong>Resend:</strong> Email delivery - <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Resend Privacy Policy</a></li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              These services have their own privacy policies. We recommend reviewing them.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">9. Children's Privacy</h3>
            <p className="text-gray-700 leading-relaxed">
              Uphold is not intended for users under 18. We do not knowingly collect information from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">10. International Users</h3>
            <p className="text-gray-700 leading-relaxed">
              Uphold is operated from [Your Country]. If you use the service from outside [Your Country], your information will be transferred to and processed in [Your Country]. By using the service, you consent to this transfer.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">11. Changes to This Policy</h3>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of material changes via email or a notice on the platform. The "Last Updated" date will reflect when changes were made.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">12. Contact Us</h3>
            <p className="text-gray-700 leading-relaxed">
              If you have questions or concerns about this Privacy Policy, please contact us:
            </p>
            <p className="text-gray-700 leading-relaxed mt-2">
              Email: <a href="mailto:privacy@uphold.app" className="text-blue-600 hover:underline">privacy@uphold.app</a><br />
              Address: [Your Business Address]
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
