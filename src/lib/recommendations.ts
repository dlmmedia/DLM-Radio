import type { Station } from "./types";

interface ListeningProfile {
  tagCounts: Record<string, number>;
  countryCounts: Record<string, number>;
  totalListens: number;
}

const STORAGE_KEY = "radio-profile";

function getProfile(): ListeningProfile {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { tagCounts: {}, countryCounts: {}, totalListens: 0 };
}

function saveProfile(profile: ListeningProfile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {}
}

export function recordListening(station: Station) {
  const profile = getProfile();
  profile.totalListens++;

  // Track tags
  if (station.tags) {
    station.tags.split(",").forEach((tag) => {
      const t = tag.trim().toLowerCase();
      if (t) profile.tagCounts[t] = (profile.tagCounts[t] || 0) + 1;
    });
  }

  // Track country
  if (station.countrycode) {
    profile.countryCounts[station.countrycode] =
      (profile.countryCounts[station.countrycode] || 0) + 1;
  }

  saveProfile(profile);
}

export function getTopTags(limit = 5): string[] {
  const profile = getProfile();
  return Object.entries(profile.tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
}

export function getTopCountries(limit = 3): string[] {
  const profile = getProfile();
  return Object.entries(profile.countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([code]) => code);
}

export function scoreStation(station: Station): number {
  const profile = getProfile();
  let score = 0;

  // Tag affinity
  if (station.tags) {
    station.tags.split(",").forEach((tag) => {
      const t = tag.trim().toLowerCase();
      if (profile.tagCounts[t]) {
        score += profile.tagCounts[t] * 2;
      }
    });
  }

  // Country affinity
  if (station.countrycode && profile.countryCounts[station.countrycode]) {
    score += profile.countryCounts[station.countrycode];
  }

  // Popularity bonus
  score += Math.log(station.votes + 1) * 0.5;
  score += Math.log(station.clickcount + 1) * 0.3;

  return score;
}

export function rankStations(stations: Station[]): Station[] {
  return [...stations].sort((a, b) => scoreStation(b) - scoreStation(a));
}
