import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-[#f8f7f4] flex items-center justify-center px-5">
      <SignUp />
    </main>
  );
}
