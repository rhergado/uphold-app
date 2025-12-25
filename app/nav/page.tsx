"use client";

import Link from "next/link";

export default function NavPage() {
  return (
    <main className="min-h-screen bg-[#f8f7f4] px-5 py-8">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-light tracking-tight text-neutral-800">
            Uphold
          </h1>
          <p className="text-sm text-neutral-600">
            Navigation - Browse all pages
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Main Pages
          </h2>

          <Link
            href="/"
            className="block w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            🏠 Home / Landing Page
          </Link>

          <Link
            href="/test-create"
            className="block w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            ✏️ Create Commitment (No Auth)
          </Link>

          <Link
            href="/dashboard"
            className="block w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            📊 Dashboard
          </Link>

          <Link
            href="/community"
            className="block w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            👥 Community
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Test Pages
          </h2>

          <Link
            href="/test-mobile"
            className="block w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            📱 Mobile Connection Test
          </Link>
        </div>

        <div className="text-center pt-4">
          <p className="text-xs text-gray-500">
            Testing on: {typeof window !== 'undefined' ? window.location.host : 'Loading...'}
          </p>
        </div>
      </div>
    </main>
  );
}
