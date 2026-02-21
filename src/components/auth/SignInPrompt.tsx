"use client";

import { signIn } from "next-auth/react";
import { X, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useSignInPulse } from "@/hooks/useSignInPulse";

export function SignInPrompt() {
  const showSignIn = useSignInPulse();

  return (
    <AnimatePresence>
      {showSignIn && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="fixed bottom-20 right-4 z-50 w-[300px] overflow-hidden rounded-xl border border-border/50 bg-background/95 shadow-2xl backdrop-blur-xl"
        >
          <div className="relative p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <Radio className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">Join DLM World Radio</p>
                <p className="text-xs text-muted-foreground">
                  Free, takes 5 seconds
                </p>
              </div>
            </div>

            <p className="mb-3 text-xs text-muted-foreground">
              Sign in to save your favorite stations and sync across all your
              devices.
            </p>

            <Button
              size="sm"
              className="w-full gap-2 text-xs"
              onClick={() => signIn("google")}
            >
              <GoogleSmallIcon className="h-3.5 w-3.5" />
              Sign in with Google
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function GoogleSmallIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
