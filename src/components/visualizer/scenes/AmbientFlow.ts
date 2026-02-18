import type { AudioData } from "@/lib/types";
import type { CanvasScene } from "./types";

interface Ribbon {
  phase: number;
  speed: number;
  amplitude: number;
  yBase: number;
  hueOffset: number;
  thickness: number;
  depth: number; // 0=back, 1=front — affects opacity
}

const RIBBON_COUNT = 12;

function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  outerR: number,
  innerR: number,
  points: number,
  rotation: number
) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i / (points * 2)) * Math.PI * 2 + rotation;
    const rad = i % 2 === 0 ? outerR : innerR;
    const px = x + Math.cos(angle) * rad;
    const py = y + Math.sin(angle) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

export function createAmbientFlow(): CanvasScene {
  let ribbons: Ribbon[] = [];

  return {
    type: "canvas2d",

    init(_canvas, _ctx) {
      ribbons = [];
      for (let i = 0; i < RIBBON_COUNT; i++) {
        const depth = i / (RIBBON_COUNT - 1);
        ribbons.push({
          phase: Math.random() * Math.PI * 2,
          speed: 0.15 + Math.random() * 0.35,
          amplitude: 25 + Math.random() * 65,
          yBase: 0.12 + (i / RIBBON_COUNT) * 0.76,
          hueOffset: i * 25,
          thickness: 15 + Math.random() * 45,
          depth,
        });
      }
    },

    draw(ctx, w, h, audio, time, color) {
      const r = parseInt(color.slice(1, 3), 16) || 59;
      const g = parseInt(color.slice(3, 5), 16) || 130;
      const b = parseInt(color.slice(5, 7), 16) || 246;

      // Vignette darkening at edges
      const vigSize = Math.max(w, h) * 0.7;
      const vigGrad = ctx.createRadialGradient(w / 2, h / 2, vigSize * 0.4, w / 2, h / 2, vigSize);
      vigGrad.addColorStop(0, `rgba(0, 0, 0, 0)`);
      vigGrad.addColorStop(1, `rgba(0, 0, 0, 0.25)`);
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, w, h);

      // Background bass pulse
      const pulseRadius = Math.max(w, h) * (0.25 + audio.bass * 0.35);
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, pulseRadius);
      bgGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.04 + audio.bass * 0.08})`);
      bgGrad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${0.02 + audio.energy * 0.03})`);
      bgGrad.addColorStop(1, `rgba(0, 0, 0, 0)`);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      for (let ri = 0; ri < ribbons.length; ri++) {
        const ribbon = ribbons[ri];
        const centerY = ribbon.yBase * h;
        const segments = 100;
        const bandIndex = ri % 8;
        const bandValue = audio.raw[bandIndex * 4] || 0;
        const depthAlpha = 0.4 + ribbon.depth * 0.6;

        const dynamicAmplitude =
          ribbon.amplitude * (0.4 + bandValue * 2.2 + audio.energy * 0.6);
        const dynamicThickness =
          ribbon.thickness * (0.5 + audio.mid * 1.0 + bandValue * 0.3);

        // Aurora hue cycling over time
        const hueShift = ribbon.hueOffset + time * 8 + audio.mid * 40;
        const rr = Math.round((r + hueShift * 0.5) % 256);
        const rg = Math.round((g + hueShift * 0.3) % 256);
        const rb = Math.round((b + hueShift * 0.15) % 256);

        const topPoints: [number, number][] = [];
        const bottomPoints: [number, number][] = [];
        const centerPoints: [number, number][] = [];

        for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          const x = t * w;

          // Multi-octave sine composition for Perlin-like motion
          const wave1 =
            Math.sin(t * Math.PI * 3 + time * ribbon.speed + ribbon.phase) *
            dynamicAmplitude;
          const wave2 =
            Math.sin(
              t * Math.PI * 5 + time * ribbon.speed * 0.7 + ribbon.phase * 1.3
            ) *
            dynamicAmplitude *
            0.3;
          const wave3 =
            Math.cos(t * Math.PI * 2 + time * 0.2) * audio.high * 20;
          const wave4 =
            Math.sin(t * Math.PI * 7 + time * 0.4 + ribbon.phase * 0.7) *
            dynamicAmplitude *
            0.12;
          const wave5 =
            Math.cos(t * Math.PI * 11 + time * 0.15 + ri * 0.5) *
            dynamicAmplitude *
            0.06;

          const y = centerY + wave1 + wave2 + wave3 + wave4 + wave5;
          topPoints.push([x, y - dynamicThickness / 2]);
          bottomPoints.push([x, y + dynamicThickness / 2]);
          centerPoints.push([x, y]);
        }

        // Glow trail: draw ribbon 3 times at decreasing opacity for trail effect
        for (let trail = 2; trail >= 0; trail--) {
          const trailAlpha = (1 - trail * 0.35) * depthAlpha;
          const trailOffset = trail * 3;

          ctx.beginPath();
          ctx.moveTo(topPoints[0][0], topPoints[0][1] + trailOffset);
          for (let i = 1; i < topPoints.length; i++) {
            const prev = topPoints[i - 1];
            const curr = topPoints[i];
            const cpx = (prev[0] + curr[0]) / 2;
            ctx.quadraticCurveTo(
              prev[0],
              prev[1] + trailOffset,
              cpx,
              (prev[1] + curr[1]) / 2 + trailOffset
            );
          }
          for (let i = bottomPoints.length - 1; i >= 0; i--) {
            const prev =
              i < bottomPoints.length - 1
                ? bottomPoints[i + 1]
                : topPoints[topPoints.length - 1];
            const curr = bottomPoints[i];
            const cpx = (prev[0] + curr[0]) / 2;
            ctx.quadraticCurveTo(
              prev[0],
              prev[1] + trailOffset,
              cpx,
              (prev[1] + curr[1]) / 2 + trailOffset
            );
          }
          ctx.closePath();

          const grad = ctx.createLinearGradient(
            0,
            centerY - dynamicThickness,
            0,
            centerY + dynamicThickness
          );
          const baseAlpha = trail === 0 ? 0.06 : 0.02;
          const reactAlpha = trail === 0 ? 0.14 : 0.04;
          grad.addColorStop(0, `rgba(${rr}, ${rg}, ${rb}, 0)`);
          grad.addColorStop(
            0.3,
            `rgba(${rr}, ${rg}, ${rb}, ${(baseAlpha + bandValue * reactAlpha) * trailAlpha})`
          );
          grad.addColorStop(
            0.5,
            `rgba(${rr}, ${rg}, ${rb}, ${(baseAlpha * 1.5 + bandValue * reactAlpha * 1.5) * trailAlpha})`
          );
          grad.addColorStop(
            0.7,
            `rgba(${rr}, ${rg}, ${rb}, ${(baseAlpha + bandValue * reactAlpha) * trailAlpha})`
          );
          grad.addColorStop(1, `rgba(${rr}, ${rg}, ${rb}, 0)`);

          ctx.fillStyle = grad;
          ctx.fill();
        }

        // Center line (brighter)
        ctx.beginPath();
        for (let i = 0; i < centerPoints.length; i++) {
          const [x, y] = centerPoints[i];
          if (i === 0) ctx.moveTo(x, y);
          else {
            const [px, py] = centerPoints[i - 1];
            ctx.quadraticCurveTo(px, py, (px + x) / 2, (py + y) / 2);
          }
        }
        ctx.strokeStyle = `rgba(${rr}, ${rg}, ${rb}, ${(0.1 + bandValue * 0.35) * depthAlpha})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // Star-shaped sparkles reacting to treble
      const sparkleCount = Math.floor(audio.treble * 25 + audio.energy * 10);
      for (let i = 0; i < sparkleCount; i++) {
        const px = (Math.sin(time * 0.4 + i * 7.3) * 0.5 + 0.5) * w;
        const py = (Math.cos(time * 0.25 + i * 5.1) * 0.5 + 0.5) * h;
        const size = 1.5 + Math.random() * 3;
        const sparkleAlpha = 0.15 + audio.treble * 0.35 + Math.random() * 0.15;
        const rot = time * 0.5 + i * 1.1;

        // Hue-shifted sparkle colors
        const sHue = (i * 37 + time * 15) % 360;
        const sr = Math.round((r + sHue * 0.3) % 256);
        const sg = Math.round((g + sHue * 0.2) % 256);
        const sb = Math.round((b + sHue * 0.1) % 256);

        drawStar(ctx, px, py, size, size * 0.35, 4, rot);
        ctx.fillStyle = `rgba(${sr}, ${sg}, ${sb}, ${sparkleAlpha})`;
        ctx.fill();

        // Tiny glow
        ctx.shadowColor = `rgba(${sr}, ${sg}, ${sb}, ${sparkleAlpha * 0.5})`;
        ctx.shadowBlur = 3;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    },
  };
}
