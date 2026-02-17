import { RADIO_API_BASE, USER_AGENT } from "./constants";
import type {
  Station,
  TagResult,
  CountryCodeResult,
  LanguageResult,
  CodecResult,
  StateResult,
  StationSearchParams,
} from "./types";

const cache = new Map<string, { data: unknown; expires: number }>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: unknown, ttlMs: number) {
  cache.set(key, { data, expires: Date.now() + ttlMs });
}

async function apiFetch<T>(path: string, ttlMs: number = 120_000): Promise<T> {
  const cacheKey = path;
  const cached = getCached<T>(cacheKey);
  if (cached) return cached;

  const res = await fetch(`${RADIO_API_BASE}${path}`, {
    headers: {
      "User-Agent": USER_AGENT,
      "Content-Type": "application/json",
    },
    next: { revalidate: Math.floor(ttlMs / 1000) },
  });

  if (!res.ok) throw new Error(`Radio Browser API error: ${res.status}`);
  const data = (await res.json()) as T;
  setCache(cacheKey, data, ttlMs);
  return data;
}

function buildQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts.length ? `?${parts.join("&")}` : "";
}

// Station search
export async function searchStations(params: StationSearchParams): Promise<Station[]> {
  const query = buildQuery({ ...params });
  return apiFetch<Station[]>(`/json/stations/search${query}`, 120_000);
}

// Station by various fields
export async function getStationsByTag(tag: string, limit = 100): Promise<Station[]> {
  return apiFetch<Station[]>(`/json/stations/bytagexact/${encodeURIComponent(tag)}${buildQuery({ limit, order: "clickcount", reverse: true, hidebroken: true })}`, 300_000);
}

export async function getStationsByCountryCode(code: string, limit = 100): Promise<Station[]> {
  return apiFetch<Station[]>(`/json/stations/bycountrycodeexact/${encodeURIComponent(code)}${buildQuery({ limit, order: "clickcount", reverse: true, hidebroken: true })}`, 300_000);
}

export async function getStationsByLanguage(lang: string, limit = 100): Promise<Station[]> {
  return apiFetch<Station[]>(`/json/stations/bylanguageexact/${encodeURIComponent(lang)}${buildQuery({ limit, order: "clickcount", reverse: true, hidebroken: true })}`, 300_000);
}

export async function getStationByUuid(uuid: string): Promise<Station | null> {
  const result = await apiFetch<Station[]>(`/json/stations/byuuid/${encodeURIComponent(uuid)}`, 600_000);
  return result[0] || null;
}

// Popularity endpoints
export async function getTopClickStations(limit = 50): Promise<Station[]> {
  return apiFetch<Station[]>(`/json/stations/topclick/${limit}`, 300_000);
}

export async function getTopVoteStations(limit = 50): Promise<Station[]> {
  return apiFetch<Station[]>(`/json/stations/topvote/${limit}`, 300_000);
}

export async function getLastClickStations(limit = 50): Promise<Station[]> {
  return apiFetch<Station[]>(`/json/stations/lastclick/${limit}`, 300_000);
}

export async function getLastChangeStations(limit = 50): Promise<Station[]> {
  return apiFetch<Station[]>(`/json/stations/lastchange/${limit}`, 300_000);
}

// Metadata endpoints
export async function getTags(limit = 100): Promise<TagResult[]> {
  return apiFetch<TagResult[]>(`/json/tags${buildQuery({ order: "stationcount", reverse: true, limit, hidebroken: true })}`, 3_600_000);
}

export async function getCountryCodes(limit = 250): Promise<CountryCodeResult[]> {
  return apiFetch<CountryCodeResult[]>(`/json/countrycodes${buildQuery({ order: "stationcount", reverse: true, limit })}`, 3_600_000);
}

export async function getLanguages(limit = 100): Promise<LanguageResult[]> {
  return apiFetch<LanguageResult[]>(`/json/languages${buildQuery({ order: "stationcount", reverse: true, limit })}`, 3_600_000);
}

export async function getCodecs(): Promise<CodecResult[]> {
  return apiFetch<CodecResult[]>(`/json/codecs${buildQuery({ order: "stationcount", reverse: true })}`, 3_600_000);
}

export async function getStates(country: string): Promise<StateResult[]> {
  return apiFetch<StateResult[]>(`/json/states/${encodeURIComponent(country)}/${buildQuery({ order: "stationcount", reverse: true })}`, 3_600_000);
}

// Geo stations (for globe)
export async function getGeoStations(limit = 50000): Promise<Station[]> {
  return apiFetch<Station[]>(`/json/stations/search${buildQuery({ has_geo_info: true, hidebroken: true, limit, order: "clickcount", reverse: true })}`, 3_600_000);
}

// Interactions
export async function recordClick(stationuuid: string): Promise<void> {
  try {
    await fetch(`${RADIO_API_BASE}/json/url/${stationuuid}`, {
      method: "POST",
      headers: { "User-Agent": USER_AGENT },
    });
  } catch {
    // non-critical
  }
}

export async function voteForStation(stationuuid: string): Promise<{ ok: boolean; message: string }> {
  const res = await fetch(`${RADIO_API_BASE}/json/vote/${stationuuid}`, {
    method: "POST",
    headers: { "User-Agent": USER_AGENT },
  });
  return res.json();
}
