"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRadioStore } from "@/stores/radioStore";
import { getAudioData } from "@/hooks/useAudioData";
import { getGenreColor } from "@/lib/constants";

// ── Cumulus cloud ────────────────────────────────────────────────────
interface Cloud {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  opacity: number;
  depth: number; // 0 = far/high, 1 = near/low — affects size, speed, opacity
  blobs: { dx: number; dy: number; r: number; bright: number }[];
  phase: number;
}

function createClouds(count: number, w: number, h: number): Cloud[] {
  const clouds: Cloud[] = [];
  for (let i = 0; i < count; i++) {
    const depth = Math.random();
    const depthScale = 0.5 + depth * 0.7;
    const blobCount = 5 + Math.floor(Math.random() * 6);
    const cloudW = (100 + Math.random() * 200) * depthScale;
    const cloudH = (30 + Math.random() * 45) * depthScale;
    const blobs: Cloud["blobs"] = [];

    for (let j = 0; j < blobCount; j++) {
      const dy = (Math.random() - 0.5) * cloudH * 0.7;
      blobs.push({
        dx: (Math.random() - 0.5) * cloudW * 0.85,
        dy,
        r: (18 + Math.random() * 40) * depthScale,
        // Bottom blobs are slightly darker (shadow), top blobs brighter (lit)
        bright: dy > 0 ? 0.85 + Math.random() * 0.1 : 0.95 + Math.random() * 0.05,
      });
    }
    // Sort blobs bottom-up so bright tops paint over darker bottoms
    blobs.sort((a, b) => b.dy - a.dy);

    const yBand = depth < 0.3 ? 0.08 : depth < 0.7 ? 0.2 : 0.4;
    clouds.push({
      x: Math.random() * (w + 500) - 250,
      y: yBand * h + Math.random() * h * 0.3,
      width: cloudW,
      height: cloudH,
      speed: (0.08 + Math.random() * 0.2) * (0.4 + depth * 0.8),
      opacity: (0.3 + depth * 0.45) + Math.random() * 0.15,
      depth,
      blobs,
      phase: Math.random() * Math.PI * 2,
    });
  }
  // Sort by depth so far clouds render first
  clouds.sort((a, b) => a.depth - b.depth);
  return clouds;
}

// ── Cirrus wisp (high-altitude thin streaks) ────────────────────────
interface CirrusWisp {
  x: number;
  y: number;
  length: number;
  angle: number;
  opacity: number;
  speed: number;
  thickness: number;
  curvature: number;
}

function createCirrus(count: number, w: number, h: number): CirrusWisp[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w * 1.5 - w * 0.25,
    y: Math.random() * h * 0.25,
    length: 120 + Math.random() * 250,
    angle: (Math.random() - 0.5) * 0.25,
    opacity: 0.12 + Math.random() * 0.18,
    speed: 0.05 + Math.random() * 0.12,
    thickness: 1 + Math.random() * 2.5,
    curvature: (Math.random() - 0.5) * 0.003,
  }));
}

// ── Light mote (pollen / dust) ──────────────────────────────────────
interface LightMote {
  x: number;
  y: number;
  size: number;
  alpha: number;
  driftX: number;
  driftY: number;
  phase: number;
}

function createMotes(count: number, w: number, h: number): LightMote[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    size: Math.random() * 2 + 0.5,
    alpha: Math.random() * 0.25 + 0.08,
    driftX: (Math.random() - 0.5) * 0.15,
    driftY: (Math.random() - 0.5) * 0.08,
    phase: Math.random() * Math.PI * 2,
  }));
}

// ── Sun ray ─────────────────────────────────────────────────────────
interface SunRay {
  angle: number;
  length: number;
  width: number;
  phase: number;
  speed: number;
}

