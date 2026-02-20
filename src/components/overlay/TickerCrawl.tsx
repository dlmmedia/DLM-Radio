"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TickerMessage } from "@/lib/overlay-content";

interface TickerCrawlProps {
  messages: TickerMessage[];
  visible: boolean;
  onComplete: () => void;
}

export function TickerCrawl({ messages, visible, onComplete }: TickerCrawlProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const innerRef = useRef<HTMLDivElement>(null);

  const joined = messages.map((m) => m.text).join("   \u2022   ");

  useEffect(() => {
    if (!visible) return;
    if (innerRef.current) setContentWidth(innerRef.current.scrollWidth);
    if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth);
  }, [visible, joined]);

  const totalDistance = contentWidth + containerWidth;
  const speed = 60; // px per second
  const duration = totalDistance / speed;

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onComplete, duration * 1000 + 500);
    return () => clearTimeout(timer);
  }, [visible, duration, onComplete]);

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
            initial={{ x: containerWidth || "100%" }}
            animate={{ x: -(contentWidth || 0) }}
            transition={{ duration, ease: "linear" }}
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
                        : "font-normal text-black/60 dark:text-white/40"
                  }`}
                >
                  {msg.text}
                </span>
                {i < messages.length - 1 && (
                  <span className="mx-4 text-[8px] text-black/30 dark:text-white/20">{"\u2022"}</span>
                )}
              </span>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
