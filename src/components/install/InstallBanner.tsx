"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import {
  X,
  Download,
  Radio,
  Share,
  Plus,
  Smartphone,
  Monitor,
  ChevronRight,
} from "lucide-react";

const APK_DOWNLOAD_URL = "/downloads/dlm-radio.apk";

const SHOW_DELAY_MS = 8_000;

export function InstallBanner() {
  const { platform, canInstall, isInstalled, shouldShowBanner, promptInstall, dismiss } =
    useInstallPrompt();
  const [ready, setReady] = useState(false);
  const [showIosSteps, setShowIosSteps] = useState(false);

  useEffect(() => {
    if (!shouldShowBanner) return;
    const timer = setTimeout(() => setReady(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [shouldShowBanner]);

  const visible = shouldShowBanner && ready;

  if (isInstalled) return null;

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-[3px]"
            onClick={dismiss}
          />

          {/* Banner */}
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[400px] z-[71] overflow-hidden rounded-2xl border border-border/50 bg-background/95 shadow-2xl backdrop-blur-xl"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          >
            {/* Close */}
            <button
              onClick={dismiss}
              className="absolute top-3 right-3 z-10 rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Gradient accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />

            <div className="p-5">
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20 flex-shrink-0">
                  <Radio className="h-6 w-6 text-violet-500" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold tracking-tight">
                    Get the DLM Radio App
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {platform === "ios"
                      ? "Add to your home screen for the best experience"
                      : "Install for offline access, background audio & lock screen controls"}
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                <FeaturePill icon="offline" label="Works Offline" />
                <FeaturePill icon="audio" label="Background Play" />
                <FeaturePill icon="fast" label="Instant Launch" />
              </div>

              {/* Platform-specific actions */}
              {platform === "android" && (
                <AndroidActions
                  canInstall={canInstall}
                  onInstallPWA={promptInstall}
                />
              )}

              {platform === "ios" && (
                <IosActions
                  showSteps={showIosSteps}
                  onToggleSteps={() => setShowIosSteps((v) => !v)}
                />
              )}

              {platform === "desktop" && (
                <DesktopActions
                  canInstall={canInstall}
                  onInstallPWA={promptInstall}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function FeaturePill({ icon, label }: { icon: "offline" | "audio" | "fast"; label: string }) {
  const iconMap = {
    offline: <Download className="h-3 w-3" />,
    audio: <Radio className="h-3 w-3" />,
    fast: <Smartphone className="h-3 w-3" />,
  };
  return (
    <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-2 py-1.5 text-[10px] font-medium text-muted-foreground">
      <span className="text-violet-500">{iconMap[icon]}</span>
      <span className="truncate">{label}</span>
    </div>
  );
}

function AndroidActions({
  canInstall,
  onInstallPWA,
}: {
  canInstall: boolean;
  onInstallPWA: () => Promise<boolean>;
}) {
  return (
    <div className="space-y-2">
      {/* Primary: PWA Install (if available) or APK Download */}
      {canInstall ? (
        <Button
          className="w-full gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 shadow-lg shadow-violet-500/20"
          onClick={onInstallPWA}
        >
          <Download className="h-4 w-4" />
          Install App
        </Button>
      ) : (
        <Button
          className="w-full gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 shadow-lg shadow-violet-500/20"
          asChild
        >
          <a href={APK_DOWNLOAD_URL} download>
            <Download className="h-4 w-4" />
            Download Android App
          </a>
        </Button>
      )}

      {/* Secondary: the other option */}
      {canInstall ? (
        <Button variant="outline" size="sm" className="w-full gap-2 text-xs" asChild>
          <a href={APK_DOWNLOAD_URL} download>
            <Download className="h-3.5 w-3.5" />
            Or download APK directly
          </a>
        </Button>
      ) : (
        <p className="text-center text-[10px] text-muted-foreground">
          Download and install the APK to get the full app experience
        </p>
      )}
    </div>
  );
}

function IosActions({
  showSteps,
  onToggleSteps,
}: {
  showSteps: boolean;
  onToggleSteps: () => void;
}) {
  return (
    <div className="space-y-3">
      <Button
        className="w-full gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 shadow-lg shadow-violet-500/20"
        onClick={onToggleSteps}
      >
        <Plus className="h-4 w-4" />
        Add to Home Screen
      </Button>

      <AnimatePresence>
        {showSteps && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-2.5 pt-1">
              <IosStep
                step={1}
                icon={<Share className="h-4 w-4" />}
                text={<>Tap the <strong>Share</strong> button in Safari</>}
              />
              <IosStep
                step={2}
                icon={<Plus className="h-4 w-4" />}
                text={<>Scroll down and tap <strong>Add to Home Screen</strong></>}
              />
              <IosStep
                step={3}
                icon={<ChevronRight className="h-4 w-4" />}
                text={<>Tap <strong>Add</strong> to confirm</>}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function IosStep({
  step,
  icon,
  text,
}: {
  step: number;
  icon: React.ReactNode;
  text: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-2.5">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/15 text-violet-500 flex-shrink-0 text-xs font-bold">
        {step}
      </div>
      <span className="text-violet-500 flex-shrink-0">{icon}</span>
      <span className="text-xs text-foreground">{text}</span>
    </div>
  );
}

function DesktopActions({
  canInstall,
  onInstallPWA,
}: {
  canInstall: boolean;
  onInstallPWA: () => Promise<boolean>;
}) {
  return (
    <div className="space-y-2">
      {canInstall ? (
        <Button
          className="w-full gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 shadow-lg shadow-violet-500/20"
          onClick={onInstallPWA}
        >
          <Monitor className="h-4 w-4" />
          Install Desktop App
        </Button>
      ) : (
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>Use Chrome, Edge, or another Chromium browser to install as a desktop app.</p>
        </div>
      )}

      {/* Android APK download for people browsing on desktop */}
      <Button variant="outline" size="sm" className="w-full gap-2 text-xs" asChild>
        <a href={APK_DOWNLOAD_URL} download>
          <Download className="h-3.5 w-3.5" />
          Download Android APK
        </a>
      </Button>
    </div>
  );
}
