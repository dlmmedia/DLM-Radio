"use client";

import { useEffect, useCallback, useRef, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { useRadioStore } from "@/stores/radioStore";
import { useOverlayStore } from "@/stores/overlayStore";
import {
  APP_PROMOS,
  AFFILIATE_ITEMS,
  HINTS,
  TICKER_MESSAGES,
  CONTEXT_FACTS,
} from "@/lib/overlay-content";
import {
  decideNext,
  buildWeightedPromoQueue,
  getPromoDuration,
  calculateReadingDuration,
  COOLDOWN_MS,
} from "@/lib/overlay-scheduler";
import { AppPromoCard } from "./cards/AppPromoCard";
import { AffiliateCard } from "./cards/AffiliateCard";
import { HintBanner } from "./cards/HintBanner";
import { ContextCard } from "./cards/ContextCard";
import { TickerCrawl } from "./TickerCrawl";

let idCounter = 0;
function nextId() {
  return `overlay-${++idCounter}-${Date.now()}`;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function OverlayOrchestrator() {
  const visualizerActive = useRadioStore((s) => s.visualizerActive);
  const isLoading = useRadioStore((s) => s.isLoading);
  const panelOpen = useRadioStore((s) => s.panelOpen);
  const currentStation = useRadioStore((s) => s.currentStation);

  const {
    activeCards,
    tickerActive,
    tickerContentIndex,
    shownHints,
    lastShownAt,
    cardHistory,
    nextTypeIndex,
    paused,
    showCard,
    dismissCard,
    setTickerActive,
    advanceTickerIndex,
    markHintShown,
    isOnCooldown,
    advanceTypeIndex,
  } = useOverlayStore();

  // Pre-build weighted promo queue
  const promoQueue = useRef<number[]>([]);
  const promoQueueIdx = useRef(0);
  const affiliateIdx = useRef(0);

  // Shuffled ticker order (once per session)
  const shuffledTickerOrder = useRef<number[]>([]);

  useEffect(() => {
    promoQueue.current = buildWeightedPromoQueue(
      APP_PROMOS.length,
      APP_PROMOS.map((p) => p.tier)
    );
    promoQueueIdx.current = 0;

    shuffledTickerOrder.current = shuffleArray(
      Array.from({ length: TICKER_MESSAGES.length }, (_, i) => i)
    );
  }, []);

  const tickerLastShown = useRef(0);

  // Count promos shown in last 10 min
  const promoCountLast10Min = useMemo(() => {
    const tenMinAgo = Date.now() - 10 * 60 * 1000;
    return cardHistory.filter(
      (h) => h.shownAt > tenMinAgo && h.id.startsWith("promo-")
    ).length;
  }, [cardHistory]);

  // Get a context fact for the current station
  const getContextFact = useCallback(() => {
    if (!currentStation) return null;
    const cc = currentStation.countrycode?.toUpperCase();
    const tags = currentStation.tags?.toLowerCase() ?? "";

    const countryFact = CONTEXT_FACTS.find(
      (f) => f.countryCode === cc && !isOnCooldown(f.id, COOLDOWN_MS)
    );
    if (countryFact) return countryFact;

    const genreFact = CONTEXT_FACTS.find(
      (f) => f.genre && tags.includes(f.genre) && !isOnCooldown(f.id, COOLDOWN_MS)
    );
    if (genreFact) return genreFact;

    const available = CONTEXT_FACTS.filter((f) => !isOnCooldown(f.id, COOLDOWN_MS));
    return available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : null;
  }, [currentStation, isOnCooldown]);

  // Get next unseen hint
  const getNextHint = useCallback(() => {
    return HINTS.find((h) => !shownHints.has(h.id)) ?? null;
  }, [shownHints]);

  // Get next promo (weighted rotation)
  const getNextPromo = useCallback(() => {
    const queue = promoQueue.current;
    if (queue.length === 0) return null;

    for (let attempts = 0; attempts < queue.length; attempts++) {
      const idx = queue[promoQueueIdx.current % queue.length];
      promoQueueIdx.current++;
      const promo = APP_PROMOS[idx];
      if (!isOnCooldown(promo.id, COOLDOWN_MS)) return promo;
    }
    return null;
  }, [isOnCooldown]);

  // Get next affiliate
  const getNextAffiliate = useCallback(() => {
    for (let attempts = 0; attempts < AFFILIATE_ITEMS.length; attempts++) {
      const item = AFFILIATE_ITEMS[affiliateIdx.current % AFFILIATE_ITEMS.length];
      affiliateIdx.current++;
      if (!isOnCooldown(item.id, COOLDOWN_MS)) return item;
    }
    return null;
  }, [isOnCooldown]);

  // Build ticker message set (shuffled, 12 per batch)
  const tickerMessages = useMemo(() => {
    const order = shuffledTickerOrder.current;
    if (order.length === 0) return TICKER_MESSAGES.slice(0, 12);

    const batchSize = 12;
    const startOffset = (tickerContentIndex * batchSize) % order.length;
    const batch = [];
    for (let i = 0; i < batchSize; i++) {
      const shuffledIdx = order[(startOffset + i) % order.length];
      batch.push(TICKER_MESSAGES[shuffledIdx]);
    }
    return batch;
  }, [tickerContentIndex]);

  // Main scheduling loop
  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      const nonTickerActive = activeCards.filter((c) => c.type !== "ticker");
      if (nonTickerActive.length > 0) return;

      const decision = decideNext({
        lastShownAt,
        promoCountLast10Min,
        hasUnseenHints: !!getNextHint(),
        isLoading,
        panelOpen,
        visualizerActive,
        tickerLastShown: tickerLastShown.current,
        nextTypeIndex,
        hasContextContent: !!getContextFact(),
        hasPromoContent: !!getNextPromo(),
        hasAffiliateContent: !!getNextAffiliate(),
      });

      if (!decision) return;

      const now = Date.now();

      switch (decision.type) {
        case "hint": {
          const hint = getNextHint();
          if (!hint) break;
          markHintShown(hint.id);
          showCard({
            id: nextId(),
            type: "hint",
            contentId: hint.id,
            shownAt: now,
            duration: 5000,
          });
          break;
        }
        case "context": {
          const fact = getContextFact();
          if (!fact) break;
          advanceTypeIndex();
          showCard({
            id: nextId(),
            type: "context",
            contentId: fact.id,
            shownAt: now,
            duration: calculateReadingDuration(fact.fact),
          });
          break;
        }
        case "app-promo": {
          const promo = getNextPromo();
          if (!promo) break;
          advanceTypeIndex();
          showCard({
            id: nextId(),
            type: "app-promo",
            contentId: promo.id,
            shownAt: now,
            duration: getPromoDuration(promo.tier),
          });
          break;
        }
        case "affiliate": {
          const item = getNextAffiliate();
          if (!item) break;
          advanceTypeIndex();
          showCard({
            id: nextId(),
            type: "affiliate",
            contentId: item.id,
            shownAt: now,
            duration: calculateReadingDuration(item.tagline),
          });
          break;
        }
        case "ticker": {
          tickerLastShown.current = now;
          setTickerActive(true);
          break;
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [
    paused,
    activeCards,
    lastShownAt,
    promoCountLast10Min,
    isLoading,
    panelOpen,
    visualizerActive,
    nextTypeIndex,
    getNextHint,
    getContextFact,
    getNextPromo,
    getNextAffiliate,
    markHintShown,
    showCard,
    setTickerActive,
    advanceTypeIndex,
  ]);

  // Auto-dismiss cards after their duration
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (const card of activeCards) {
      const elapsed = Date.now() - card.shownAt;
      const remaining = card.duration - elapsed;
      if (remaining > 0) {
        timers.push(setTimeout(() => dismissCard(card.id), remaining));
      } else {
        dismissCard(card.id);
      }
    }
    return () => timers.forEach(clearTimeout);
  }, [activeCards, dismissCard]);

  const resolvePromo = (contentId: string) =>
    APP_PROMOS.find((p) => p.id === contentId);
  const resolveAffiliate = (contentId: string) =>
    AFFILIATE_ITEMS.find((a) => a.id === contentId);
  const resolveHint = (contentId: string) =>
    HINTS.find((h) => h.id === contentId);
  const resolveContext = (contentId: string) =>
    CONTEXT_FACTS.find((f) => f.id === contentId);

  return (
    <div className="pointer-events-none fixed inset-0 z-[33] overflow-hidden">
      {/* Hint banner — top center */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2">
        <AnimatePresence mode="wait">
          {activeCards
            .filter((c) => c.type === "hint")
            .map((card) => {
              const hint = resolveHint(card.contentId);
              if (!hint) return null;
              return (
                <HintBanner
                  key={card.id}
                  hint={hint}
                  onDismiss={() => dismissCard(card.id)}
                />
              );
            })}
        </AnimatePresence>
      </div>

      {/* Context card — top-right */}
      <div className="absolute top-14 right-4">
        <AnimatePresence mode="wait">
          {activeCards
            .filter((c) => c.type === "context")
            .map((card) => {
              const fact = resolveContext(card.contentId);
              if (!fact) return null;
              return (
                <ContextCard
                  key={card.id}
                  fact={fact}
                  onDismiss={() => dismissCard(card.id)}
                />
              );
            })}
        </AnimatePresence>
      </div>

      {/* App promo card — bottom-right (globe) or top-right (visualizer) */}
      <div
        className={
          visualizerActive
            ? "absolute top-14 right-4"
            : "absolute bottom-20 right-4"
        }
      >
        <AnimatePresence mode="wait">
          {activeCards
            .filter((c) => c.type === "app-promo")
            .map((card) => {
              const promo = resolvePromo(card.contentId);
              if (!promo) return null;
              return (
                <AppPromoCard
                  key={card.id}
                  promo={promo}
                  onDismiss={() => dismissCard(card.id)}
                />
              );
            })}
        </AnimatePresence>
      </div>

      {/* Affiliate card — bottom-left (globe) or center-bottom (visualizer) */}
      <div
        className={
          visualizerActive
            ? "absolute bottom-20 left-1/2 -translate-x-1/2"
            : "absolute bottom-20 left-4"
        }
      >
        <AnimatePresence mode="wait">
          {activeCards
            .filter((c) => c.type === "affiliate")
            .map((card) => {
              const item = resolveAffiliate(card.contentId);
              if (!item) return null;
              return (
                <AffiliateCard
                  key={card.id}
                  item={item}
                  onDismiss={() => dismissCard(card.id)}
                />
              );
            })}
        </AnimatePresence>
      </div>

      {/* Ticker crawl — above PlayerBar */}
      <TickerCrawl
        messages={tickerMessages}
        visible={tickerActive}
        onComplete={() => {
          setTickerActive(false);
          advanceTickerIndex();
        }}
      />
    </div>
  );
}
