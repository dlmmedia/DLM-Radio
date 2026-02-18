"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRadioStore } from "@/stores/radioStore";
import { getAudioData } from "@/hooks/useAudioData";
import { getGenreColor } from "@/lib/constants";
import { MOOD_CONFIGS, type VisualMood } from "@/lib/visual-moods";

// ── Star ────────────────────────────────────────────────────────────
interface Star {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  twinklePhase: number;
  twinkleSpeed: number;
  colorR: number;
  colorG: number;
  colorB: number;
  driftX: number;
  driftY: number;
}

function createStars(count: number, w: number, h: number): Star[] {
  const stars: Star[] = [];
  const tints = [
    [255, 252, 240], // warm white
    [200, 220, 255], // cool blue
    [255, 240, 200], // pale gold
    [220, 200, 255], // lavender
    [200, 255, 240], // mint
  ];
  for (let i = 0; i < count; i++) {
    const tint = tints[Math.floor(Math.random() * tints.length)];
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 2.5 + 0.5,
      baseAlpha: Math.random() * 0.6 + 0.2,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 1.5 + 0.5,
      colorR: tint[0],
      colorG: tint[1],
      colorB: tint[2],
      driftX: (Math.random() - 0.5) * 0.02,
      driftY: (Math.random() - 0.5) * 0.01,
    });
  }
  return stars;
}

// ── Nebula ──────────────────────────────────────────────────────────
interface Nebula {
  x: number;
  y: number;
  radius: number;
  baseHue: number;
  baseAlpha: number;
  driftSpeed: number;
  phase: number;
}

function createNebulae(count: number, w: number, h: number): Nebula[] {
  const nebulae: Nebula[] = [];
  const positions = [
    [0.1, 0.1],
    [0.9, 0.15],
    [0.85, 0.85],
    [0.1, 0.9],
    [0.5, 0.05],
  ];
  for (let i = 0; i < count; i++) {
    const pos = positions[i % positions.length];
    nebulae.push({
      x: pos[0] * w,
      y: pos[1] * h,
      radius: Math.random() * 200 + 150,
      baseHue: Math.random() * 360,
      baseAlpha: 0.04 + Math.random() * 0.04,
      driftSpeed: (Math.random() - 0.5) * 0.3,
      phase: Math.random() * Math.PI * 2,
    });
  }
  return nebulae;
}

// ── Shooting star ───────────────────────────────────────────────────
interface ShootingStar {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  length: number;
  hue: number;
}

function createShootingStarPool(size: number): ShootingStar[] {
  return Array.from({ length: size }, () => ({
    active: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    life: 0,
    maxLife: 0,
    length: 0,
    hue: 0,
  }));
}

function spawnShootingStar(pool: ShootingStar[], w: number, h: number) {
  const star = pool.find((s) => !s.active);
  if (!star) return;

  const side = Math.floor(Math.random() * 4);
  const speed = 4 + Math.random() * 6;
  const angle = Math.random() * Math.PI * 0.5 - Math.PI * 0.25;

  switch (side) {
    case 0: // top
      star.x = Math.random() * w;
      star.y = -10;
      star.vx = Math.sin(angle) * speed;
      star.vy = Math.cos(angle) * speed;
      break;
    case 1: // right
      star.x = w + 10;
      star.y = Math.random() * h;
      star.vx = -Math.cos(angle) * speed;
      star.vy = Math.sin(angle) * speed;
      break;
    case 2: // bottom
      star.x = Math.random() * w;
      star.y = h + 10;
      star.vx = Math.sin(angle) * speed;
      star.vy = -Math.cos(angle) * speed;
      break;
    default: // left
      star.x = -10;
      star.y = Math.random() * h;
      star.vx = Math.cos(angle) * speed;
      star.vy = Math.sin(angle) * speed;
      break;
  }

  star.active = true;
  star.life = 0;
  star.maxLife = 40 + Math.random() * 30;
  star.length = 30 + Math.random() * 50;
  star.hue = 200 + Math.random() * 60;
}

