"use client";

import { useRadioStore } from "@/stores/radioStore";
import { PanelNav } from "./PanelNav";
import { ExploreTab } from "./ExploreTab";
import { FavoritesTab } from "./FavoritesTab";
import { BrowseTab } from "./BrowseTab";
import { SearchTab } from "./SearchTab";
import { SettingsTab } from "./SettingsTab";
import { motion, AnimatePresence } from "framer-motion";
import { X, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/auth/UserMenu";
import { SignInBanner } from "@/components/auth/SignInBanner";

const tabComponent: Record<string, React.FC> = {
  explore: ExploreTab,
  favorites: FavoritesTab,
  browse: BrowseTab,
  search: SearchTab,
  settings: SettingsTab,
};

export function SidePanel() {
  const { panelTab, panelOpen, togglePanel } = useRadioStore();

  const ActiveTab = tabComponent[panelTab] ?? ExploreTab;

  return (
    <AnimatePresence>
      {panelOpen && (
        <>
          {/* Backdrop overlay for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-35 bg-black/50 backdrop-blur-[2px] sm:hidden"
            onClick={togglePanel}
          />

          <motion.div
            data-sidebar-panel
            initial={{ x: -360, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -360, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-16 w-full sm:w-[340px] z-40 flex flex-col bg-background/95 backdrop-blur-xl border-r border-border/40"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/30"
              style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top, 0.75rem))" }}
            >
              <motion.div
                className="flex items-center gap-2 cursor-default select-none"
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Radio className="h-5 w-5 text-primary" />
                </motion.div>
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary via-foreground to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">
                  DLM World Radio
                </h1>
              </motion.div>
              <div className="flex items-center gap-1">
                <UserMenu />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={togglePanel}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Sign-in banner (only visible when not authenticated) */}
            <SignInBanner />

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full">
                <ActiveTab />
              </div>
            </div>

            {/* Bottom Nav */}
            <PanelNav />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
