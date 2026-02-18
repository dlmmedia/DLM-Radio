"use client";

import { useEffect, useRef, useCallback } from "react";
import { getAudioData } from "@/hooks/useAudioData";
import { getGenreColor } from "@/lib/constants";
import { useRadioStore } from "@/stores/radioStore";
import { getSceneForTags } from "@/lib/scene-presets";
import type { VisualizerScene, SceneId, CanvasScene, ThreeScene } from "./scenes/types";
import { createSpectrumBars } from "./scenes/SpectrumBars";
import { createCircularSpectrum } from "./scenes/CircularSpectrum";
import { createWaveform } from "./scenes/Waveform";
import { createParticleField } from "./scenes/ParticleField";
import { createAmbientFlow } from "./scenes/AmbientFlow";
import { createGlowOrbs } from "./scenes/GlowOrbs";

const SCENE_FACTORIES: Record<SceneId, () => VisualizerScene> = {
  spectrumBars: createSpectrumBars,
  circularSpectrum: createCircularSpectrum,
  waveform: createWaveform,
  particleField: createParticleField,
  ambientFlow: createAmbientFlow,
  glowOrbs: createGlowOrbs,
};

export function SceneRenderer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threeContainerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const sceneRef = useRef<VisualizerScene | null>(null);
  const activeSceneIdRef = useRef<SceneId | null>(null);
  const timeRef = useRef(0);

  const visualizerScene = useRadioStore((s) => s.visualizerScene);
  const currentStation = useRadioStore((s) => s.currentStation);

  const resolveSceneId = useCallback((): SceneId => {
    if (visualizerScene === "auto") {
      return getSceneForTags(currentStation?.tags ?? "");
    }
    return visualizerScene as SceneId;
  }, [visualizerScene, currentStation]);

  const disposeScene = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    if (sceneRef.current?.dispose) {
      sceneRef.current.dispose();
    }
    sceneRef.current = null;
    activeSceneIdRef.current = null;

    if (threeContainerRef.current) {
      while (threeContainerRef.current.firstChild) {
        threeContainerRef.current.removeChild(threeContainerRef.current.firstChild);
      }
    }
  }, []);

  useEffect(() => {
    const sceneId = resolveSceneId();
    if (sceneId === activeSceneIdRef.current) return;

    disposeScene();

    const factory = SCENE_FACTORIES[sceneId];
    if (!factory) return;

    const newScene = factory();
    sceneRef.current = newScene;
    activeSceneIdRef.current = sceneId;
    timeRef.current = 0;

    if (newScene.type === "canvas2d") {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) return;

      const resize = () => {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };

      resize();
      (newScene as CanvasScene).init(canvas, ctx);

      const draw = () => {
        if (sceneRef.current !== newScene) return;
        const rect = canvas.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        ctx.clearRect(0, 0, w, h);
        const audio = getAudioData();
        timeRef.current += 0.016;
        const genreColor = getGenreColor(
          useRadioStore.getState().currentStation?.tags ?? ""
        );
        (newScene as CanvasScene).draw(ctx, w, h, audio, timeRef.current, genreColor);
        animRef.current = requestAnimationFrame(draw);
      };

      animRef.current = requestAnimationFrame(draw);

      const onResize = () => {
        resize();
      };
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
        disposeScene();
      };
    } else {
      // Three.js scene
      const container = threeContainerRef.current;
      if (!container) return;

      (newScene as ThreeScene).init(container);

      const draw = () => {
        if (sceneRef.current !== newScene) return;
        const audio = getAudioData();
        timeRef.current += 0.016;
        const genreColor = getGenreColor(
          useRadioStore.getState().currentStation?.tags ?? ""
        );
        (newScene as ThreeScene).update(audio, timeRef.current, genreColor);
        animRef.current = requestAnimationFrame(draw);
      };

      animRef.current = requestAnimationFrame(draw);

      const onResize = () => {
        const rect = container.getBoundingClientRect();
        (newScene as ThreeScene).resize(rect.width, rect.height);
      };
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
        disposeScene();
      };
    }
  }, [resolveSceneId, disposeScene]);

  const sceneId = resolveSceneId();
  const isThreeScene = sceneId === "particleField" || sceneId === "glowOrbs";

  return (
    <div className="absolute inset-0">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: isThreeScene ? "none" : "block" }}
      />
      <div
        ref={threeContainerRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: isThreeScene ? "block" : "none" }}
      />
    </div>
  );
}
