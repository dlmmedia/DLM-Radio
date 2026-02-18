import type { SceneId, SceneMeta } from "@/components/visualizer/scenes/types";

export const SCENE_META: Record<SceneId, SceneMeta> = {
  spectrumBars: {
    id: "spectrumBars",
    name: "Spectrum",
    icon: "BarChart3",
    description: "Classic frequency bars with reflections",
  },
  circularSpectrum: {
    id: "circularSpectrum",
    name: "Radial",
    icon: "CircleDot",
    description: "Radial frequency spectrum",
  },
  waveform: {
    id: "waveform",
    name: "Waveform",
    icon: "AudioLines",
    description: "Oscilloscope waveform display",
  },
  particleField: {
    id: "particleField",
    name: "Particles",
    icon: "Sparkles",
    description: "3D particle field",
  },
  ambientFlow: {
    id: "ambientFlow",
    name: "Flow",
    icon: "Waves",
    description: "Flowing ambient ribbons",
  },
  glowOrbs: {
    id: "glowOrbs",
    name: "Orbs",
    icon: "Globe",
    description: "Audio-reactive 3D orbs",
  },
};

export const SCENE_ORDER: SceneId[] = [
  "spectrumBars",
  "circularSpectrum",
  "waveform",
  "particleField",
  "ambientFlow",
  "glowOrbs",
];

const GENRE_SCENE_MAP: Record<string, SceneId> = {
  news: "waveform",
  talk: "waveform",
  information: "waveform",
  sports: "waveform",
  electronic: "circularSpectrum",
  dance: "circularSpectrum",
  house: "circularSpectrum",
  trance: "circularSpectrum",
  techno: "circularSpectrum",
  edm: "circularSpectrum",
  classical: "ambientFlow",
  jazz: "ambientFlow",
  blues: "ambientFlow",
  ambient: "ambientFlow",
  rock: "spectrumBars",
  "classic rock": "spectrumBars",
  metal: "spectrumBars",
  alternative: "spectrumBars",
  pop: "particleField",
  hits: "particleField",
  "top 40": "particleField",
  latin: "particleField",
  country: "glowOrbs",
  folk: "glowOrbs",
  world: "glowOrbs",
  reggae: "glowOrbs",
  christian: "glowOrbs",
};

export function getSceneForTags(tags: string): SceneId {
  const tagList = tags.toLowerCase().split(",").map((t) => t.trim());
  for (const tag of tagList) {
    if (GENRE_SCENE_MAP[tag]) return GENRE_SCENE_MAP[tag];
  }
  return "spectrumBars";
}
