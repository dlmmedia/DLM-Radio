export interface Station {
  changeuuid: string;
  stationuuid: string;
  name: string;
  url: string;
  url_resolved: string;
  homepage: string;
  favicon: string;
  tags: string;
  country: string;
  countrycode: string;
  iso_3166_2: string;
  state: string;
  language: string;
  languagecodes: string;
  votes: number;
  lastchangetime_iso8601: string;
  codec: string;
  bitrate: number;
  hls: number;
  lastcheckok: number;
  lastchecktime_iso8601: string;
  clicktimestamp_iso8601: string | null;
  clickcount: number;
  clicktrend: number;
  ssl_error: number;
  geo_lat: number | null;
  geo_long: number | null;
  has_extended_info: boolean;
}

export interface TagResult {
  name: string;
  stationcount: number;
}

export interface CountryResult {
  name: string;
  stationcount: number;
}

export interface CountryCodeResult {
  name: string;
  stationcount: number;
}

export interface LanguageResult {
  name: string;
  iso_639: string | null;
  stationcount: number;
}

export interface CodecResult {
  name: string;
  stationcount: number;
}

export interface StateResult {
  name: string;
  country: string;
  stationcount: number;
}

export interface StationSearchParams {
  name?: string;
  nameExact?: boolean;
  country?: string;
  countryExact?: boolean;
  countrycode?: string;
  state?: string;
  stateExact?: boolean;
  language?: string;
  languageExact?: boolean;
  tag?: string;
  tagExact?: boolean;
  tagList?: string;
  codec?: string;
  bitrateMin?: number;
  bitrateMax?: number;
  has_geo_info?: boolean;
  has_extended_info?: boolean;
  order?: string;
  reverse?: boolean;
  offset?: number;
  limit?: number;
  hidebroken?: boolean;
}

export interface AudioData {
  sub: number;
  bass: number;
  mid: number;
  high: number;
  treble: number;
  energy: number;
  raw: Float32Array;
  waveform: Float32Array;
}

export type PanelTab = "explore" | "favorites" | "browse" | "search" | "settings";

export type PlaylistCategory = "featured" | "mood" | "genre" | "regional" | "talk";

export interface PlaylistDefinition {
  id: string;
  name: string;
  description: string;
  category: PlaylistCategory;
  query: StationSearchParams;
  color: string;
}
