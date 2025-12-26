"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-neutral-600">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 bg-white">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-3">
          <h1 className="font-light tracking-tight text-neutral-800" style={{ fontSize: '3.9rem' }}>
            Up<span className="font-bold">hold</span>
          </h1>
          <p className="text-sm font-light text-neutral-600 tracking-wide">
            Keep your word.
          </p>
          <p className="text-base text-gray-700 leading-relaxed max-w-sm mx-auto">
            Put money on the line to achieve your goals. Get 95% back when you succeed, or donate to charity when you don't.
          </p>
        </div>

        <div className="pt-4 space-y-3">
          <Link href="/sign-up" className="block w-full py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Sign Up
          </Link>
          <Link href="/sign-in" className="block w-full py-3 px-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
            Log In
          </Link>
          <Link href="/how-it-works" className="block w-full py-3 px-6 text-gray-600 hover:text-blue-600 transition-colors text-center">
            How it Works
          </Link>
        </div>

        {/* Trust Badge */}
        <div className="pt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Secure payments powered by Stripe</span>
        </div>

        {/* Footer Links */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
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
