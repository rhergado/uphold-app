import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-[#f8f7f4] flex items-center justify-center px-5">
      <SignIn />
    </main>
  );
}
