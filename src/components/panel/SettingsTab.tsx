"use client";

import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useHistory } from "@/hooks/useHistory";
import { useRadioStore } from "@/stores/radioStore";
import { Button } from "@/components/ui/button";
import { Trash2, Radio, Check, Cloud, Sun, Moon, Monitor, Download, Smartphone, ExternalLink, Share, Plus, Globe } from "lucide-react";
import { SCENE_META, SCENE_ORDER } from "@/lib/scene-presets";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

const APK_DOWNLOAD_URL = "/downloads/dlm-radio.apk";
import type { SceneId } from "@/components/visualizer/scenes/types";

export function SettingsTab() {
  const { status } = useSession();
  const isAuth = status === "authenticated";
  const { clearHistory, isCloudSynced } = useHistory();
  const { theme, setTheme } = useTheme();
  const autoVisualizer = useRadioStore((s) => s.autoVisualizer);
  const idleTimeout = useRadioStore((s) => s.idleTimeout);
  const setAutoVisualizer = useRadioStore((s) => s.setAutoVisualizer);
  const setIdleTimeout = useRadioStore((s) => s.setIdleTimeout);
  const visualizerScene = useRadioStore((s) => s.visualizerScene);
  const setVisualizerScene = useRadioStore((s) => s.setVisualizerScene);

  const { platform, canInstall, isInstalled, promptInstall } = useInstallPrompt();

  const sceneOptions: { id: SceneId | "auto"; name: string }[] = [
    { id: "auto", name: "Auto (match genre)" },
    ...SCENE_ORDER.map((id) => ({ id, name: SCENE_META[id].name })),
  ];

  const themeOptions: { id: string; name: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "light", name: "Light", icon: Sun },
    { id: "dark", name: "Dark", icon: Moon },
    { id: "system", name: "System", icon: Monitor },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-5">
        {/* Sync indicator */}
        {isAuth && (
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Cloud className="h-3 w-3" />
            <span>Settings synced to your account</span>
          </div>
        )}

        {/* Appearance */}
        <div>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Appearance
          </h2>
          <div className="grid grid-cols-3 gap-1.5">
            {themeOptions.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  className={`text-xs px-2.5 py-2 rounded-md border transition-colors flex items-center justify-center gap-1.5 ${
                    theme === opt.id
                      ? "bg-primary/10 border-primary/40 text-primary"
                      : "border-border hover:bg-muted/50 text-muted-foreground"
                  }`}
                  onClick={() => setTheme(opt.id)}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{opt.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Get the App */}
        <div>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Get the App
          </h2>
          <div className="rounded-xl border border-border/60 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 p-3.5 space-y-3">
            {isInstalled && (
              <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 font-medium">
                <Check className="h-3.5 w-3.5" />
                <span>DLM World Radio is installed on this device</span>
              </div>
            )}

            {/* PWA Install */}
            {!isInstalled && (
              <div className="space-y-2">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Progressive Web App
                </p>
                {canInstall ? (
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full justify-start text-xs gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0"
                    onClick={promptInstall}
                  >
                    {platform === "desktop" ? (
                      <Monitor className="h-3.5 w-3.5" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    {platform === "desktop" ? "Install Desktop App" : "Install as App"}
                  </Button>
                ) : platform === "ios" ? (
                  <div className="space-y-1.5 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Share className="h-3 w-3 flex-shrink-0 text-violet-500" />
                      <span>Tap <strong>Share</strong> in Safari</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Plus className="h-3 w-3 flex-shrink-0 text-violet-500" />
                      <span>Then <strong>Add to Home Screen</strong></span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    Use Chrome or Edge to install as a desktop or mobile app.
                  </p>
                )}
              </div>
            )}

            {/* Android APK */}
            <div className="space-y-2">
              {!isInstalled && (
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Android
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                asChild
              >
                <a href={APK_DOWNLOAD_URL} download>
                  <Smartphone className="h-3.5 w-3.5 mr-2" />
                  Download Android APK
                </a>
              </Button>
            </div>
          </div>
        </div>

        <Separator />

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
          {isCloudSynced && (
            <p className="text-[10px] text-muted-foreground mt-1.5 ml-0.5">
              This will clear history from your account
            </p>
          )}
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
              <span className="font-medium">DLM World Radio</span>
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
