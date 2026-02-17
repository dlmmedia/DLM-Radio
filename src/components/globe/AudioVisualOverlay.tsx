"use client";

import { useEffect, useRef } from "react";
import { useRadioStore } from "@/stores/radioStore";
import { getAudioData } from "@/hooks/useAudioData";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  angle: number;
  orbitRadius: number;
  speed: number;
}

function createParticles(
  count: number,
  cx: number,
  cy: number
): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const orbitRadius = 80 + Math.random() * 260;
    particles.push({
      x: cx + Math.cos(angle) * orbitRadius,
      y: cy + Math.sin(angle) * orbitRadius,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 2 + 0.5,
      baseAlpha: Math.random() * 0.4 + 0.1,
      angle,
      orbitRadius,
      speed: (Math.random() * 0.3 + 0.1) * (Math.random() > 0.5 ? 1 : -1),
    });
  }
  return particles;
}

export function AudioVisualOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const isPlaying = useRadioStore((s) => s.isPlaying);

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

      const cx = rect.width / 2;
      const cy = rect.height / 2;
      particlesRef.current = createParticles(120, cx, cy);
    };

    resize();
    window.addEventListener("resize", resize);

    let time = 0;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      const audio = getAudioData();
      time += 0.016;

      // --- Radial glow (reacts to bass and energy) ---
      const glowIntensity = audio.energy * 0.7 + audio.bass * 0.3;
      const glowRadius = 120 + glowIntensity * 200 + Math.sin(time * 2) * 15;

      if (glowIntensity > 0.01) {
        // Outer atmospheric glow
        const outerGrad = ctx.createRadialGradient(
          cx, cy, 0,
          cx, cy, glowRadius * 2
        );
        const hue = 240 + audio.mid * 60;
        outerGrad.addColorStop(0, `hsla(${hue}, 80%, 50%, ${glowIntensity * 0.12})`);
        outerGrad.addColorStop(0.3, `hsla(${hue + 20}, 70%, 40%, ${glowIntensity * 0.08})`);
        outerGrad.addColorStop(0.7, `hsla(${hue + 40}, 60%, 30%, ${glowIntensity * 0.03})`);
        outerGrad.addColorStop(1, "hsla(0, 0%, 0%, 0)");

        ctx.fillStyle = outerGrad;
        ctx.fillRect(0, 0, w, h);

        // Inner bright core
        const innerGrad = ctx.createRadialGradient(
          cx, cy, 0,
          cx, cy, glowRadius * 0.8
        );
        innerGrad.addColorStop(0, `hsla(${hue}, 90%, 70%, ${glowIntensity * 0.15})`);
        innerGrad.addColorStop(0.5, `hsla(${hue + 10}, 80%, 50%, ${glowIntensity * 0.06})`);
        innerGrad.addColorStop(1, "hsla(0, 0%, 0%, 0)");

        ctx.fillStyle = innerGrad;
        ctx.fillRect(0, 0, w, h);

        // Pulsing ring
        const ringRadius = glowRadius * 0.6 + audio.bass * 80;
        ctx.beginPath();
        ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${glowIntensity * 0.15})`;
        ctx.lineWidth = 2 + audio.bass * 4;
        ctx.stroke();
      }

      // --- Particles (react to energy and bass) ---
      const particles = particlesRef.current;
      for (const p of particles) {
        p.angle += p.speed * 0.01 * (1 + audio.energy * 2);

        const drift = audio.bass * 30;
        const currentRadius = p.orbitRadius + drift * Math.sin(time + p.angle);
        p.x = cx + Math.cos(p.angle) * currentRadius;
        p.y = cy + Math.sin(p.angle) * currentRadius;

        const alpha = p.baseAlpha * (0.3 + audio.energy * 1.5);
        if (alpha < 0.01) continue;

        const size = p.radius * (1 + audio.bass * 1.5);
        const particleHue = (240 + audio.mid * 80 + p.angle * 30) % 360;

        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${particleHue}, 70%, 65%, ${Math.min(alpha, 0.8)})`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1, opacity: isPlaying ? 1 : 0, transition: "opacity 0.5s ease" }}
    />
  );
}
