import type { AudioData } from "@/lib/types";
import type { CanvasScene } from "./types";

export function createSpectrumBars(): CanvasScene {
  const smoothedBands = new Float32Array(48);
  const peakValues = new Float32Array(48);
  const peakDecay = new Float32Array(48);
  const peakHoldTime = new Float32Array(48);

  return {
    type: "canvas2d",

    init() {
      smoothedBands.fill(0);
      peakValues.fill(0);
      peakDecay.fill(0);
      peakHoldTime.fill(0);
    },

    draw(ctx, w, h, audio, time, color) {
      const barCount = 48;
      const gap = 2;
      const totalGapWidth = (barCount - 1) * gap;
      const maxBarWidth = (w * 0.75 - totalGapWidth) / barCount;
      const barWidth = Math.max(3, maxBarWidth);
      const totalWidth = barCount * barWidth + totalGapWidth;
      const startX = (w - totalWidth) / 2;
      const centerY = h * 0.5;
      const maxBarHeight = h * 0.35;

      const r = parseInt(color.slice(1, 3), 16) || 100;
      const g = parseInt(color.slice(3, 5), 16) || 130;
      const b = parseInt(color.slice(5, 7), 16) || 255;

      // Interpolate 32 raw bands into 48
      for (let i = 0; i < barCount; i++) {
        const rawIdx = (i / barCount) * 31;
        const lo = Math.floor(rawIdx);
        const hi = Math.min(lo + 1, 31);
        const frac = rawIdx - lo;
        const target =
          (audio.raw[lo] ?? 0) * (1 - frac) + (audio.raw[hi] ?? 0) * frac;
        smoothedBands[i] += (target - smoothedBands[i]) * 0.35;

        // Peak tracking with hold and decay
        if (smoothedBands[i] > peakValues[i]) {
          peakValues[i] = smoothedBands[i];
          peakHoldTime[i] = 30;
          peakDecay[i] = 0;
        } else {
          if (peakHoldTime[i] > 0) {
            peakHoldTime[i]--;
          } else {
            peakDecay[i] += 0.0008;
            peakValues[i] -= peakDecay[i];
            if (peakValues[i] < 0) peakValues[i] = 0;
          }
        }
      }

      // Background breathing pulse
      const pulseSize = Math.max(w, h) * (0.3 + audio.energy * 0.7);
      const bgGrad = ctx.createRadialGradient(
        w / 2, centerY, 0,
        w / 2, centerY, pulseSize
      );
      bgGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.04 + audio.energy * 0.1})`);
      bgGrad.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${0.02 + audio.energy * 0.04})`);
      bgGrad.addColorStop(1, `rgba(0, 0, 0, 0)`);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Waveform trace behind bars
      const waveform = audio.raw;
      const wfSamples = Math.min(waveform.length, 256);
      const wfStep = Math.max(1, Math.floor(waveform.length / wfSamples));
      ctx.beginPath();
      for (let i = 0; i < wfSamples; i++) {
        const x = startX + (i / wfSamples) * totalWidth;
        const sample = waveform[i * wfStep] || 0;
        const y = centerY + sample * maxBarHeight * 0.6;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.08 + audio.energy * 0.15})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Center axis line
      ctx.beginPath();
      ctx.moveTo(startX - 20, centerY);
      ctx.lineTo(startX + totalWidth + 20, centerY);
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.08)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw mirrored bars
      for (let i = 0; i < barCount; i++) {
        const value = smoothedBands[i];
        const barHeight = value * maxBarHeight * 1.3 + 2;
        const x = startX + i * (barWidth + gap);

        // Frequency-based color: low = warm, high = cool
        const t = i / barCount;
        const barR = Math.round(r * (1 - t * 0.3) + 255 * t * 0.2);
        const barG = Math.round(g * (0.6 + t * 0.4));
        const barB = Math.round(b * (0.5 + t * 0.5) + 100 * t);

        const clampR = Math.min(255, barR);
        const clampG = Math.min(255, barG);
        const clampB = Math.min(255, barB);

        // Upper bar (grows upward from center)
        const topGrad = ctx.createLinearGradient(x, centerY, x, centerY - barHeight);
        topGrad.addColorStop(0, `rgba(${clampR}, ${clampG}, ${clampB}, 0.5)`);
        topGrad.addColorStop(0.4, `rgba(${clampR}, ${clampG}, ${clampB}, 0.85)`);
        topGrad.addColorStop(1, `rgba(${clampR}, ${clampG}, ${clampB}, 0.95)`);

        const radius = Math.min(barWidth / 2, 3);

        ctx.fillStyle = topGrad;
        ctx.beginPath();
        ctx.roundRect(x, centerY - barHeight, barWidth, barHeight, [
          radius,
          radius,
          0,
          0,
        ]);
        ctx.fill();

        // Glow on upper bar
        ctx.shadowColor = `rgba(${clampR}, ${clampG}, ${clampB}, ${0.4 + value * 0.5})`;
        ctx.shadowBlur = 10 + value * 20;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Lower bar (grows downward from center, slightly shorter)
        const lowerHeight = barHeight * 0.7;
        const bottomGrad = ctx.createLinearGradient(x, centerY, x, centerY + lowerHeight);
        bottomGrad.addColorStop(0, `rgba(${clampR}, ${clampG}, ${clampB}, 0.4)`);
        bottomGrad.addColorStop(0.5, `rgba(${clampR}, ${clampG}, ${clampB}, 0.5)`);
        bottomGrad.addColorStop(1, `rgba(${clampR}, ${clampG}, ${clampB}, 0.15)`);

        ctx.fillStyle = bottomGrad;
        ctx.beginPath();
        ctx.roundRect(x, centerY, barWidth, lowerHeight, [0, 0, radius, radius]);
        ctx.fill();

        // Inner highlight line on upper bar
        if (barHeight > 8) {
          ctx.beginPath();
          ctx.moveTo(x + barWidth * 0.3, centerY);
          ctx.lineTo(x + barWidth * 0.3, centerY - barHeight + radius);
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.06 + value * 0.12})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }

        // Peak indicator (floating line that decays)
        const peak = peakValues[i];
        if (peak > 0.05) {
          const peakY = centerY - peak * maxBarHeight - 4;
          ctx.beginPath();
          ctx.moveTo(x, peakY);
          ctx.lineTo(x + barWidth, peakY);
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 + peak * 0.5})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.shadowColor = `rgba(${clampR}, ${clampG}, ${clampB}, ${peak * 0.6})`;
          ctx.shadowBlur = 6;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }

      // Subtle side vignette
      const vigLeft = ctx.createLinearGradient(0, 0, w * 0.15, 0);
      vigLeft.addColorStop(0, `rgba(0, 0, 0, 0.3)`);
      vigLeft.addColorStop(1, `rgba(0, 0, 0, 0)`);
      ctx.fillStyle = vigLeft;
      ctx.fillRect(0, 0, w * 0.15, h);

      const vigRight = ctx.createLinearGradient(w, 0, w * 0.85, 0);
      vigRight.addColorStop(0, `rgba(0, 0, 0, 0.3)`);
      vigRight.addColorStop(1, `rgba(0, 0, 0, 0)`);
      ctx.fillStyle = vigRight;
      ctx.fillRect(w * 0.85, 0, w * 0.15, h);
    },
  };
}
