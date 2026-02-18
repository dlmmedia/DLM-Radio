"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useHistory } from "@/hooks/useHistory";
import { useRadioStore } from "@/stores/radioStore";
import { Button } from "@/components/ui/button";
import { Trash2, Radio, Check } from "lucide-react";
import { SCENE_META, SCENE_ORDER } from "@/lib/scene-presets";
import type { SceneId } from "@/components/visualizer/scenes/types";

export function SettingsTab() {
  const { clearHistory } = useHistory();
  const autoVisualizer = useRadioStore((s) => s.autoVisualizer);
  const idleTimeout = useRadioStore((s) => s.idleTimeout);
  const setAutoVisualizer = useRadioStore((s) => s.setAutoVisualizer);
  const setIdleTimeout = useRadioStore((s) => s.setIdleTimeout);
  const visualizerScene = useRadioStore((s) => s.visualizerScene);
  const setVisualizerScene = useRadioStore((s) => s.setVisualizerScene);

  const sceneOptions: { id: SceneId | "auto"; name: string }[] = [
    { id: "auto", name: "Auto (match genre)" },
    ...SCENE_ORDER.map((id) => ({ id, name: SCENE_META[id].name })),
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-5">
        {/* Visualizer */}
        <div>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Visualizer
          </h2>
          <div className="space-y-4">
            {/* Auto-visualizer toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium block">
                  Auto Visualizer
                </label>
                <span className="text-[11px] text-muted-foreground">
                  Show when idle while playing
                </span>
              </div>
              <Switch
                checked={autoVisualizer}
                onCheckedChange={setAutoVisualizer}
              />
            </div>

            {/* Idle timeout */}
            {autoVisualizer && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Idle timeout
                </label>
                <Slider
                  value={[idleTimeout]}
                  onValueChange={([v]) => setIdleTimeout(v)}
                  min={30}
                  max={300}
                  step={15}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>30s</span>
                  <span className="font-medium text-foreground">
                    {idleTimeout >= 60
                      ? `${Math.floor(idleTimeout / 60)}m${idleTimeout % 60 > 0 ? ` ${idleTimeout % 60}s` : ""}`
                      : `${idleTimeout}s`}
                  </span>
                  <span>5m</span>
                </div>
              </div>
            )}

            {/* Default scene */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Default scene
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {sceneOptions.map((opt) => (
                  <button
                    key={opt.id}
                    className={`text-xs px-2.5 py-1.5 rounded-md border transition-colors flex items-center gap-1.5 ${
                      visualizerScene === opt.id
                        ? "bg-primary/10 border-primary/40 text-primary"
                        : "border-border hover:bg-muted/50 text-muted-foreground"
                    }`}
                    onClick={() => setVisualizerScene(opt.id)}
                  >
                    {visualizerScene === opt.id && (
                      <Check className="h-3 w-3 flex-shrink-0" />
                    )}
                    <span className="truncate">{opt.name}</span>
                  </button>
                ))}
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
              An audio-reactive radio experience with an interactive globe
              and 50,000+ stations from around the world.
            </p>
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
            <ShortcutRow keys="V" action="Toggle visualizer" />
            <ShortcutRow keys="B" action="Cycle visual mood" />
            <ShortcutRow keys="Esc" action="Close / Back" />
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
