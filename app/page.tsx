import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 bg-[#f8f7f4]">
      <div className="max-w-md w-full text-center space-y-8">
        {/* User Button - Top Right */}
        <div className="absolute top-5 right-5">
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>

        {/* Logo */}
        <div className="space-y-1">
          <h1 className="text-6xl font-light tracking-tight text-neutral-800">
            Uphold
          </h1>
          <p className="text-sm font-light text-neutral-600 tracking-wide">
            Get it done. For real.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="pt-4 space-y-3">
          <SignedIn>
            <Link href="/create">
              <Button className="w-full">Create Commitment</Button>
            </Link>
          </SignedIn>

          <SignedOut>
            <Link href="/sign-in">
              <Button className="w-full">Get Started</Button>
            </Link>
          </SignedOut>
        </div>
      </div>
    </main>
  );
}
