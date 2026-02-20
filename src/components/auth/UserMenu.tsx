"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { LogIn, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSignInPulse } from "@/hooks/useSignInPulse";
import { AnimatePresence, motion } from "framer-motion";

export function UserMenu() {
  const { data: session, status } = useSession();
  const showSignIn = useSignInPulse();

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <AnimatePresence>
        {showSignIn && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 whitespace-nowrap rounded-full px-3 text-xs"
              onClick={() => signIn("google")}
            >
              <LogIn className="h-3 w-3" />
              Sign in
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full ring-1 ring-border/50 transition-all hover:ring-primary/50"
            onClick={() => signOut()}
          >
            {session.user.image ? (
              <img
                src={session.user.image}
                alt={session.user.name ?? "User"}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary/10">
                <User className="h-3.5 w-3.5 text-primary" />
              </div>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="flex flex-col gap-0.5">
          <span className="font-medium">{session.user.name}</span>
          <span className="text-xs text-muted-foreground">
            Click to sign out
          </span>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