function createSunRays(count: number): SunRay[] {
  return Array.from({ length: count }, (_, i) => ({
    angle: (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.3,
    length: 0.25 + Math.random() * 0.4,
    width: 0.015 + Math.random() * 0.04,
    phase: Math.random() * Math.PI * 2,
    speed: 0.2 + Math.random() * 0.4,
  }));
}

// ── Component ───────────────────────────────────────────────────────
export function SkyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const cloudsRef = useRef<Cloud[]>([]);
  const cirrusRef = useRef<CirrusWisp[]>([]);
  const motesRef = useRef<LightMote[]>([]);
  const raysRef = useRef<SunRay[]>(createSunRays(14));
  const isPlaying = useRadioStore((s) => s.isPlaying);
  const currentStation = useRadioStore((s) => s.currentStation);

  const initEntities = useCallback((w: number, h: number) => {
    cloudsRef.current = createClouds(18, w, h);
    cirrusRef.current = createCirrus(8, w, h);
    motesRef.current = createMotes(50, w, h);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      initEntities(rect.width, rect.height);
    };

    resize();
    window.addEventListener("resize", resize);

    let time = 0;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      const audio = getAudioData();
      time += 0.016;

      // ── Multi-stop sky gradient ──
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, "#6CB4DE");
      skyGrad.addColorStop(0.15, "#89C9EA");
      skyGrad.addColorStop(0.35, "#A8D8F0");
      skyGrad.addColorStop(0.55, "#C4E5F5");
      skyGrad.addColorStop(0.75, "#DCF0F9");
      skyGrad.addColorStop(0.9, "#ECF6FB");
      skyGrad.addColorStop(1, "#F4FAFE");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Warm ambient light from sun side (right) ──
      const ambR = Math.max(w, h) * 0.8;
      const ambGrad = ctx.createRadialGradient(w * 0.9, h * 0.1, 0, w * 0.9, h * 0.1, ambR);
      ambGrad.addColorStop(0, "rgba(255, 245, 220, 0.12)");
      ambGrad.addColorStop(0.4, "rgba(255, 240, 210, 0.06)");
      ambGrad.addColorStop(1, "rgba(255, 240, 210, 0)");
      ctx.fillStyle = ambGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Cool tint on shadow side (left) ──
      const coolR = Math.max(w, h) * 0.7;
      const coolGrad = ctx.createRadialGradient(0, h * 0.6, 0, 0, h * 0.6, coolR);
      coolGrad.addColorStop(0, "rgba(140, 170, 210, 0.06)");
      coolGrad.addColorStop(0.5, "rgba(140, 170, 210, 0.03)");
      coolGrad.addColorStop(1, "rgba(140, 170, 210, 0)");
      ctx.fillStyle = coolGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Genre color tint ──
      const genreColor = currentStation
        ? getGenreColor(currentStation.tags)
        : "#6b7280";
      ctx.fillStyle = genreColor;
      ctx.globalAlpha = 0.025 + audio.energy * 0.02;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;

      // ── Sun ──
      const sunX = w * 0.83;
      const sunY = h * 0.1;
      const sunPulse = 1 + audio.energy * 0.12;

      // Atmospheric scatter halo
      const scatterR = 280 * sunPulse;
      const scatterGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, scatterR);
      scatterGrad.addColorStop(0, "rgba(255, 250, 230, 0.35)");
      scatterGrad.addColorStop(0.2, "rgba(255, 245, 215, 0.2)");
      scatterGrad.addColorStop(0.5, "rgba(255, 240, 200, 0.07)");
      scatterGrad.addColorStop(1, "rgba(255, 240, 200, 0)");
      ctx.fillStyle = scatterGrad;
      ctx.fillRect(sunX - scatterR, sunY - scatterR, scatterR * 2, scatterR * 2);

      // Inner core
      const coreR = 50 * sunPulse;
      const coreGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, coreR);
      coreGrad.addColorStop(0, "rgba(255, 255, 245, 0.95)");
      coreGrad.addColorStop(0.15, "rgba(255, 252, 230, 0.7)");
      coreGrad.addColorStop(0.4, "rgba(255, 248, 215, 0.25)");
      coreGrad.addColorStop(1, "rgba(255, 248, 215, 0)");
      ctx.fillStyle = coreGrad;
      ctx.fillRect(sunX - coreR, sunY - coreR, coreR * 2, coreR * 2);

      // ── Sun rays (god rays) ──
      const rays = raysRef.current;
      for (const ray of rays) {
        const wave = 0.5 + 0.5 * Math.sin(time * ray.speed + ray.phase);
        const rayAlpha = (0.025 + audio.energy * 0.035) * wave;
        if (rayAlpha < 0.004) continue;

        const rayLen = Math.min(w, h) * ray.length * sunPulse;
        const endX = sunX + Math.cos(ray.angle) * rayLen;
        const endY = sunY + Math.sin(ray.angle) * rayLen;

        const rayGrad = ctx.createLinearGradient(sunX, sunY, endX, endY);
        rayGrad.addColorStop(0, `rgba(255, 250, 225, ${rayAlpha * 1.6})`);
        rayGrad.addColorStop(0.4, `rgba(255, 248, 210, ${rayAlpha * 0.8})`);
        rayGrad.addColorStop(1, "rgba(255, 248, 210, 0)");

        const perpX = -Math.sin(ray.angle) * ray.width * rayLen;
        const perpY = Math.cos(ray.angle) * ray.width * rayLen;
        ctx.beginPath();
        ctx.moveTo(sunX + perpX, sunY + perpY);
        ctx.lineTo(endX, endY);
        ctx.lineTo(sunX - perpX, sunY - perpY);
        ctx.closePath();
        ctx.fillStyle = rayGrad;
        ctx.fill();
      }

      // ── Cirrus wisps (high, thin streaks) ──
      const cirrus = cirrusRef.current;
      for (const c of cirrus) {
        c.x += c.speed;
        if (c.x > w + c.length) c.x = -c.length * 1.5;

        const alpha = c.opacity * (0.6 + audio.energy * 0.2);
        if (alpha < 0.03) continue;

        ctx.beginPath();
        ctx.moveTo(c.x, c.y);

        const segments = 20;
        for (let i = 1; i <= segments; i++) {
          const t = i / segments;
          const px = c.x + c.length * t * Math.cos(c.angle);
          const waveSin = Math.sin(t * Math.PI * 3 + time * 0.3) * 8;
          const curve = c.curvature * c.length * t * t * 200;
          const py = c.y + c.length * t * Math.sin(c.angle) + waveSin + curve;
          ctx.lineTo(px, py);
        }

        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = c.thickness;
        ctx.lineCap = "round";
        ctx.stroke();

        // Soft glow around wisp
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
        ctx.lineWidth = c.thickness * 4;
        ctx.stroke();
      }

      // ── Cumulus clouds (sorted by depth) ──
      const clouds = cloudsRef.current;
      for (const cloud of clouds) {
        cloud.x += cloud.speed;
        if (cloud.x > w + cloud.width * 1.5) cloud.x = -cloud.width * 2;

        const breathe = 1 + Math.sin(time * 0.35 + cloud.phase) * 0.025 + audio.bass * 0.04;
        const cloudAlpha = cloud.opacity * (0.55 + audio.energy * 0.15);

        for (const blob of cloud.blobs) {
          const bx = cloud.x + blob.dx * breathe;
          const by = cloud.y + blob.dy * breathe;
          const br = blob.r * breathe;

          const luminance = blob.bright;
          const r = Math.round(245 * luminance + 10);
          const g = Math.round(248 * luminance + 7);
          const b = Math.round(255 * luminance);

          const grad = ctx.createRadialGradient(bx, by - br * 0.15, 0, bx, by, br);
          grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${cloudAlpha * 0.9})`);
          grad.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, ${cloudAlpha * 0.65})`);
          grad.addColorStop(0.65, `rgba(${r - 5}, ${g - 3}, ${b}, ${cloudAlpha * 0.3})`);
          grad.addColorStop(1, `rgba(${r - 10}, ${g - 5}, ${b}, 0)`);

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(bx, by, br, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ── Floating motes ──
      const motes = motesRef.current;
      for (const mote of motes) {
        mote.x += mote.driftX;
        mote.y += mote.driftY;

        if (mote.x < -5) mote.x = w + 5;
        if (mote.x > w + 5) mote.x = -5;
        if (mote.y < -5) mote.y = h + 5;
        if (mote.y > h + 5) mote.y = -5;

        const twinkle = 0.5 + 0.5 * Math.sin(time * 1.5 + mote.phase);
        const alpha = mote.alpha * twinkle * (0.4 + audio.treble * 0.4);
        if (alpha < 0.02) continue;

        ctx.beginPath();
        ctx.arc(mote.x, mote.y, mote.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 240, ${alpha})`;
        ctx.fill();
      }

      // ── Horizon atmospheric haze ──
      const hazeH = h * 0.25;
      const hazeY = h - hazeH;
      const horizonGrad = ctx.createLinearGradient(0, hazeY, 0, h);
      const hazeAlpha = 0.12 + audio.energy * 0.04;
      horizonGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
      horizonGrad.addColorStop(0.4, `rgba(255, 252, 245, ${hazeAlpha * 0.4})`);
      horizonGrad.addColorStop(0.8, `rgba(255, 250, 240, ${hazeAlpha * 0.7})`);
      horizonGrad.addColorStop(1, `rgba(255, 248, 235, ${hazeAlpha})`);
      ctx.fillStyle = horizonGrad;
      ctx.fillRect(0, hazeY, w, hazeH);

      // ── Subtle vignette ──
      const vigR = Math.max(w, h) * 0.78;
      const vigGrad = ctx.createRadialGradient(
        w / 2, h / 2, Math.min(w, h) * 0.3,
        w / 2, h / 2, vigR
      );
      vigGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
      vigGrad.addColorStop(0.75, "rgba(0, 0, 0, 0)");
      vigGrad.addColorStop(1, `rgba(10, 30, 60, ${0.035 + audio.energy * 0.015})`);
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, w, h);

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [initEntities, currentStation]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{
        zIndex: 0,
        opacity: isPlaying ? 1 : 0.5,
        transition: "opacity 1s ease",
      }}
    />
  );
}
