import type { PlaylistDefinition } from "./types";

export const CURATED_PLAYLISTS: PlaylistDefinition[] = [
  {
    id: "night-vibes",
    name: "Night Vibes",
    description: "Late-night jazz, lounge, and chill",
    query: { tag: "jazz", order: "votes", reverse: true, limit: 50, hidebroken: true },
    color: "#3b82f6",
  },
  {
    id: "world-beat",
    name: "World Beat",
    description: "Global folk and world music",
    query: { tag: "world", order: "votes", reverse: true, limit: 50, hidebroken: true },
    color: "#22c55e",
  },
  {
    id: "electronic-pulse",
    name: "Electronic Pulse",
    description: "Dance, house, trance, electronic",
    query: { tag: "electronic", order: "clickcount", reverse: true, limit: 50, hidebroken: true },
    color: "#8b5cf6",
  },
  {
    id: "classical-hour",
    name: "Classical Hour",
    description: "Orchestral and chamber music",
    query: { tag: "classical", order: "votes", reverse: true, limit: 50, hidebroken: true },
    color: "#f59e0b",
  },
  {
    id: "indie-underground",
    name: "Indie Underground",
    description: "Alternative and indie stations",
    query: { tag: "alternative", order: "votes", reverse: true, limit: 50, hidebroken: true },
    color: "#ef4444",
  },
  {
    id: "news-desk",
    name: "News Desk",
    description: "News and talk radio worldwide",
    query: { tag: "news", order: "clickcount", reverse: true, limit: 50, hidebroken: true },
    color: "#eab308",
  },
  {
    id: "retro-wave",
    name: "Retro Wave",
    description: "70s, 80s, 90s hits and oldies",
    query: { tag: "80s", order: "votes", reverse: true, limit: 50, hidebroken: true },
    color: "#f97316",
  },
  {
    id: "latin-heat",
    name: "Latin Heat",
    description: "Latin, sertanejo, regional Mexican",
    query: { tag: "latin", order: "clickcount", reverse: true, limit: 50, hidebroken: true },
    color: "#e11d48",
  },
];