// ── Aurora wisp ─────────────────────────────────────────────────────
interface AuroraWisp {
  edge: 0 | 1;
  cp1x: number;
  cp2x: number;
  phase: number;
  speed: number;
  baseHue: number;
  amplitude: number;
}

function createAuroraWisps(count: number): AuroraWisp[] {
  const wisps: AuroraWisp[] = [];
  for (let i = 0; i < count; i++) {
    wisps.push({
      edge: (i % 2) as 0 | 1,
      cp1x: 0.2 + Math.random() * 0.3,
      cp2x: 0.5 + Math.random() * 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.4,
      baseHue: Math.random() * 360,
      amplitude: 30 + Math.random() * 50,
    });
  }
  return wisps;
}

// ── Edge light streak ───────────────────────────────────────────────
interface EdgeStreak {
  active: boolean;
  edge: number;
  position: number;
  length: number;
  speed: number;
  life: number;
  maxLife: number;
  hue: number;
}

function createStreakPool(size: number): EdgeStreak[] {
  return Array.from({ length: size }, () => ({
    active: false,
    edge: 0,
    position: 0,
    length: 0,
    speed: 0,
    life: 0,
    maxLife: 0,
    hue: 0,
  }));
}

function spawnStreak(pool: EdgeStreak[], hue: number) {
  const streak = pool.find((s) => !s.active);
  if (!streak) return;

  streak.active = true;
  streak.edge = Math.floor(Math.random() * 4);
  streak.position = -0.1;
  streak.length = 0.1 + Math.random() * 0.15;
  streak.speed = 0.015 + Math.random() * 0.02;
  streak.life = 0;
  streak.maxLife = 60 + Math.random() * 40;
  streak.hue = hue + (Math.random() - 0.5) * 30;
}

