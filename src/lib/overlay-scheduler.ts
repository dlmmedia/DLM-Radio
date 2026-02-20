import type { AppTier } from "./overlay-content";

const MIN_GAP_MS = 15_000;
const COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes before repeating same card
const MAX_PROMOS_PER_10MIN = 3;
const TICKER_INTERVAL_MS = 2.5 * 60 * 1000; // every 2.5 minutes
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

const PRIORITY: OverlayEventType[] = ["hint", "context", "app-promo", "affiliate", "ticker"];

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
}

export function decideNext(ctx: SchedulerContext): ScheduleDecision | null {
  const now = Date.now();
  const elapsed = now - ctx.lastShownAt;

  if (ctx.isLoading) return null;

  if (elapsed < MIN_GAP_MS) {
    return null;
  }

  // Hints take highest priority (only unseen ones)
  if (ctx.hasUnseenHints) {
    return { type: "hint", delay: 0 };
  }

  // Ticker runs on its own cadence
  if (now - ctx.tickerLastShown > TICKER_INTERVAL_MS) {
    return { type: "ticker", delay: 0 };
  }

  // Reduce card frequency when panel is open
  const adjustedGap = ctx.panelOpen ? MIN_GAP_MS * 2 : MIN_GAP_MS;
  if (elapsed < adjustedGap) return null;

  // Context cards when available
  if (Math.random() < 0.35) {
    return { type: "context", delay: 0 };
  }

  // App promos (respect rate limit)
  if (ctx.promoCountLast10Min < MAX_PROMOS_PER_10MIN) {
    if (Math.random() < 0.55) {
      return { type: "app-promo", delay: 0 };
    }
  }

  // Affiliate cards fill the rest
  return { type: "affiliate", delay: 0 };
}

export { MIN_GAP_MS, COOLDOWN_MS, MAX_PROMOS_PER_10MIN, TICKER_INTERVAL_MS, TICKER_DURATION_MS };
