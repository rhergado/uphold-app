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
        <div className="space-y-1">
          <h1 className="font-light tracking-tight text-neutral-800" style={{ fontSize: '3.9rem' }}>
            Up<span className="font-bold">hold</span>
          </h1>
          <p className="text-sm font-light text-neutral-600 tracking-wide">
            Keep your word.
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
      </div>
    </main>
  );
}
