"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

export type AnimationPreset =
  | "slide-right"
  | "slide-left"
  | "fade-blur"
  | "drop-bounce"
  | "drift-up";

const presets: Record<AnimationPreset, Variants> = {
  "slide-right": {
    initial: { x: 80, opacity: 0, y: 6 },
    animate: { x: 0, opacity: 1, y: 0, transition: { type: "spring", damping: 22, stiffness: 180 } },
    exit: { x: 40, opacity: 0, transition: { duration: 0.4, ease: "easeIn" } },
  },
  "slide-left": {
    initial: { x: -80, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { type: "spring", damping: 22, stiffness: 180 } },
    exit: { x: -40, opacity: 0, transition: { duration: 0.4, ease: "easeIn" } },
  },
  "fade-blur": {
    initial: { opacity: 0, filter: "blur(12px)", scale: 0.97 },
    animate: {
      opacity: 1,
      filter: "blur(0px)",
      scale: 1,
      transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
    },
    exit: {
      opacity: 0,
      filter: "blur(8px)",
      scale: 0.97,
      transition: { duration: 0.4, ease: "easeIn" },
    },
  },
  "drop-bounce": {
    initial: { y: -60, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { type: "spring", damping: 15, stiffness: 250 } },
    exit: { y: -30, opacity: 0, transition: { duration: 0.3, ease: "easeIn" } },
  },
  "drift-up": {
    initial: { y: 12, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } },
    exit: { y: -8, opacity: 0, transition: { duration: 0.5, ease: "easeIn" } },
  },
};

interface OverlayCardProps {
  preset: AnimationPreset;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}

export function OverlayCard({ preset, className = "", children, onClick }: OverlayCardProps) {
  const variants = presets[preset];

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`pointer-events-auto ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
