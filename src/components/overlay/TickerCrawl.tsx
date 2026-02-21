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
  const innerRef = useRef<HTMLDivElement>(null);
  const [cssVars, setCssVars] = useState<Record<string, string> | null>(null);
  const completedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!visible) {
      setCssVars(null);
      completedRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    let raf1: number;
    let raf2: number;

    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const contentW = innerRef.current?.scrollWidth ?? 0;
        const viewportW = containerRef.current?.offsetWidth ?? 0;

        if (contentW > 0 && viewportW > 0) {
          const speed = 55;
          const duration = (contentW + viewportW) / speed;

          setCssVars({
            "--ticker-start": `${viewportW}px`,
            "--ticker-end": `${-contentW}px`,
            "--ticker-duration": `${duration}s`,
          });

          timeoutRef.current = setTimeout(() => {
            if (!completedRef.current) {
              completedRef.current = true;
              onComplete();
            }
          }, duration * 1000 + 600);
        }
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [visible, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="pointer-events-none fixed bottom-16 left-0 right-0 z-[32] h-7 overflow-hidden bg-white/60 dark:bg-black/25 backdrop-blur-md border-y border-black/[0.06] dark:border-white/[0.04]"
        >
          <div
            ref={innerRef}
            className={`absolute top-0 flex h-full items-center whitespace-nowrap ${cssVars ? "ticker-crawl-animate" : ""}`}
            style={
              cssVars
                ? (cssVars as React.CSSProperties)
                : { transform: "translate3d(100vw, 0, 0)" }
            }
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
                  <span className="mx-6 text-[8px] text-black/30 dark:text-white/20">
                    {"\u2022"}
                  </span>
                )}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
