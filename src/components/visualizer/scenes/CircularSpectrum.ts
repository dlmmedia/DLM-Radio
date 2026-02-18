import type { AudioData } from "@/lib/types";
import type { CanvasScene } from "./types";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  r: number;
  g: number;
  b: number;
}

const MAX_PARTICLES = 80;

export function createCircularSpectrum(): CanvasScene {
  const smoothedInner = new Float32Array(64);
  const smoothedOuter = new Float32Array(64);
  let particles: Particle[] = [];

  return {
    type: "canvas2d",

    init() {
      smoothedInner.fill(0);
      smoothedOuter.fill(0);
      particles = [];
    },

    draw(ctx, w, h, audio, time, color) {
      const cx = w / 2;
      const cy = h / 2;
      const scale = Math.min(w, h);
      const innerRadius = scale * 0.1;
      const midRadius = scale * 0.2;
      const outerRadius = scale * 0.28;
      const maxInnerBar = scale * 0.12;
      const maxOuterBar = scale * 0.18;
      const barCount = 64;

      const r = parseInt(color.slice(1, 3), 16) || 139;
      const g = parseInt(color.slice(3, 5), 16) || 92;
      const b = parseInt(color.slice(5, 7), 16) || 246;

      // Smooth bands — inner ring uses bass/sub heavy data, outer uses mid/high
      for (let i = 0; i < barCount; i++) {
        const rawIdx = (i / barCount) * 31;
        const lo = Math.floor(rawIdx);
        const hi = Math.min(lo + 1, 31);
        const frac = rawIdx - lo;
        const raw = (audio.raw[lo] ?? 0) * (1 - frac) + (audio.raw[hi] ?? 0) * frac;

        // Inner emphasizes low frequencies
        const innerWeight = 1 - (i / barCount) * 0.6;
        const innerTarget = raw * innerWeight + audio.bass * 0.5 * innerWeight;
        smoothedInner[i] += (innerTarget - smoothedInner[i]) * 0.3;

        // Outer emphasizes high frequencies
        const outerWeight = 0.4 + (i / barCount) * 0.6;
        const outerTarget = raw * outerWeight + audio.high * 0.35 * outerWeight;
        smoothedOuter[i] += (outerTarget - smoothedOuter[i]) * 0.35;
      }

      // Background radial glow
      const bgGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 0.5);
      bgGlow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.05 + audio.energy * 0.1})`);
      bgGlow.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${0.02 + audio.energy * 0.04})`);
      bgGlow.addColorStop(1, `rgba(0, 0, 0, 0)`);
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, w, h);

      const angleStep = (Math.PI * 2) / barCount;
      const innerRotation = time * 0.08;
      const outerRotation = -time * 0.05;

      // Center geometric core — morphing hexagon/circle based on bass
      const coreSides = 6;
      const coreRadius = innerRadius * (0.5 + audio.bass * 0.7);
      const coreMorph = audio.sub * 0.6;
      ctx.beginPath();
      for (let i = 0; i <= coreSides; i++) {
        const a = (i / coreSides) * Math.PI * 2 + time * 0.2;
        const rr = coreRadius * (1 + Math.sin(a * 3 + time) * coreMorph);
        const px = cx + Math.cos(a) * rr;
        const py = cy + Math.sin(a) * rr;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius * 1.5);
      coreGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.5 + audio.energy * 0.5})`);
      coreGrad.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${0.2 + audio.energy * 0.25})`);
      coreGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Core outline glow
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.4 + audio.bass * 0.5})`;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.6)`;
      ctx.shadowBlur = 12 + audio.bass * 20;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Inner ring guide
      ctx.beginPath();
      ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.12)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Mid ring guide
      ctx.beginPath();
      ctx.arc(cx, cy, midRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.08)`;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Inner radial bars (bass-reactive, rotating clockwise)
      const innerTipXs: number[] = [];
      const innerTipYs: number[] = [];
      for (let i = 0; i < barCount; i++) {
        const value = smoothedInner[i];
        const barLength = value * maxInnerBar * 1.3 + 2;
        const angle = i * angleStep + innerRotation;

        const x1 = cx + Math.cos(angle) * innerRadius;
        const y1 = cy + Math.sin(angle) * innerRadius;
        const x2 = cx + Math.cos(angle) * (innerRadius + barLength);
        const y2 = cy + Math.sin(angle) * (innerRadius + barLength);

        innerTipXs.push(x2);
        innerTipYs.push(y2);

        const t = i / barCount;
        const barR = Math.min(255, Math.round(r + t * 40));
        const barG = Math.min(255, Math.round(g + t * 20));
        const barB = Math.min(255, Math.round(b - t * 30 + 30));

        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, `rgba(${barR}, ${barG}, ${barB}, 0.4)`);
        grad.addColorStop(1, `rgba(${barR}, ${barG}, ${barB}, ${0.3 + value * 0.6})`);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = grad;
        ctx.lineWidth = Math.max(2, (Math.PI * 2 * innerRadius) / barCount * 0.55);
        ctx.lineCap = "round";
        ctx.stroke();

        if (value > 0.3) {
          ctx.shadowColor = `rgba(${barR}, ${barG}, ${barB}, 0.6)`;
          ctx.shadowBlur = value * 18;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }

      // Connecting arcs between adjacent inner bar tips
      ctx.beginPath();
      for (let i = 0; i < barCount; i++) {
        const nx = (i + 1) % barCount;
        if (i === 0) ctx.moveTo(innerTipXs[i], innerTipYs[i]);
        const cpx = (innerTipXs[i] + innerTipXs[nx]) / 2;
        const cpy = (innerTipYs[i] + innerTipYs[nx]) / 2;
        ctx.quadraticCurveTo(innerTipXs[i], innerTipYs[i], cpx, cpy);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.06 + audio.energy * 0.14})`;
      ctx.lineWidth = 0.7;
      ctx.stroke();

      // Outer radial bars (high-reactive, rotating counter-clockwise)
      const outerTipXs: number[] = [];
      const outerTipYs: number[] = [];
      for (let i = 0; i < barCount; i++) {
        const value = smoothedOuter[i];
        const barLength = value * maxOuterBar * 1.2 + 2;
        const angle = i * angleStep + outerRotation;

        const x1 = cx + Math.cos(angle) * midRadius;
        const y1 = cy + Math.sin(angle) * midRadius;
        const x2 = cx + Math.cos(angle) * (midRadius + barLength);
        const y2 = cy + Math.sin(angle) * (midRadius + barLength);

        outerTipXs.push(x2);
        outerTipYs.push(y2);

        const t = i / barCount;
        const barR = Math.min(255, Math.round(r * 0.7 + 80 * t));
        const barG = Math.min(255, Math.round(g + 60 * t));
        const barB = Math.min(255, Math.round(b * (0.8 + t * 0.2)));

        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, `rgba(${barR}, ${barG}, ${barB}, 0.25)`);
        grad.addColorStop(1, `rgba(${barR}, ${barG}, ${barB}, ${0.15 + value * 0.5})`);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = grad;
        ctx.lineWidth = Math.max(1.5, (Math.PI * 2 * midRadius) / barCount * 0.4);
        ctx.lineCap = "round";
        ctx.stroke();
      }

      // Waveform polar trace between inner and outer rings
      const waveform = audio.raw;
      const wfSamples = Math.min(waveform.length, 128);
      const wfStep = Math.max(1, Math.floor(waveform.length / wfSamples));
      const wfBaseRadius = (innerRadius + midRadius) / 2;
      const wfAmplitude = (midRadius - innerRadius) * 0.7;

      ctx.beginPath();
      for (let i = 0; i <= wfSamples; i++) {
        const angle = (i / wfSamples) * Math.PI * 2 + time * 0.03;
        const sample = waveform[(i % wfSamples) * wfStep] || 0;
        const radius = wfBaseRadius + sample * wfAmplitude;
        const px = cx + Math.cos(angle) * radius;
        const py = cy + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.1 + audio.energy * 0.18})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Outer ring pulsing
      const outerRingRadius = outerRadius + audio.energy * 40;
      ctx.beginPath();
      ctx.arc(cx, cy, outerRingRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.06 + audio.energy * 0.12})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Particle spray on transients
      if (audio.energy > 0.4 && particles.length < MAX_PARTICLES) {
        const spawnCount = Math.floor((audio.energy - 0.35) * 18);
        for (let s = 0; s < spawnCount && particles.length < MAX_PARTICLES; s++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1 + audio.energy * 3;
          particles.push({
            x: cx + Math.cos(angle) * outerRingRadius,
            y: cy + Math.sin(angle) * outerRingRadius,
            vx: Math.cos(angle) * speed * (0.5 + Math.random()),
            vy: Math.sin(angle) * speed * (0.5 + Math.random()),
            life: 1,
            maxLife: 40 + Math.random() * 30,
            size: 1 + Math.random() * 2,
            r: Math.min(255, r + Math.round(Math.random() * 40)),
            g: Math.min(255, g + Math.round(Math.random() * 30)),
            b: Math.min(255, b + Math.round(Math.random() * 20)),
          });
        }
      }

      // Update and draw particles
      particles = particles.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.life -= 1 / p.maxLife;

        if (p.life <= 0) return false;

        const alpha = p.life * 0.6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${alpha})`;
        ctx.fill();
        return true;
      });

      // Inner mirror bars (short, inward from inner ring)
      for (let i = 0; i < barCount; i++) {
        const value = smoothedInner[i];
        const barLength = value * maxInnerBar * 0.25 + 1;
        const angle = i * angleStep + innerRotation;

        const x1 = cx + Math.cos(angle) * innerRadius;
        const y1 = cy + Math.sin(angle) * innerRadius;
        const x2 = cx + Math.cos(angle) * (innerRadius - barLength);
        const y2 = cy + Math.sin(angle) * (innerRadius - barLength);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.08 + value * 0.15})`;
        ctx.lineWidth = Math.max(1, (Math.PI * 2 * innerRadius) / barCount * 0.35);
        ctx.lineCap = "round";
        ctx.stroke();
      }
    },
  };
}
