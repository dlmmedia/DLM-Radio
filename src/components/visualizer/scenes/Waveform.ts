import type { AudioData } from "@/lib/types";
import type { CanvasScene } from "./types";

export function createWaveform(): CanvasScene {
  return {
    type: "canvas2d",

    init() {},

    draw(ctx, w, h, audio, time, color) {
      const r = parseInt(color.slice(1, 3), 16) || 234;
      const g = parseInt(color.slice(3, 5), 16) || 179;
      const b = parseInt(color.slice(5, 7), 16) || 8;

      const cy = h * 0.5;
      const amplitude = h * 0.25;
      const waveform = audio.raw;
      const sampleCount = Math.min(waveform.length, 512);
      const step = Math.max(1, Math.floor(waveform.length / sampleCount));

      // Audio-reactive background gradient
      const bgGrad = ctx.createRadialGradient(
        w / 2, cy, 0,
        w / 2, cy, Math.max(w, h) * 0.5
      );
      bgGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.02 + audio.energy * 0.04})`);
      bgGrad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${0.01 + audio.energy * 0.015})`);
      bgGrad.addColorStop(1, `rgba(0, 0, 0, 0)`);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Background horizontal lines (subtle grid)
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.03)`;
      ctx.lineWidth = 0.5;
      const gridSpacing = h / 10;
      for (let y = gridSpacing; y < h; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Center line
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(w, cy);
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.08)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Glow path first (behind main waveform)
      ctx.beginPath();
      for (let i = 0; i < sampleCount; i++) {
        const x = (i / sampleCount) * w;
        const sample = waveform[i * step] || 0;
        const y = cy + sample * amplitude;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.12)`;
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      // Second glow layer
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.18)`;
      ctx.lineWidth = 4;
      ctx.stroke();

      // Main waveform
      ctx.beginPath();
      for (let i = 0; i < sampleCount; i++) {
        const x = (i / sampleCount) * w;
        const sample = waveform[i * step] || 0;
        const y = cy + sample * amplitude;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.85)`;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      // Mirrored waveform (inverted, faded)
      ctx.beginPath();
      for (let i = 0; i < sampleCount; i++) {
        const x = (i / sampleCount) * w;
        const sample = waveform[i * step] || 0;
        const y = cy - sample * amplitude * 0.35;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.1)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Energy meter
      const meterTotalW = w * 0.6;
      const meterStartX = (w - meterTotalW) / 2;
      const meterY = h * 0.82;
      const meterH = 2;
      const energyWidth = audio.energy * meterTotalW;
      const eGrad = ctx.createLinearGradient(
        meterStartX, meterY,
        meterStartX + energyWidth, meterY
      );
      eGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.08)`);
      eGrad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.35)`);
      eGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.08)`);
      ctx.fillStyle = eGrad;
      ctx.fillRect(meterStartX, meterY, energyWidth, meterH);

      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.04)`;
      ctx.lineWidth = 0.5;
      ctx.strokeRect(meterStartX, meterY, meterTotalW, meterH);

      // Scanning line with energy-reactive speed
      const scanSpeed = 20 + audio.energy * 60;
      const scanX = meterStartX + ((time * scanSpeed) % meterTotalW);
      const scanGrad = ctx.createLinearGradient(scanX - 2, 0, scanX + 2, 0);
      scanGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
      scanGrad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${0.04 + audio.energy * 0.06})`);
      scanGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      ctx.fillStyle = scanGrad;
      ctx.fillRect(scanX - 8, cy - amplitude * 1.1, 16, amplitude * 2.2);
    },
  };
}
