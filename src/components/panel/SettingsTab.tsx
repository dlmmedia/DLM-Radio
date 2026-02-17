"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { useHistory } from "@/hooks/useHistory";
import { Button } from "@/components/ui/button";
import { Trash2, ExternalLink, Radio } from "lucide-react";

export function SettingsTab() {
  const [visualizerIntensity, setVisualizerIntensity] = useState(70);
  const { clearHistory } = useHistory();

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-5">
        {/* Visualizer */}
        <div>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Visualizer
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Intensity
              </label>
              <Slider
                value={[visualizerIntensity]}
                onValueChange={([v]) => setVisualizerIntensity(v)}
                max={100}
                step={1}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>Subtle</span>
                <span>Intense</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Data */}
        <div>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Data
          </h2>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-xs"
            onClick={clearHistory}
          >
            <Trash2 className="h-3.5 w-3.5 mr-2" />
            Clear listening history
          </Button>
        </div>

        <Separator />

        {/* About */}
        <div>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            About
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-primary" />
              <span className="font-medium">DLM Radio</span>
            </div>
            <p className="text-xs text-muted-foreground">
              An audio-reactive radio globe powered by Radio Browser API with
              50,000+ stations worldwide.
            </p>
            <a
              href="https://www.radio-browser.info/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Radio Browser API
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <Separator />
        <div>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Keyboard Shortcuts
          </h2>
          <div className="space-y-1.5 text-xs">
            <ShortcutRow keys="Space" action="Play / Pause" />
            <ShortcutRow keys="←/→" action="Prev / Next station" />
            <ShortcutRow keys="↑/↓" action="Volume" />
            <ShortcutRow keys="M" action="Mute" />
            <ShortcutRow keys="F" action="Fullscreen" />
            <ShortcutRow keys="R" action="Random station" />
            <ShortcutRow keys="Esc" action="Close panel" />
            <ShortcutRow keys="1-4" action="Switch tab" />
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

function ShortcutRow({ keys, action }: { keys: string; action: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{action}</span>
      <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">
        {keys}
      </kbd>
    </div>
  );
}
