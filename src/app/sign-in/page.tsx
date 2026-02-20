import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/auth/SignInForm";

export const metadata = {
  title: "Sign In — DLM Radio",
  description: "Sign in to DLM Radio to save your favorites and sync across devices.",
};

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
      {/* Animated gradient background */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-black to-blue-950" />
        <div className="absolute top-1/4 -left-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[120px] animate-pulse" />
        <div className="absolute -right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-blue-600/20 blur-[120px] animate-pulse [animation-delay:1s]" />
      </div>

      <SignInForm />
    </div>
  );
}
