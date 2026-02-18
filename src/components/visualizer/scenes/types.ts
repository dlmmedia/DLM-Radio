import type { AudioData } from "@/lib/types";

export type SceneId =
  | "spectrumBars"
  | "circularSpectrum"
  | "waveform"
  | "particleField"
  | "ambientFlow"
  | "glowOrbs";

export interface CanvasScene {
  type: "canvas2d";
  init(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void;
  draw(ctx: CanvasRenderingContext2D, w: number, h: number, audio: AudioData, time: number, color: string): void;
  dispose?(): void;
}

export interface ThreeScene {
  type: "three";
  init(container: HTMLDivElement): void;
  update(audio: AudioData, time: number, color: string): void;
  resize(w: number, h: number): void;
  dispose(): void;
}

export type VisualizerScene = CanvasScene | ThreeScene;

export interface SceneMeta {
  id: SceneId;
  name: string;
  icon: string;
  description: string;
}
