import type { AppTier } from "./overlay-content";

const MIN_GAP_MS = 15_000;
const COOLDOWN_MS = 30 * 60 * 1000;
const MAX_PROMOS_PER_10MIN = 3;
const TICKER_INTERVAL_MS = 2.5 * 60 * 1000;
const TICKER_DURATION_MS = 35_000;

export function calculateReadingDuration(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.max(5000, words * 300 + 3000);
}

export function getPromoDuration(tier: AppTier): number {
  return tier === 1 ? 9000 : 7000;
}

/** Tier 1 apps get 3x weight, Tier 2 gets 2x, Tier 3 gets 1x */
export function buildWeightedPromoQueue(promoCount: number, tiers: AppTier[]): number[] {
  const weighted: { index: number; weight: number }[] = tiers.map((tier, index) => ({
    index,
    weight: tier === 1 ? 3 : tier === 2 ? 2 : 1,
  }));

  const pool: number[] = [];
  for (const item of weighted) {
    for (let i = 0; i < item.weight; i++) {
      pool.push(item.index);
    }
  }

  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool;
}

export type OverlayEventType = "hint" | "context" | "app-promo" | "affiliate" | "ticker";

/**
 * Weighted rotation pattern ensuring even distribution:
 * context (2x), app-promo (2x), affiliate (2x) in a balanced cycle.
 * The pattern avoids same-type streaks while keeping promos visible.
 */
const CARD_ROTATION: Exclude<OverlayEventType, "hint" | "ticker">[] = [
  "context",
  "app-promo",
  "affiliate",
  "app-promo",
  "context",
  "affiliate",
];

export interface ScheduleDecision {
  type: OverlayEventType;
  delay: number;
}

interface SchedulerContext {
  lastShownAt: number;
  promoCountLast10Min: number;
  hasUnseenHints: boolean;
  isLoading: boolean;
  panelOpen: boolean;
  visualizerActive: boolean;
  tickerLastShown: number;
  nextTypeIndex: number;
  hasContextContent: boolean;
  hasPromoContent: boolean;
  hasAffiliateContent: boolean;
}

export function decideNext(ctx: SchedulerContext): ScheduleDecision | null {
  const now = Date.now();
  const elapsed = now - ctx.lastShownAt;

  if (ctx.isLoading) return null;

  if (elapsed < MIN_GAP_MS) {
    return null;
  }

  if (ctx.hasUnseenHints) {
    return { type: "hint", delay: 0 };
  }

  if (now - ctx.tickerLastShown > TICKER_INTERVAL_MS) {
    return { type: "ticker", delay: 0 };
  }

  const adjustedGap = ctx.panelOpen ? MIN_GAP_MS * 2 : MIN_GAP_MS;
  if (elapsed < adjustedGap) return null;

  // Walk the rotation pattern, skipping types that have no content or hit rate limits
  const rotationLen = CARD_ROTATION.length;
  for (let attempt = 0; attempt < rotationLen; attempt++) {
    const candidate = CARD_ROTATION[(ctx.nextTypeIndex + attempt) % rotationLen];

    switch (candidate) {
      case "context":
        if (ctx.hasContextContent) return { type: "context", delay: 0 };
        break;
      case "app-promo":
        if (ctx.hasPromoContent && ctx.promoCountLast10Min < MAX_PROMOS_PER_10MIN)
          return { type: "app-promo", delay: 0 };
        break;
      case "affiliate":
        if (ctx.hasAffiliateContent) return { type: "affiliate", delay: 0 };
        break;
    }
  }

  return null;
}

export { MIN_GAP_MS, COOLDOWN_MS, MAX_PROMOS_PER_10MIN, TICKER_INTERVAL_MS, TICKER_DURATION_MS };