// ── Grid (Neon City mood) ───────────────────────────────────────────
function drawGrid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  energy: number,
  palette: [number, number, number]
) {
  const spacing = 60;
  const alpha = 0.03 + energy * 0.04;
  const hue = palette[0];

  ctx.strokeStyle = `hsla(${hue}, 70%, 50%, ${alpha})`;
  ctx.lineWidth = 0.5;

  const offsetY = (time * 20) % spacing;
  for (let y = -spacing + offsetY; y < h + spacing; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  const offsetX = (time * 10) % spacing;
  for (let x = -spacing + offsetX; x < w + spacing; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
}

// ── Scan lines (Neon City) ──────────────────────────────────────────
function drawScanLines(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  energy: number
) {
  const lineSpacing = 3;
  const alpha = 0.015 + energy * 0.015;
  ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
  for (let y = 0; y < h; y += lineSpacing * 2) {
    ctx.fillRect(0, y, w, lineSpacing);
  }

  const bandY = ((time * 40) % (h + 100)) - 50;
  const bandGrad = ctx.createLinearGradient(0, bandY - 30, 0, bandY + 30);
  bandGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
  bandGrad.addColorStop(0.5, `rgba(255, 255, 255, ${0.02 + energy * 0.02})`);
  bandGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = bandGrad;
  ctx.fillRect(0, bandY - 30, w, 60);
}

// ── Offscreen nebula canvas cache ───────────────────────────────────
let nebulaCache: {
  canvas: OffscreenCanvas | HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  w: number;
  h: number;
} | null = null;

function getNebulaCanvas(w: number, h: number) {
  if (nebulaCache && nebulaCache.w === w && nebulaCache.h === h) {
    return nebulaCache;
  }
  const canvas =
    typeof OffscreenCanvas !== "undefined"
      ? new OffscreenCanvas(w, h)
      : (() => {
          const c = document.createElement("canvas");
          c.width = w;
          c.height = h;
          return c;
        })();
  const ctx = canvas.getContext("2d")!;
  nebulaCache = { canvas, ctx, w, h };
  return nebulaCache;
}

// ── Component ───────────────────────────────────────────────────────
export function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);
  const nebulaeRef = useRef<Nebula[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>(createShootingStarPool(5));
  const wispsRef = useRef<AuroraWisp[]>(createAuroraWisps(5));
  const streaksRef = useRef<EdgeStreak[]>(createStreakPool(6));
  const lastBassRef = useRef(0);
  const lastHighRef = useRef(0);
  const lastPeriodicSpawnRef = useRef(0);
  const isPlaying = useRadioStore((s) => s.isPlaying);
  const currentStation = useRadioStore((s) => s.currentStation);
  const visualMood = useRadioStore((s) => s.visualMood) as VisualMood;

  const initEntities = useCallback(
    (w: number, h: number) => {
      const mood = MOOD_CONFIGS[visualMood];
      starsRef.current = createStars(mood.starCount, w, h);
      nebulaeRef.current = createNebulae(mood.nebulaCount, w, h);
    },
    [visualMood]
  );

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
      const mood = MOOD_CONFIGS[visualMood];
      time += 0.016;

      // ── Genre color tint (very subtle full-screen wash) ──
      const genreColor = currentStation
        ? getGenreColor(currentStation.tags)
        : "#6b7280";
      ctx.fillStyle = genreColor;
      ctx.globalAlpha = 0.02 + audio.energy * 0.02;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;

      // ── Stars ──
      const stars = starsRef.current;
      for (let si = 0; si < stars.length; si++) {
        const s = stars[si];
        s.x += s.driftX;
        s.y += s.driftY;

        if (s.x < -5) s.x = w + 5;
        if (s.x > w + 5) s.x = -5;
        if (s.y < -5) s.y = h + 5;
        if (s.y > h + 5) s.y = -5;

        // Per-band reactivity: group stars by index
        const bandGroup = si % 3;
        const bandBoost =
          bandGroup === 0
            ? audio.bass * 0.35
            : bandGroup === 1
              ? audio.mid * 0.3
              : audio.treble * 0.4;

        const twinkle =
          0.5 +
          0.5 *
            Math.sin(
              time * s.twinkleSpeed + s.twinklePhase + audio.high * 4 + bandBoost * 2
            );
        const alpha =
          s.baseAlpha *
          twinkle *
          mood.starBrightness *
          (0.5 + audio.energy * 0.5 + bandBoost * 0.3);

        if (alpha < 0.02) continue;

        const size = s.size * (1 + audio.treble * 0.4 + (s.size > 1.5 ? audio.bass * 0.3 : 0));

        ctx.beginPath();
        ctx.arc(s.x, s.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.colorR}, ${s.colorG}, ${s.colorB}, ${Math.min(alpha, 0.9)})`;
        ctx.fill();

        if (size > 1.5 && alpha > 0.35) {
          const glowMult = 3 + audio.mid * 1.5;
          const grad = ctx.createRadialGradient(
            s.x, s.y, 0, s.x, s.y, size * glowMult
          );
          grad.addColorStop(
            0,
            `rgba(${s.colorR}, ${s.colorG}, ${s.colorB}, ${alpha * 0.35})`
          );
          grad.addColorStop(1, `rgba(${s.colorR}, ${s.colorG}, ${s.colorB}, 0)`);
          ctx.fillStyle = grad;
          ctx.fillRect(s.x - size * glowMult, s.y - size * glowMult, size * glowMult * 2, size * glowMult * 2);
        }
      }

      // ── Nebulae (drawn to offscreen canvas, then composited) ──
      if (mood.nebulaCount > 0) {
        const nc = getNebulaCanvas(w, h);
        nc.ctx.clearRect(0, 0, w, h);

        for (const neb of nebulaeRef.current) {
          const hueShift = audio.mid * 40;
          const hue = neb.baseHue + hueShift + time * neb.driftSpeed * 10;
          const breathe = 0.7 + 0.3 * Math.sin(time * 0.5 + neb.phase);
          const alpha =
            neb.baseAlpha * breathe * mood.nebulaOpacity * (0.5 + audio.sub * 0.5);

          if (alpha < 0.005) continue;

          const grad = nc.ctx.createRadialGradient(
            neb.x, neb.y, 0,
            neb.x, neb.y, neb.radius
          );
          grad.addColorStop(0, `hsla(${hue}, 60%, 40%, ${alpha})`);
          grad.addColorStop(0.4, `hsla(${hue + 30}, 50%, 30%, ${alpha * 0.6})`);
          grad.addColorStop(1, "hsla(0, 0%, 0%, 0)");

          nc.ctx.fillStyle = grad;
          nc.ctx.fillRect(
            neb.x - neb.radius,
            neb.y - neb.radius,
            neb.radius * 2,
            neb.radius * 2
          );
        }

        ctx.drawImage(nc.canvas as HTMLCanvasElement, 0, 0);
      }

      // ── Grid lines (Neon City mood) ──
      if (mood.gridLines) {
        drawGrid(ctx, w, h, time, audio.energy, mood.palette);
      }

      // ── Aurora wisps (edge ribbons) ──
      if (mood.auroraIntensity > 0) {
        const wisps = wispsRef.current;
        for (const wisp of wisps) {
          const hue =
            wisp.baseHue +
            mood.palette[wisp.edge] * 0.3 +
            audio.mid * 40 +
            time * 10;

          const edgeY = wisp.edge === 0 ? 0 : h;
          const sign = wisp.edge === 0 ? 1 : -1;
          const waveOffset =
            Math.sin(time * wisp.speed + wisp.phase) *
            wisp.amplitude *
            (0.5 + audio.energy * 0.5);

          const alpha = mood.auroraIntensity * (0.03 + audio.energy * 0.04);
          if (alpha < 0.005) continue;

          ctx.beginPath();
          ctx.moveTo(0, edgeY);

          const segments = 8;
          for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const px = t * w;
            const waveY =
              sign *
              (20 +
                waveOffset *
                  Math.sin(t * Math.PI * 2 + time * wisp.speed + wisp.phase));
            const py = edgeY + waveY;
            if (i === 0) {
              ctx.lineTo(px, py);
            } else {
              const prevT = (i - 1) / segments;
              const cpx = (prevT + t) * 0.5 * w;
              ctx.quadraticCurveTo(cpx, py, px, py);
            }
          }

          ctx.lineTo(w, edgeY);
          ctx.closePath();

          const ribbonGrad = ctx.createLinearGradient(
            0, edgeY, 0, edgeY + sign * wisp.amplitude * 2
          );
          ribbonGrad.addColorStop(0, `hsla(${hue}, 60%, 55%, ${alpha})`);
          ribbonGrad.addColorStop(0.5, `hsla(${hue + 30}, 50%, 45%, ${alpha * 0.5})`);
          ribbonGrad.addColorStop(1, "hsla(0, 0%, 0%, 0)");

          ctx.fillStyle = ribbonGrad;
          ctx.fill();
        }
      }

      // ── Edge light streaks ──
      if (mood.edgeStreakIntensity > 0) {
        const highBump = audio.high - lastHighRef.current;
        lastHighRef.current = audio.high;

        if (highBump > 0.1 && audio.high > 0.3 && Math.random() > 0.5) {
          spawnStreak(streaksRef.current, mood.palette[0]);
        }

        for (const streak of streaksRef.current) {
          if (!streak.active) continue;

          streak.position += streak.speed;
          streak.life++;

          if (streak.life > streak.maxLife || streak.position > 1.2) {
            streak.active = false;
            continue;
          }

          const progress = streak.life / streak.maxLife;
          const fadeIn = Math.min(progress * 4, 1);
          const fadeOut = 1 - Math.max((progress - 0.7) / 0.3, 0);
          const alpha = fadeIn * fadeOut * 0.15 * mood.edgeStreakIntensity;

          let x1: number, y1: number, x2: number, y2: number;
          const pos = streak.position;
          const len = streak.length;
          const margin = 2;

          switch (streak.edge) {
            case 0:
              x1 = pos * w; y1 = margin;
              x2 = (pos + len) * w; y2 = margin;
              break;
            case 1:
              x1 = w - margin; y1 = pos * h;
              x2 = w - margin; y2 = (pos + len) * h;
              break;
            case 2:
              x1 = (1 - pos) * w; y1 = h - margin;
              x2 = (1 - pos - len) * w; y2 = h - margin;
              break;
            default:
              x1 = margin; y1 = (1 - pos) * h;
              x2 = margin; y2 = (1 - pos - len) * h;
              break;
          }

          const grad = ctx.createLinearGradient(x1, y1, x2, y2);
          grad.addColorStop(0, `hsla(${streak.hue}, 70%, 70%, 0)`);
          grad.addColorStop(0.3, `hsla(${streak.hue}, 80%, 80%, ${alpha})`);
          grad.addColorStop(0.7, `hsla(${streak.hue}, 80%, 80%, ${alpha})`);
          grad.addColorStop(1, `hsla(${streak.hue}, 70%, 70%, 0)`);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.5 + audio.energy * 1;
          ctx.stroke();

          ctx.lineWidth = 4 + audio.energy * 2;
          ctx.globalAlpha = alpha * 0.4;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }

      // ── Scan lines (Neon City mood) ──
      if (mood.scanLines) {
        drawScanLines(ctx, w, h, time, audio.energy);
      }

      // ── Shooting stars ──
      if (mood.shootingStars) {
        const bassBump = audio.bass - lastBassRef.current;
        lastBassRef.current = audio.bass;

        if (bassBump > 0.08 && audio.bass > 0.3 && Math.random() > 0.4) {
          spawnShootingStar(shootingStarsRef.current, w, h);
        }

        // Periodic spawn every ~8-12 seconds regardless of audio
        lastPeriodicSpawnRef.current += 0.016;
        if (lastPeriodicSpawnRef.current > 8 + Math.random() * 4) {
          spawnShootingStar(shootingStarsRef.current, w, h);
          lastPeriodicSpawnRef.current = 0;
        }

        for (const ss of shootingStarsRef.current) {
          if (!ss.active) continue;

          ss.x += ss.vx;
          ss.y += ss.vy;
          ss.life++;

          if (ss.life > ss.maxLife) {
            ss.active = false;
            continue;
          }

          const progress = ss.life / ss.maxLife;
          const fadeIn = Math.min(progress * 5, 1);
          const fadeOut = 1 - Math.max((progress - 0.6) / 0.4, 0);
          const alpha = fadeIn * fadeOut * 0.8;

          const tailX = ss.x - (ss.vx / Math.hypot(ss.vx, ss.vy)) * ss.length;
          const tailY = ss.y - (ss.vy / Math.hypot(ss.vx, ss.vy)) * ss.length;

          const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
          grad.addColorStop(0, `hsla(${ss.hue}, 60%, 80%, 0)`);
          grad.addColorStop(0.7, `hsla(${ss.hue}, 70%, 85%, ${alpha * 0.5})`);
          grad.addColorStop(1, `hsla(${ss.hue}, 80%, 95%, ${alpha})`);

          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(ss.x, ss.y);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          const headGrad = ctx.createRadialGradient(
            ss.x, ss.y, 0, ss.x, ss.y, 4
          );
          headGrad.addColorStop(0, `hsla(${ss.hue}, 80%, 95%, ${alpha * 0.8})`);
          headGrad.addColorStop(1, `hsla(${ss.hue}, 80%, 95%, 0)`);
          ctx.fillStyle = headGrad;
          ctx.fillRect(ss.x - 4, ss.y - 4, 8, 8);
        }
      }

      // ── Vignette pulse (drawn last so it frames everything) ──
      const vignetteAlpha =
        mood.vignetteOpacity * (0.7 + audio.energy * 0.3);
      const vigGrad = ctx.createRadialGradient(
        w / 2, h / 2, Math.min(w, h) * 0.25,
        w / 2, h / 2, Math.max(w, h) * 0.75
      );
      vigGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
      vigGrad.addColorStop(0.6, "rgba(0, 0, 0, 0)");
      vigGrad.addColorStop(1, `rgba(0, 0, 0, ${vignetteAlpha})`);
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, w, h);

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [visualMood, initEntities, currentStation]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{
        zIndex: 0,
        opacity: isPlaying ? 1 : 0.3,
        transition: "opacity 1s ease",
      }}
    />
  );
}
