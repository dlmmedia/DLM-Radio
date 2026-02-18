import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

export function hexToRGB(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255 || 0.4;
  const g = parseInt(hex.slice(3, 5), 16) / 255 || 0.5;
  const b = parseInt(hex.slice(5, 7), 16) / 255 || 1.0;
  return { r, g, b };
}

export function hexToRGB255(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) || 100;
  const g = parseInt(hex.slice(3, 5), 16) || 130;
  const b = parseInt(hex.slice(5, 7), 16) || 255;
  return { r, g, b };
}

export function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const rv = parseInt(hex.slice(1, 3), 16) / 255 || 0;
  const gv = parseInt(hex.slice(3, 5), 16) / 255 || 0;
  const bv = parseInt(hex.slice(5, 7), 16) / 255 || 0;
  const max = Math.max(rv, gv, bv);
  const min = Math.min(rv, gv, bv);
  const l = (max + min) / 2;
  let h = 0,
    s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rv) h = ((gv - bv) / d + (gv < bv ? 6 : 0)) / 6;
    else if (max === gv) h = ((bv - rv) / d + 2) / 6;
    else h = ((rv - gv) / d + 4) / 6;
  }
  return { h, s, l };
}

export function createStarTexture(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const cx = size / 2;
  const cy = size / 2;

  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
  glow.addColorStop(0, "rgba(255,255,255,1)");
  glow.addColorStop(0.08, "rgba(255,255,255,0.9)");
  glow.addColorStop(0.2, "rgba(255,255,255,0.4)");
  glow.addColorStop(0.5, "rgba(255,255,255,0.08)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  ctx.globalCompositeOperation = "lighter";
  for (let angle = 0; angle < 4; angle++) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((angle * Math.PI) / 2 + Math.PI / 4 * (angle % 2 === 1 ? 0.3 : 0));
    const spike = ctx.createLinearGradient(0, 0, size / 2, 0);
    spike.addColorStop(0, "rgba(255,255,255,0.9)");
    spike.addColorStop(0.3, "rgba(255,255,255,0.3)");
    spike.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = spike;
    ctx.fillRect(0, -0.8, size / 2, 1.6);
    ctx.restore();
  }

  // Diagonal spikes (dimmer, for 8-point star feel)
  for (let angle = 0; angle < 4; angle++) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((angle * Math.PI) / 2 + Math.PI / 4);
    const spike = ctx.createLinearGradient(0, 0, size * 0.35, 0);
    spike.addColorStop(0, "rgba(255,255,255,0.4)");
    spike.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = spike;
    ctx.fillRect(0, -0.5, size * 0.35, 1);
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function createBloomComposer(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  options?: { strength?: number; radius?: number; threshold?: number }
): EffectComposer {
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(renderer.domElement.width, renderer.domElement.height),
    options?.strength ?? 0.8,
    options?.radius ?? 0.6,
    options?.threshold ?? 0.1
  );
  composer.addPass(bloomPass);

  return composer;
}

export function getBloomPass(composer: EffectComposer): UnrealBloomPass | null {
  for (const pass of composer.passes) {
    if (pass instanceof UnrealBloomPass) return pass;
  }
  return null;
}
