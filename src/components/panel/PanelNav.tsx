"use client";

import { useRadioStore } from "@/stores/radioStore";
import type { PanelTab } from "@/lib/types";
import { Compass, Heart, LayoutGrid, Search, Settings } from "lucide-react";

const tabs: { id: PanelTab; label: string; icon: React.ReactNode }[] = [
  { id: "explore", label: "Explore", icon: <Compass className="h-4 w-4" /> },
  { id: "favorites", label: "Favorites", icon: <Heart className="h-4 w-4" /> },
  { id: "browse", label: "Browse", icon: <LayoutGrid className="h-4 w-4" /> },
  { id: "search", label: "Search", icon: <Search className="h-4 w-4" /> },
  { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
];

export function PanelNav() {
  const { panelTab, setPanelTab } = useRadioStore();

  return (
    <div className="flex items-center border-t border-border/30 bg-background/80">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setPanelTab(tab.id)}
          className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] transition-colors ${
            panelTab === tab.id
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
