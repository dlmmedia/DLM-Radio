export type VisualMood = "cosmic" | "neonCity" | "northernLights" | "minimal";

export interface MoodConfig {
  name: string;
  starCount: number;
  nebulaCount: number;
  /** HSL hue values for the palette */
  palette: [number, number, number];
  /** Star brightness multiplier */
  starBrightness: number;
  /** Nebula opacity multiplier */
  nebulaOpacity: number;
  /** Aurora intensity (0 = off) */
  auroraIntensity: number;
  /** Whether to show shooting stars */
  shootingStars: boolean;
  /** Whether to show grid lines (neon city) */
  gridLines: boolean;
  /** Whether to show scan lines */
  scanLines: boolean;
  /** Edge streak intensity */
  edgeStreakIntensity: number;
  /** Vignette base opacity */
  vignetteOpacity: number;
}

export const MOOD_CONFIGS: Record<VisualMood, MoodConfig> = {
  cosmic: {
    name: "Cosmic",
    starCount: 300,
    nebulaCount: 4,
    palette: [260, 200, 320],
    starBrightness: 1.0,
    nebulaOpacity: 1.0,
    auroraIntensity: 0.6,
    shootingStars: true,
    gridLines: false,
    scanLines: false,
    edgeStreakIntensity: 0.5,
    vignetteOpacity: 0.1,
  },
  neonCity: {
    name: "Neon City",
    starCount: 120,
    nebulaCount: 2,
    palette: [180, 300, 30],
    starBrightness: 0.7,
    nebulaOpacity: 0.6,
    auroraIntensity: 0.0,
    shootingStars: false,
    gridLines: true,
    scanLines: true,
    edgeStreakIntensity: 0.8,
    vignetteOpacity: 0.15,
  },
  northernLights: {
    name: "Northern Lights",
    starCount: 200,
    nebulaCount: 3,
    palette: [140, 180, 270],
    starBrightness: 0.8,
    nebulaOpacity: 0.8,
    auroraIntensity: 1.0,
    shootingStars: true,
    gridLines: false,
    scanLines: false,
    edgeStreakIntensity: 0.3,
    vignetteOpacity: 0.08,
  },
  minimal: {
    name: "Minimal",
    starCount: 80,
    nebulaCount: 1,
    palette: [220, 220, 220],
    starBrightness: 0.5,
    nebulaOpacity: 0.3,
    auroraIntensity: 0.0,
    shootingStars: false,
    gridLines: false,
    scanLines: false,
    edgeStreakIntensity: 0.2,
    vignetteOpacity: 0.12,
  },
};

export const MOOD_ORDER: VisualMood[] = [
  "cosmic",
  "neonCity",
  "northernLights",
  "minimal",
];
