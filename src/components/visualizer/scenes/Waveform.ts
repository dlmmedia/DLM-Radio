import type { AudioData } from "@/lib/types";
import type { CanvasScene } from "./types";

export function createWaveform(): CanvasScene {
  let smoothedEnergy = 0;

  return {
    type: "canvas2d",

    init() {
      smoothedEnergy = 0;
    },

    draw(ctx, w, h, audio, time, color) {
      const r = parseInt(color.slice(1, 3), 16) || 234;
      const g = parseInt(color.slice(3, 5), 16) || 179;
      const b = parseInt(color.slice(5, 7), 16) || 8;

      smoothedEnergy += (audio.energy - smoothedEnergy) * 0.12;

      const cy = h * 0.5;
      const amplitude = h * 0.3;
      const waveform = audio.waveform;
      const sampleCount = Math.min(waveform.length, 512);
      const step = Math.max(1, Math.floor(waveform.length / sampleCount));

      // Audio-reactive background gradient
      const bgGrad = ctx.createRadialGradient(
        w / 2, cy, 0,
        w / 2, cy, Math.max(w, h) * 0.6
      );
      bgGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.03 + smoothedEnergy * 0.06})`);
      bgGrad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${0.01 + smoothedEnergy * 0.02})`);
      bgGrad.addColorStop(1, `rgba(0, 0, 0, 0)`);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Subtle grid lines
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.025)`;
      ctx.lineWidth = 0.5;
      const gridSpacing = h / 12;
      for (let y = gridSpacing; y < h; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      const vGridSpacing = w / 16;
      for (let x = 0; x <= w; x += vGridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, cy - amplitude * 1.2);
        ctx.lineTo(x, cy + amplitude * 1.2);
        ctx.stroke();
      }

      // Center line
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(w, cy);
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.06)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Build waveform points spanning the full width
      const points: [number, number][] = [];
      for (let i = 0; i < sampleCount; i++) {
        const x = (i / (sampleCount - 1)) * w;
        const sample = waveform[i * step] || 0;
        const y = cy + sample * amplitude;
        points.push([x, y]);
      }

      function drawSmoothCurve(pts: [number, number][]) {
        if (pts.length < 2) return;
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length - 1; i++) {
          const cpx = (pts[i][0] + pts[i + 1][0]) / 2;
          const cpy = (pts[i][1] + pts[i + 1][1]) / 2;
          ctx.quadraticCurveTo(pts[i][0], pts[i][1], cpx, cpy);
        }
        const last = pts[pts.length - 1];
        ctx.lineTo(last[0], last[1]);
      }

      // Outer glow
      ctx.beginPath();
      drawSmoothCurve(points);
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.06 + smoothedEnergy * 0.1})`;
      ctx.lineWidth = 12;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      // Inner glow
      ctx.beginPath();
      drawSmoothCurve(points);
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.12 + smoothedEnergy * 0.15})`;
      ctx.lineWidth = 5;
      ctx.stroke();

      // Fill gradient under waveform
      ctx.beginPath();
      drawSmoothCurve(points);
      ctx.lineTo(w, cy);
      ctx.lineTo(0, cy);
      ctx.closePath();
      const fillGrad = ctx.createLinearGradient(0, cy - amplitude, 0, cy);
      fillGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.08 + smoothedEnergy * 0.12})`);
      fillGrad.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${0.03 + smoothedEnergy * 0.05})`);
      fillGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      ctx.fillStyle = fillGrad;
      ctx.fill();

      // Main waveform line
      ctx.beginPath();
      drawSmoothCurve(points);
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.7 + smoothedEnergy * 0.3})`;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      // Bright core line
      ctx.beginPath();
      drawSmoothCurve(points);
      ctx.strokeStyle = `rgba(${Math.min(255, r + 80)}, ${Math.min(255, g + 80)}, ${Math.min(255, b + 80)}, ${0.3 + smoothedEnergy * 0.4})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Mirrored reflection below center
      const reflectionPoints: [number, number][] = points.map(([x, y]) => {
        const offset = y - cy;
        return [x, cy - offset * 0.3];
      });
      ctx.beginPath();
      drawSmoothCurve(reflectionPoints);
      ctx.lineTo(w, cy);
      ctx.lineTo(0, cy);
      ctx.closePath();
      const reflFillGrad = ctx.createLinearGradient(0, cy, 0, cy + amplitude * 0.35);
      reflFillGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.04)`);
      reflFillGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      ctx.fillStyle = reflFillGrad;
      ctx.fill();

      ctx.beginPath();
      drawSmoothCurve(reflectionPoints);
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.08)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Scanning line
      const scanSpeed = 30;
      const scanX = (time * scanSpeed) % w;
      const scanGrad = ctx.createLinearGradient(scanX - 1, 0, scanX + 1, 0);
      scanGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
      scanGrad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${0.03 + smoothedEnergy * 0.05})`);
      scanGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      ctx.fillStyle = scanGrad;
      ctx.fillRect(scanX - 10, cy - amplitude * 1.2, 20, amplitude * 2.4);
    },
  };
}
