export const RADIO_API_BASE = process.env.NEXT_PUBLIC_RADIO_API || "https://de1.api.radio-browser.info";
export const USER_AGENT = "DLM-Radio/1.0";

export const GENRE_COLORS: Record<string, string> = {
  pop: "#ec4899",
  hits: "#ec4899",
  "top 40": "#ec4899",
  rock: "#ef4444",
  "classic rock": "#ef4444",
  metal: "#ef4444",
  alternative: "#ef4444",
  jazz: "#3b82f6",
  blues: "#3b82f6",
  classical: "#f59e0b",
  electronic: "#8b5cf6",
  dance: "#8b5cf6",
  house: "#8b5cf6",
  trance: "#8b5cf6",
  techno: "#8b5cf6",
  news: "#eab308",
  talk: "#eab308",
  information: "#eab308",
  country: "#22c55e",
  folk: "#22c55e",
  world: "#22c55e",
  "80s": "#f97316",
  "90s": "#f97316",
  oldies: "#f97316",
  latin: "#e11d48",
  reggae: "#16a34a",
  christian: "#a855f7",
  "public radio": "#06b6d4",
};

export function getGenreColor(tags: string): string {
  const tagList = tags.toLowerCase().split(",").map((t) => t.trim());
  for (const tag of tagList) {
    if (GENRE_COLORS[tag]) return GENRE_COLORS[tag];
  }
  return "#6b7280";
}

export function getCountryFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return "";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((c) => 0x1f1e6 + c.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}
