"use client";

import { useRadioStore } from "@/stores/radioStore";
import { PanelNav } from "./PanelNav";
import { ExploreTab } from "./ExploreTab";
import { FavoritesTab } from "./FavoritesTab";
import { BrowseTab } from "./BrowseTab";
import { SearchTab } from "./SearchTab";
import { SettingsTab } from "./SettingsTab";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <motion.div
          initial={{ x: -360, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -360, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed left-0 top-0 bottom-16 w-[340px] z-40 flex flex-col bg-background/95 backdrop-blur-xl border-r border-border/40"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
            <h1 className="text-lg font-semibold tracking-tight">DLM Radio</h1>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={togglePanel}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full">
              <ActiveTab />
            </div>
          </div>

          {/* Bottom Nav */}
          <PanelNav />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
