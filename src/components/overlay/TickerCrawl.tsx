"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TickerMessage } from "@/lib/overlay-content";

interface TickerCrawlProps {
  messages: TickerMessage[];
  visible: boolean;
  onComplete: () => void;
}

export function TickerCrawl({ messages, visible, onComplete }: TickerCrawlProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [contentWidth, setContentWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const joined = messages.map((m) => m.text).join("   \u2022   ");

  const measure = useCallback(() => {
    const cw = innerRef.current?.scrollWidth ?? 0;
    const vw = containerRef.current?.offsetWidth ?? 0;
    if (cw > 0 && vw > 0) {
      setContentWidth(cw);
      setContainerWidth(vw);
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!visible) {
      setReady(false);
      return;
    }
    // Measure after a frame so the DOM has rendered the hidden content
    const raf = requestAnimationFrame(() => {
      measure();
    });
    return () => cancelAnimationFrame(raf);
  }, [visible, joined, measure]);

  const totalDistance = contentWidth + containerWidth;
  const speed = 60;
  const duration = totalDistance / speed;

  useEffect(() => {
    if (!visible || !ready) return;
    const timer = setTimeout(onComplete, duration * 1000 + 500);
    return () => clearTimeout(timer);
  }, [visible, ready, duration, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.6 } }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          className="pointer-events-none fixed bottom-16 left-0 right-0 z-[32] h-7 overflow-hidden bg-white/60 dark:bg-black/25 backdrop-blur-md border-y border-black/[0.06] dark:border-white/[0.04]"
        >
          <motion.div
            ref={innerRef}
            initial={false}
            animate={
              ready
                ? { x: -contentWidth }
                : { x: containerWidth || "100%" }
            }
            transition={
              ready
                ? { duration, ease: "linear" }
                : { duration: 0 }
            }
            style={{
              willChange: "transform",
              x: ready ? undefined : containerWidth || "100%",
            }}
            className="absolute top-0 flex h-full items-center whitespace-nowrap"
          >
            {messages.map((msg, i) => (
              <span key={msg.id} className="inline-flex items-center">
                <span
                  className={`text-[11px] tracking-wide ${
                    msg.type === "promo"
                      ? "font-medium text-black/70 dark:text-white/50"
                      : msg.type === "fact"
                        ? "font-normal text-black/60 dark:text-white/40 italic"
                        : msg.type === "quote"
                          ? "font-normal text-black/65 dark:text-white/45 italic"
                          : "font-normal text-black/60 dark:text-white/40"
                  }`}
                >
                  {msg.text}
                </span>
                {i < messages.length - 1 && (
                  <span className="mx-6 text-[8px] text-black/30 dark:text-white/20">{"\u2022"}</span>
                )}
              </span>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
